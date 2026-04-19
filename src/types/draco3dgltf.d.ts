declare module 'draco3dgltf' {
  type DracoModuleFactory<T> = () => Promise<T>;

  const draco3d: {
    createEncoderModule: DracoModuleFactory<unknown>;
    createDecoderModule: DracoModuleFactory<unknown>;
  };

  export default draco3d;
}
