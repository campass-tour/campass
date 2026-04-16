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
};

export default nextConfig;
