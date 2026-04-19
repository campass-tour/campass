const MAX_INPUT_BYTES = 50 * 1024 * 1024;
const ACCEPTED_CONTENT_TYPES = new Set(['model/gltf-binary', 'application/octet-stream']);

export const runtime = 'nodejs';

type CompressionModules = {
  NodeIO: new () => NodeIOInstance;
  KHRDracoMeshCompression: {
    EncoderMethod: {
      EDGEBREAKER: number;
    };
  };
  dedup: () => () => unknown;
  prune: () => () => unknown;
  draco3d: {
    createDecoderModule: () => Promise<unknown>;
    createEncoderModule: () => Promise<unknown>;
  };
};

type NodeIOInstance = {
  registerExtensions(extensions: unknown[]): NodeIOInstance;
  registerDependencies(dependencies: Record<string, unknown>): NodeIOInstance;
  readBinary(input: Uint8Array): Promise<{
    transform(...transforms: Array<() => unknown>): Promise<void>;
    createExtension(extension: unknown): {
      setRequired(required: boolean): {
        setEncoderOptions(options: Record<string, unknown>): void;
      };
    };
  }>;
  writeBinary(document: unknown): Promise<Uint8Array>;
};

const dynamicImport = <T>(specifier: string) =>
  new Function('s', 'return import(s)')(specifier) as Promise<T>;

let compressionModulesPromise: Promise<CompressionModules> | null = null;

const loadCompressionModules = async () => {
  if (compressionModulesPromise) {
    return compressionModulesPromise;
  }

  compressionModulesPromise = (async () => {
    const [coreModule, extensionsModule, functionsModule, dracoModule] = await Promise.all([
      dynamicImport<{ NodeIO: CompressionModules['NodeIO'] }>('@gltf-transform/core'),
      dynamicImport<{ KHRDracoMeshCompression: CompressionModules['KHRDracoMeshCompression'] }>('@gltf-transform/extensions'),
      dynamicImport<{
        dedup: CompressionModules['dedup'];
        prune: CompressionModules['prune'];
      }>('@gltf-transform/functions'),
      dynamicImport<{ default: CompressionModules['draco3d'] }>('draco3dgltf'),
    ]);

    return {
      NodeIO: coreModule.NodeIO,
      KHRDracoMeshCompression: extensionsModule.KHRDracoMeshCompression,
      dedup: functionsModule.dedup,
      prune: functionsModule.prune,
      draco3d: dracoModule.default,
    };
  })().catch((error) => {
    compressionModulesPromise = null;
    throw error;
  });

  return compressionModulesPromise;
};

const createCompressionIo = async () => {
  const modules = await loadCompressionModules();
  const [decoderModule, encoderModule] = await Promise.all([
    modules.draco3d.createDecoderModule(),
    modules.draco3d.createEncoderModule(),
  ]);

  const io = new modules.NodeIO()
    .registerExtensions([modules.KHRDracoMeshCompression])
    .registerDependencies({
      'draco3d.decoder': decoderModule,
      'draco3d.encoder': encoderModule,
    });

  return {
    io,
    KHRDracoMeshCompression: modules.KHRDracoMeshCompression,
    dedup: modules.dedup,
    prune: modules.prune,
  };
};

const jsonError = (status: number, message: string) =>
  Response.json(
    {
      error: message,
    },
    { status }
  );

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim();
  if (contentType && !ACCEPTED_CONTENT_TYPES.has(contentType)) {
    return jsonError(415, 'Expected a GLB binary payload.');
  }

  const contentLengthHeader = request.headers.get('content-length');
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : Number.NaN;
  if (Number.isFinite(contentLength) && contentLength > MAX_INPUT_BYTES) {
    return jsonError(413, 'GLB payload exceeds the 50MB limit.');
  }

  try {
    const input = new Uint8Array(await request.arrayBuffer());
    if (input.byteLength > MAX_INPUT_BYTES) {
      return jsonError(413, 'GLB payload exceeds the 50MB limit.');
    }

    const { io, KHRDracoMeshCompression, dedup, prune } = await createCompressionIo();
    const document = await io.readBinary(input);

    await document.transform(dedup(), prune());

    document
      .createExtension(KHRDracoMeshCompression)
      .setRequired(true)
      .setEncoderOptions({
        method: KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER,
        encodeSpeed: 5,
        decodeSpeed: 5,
        quantizationBits: {
          POSITION: 14,
          NORMAL: 10,
          COLOR: 8,
          TEX_COORD: 12,
          GENERIC: 12,
        },
        quantizationVolume: 'mesh',
      });

    const output = await io.writeBinary(document);

    const outputBuffer = output.buffer.slice(
      output.byteOffset,
      output.byteOffset + output.byteLength
    ) as ArrayBuffer;

    return new Response(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Content-Length': String(output.byteLength),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('@gltf-transform') || message.includes('draco3dgltf')) {
      return jsonError(503, 'GLTF compression dependencies are not installed on the server.');
    }

    console.error('Failed to Draco-compress GLB.', error);
    return jsonError(500, 'Failed to compress GLB.');
  }
}
