import { NextResponse } from "next/server";

/** Stub do webhook WhatsApp — implementação fora desta Spec. */
export function POST() {
  return NextResponse.json(
    { ok: false, message: "WhatsApp webhook stub" },
    { status: 501 },
  );
}
