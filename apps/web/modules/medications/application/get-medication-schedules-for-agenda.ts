import { fetchHojeMedicationData } from "@/modules/medications/infrastructure/medication-read-repo";
import type { MedicationScheduleSnapshot } from "@/modules/medications/domain/hoje-timeline";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getMedicationSchedulesForAgenda(input: {
  careRecipientId: string;
  now?: Date;
  timeZone: string;
}): Promise<MedicationScheduleSnapshot[]> {
  const supabase = await createSupabaseServerClient();
  const { medications } = await fetchHojeMedicationData(
    supabase,
    input.careRecipientId,
    input.now ?? new Date(),
    input.timeZone,
  );
  return medications;
}
