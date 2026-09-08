import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root: without it Turbopack walks up and picks the
  // package-lock.json in the home directory, which is not this project.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
