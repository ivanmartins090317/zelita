import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { processWhatsAppOptIn } from "@/modules/reminders/application/process-whatsapp-opt-in";
import { isValidWhatsAppSignature } from "@/modules/reminders/infrastructure/whatsapp-signature";

const inboundSchema = z.object({
  entry: z
    .array(
      z.object({
        changes: z
          .array(
            z.object({
              value: z
                .object({
                  messages: z
                    .array(
                      z.object({
                        from: z.string().optional(),
                        text: z
                          .object({ body: z.string().optional() })
                          .optional(),
                      }),
                    )
                    .optional(),
                })
                .optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
});

export async function GET(request: NextRequest) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (!verifyToken) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "WHATSAPP_VERIFY_TOKEN ausente. Preencha no .env.local para validar o webhook.",
      },
      { status: 503 },
    );
  }

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ ok: false, message: "Verificação inválida." }, {
    status: 403,
  });
}

export async function POST(request: NextRequest) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "WHATSAPP_APP_SECRET ausente. Sem assinatura o webhook não grava opt-in.",
      },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  if (!isValidWhatsAppSignature(rawBody, signature, appSecret)) {
    return NextResponse.json(
      { ok: false, message: "Assinatura WhatsApp inválida." },
      { status: 403 },
    );
  }

  let parsedJson: unknown;
  try {
    parsedJson = rawBody.length > 0 ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json(
      { ok: false, message: "JSON do webhook inválido." },
      { status: 400 },
    );
  }

  const parsed = inboundSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Payload WhatsApp fora do formato esperado." },
      { status: 400 },
    );
  }

  const message = parsed.data.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  try {
    const supabase = createSupabaseServiceClient();
    await processWhatsAppOptIn(supabase, {
      text: message?.text?.body,
      from: message?.from,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Falha ao processar webhook WhatsApp.",
      },
      { status: 500 },
    );
  }
}
