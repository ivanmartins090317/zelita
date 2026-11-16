import {
  isWebManifestSurface,
  WEB_MANIFESTS,
} from "@/lib/pwa/web-manifests";

interface ManifestRouteProps {
  params: Promise<{ surface: string }>;
}

export async function GET(
  _request: Request,
  { params }: ManifestRouteProps,
): Promise<Response> {
  const { surface } = await params;
  if (!isWebManifestSurface(surface)) {
    return new Response(null, { status: 404 });
  }

  return Response.json(WEB_MANIFESTS[surface](), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
