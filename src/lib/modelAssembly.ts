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

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
const exporter = new GLTFExporter();
const assembledModelCache = new Map<string, Promise<Blob>>();
const ASSEMBLED_MODEL_CACHE_LIMIT = 32;
const MAX_CONCURRENT_ASSEMBLIES = 1;
const assemblyWaitQueue: Array<() => void> = [];
let activeAssemblies = 0;

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

const touchCacheKey = (key: string, value: Promise<Blob>) => {
  assembledModelCache.delete(key);
  assembledModelCache.set(key, value);
};

const evictOldCacheEntries = () => {
  while (assembledModelCache.size > ASSEMBLED_MODEL_CACHE_LIMIT) {
    const oldestKey = assembledModelCache.keys().next().value as string | undefined;
    if (!oldestKey) return;
    assembledModelCache.delete(oldestKey);
  }
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

const exportSceneToBlob = (scene: THREE.Object3D) =>
  new Promise<Blob>((resolve, reject) => {
    exporter.parse(
      scene,
      (result: ArrayBuffer | object) => {
        try {
          if (result instanceof ArrayBuffer) {
            resolve(new Blob([result], { type: 'model/gltf-binary' }));
            return;
          }
          resolve(new Blob([JSON.stringify(result)], { type: 'model/gltf+json' }));
        } catch (error) {
          reject(error);
        }
      },
      (error: unknown) => reject(error),
      { binary: true, embedImages: true }
    );
  });

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
  const cached = assembledModelCache.get(key);
  if (cached) {
    touchCacheKey(key, cached);
    return cached;
  }

  const promise = runWithConcurrencyLimit(async () => {
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

  assembledModelCache.set(key, promise);
  evictOldCacheEntries();
  promise.catch(() => {
    assembledModelCache.delete(key);
  });
  return promise;
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
  const cached = assembledModelCache.get(key);
  if (cached) {
    touchCacheKey(key, cached);
    return cached;
  }

  const promise = runWithConcurrencyLimit(async () => {
    const [birdScene, wearableScene] = await Promise.all([
      loadScene(birdUrl),
      loadScene(wearableUrl),
    ]);

    const root = new THREE.Group();

    // Bird stays at origin. Wearable is placed relative to it when offsets are provided.
    birdScene.position.set(0, 0, 0);
    wearableScene.position.set(offset[0], offset[1], offset[2]);
    wearableScene.rotation.set(rotation[0], rotation[1], rotation[2]);
    wearableScene.scale.set(scale[0], scale[1], scale[2]);

    root.add(wearableScene);
    root.add(birdScene);

    return exportSceneToBlob(root);
  });

  assembledModelCache.set(key, promise);
  evictOldCacheEntries();
  promise.catch(() => {
    assembledModelCache.delete(key);
  });
  return promise;
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
  const cached = assembledModelCache.get(key);
  if (cached) {
    touchCacheKey(key, cached);
    return cached;
  }

  const promise = runWithConcurrencyLimit(async () => {
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

  assembledModelCache.set(key, promise);
  evictOldCacheEntries();
  promise.catch(() => {
    assembledModelCache.delete(key);
  });
  return promise;
};
