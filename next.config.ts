import type { NextConfig } from "next";
import path from "node:path";

const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  // Pin the workspace root: without it Turbopack walks up and picks the
  // package-lock.json in the home directory, which is not this project.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // GitHub Pages demo build only (see scripts/export-pages.mjs). Untouched for
  // the normal `next dev`/`next build`/`next start` server deployment.
  ...(STATIC_EXPORT
    ? {
        output: "export",
        basePath: "/rateradar",
        assetPrefix: "/rateradar/",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
