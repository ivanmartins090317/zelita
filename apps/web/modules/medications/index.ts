import {
  computeDailyConsumption,
  computePackEnd,
  DEFAULT_REFILL_ALERT_DAYS,
  shouldWarnRefill,
} from "./domain/pack-end";
import { deleteMedication } from "./application/delete-medication";
import {
  createMedicationWithPack,
  pauseMedicationPack,
  previewPackEnd,
  registerReplacementPack,
} from "./application/medication-actions";

import { getHojeMedications } from "./application/get-hoje-medications";
import { getRemediosPage } from "./application/get-remedios-page";
import { getMedicationSchedulesForAgenda } from "./application/get-medication-schedules-for-agenda";
import { fetchMedicationPreviewSamples } from "./infrastructure/medication-preview-read";

export const medicationsModule = {
  id: "medications",
} as const;

export {
  computeDailyConsumption,
  computePackEnd,
  DEFAULT_REFILL_ALERT_DAYS,
  shouldWarnRefill,
  createMedicationWithPack,
  deleteMedication,
  pauseMedicationPack,
  previewPackEnd,
  registerReplacementPack,
  getHojeMedications,
  getRemediosPage,
  getMedicationSchedulesForAgenda,
  fetchMedicationPreviewSamples,
};
