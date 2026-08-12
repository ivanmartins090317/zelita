import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * Webhook WhatsApp — verificação de challenge + registro de opt-in (SIM).
 * Sem verify token: responde 503 com correção (não quebra o painel).
 */
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
  try {
    const body = (await request.json()) as {
      entry?: Array<{
        changes?: Array<{
          value?: {
            messages?: Array<{ from?: string; text?: { body?: string } }>;
          };
        }>;
      }>;
    };

    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const text = message?.text?.body?.trim().toUpperCase();
    const from = message?.from;

    if (text === "SIM" && from) {
      const supabase = createSupabaseServiceClient();
      const digits = from.replace(/\D/g, "");
      const { data: recipients } = await supabase
        .from("care_recipients")
        .select("id, whatsapp")
        .is("wa_opt_in_at", null);

      const match = recipients?.find((r) =>
        (r.whatsapp ?? "").replace(/\D/g, "").endsWith(digits.slice(-8)),
      );

      if (match) {
        await supabase
          .from("care_recipients")
          .update({ wa_opt_in_at: new Date().toISOString() })
          .eq("id", match.id);

        await supabase.from("medication_events").insert({
          care_recipient_id: match.id,
          type: "wa_opt_in_accepted",
          channel: "whatsapp",
          payload: { from },
        });
      }
    }

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
