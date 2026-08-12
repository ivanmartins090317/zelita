import { NextResponse } from "next/server";

/** Stub do endpoint Inngest — implementação fora desta Spec. */
export function POST() {
  return NextResponse.json(
    { ok: false, message: "Inngest webhook stub" },
    { status: 501 },
  );
}

export function GET() {
  return NextResponse.json(
    { ok: false, message: "Inngest webhook stub" },
    { status: 501 },
  );
}
