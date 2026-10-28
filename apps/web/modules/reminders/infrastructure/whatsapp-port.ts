export const WHATSAPP_TEMPLATE_NAMES = {
  optIn: "zelita_opt_in",
  reminder: "zelita_med_reminder",
  deviceLink: "zelita_device_link",
} as const;

export interface WhatsAppTemplateMessage {
  toE164ish: string;
  kind: "opt_in_request" | "reminder" | "device_link";
  bodyVariables: string[];
}

export interface WhatsAppSendResult {
  ok: boolean;
  dryRun: boolean;
  providerMessageId?: string;
  message: string;
}

export interface WhatsAppPort {
  sendTemplate(message: WhatsAppTemplateMessage): Promise<WhatsAppSendResult>;
}

export function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID,
  );
}

export function resolveTemplateName(
  kind: WhatsAppTemplateMessage["kind"],
): string {
  if (kind === "opt_in_request") {
    return (
      process.env.WHATSAPP_TEMPLATE_OPT_IN ?? WHATSAPP_TEMPLATE_NAMES.optIn
    );
  }
  if (kind === "device_link") {
    return (
      process.env.WHATSAPP_TEMPLATE_DEVICE_LINK ??
      WHATSAPP_TEMPLATE_NAMES.deviceLink
    );
  }
  return (
    process.env.WHATSAPP_TEMPLATE_REMINDER ?? WHATSAPP_TEMPLATE_NAMES.reminder
  );
}

/** Adapter Meta Cloud API — sem token = modo seco. Produção usa template, não texto livre. */
export function createWhatsAppPort(): WhatsAppPort {
  return {
    async sendTemplate(message) {
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
      const templateName = resolveTemplateName(message.kind);

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
            type: "template",
            template: {
              name: templateName,
              language: { code: "pt_BR" },
              components: [
                {
                  type: "body",
                  parameters: message.bodyVariables.map((text) => ({
                    type: "text",
                    text,
                  })),
                },
              ],
            },
          }),
        },
      );

      if (!response.ok) {
        const detail = await response.text();
        return {
          ok: false,
          dryRun: false,
          message: `Falha WhatsApp (${response.status}): ${detail}. Verifique token, sandbox e templates Approved.`,
        };
      }

      const json = (await response.json()) as {
        messages?: Array<{ id?: string }>;
      };
      return {
        ok: true,
        dryRun: false,
        providerMessageId: json.messages?.[0]?.id,
        message: "Template WhatsApp aceito pelo provedor.",
      };
    },
  };
}
