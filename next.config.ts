import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Avoid spawning child processes during build on restricted Windows environments.
    workerThreads: true,
  },
  typescript: {
    // Work around Windows environments where Next's built-in typecheck
    // may try to spawn a non-Windows `node_modules/.bin/tsc` shim.
    // Run `npm.cmd run typecheck` in CI instead.
    ignoreBuildErrors: true,
  },
  // Silence Turbopack vs webpack mismatch warning by providing an (empty)
  // turbopack config. This keeps our custom webpack hook but avoids the
  // runtime error about mixing Turbopack and webpack configs.
  turbopack: {},
  // Webpack customization: if you're using the CDN `model-viewer` (which
  // provides a global `THREE`), prevent Next.js from bundling `three` into
  // the client bundle to avoid duplicate Three.js instances.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure externals array exists and add a mapping for `three` → global `THREE`.
      // This makes client code expect a runtime global `THREE` (provided by the CDN).
      // Note: server builds still bundle `three` normally.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.externals = config.externals || [];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.externals.push({ three: 'THREE' });
    }

    return config;
  },
};

export default nextConfig;
