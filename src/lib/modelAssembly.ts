import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

type Offset = [number, number, number];

type WearableAttachment = {
  wearableUrl: string;
  wearableOffset?: Offset | null;
  wearableRotation?: Offset | null;
  wearableScale?: Offset | null;
};

type AssembleOptions = {
  birdUrl: string;
  buildingUrl: string;
  buildingOffset?: Offset | null;
  wearables?: WearableAttachment[] | null;
  cacheKey: string;
};

type AssembleWearableOptions = {
  birdUrl: string;
  wearableUrl: string;
  wearableOffset?: Offset | null;
  wearableRotation?: Offset | null;
  wearableScale?: Offset | null;
  cacheKey: string;
};

type AssembleWearablesOptions = {
  birdUrl: string;
  wearables: WearableAttachment[];
  cacheKey: string;
};

type CacheEntry = {
  promise: Promise<Blob>;
  size: number | null;
  expiresAt: number;
};

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
const exporter = new GLTFExporter();

const assembledModelCache = new Map<string, CacheEntry>();
const ASSEMBLED_MODEL_CACHE_LIMIT = 4;
const ASSEMBLED_MODEL_CACHE_MAX_BYTES = 48 * 1024 * 1024;
const ASSEMBLED_MODEL_CACHE_TTL_MS = 2 * 60 * 1000;
const MAX_CONCURRENT_ASSEMBLIES = 1;
const MAX_EXPORT_TEXTURE_SIZE = 1024;
const MIN_BYTES_TO_ATTEMPT_COMPRESSION = 256 * 1024;
const assemblyWaitQueue: Array<() => void> = [];
let activeAssemblies = 0;

const textureKeys = [
  'map',
  'alphaMap',
  'aoMap',
  'bumpMap',
  'clearcoatMap',
  'clearcoatNormalMap',
  'clearcoatRoughnessMap',
  'displacementMap',
  'emissiveMap',
  'envMap',
  'gradientMap',
  'iridescenceMap',
  'iridescenceThicknessMap',
  'lightMap',
  'matcap',
  'metalnessMap',
  'normalMap',
  'roughnessMap',
  'sheenColorMap',
  'sheenRoughnessMap',
  'specularColorMap',
  'specularIntensityMap',
  'thicknessMap',
  'transmissionMap',
] as const;

const decoderBasePath = '/draco/';
dracoLoader.setDecoderPath(decoderBasePath);
dracoLoader.setDecoderConfig({ type: 'wasm' });
loader.setDRACOLoader(dracoLoader);

const normalizeOffset = (offset?: Offset | null): Offset =>
  offset && offset.length === 3 ? offset : [0, 0, 0];

const normalizeScale = (scale?: Offset | null): Offset => {
  if (scale && scale.length === 3) return scale;
  return [1, 1, 1];
};

const loadScene = (url: string) =>
  new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      url,
      (gltf: GLTF) => resolve(gltf.scene),
      undefined,
      (error: unknown) => reject(error)
    );
  });

const disposeMaterial = (material: THREE.Material) => {
  const materialWithMaps = material as THREE.Material & Record<string, unknown>;
  for (const key of textureKeys) {
    const texture = materialWithMaps[key];
    if (texture instanceof THREE.Texture) {
      texture.dispose();
    }
  }
  material.dispose();
};

const disposeScene = (scene: THREE.Object3D) => {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh & {
      material?: THREE.Material | THREE.Material[];
      geometry?: THREE.BufferGeometry;
      skeleton?: { dispose?: () => void };
    };

    mesh.geometry?.dispose();

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) => disposeMaterial(material));
    } else if (mesh.material) {
      disposeMaterial(mesh.material);
    }

    mesh.skeleton?.dispose?.();
  });

  scene.clear();
};

const blobFromExporterResult = (result: ArrayBuffer | object) => {
  if (result instanceof ArrayBuffer) {
    return new Blob([result], { type: 'model/gltf-binary' });
  }

  return new Blob([JSON.stringify(result)], { type: 'model/gltf+json' });
};

const compressExportedBlob = async (blob: Blob) => {
  if (typeof window === 'undefined' || blob.size < MIN_BYTES_TO_ATTEMPT_COMPRESSION) {
    return blob;
  }

  try {
    const response = await fetch('/api/gltf/compress', {
      method: 'POST',
      headers: {
        'Content-Type': blob.type || 'model/gltf-binary',
      },
      body: blob,
    });

    if (!response.ok) {
      return blob;
    }

    const compressed = await response.blob();
    return compressed.size > 0 && compressed.size < blob.size ? compressed : blob;
  } catch {
    return blob;
  }
};

