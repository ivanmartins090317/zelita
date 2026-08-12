import {
  computeDailyConsumption,
  computePackEnd,
  DEFAULT_REFILL_ALERT_DAYS,
  shouldWarnRefill,
} from "./domain/pack-end";
import {
  createMedicationWithPack,
  pauseMedicationPack,
  previewPackEnd,
} from "./application/medication-actions";

import { getHojeMedications } from "./application/get-hoje-medications";

export const medicationsModule = {
  id: "medications",
} as const;

export {
  computeDailyConsumption,
  computePackEnd,
  DEFAULT_REFILL_ALERT_DAYS,
  shouldWarnRefill,
  createMedicationWithPack,
  pauseMedicationPack,
  previewPackEnd,
  getHojeMedications,
};
