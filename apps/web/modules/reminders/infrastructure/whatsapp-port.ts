export interface WhatsAppMessage {
  toE164ish: string;
  body: string;
  kind: "opt_in_request" | "reminder";
}

export interface WhatsAppSendResult {
  ok: boolean;
  dryRun: boolean;
  providerMessageId?: string;
  message: string;
}

export interface WhatsAppPort {
  sendText(message: WhatsAppMessage): Promise<WhatsAppSendResult>;
}

export function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID,
  );
}

/** Adapter Meta Cloud API — sem token = modo seco (Spec cenário 16). */
export function createWhatsAppPort(): WhatsAppPort {
  return {
    async sendText(message) {
      if (!isWhatsAppConfigured()) {
        return {
          ok: true,
          dryRun: true,
          message: `Dry-run WA (${message.kind}) para ${message.toE164ish}. Preencha WHATSAPP_ACCESS_TOKEN e WHATSAPP_PHONE_NUMBER_ID para envio real.`,
        };
      }

      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
      const token = process.env.WHATSAPP_ACCESS_TOKEN!;
      const to = message.toE164ish.replace(/\D/g, "");

      const response = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: message.body },
          }),
        },
      );

      if (!response.ok) {
        const detail = await response.text();
        return {
          ok: false,
          dryRun: false,
          message: `Falha WhatsApp (${response.status}): ${detail}. Verifique token/sandbox.`,
        };
      }

      const json = (await response.json()) as {
        messages?: Array<{ id?: string }>;
      };
      return {
        ok: true,
        dryRun: false,
        providerMessageId: json.messages?.[0]?.id,
        message: "Mensagem WhatsApp aceita pelo provedor.",
      };
    },
  };
}
