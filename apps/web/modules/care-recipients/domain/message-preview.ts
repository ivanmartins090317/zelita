import type { SignupToneSlug } from "./signup-options";

export interface ReminderPreviewInput {
  tone: SignupToneSlug;
  careDisplayName: string;
  managerName: string;
}

function firstName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

/** Prévia de lembrete WA — nunca implica que o remédio foi tomado. */
export function buildReminderPreview(input: ReminderPreviewInput): string {
  const careName = input.careDisplayName.trim() || "você";
  const manager = firstName(input.managerName) || "sua família";

  if (input.tone === "carinhoso") {
    return `Bom dia, ${careName}! 😊 Está na hora do seu remédio. Qualquer coisa é só chamar a ${manager}. — Zelita`;
  }

  if (input.tone === "direto") {
    return `${careName}, hora do remédio. Se precisar, chame ${manager}. — Zelita`;
  }

  return `Prezado(a) ${careName}, lembramos que é horário da medicação. Em caso de necessidade, contate ${manager}. — Zelita`;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidDndTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}

/** Valida par de horários de não incomodar (antes/depois). */
export function validateDndWindow(input: {
  dontBotherBefore: string;
  dontBotherAfter: string;
}): { ok: true } | { ok: false; message: string } {
  if (!isValidDndTime(input.dontBotherBefore)) {
    return {
      ok: false,
      message: "Informe o horário “não incomodar antes de” no formato HH:MM.",
    };
  }
  if (!isValidDndTime(input.dontBotherAfter)) {
    return {
      ok: false,
      message: "Informe o horário “não incomodar depois de” no formato HH:MM.",
    };
  }
  if (input.dontBotherBefore === input.dontBotherAfter) {
    return {
      ok: false,
      message: "Os horários de não incomodar precisam formar um intervalo válido.",
    };
  }
  return { ok: true };
}

/** Mapeia rótulos do wizard para colunas dnd_start/dnd_end do banco. */
export function mapDndToPersistence(input: {
  dontBotherBefore: string;
  dontBotherAfter: string;
}): { dndStart: string; dndEnd: string } {
  return {
    dndStart: input.dontBotherAfter,
    dndEnd: input.dontBotherBefore,
  };
}
