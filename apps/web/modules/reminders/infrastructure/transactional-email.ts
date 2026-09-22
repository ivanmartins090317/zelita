export interface TransactionalEmail {
  to: string;
  subject: string;
  text: string;
}

export interface EmailSendResult {
  ok: boolean;
  dryRun: boolean;
  message: string;
}

const DEFAULT_FROM = "Zelita <zelita@mail.modernxlab.com.br>";

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Envio pontual via HTTP da Resend — sem SDK novo. Sem chave = dry-run. */
export async function sendTransactionalEmail(
  email: TransactionalEmail,
): Promise<EmailSendResult> {
  if (!isResendConfigured()) {
    return {
      ok: true,
      dryRun: true,
      message: `Dry-run e-mail "${email.subject}". Preencha RESEND_API_KEY para envio real.`,
    };
  }

  const from = process.env.RESEND_FROM ?? DEFAULT_FROM;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email.to],
      subject: email.subject,
      text: email.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return {
      ok: false,
      dryRun: false,
      message: `Falha Resend (${response.status}): ${detail}. Confira RESEND_API_KEY e o remetente.`,
    };
  }

  return { ok: true, dryRun: false, message: "E-mail aceito pela Resend." };
}
