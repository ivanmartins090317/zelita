import type { MetadataRoute } from "next";

const ICONS: NonNullable<MetadataRoute.Manifest["icons"]> = [
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
];

function surfaceManifest(input: {
  id: string;
  name: string;
  shortName: string;
}): MetadataRoute.Manifest {
  return {
    id: input.id,
    name: input.name,
    short_name: input.shortName,
    start_url: input.id,
    scope: input.id,
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#0f5b54",
    lang: "pt-BR",
    icons: ICONS,
  };
}

export const WEB_MANIFESTS = {
  familia: () =>
    surfaceManifest({
      id: "/familia",
      name: "Zelita família",
      shortName: "Família",
    }),
  idoso: () =>
    surfaceManifest({
      id: "/idoso",
      name: "Zelita",
      shortName: "Zelita",
    }),
} as const;

export type WebManifestSurface = keyof typeof WEB_MANIFESTS;

export function isWebManifestSurface(value: string): value is WebManifestSurface {
  return value === "familia" || value === "idoso";
}

export function webManifestPath(surface: WebManifestSurface): string {
  return `/pwa/${surface}`;
}
