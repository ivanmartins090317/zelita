import { NextResponse } from "next/server";

/** Stub do webhook de billing — implementação fora desta Spec. */
export function POST() {
  return NextResponse.json(
    { ok: false, message: "Billing webhook stub" },
    { status: 501 },
  );
}
