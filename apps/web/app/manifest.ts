import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zelita",
    short_name: "Zelita",
    start_url: "/idoso",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#0f5b54",
    lang: "pt-BR",
    icons: [
      {
        src: "/brand/zelita-mark.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
      {
        src: "/brand/zelita-mark.png",
        type: "image/png",
        sizes: "128x128",
        purpose: "any",
      },
    ],
  };
}
