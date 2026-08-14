import {
  buildReminderPreview,
  type ReminderPreviewInput,
} from "./message-preview";

export interface MedicationPreviewSample {
  time: string;
  medicationName: string;
  dosageLabel: string;
}

export interface ReminderPreviewWithMedicationInput extends ReminderPreviewInput {
  medication?: MedicationPreviewSample | null;
}

function firstName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function buildMedicationPhrase(sample: MedicationPreviewSample): string {
  const dose = sample.dosageLabel.trim();
  return dose
    ? ` da ${sample.medicationName} de ${dose}`
    : ` da ${sample.medicationName}`;
}

/** Prévia com remédio opcional — nunca implica tomada confirmada. */
export function buildReminderPreviewWithMedication(
  input: ReminderPreviewWithMedicationInput,
): string {
  if (!input.medication) {
    return buildReminderPreview(input);
  }

  const careName = input.careDisplayName.trim() || "você";
  const manager = firstName(input.managerName) || "sua família";
  const medicationPhrase = buildMedicationPhrase(input.medication);

  if (input.tone === "carinhoso") {
    return `Bom dia, ${careName}! 😊 Está na hora${medicationPhrase}. Qualquer coisa é só chamar a ${manager}. — Zelita`;
  }

  if (input.tone === "direto") {
    return `${careName}, hora${medicationPhrase}. Se precisar, chame ${manager}. — Zelita`;
  }

  return `Prezado(a) ${careName}, lembramos que é horário${medicationPhrase}. Em caso de necessidade, contate ${manager}. — Zelita`;
}

export function pickFirstMedicationForPreview(
  medications: Array<{
    medicationName: string;
    dosageLabel: string;
    times: string[];
  }>,
): MedicationPreviewSample | null {
  let best: MedicationPreviewSample | null = null;

  for (const medication of medications) {
    for (const time of medication.times) {
      const normalized = time.slice(0, 5);
      if (!normalized) continue;

      if (!best || normalized < best.time) {
        best = {
          time: normalized,
          medicationName: medication.medicationName,
          dosageLabel: medication.dosageLabel,
        };
      }
    }
  }

  return best;
}
