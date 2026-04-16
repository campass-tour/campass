import { Group } from './three';

export type GLTF = { scene: Group };

export class GLTFLoader {
  setDRACOLoader(_loader: unknown) {}
  load(
    _url: string,
    onLoad: (gltf: GLTF) => void,
    _onProgress?: unknown,
    _onError?: (error: unknown) => void
  ) {
    onLoad({ scene: new Group() });
  }
}

export class DRACOLoader {
  setDecoderPath(_path: string) {}
  setDecoderConfig(_config: unknown) {}
}

export class GLTFExporter {
  parse(
    _input: unknown,
    onDone: (result: ArrayBuffer | object) => void,
    _onError?: (error: unknown) => void,
    _options?: unknown
  ) {
    onDone(new ArrayBuffer(0));
  }
}