const exportSceneToBlob = async (scene: THREE.Object3D): Promise<Blob> => {
  scene.updateMatrixWorld(true);

  try {
    const exportedBlob = await new Promise<Blob>((resolve, reject) => {
      exporter.parse(
        scene,
        (result) => {
          resolve(blobFromExporterResult(result as ArrayBuffer | object));
        },
        (error) => {
          reject(error);
        },
        {
          binary: true,
          embedImages: true,
          forceIndices: true,
          onlyVisible: true,
          truncateDrawRange: true,
          maxTextureSize: MAX_EXPORT_TEXTURE_SIZE,
          animations: scene.animations || [],
        }
      );
    });

    return await compressExportedBlob(exportedBlob);
  } finally {
    disposeScene(scene);
  }
};

const deleteCacheEntry = (key: string) => {
  assembledModelCache.delete(key);
};

const touchCacheKey = (key: string) => {
  const entry = assembledModelCache.get(key);
  if (!entry) return;
  assembledModelCache.delete(key);
  assembledModelCache.set(key, entry);
};

const getCurrentCacheBytes = () => {
  let total = 0;
  for (const entry of assembledModelCache.values()) {
    total += entry.size ?? 0;
  }
  return total;
};

const pruneExpiredCacheEntries = () => {
  const now = Date.now();
  for (const [key, entry] of assembledModelCache.entries()) {
    if (entry.expiresAt <= now) {
      assembledModelCache.delete(key);
    }
  }
};

const evictOldCacheEntries = () => {
  pruneExpiredCacheEntries();

  while (
    assembledModelCache.size > ASSEMBLED_MODEL_CACHE_LIMIT ||
    getCurrentCacheBytes() > ASSEMBLED_MODEL_CACHE_MAX_BYTES
  ) {
    const oldestKey = assembledModelCache.keys().next().value as string | undefined;
    if (!oldestKey) return;
    assembledModelCache.delete(oldestKey);
  }
};

const setCacheEntry = (key: string, promise: Promise<Blob>) => {
  const entry: CacheEntry = {
    promise,
    size: null,
    expiresAt: Date.now() + ASSEMBLED_MODEL_CACHE_TTL_MS,
  };

  assembledModelCache.set(key, entry);
  evictOldCacheEntries();

  promise
    .then((blob) => {
      const current = assembledModelCache.get(key);
      if (!current || current.promise !== promise) return;
      current.size = blob.size;
      current.expiresAt = Date.now() + ASSEMBLED_MODEL_CACHE_TTL_MS;
      evictOldCacheEntries();
    })
    .catch(() => {
      deleteCacheEntry(key);
    });
};

const runWithConcurrencyLimit = async <T>(task: () => Promise<T>) => {
  if (activeAssemblies >= MAX_CONCURRENT_ASSEMBLIES) {
    await new Promise<void>((resolve) => {
      assemblyWaitQueue.push(resolve);
    });
  }

  activeAssemblies += 1;
  try {
    return await task();
  } finally {
    activeAssemblies = Math.max(0, activeAssemblies - 1);
    const next = assemblyWaitQueue.shift();
    if (next) next();
  }
};

const getOrCreateAssembledBlob = (key: string, factory: () => Promise<Blob>) => {
  pruneExpiredCacheEntries();

  const cached = assembledModelCache.get(key);
  if (cached) {
    touchCacheKey(key);
    return cached.promise;
  }

  const promise = runWithConcurrencyLimit(factory);
  setCacheEntry(key, promise);
  return promise;
};

