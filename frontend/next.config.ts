import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this folder. A package.json/lockfile in the parent
  // directory (the repo root, used to run both apps together) otherwise makes
  // Next infer the wrong root and breaks the RSC client manifest.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
