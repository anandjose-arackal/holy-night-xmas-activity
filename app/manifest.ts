import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bethlehem — 27 days to Christmas",
    short_name: "Bethlehem",
    start_url: "/",
    display: "standalone",
    background_color: "#24151a",
    theme_color: "#24151a",
    // shortcut: one SVG icon; add 192px and 512px PNGs if an app store or older Android needs them.
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