export const getAssembledModelBlob = ({
  birdUrl,
  buildingUrl,
  buildingOffset,
  wearables,
  cacheKey,
}: AssembleOptions) => {
  const offset = normalizeOffset(buildingOffset);
  const wearableKey = (wearables ?? [])
    .map((wearable) => {
      const wearableOffset = normalizeOffset(wearable.wearableOffset);
      const wearableRotation = normalizeOffset(wearable.wearableRotation);
      const wearableScale = normalizeScale(wearable.wearableScale);
      return `${wearable.wearableUrl}|${wearableOffset.join(',')}|${wearableRotation.join(',')}|${wearableScale.join(',')}`;
    })
    .join(';');
  const key = `${cacheKey}|${birdUrl}|${buildingUrl}|${offset.join(',')}|${wearableKey}`;

  return getOrCreateAssembledBlob(key, async () => {
    const wearableSpecs = wearables ?? [];
    const [birdScene, buildingScene, ...wearableScenes] = await Promise.all([
      loadScene(birdUrl),
      loadScene(buildingUrl),
      ...wearableSpecs.map((wearable) => loadScene(wearable.wearableUrl)),
    ]);

    const root = new THREE.Group();
    birdScene.position.set(0, 0, 0);
    buildingScene.position.set(offset[0], offset[1], offset[2]);

    wearableScenes.forEach((wearableScene: THREE.Group, index: number) => {
      const spec = wearableSpecs[index];
      if (!spec) return;
      const wearableOffset = normalizeOffset(spec.wearableOffset);
      const wearableRotation = normalizeOffset(spec.wearableRotation);
      const wearableScale = normalizeScale(spec.wearableScale);

      wearableScene.position.set(wearableOffset[0], wearableOffset[1], wearableOffset[2]);
      wearableScene.rotation.set(wearableRotation[0], wearableRotation[1], wearableRotation[2]);
      wearableScene.scale.set(wearableScale[0], wearableScale[1], wearableScale[2]);

      root.add(wearableScene);
    });

    root.add(buildingScene);
    root.add(birdScene);

    return exportSceneToBlob(root);
  });
};

export const getAssembledWearableModelBlob = ({
  birdUrl,
  wearableUrl,
  wearableOffset,
  wearableRotation,
  wearableScale,
  cacheKey,
}: AssembleWearableOptions) => {
  const offset = normalizeOffset(wearableOffset);
  const rotation = normalizeOffset(wearableRotation);
  const scale = normalizeScale(wearableScale);
  const key = `${cacheKey}|${birdUrl}|${wearableUrl}|${offset.join(',')}|${rotation.join(',')}|${scale.join(',')}`;

  return getOrCreateAssembledBlob(key, async () => {
    const [birdScene, wearableScene] = await Promise.all([
      loadScene(birdUrl),
      loadScene(wearableUrl),
    ]);

    const root = new THREE.Group();

    birdScene.position.set(0, 0, 0);
    wearableScene.position.set(offset[0], offset[1], offset[2]);
    wearableScene.rotation.set(rotation[0], rotation[1], rotation[2]);
    wearableScene.scale.set(scale[0], scale[1], scale[2]);

    root.add(wearableScene);
    root.add(birdScene);

    return exportSceneToBlob(root);
  });
};

export const getAssembledWearablesModelBlob = ({
  birdUrl,
  wearables,
  cacheKey,
}: AssembleWearablesOptions) => {
  const wearableKey = wearables
    .map((wearable) => {
      const wearableOffset = normalizeOffset(wearable.wearableOffset);
      const wearableRotation = normalizeOffset(wearable.wearableRotation);
      const wearableScale = normalizeScale(wearable.wearableScale);
      return `${wearable.wearableUrl}|${wearableOffset.join(',')}|${wearableRotation.join(',')}|${wearableScale.join(',')}`;
    })
    .join(';');
  const key = `${cacheKey}|${birdUrl}|${wearableKey}`;

  return getOrCreateAssembledBlob(key, async () => {
    const [birdScene, ...wearableScenes] = await Promise.all([
      loadScene(birdUrl),
      ...wearables.map((wearable) => loadScene(wearable.wearableUrl)),
    ]);

    const root = new THREE.Group();
    birdScene.position.set(0, 0, 0);

    wearableScenes.forEach((wearableScene: THREE.Group, index: number) => {
      const spec = wearables[index];
      if (!spec) return;
      const wearableOffset = normalizeOffset(spec.wearableOffset);
      const wearableRotation = normalizeOffset(spec.wearableRotation);
      const wearableScale = normalizeScale(spec.wearableScale);

      wearableScene.position.set(wearableOffset[0], wearableOffset[1], wearableOffset[2]);
      wearableScene.rotation.set(wearableRotation[0], wearableRotation[1], wearableRotation[2]);
      wearableScene.scale.set(wearableScale[0], wearableScale[1], wearableScale[2]);
      root.add(wearableScene);
    });

    root.add(birdScene);
    return exportSceneToBlob(root);
  });
};
