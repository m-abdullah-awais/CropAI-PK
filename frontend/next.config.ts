import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Self-contained production build for Docker: .next/standalone carries
  // server.js plus the traced node_modules subset (see frontend/Dockerfile).
  output: "standalone",
  // Pin the workspace root to this folder. A package.json/lockfile in the parent
  // directory (the repo root, used to run both apps together) otherwise makes
  // Next infer the wrong root and breaks the RSC client manifest.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
