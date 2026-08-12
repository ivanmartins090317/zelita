"use server";

import { pauseMedicationPack } from "@/modules/medications/application/medication-actions";

export async function pausePackAction(formData: FormData) {
  const packId = String(formData.get("packId") ?? "");
  if (!packId) return;
  await pauseMedicationPack(packId);
}
