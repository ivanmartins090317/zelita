import type { SupabaseClient } from "@supabase/supabase-js";

import type { MedicationScheduleSnapshot } from "@/modules/medications/domain/hoje-timeline";
import { fetchHojeMedicationData } from "./medication-read-repo";

export async function fetchMedicationPreviewSamples(
  supabase: SupabaseClient,
  careRecipientId: string,
  now: Date,
  timeZone: string,
): Promise<
  Array<{
    medicationName: string;
    dosageLabel: string;
    times: string[];
  }>
> {
  const result = await fetchHojeMedicationData(
    supabase,
    careRecipientId,
    now,
    timeZone,
  );

  return result.medications.map((medication: MedicationScheduleSnapshot) => ({
    medicationName: medication.medicationName,
    dosageLabel: medication.dosageLabel,
    times: medication.times,
  }));
}
