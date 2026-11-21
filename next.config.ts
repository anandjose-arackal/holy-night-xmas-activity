import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.137", "192.168.0.176"], // phone testing on the LAN
  devIndicators: false, // the dev badge covered bottom-left buttons; errors still show
  cacheComponents: true,
  // Models and pictures are fetched with ?v=ASSET_VERSION (lib/asset.ts), so phones may keep them for a year
  // without asking again; raising the version gives every file a new address.
  async headers() {
    const year = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      { source: "/models/:file*", headers: year },
      { source: "/treasures/:file*", headers: year },
      { source: "/bg/:file(village-.*)", headers: year },
      // Voice model and runtime (~6 MB gzipped). Their names do not change between versions, so a week, not a year.
      { source: "/vad/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=604800" }] },
      // Only this site may use the microphone (Pray now), never an embedded page.
      { source: "/:path*", headers: [{ key: "Permissions-Policy", value: "microphone=(self)" }] },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
