import { revalidatePath } from "next/cache";

import { familyRoutes } from "@/content/family";

export async function revalidateAjustesPaths() {
  revalidatePath(familyRoutes.ajustes);
  revalidatePath(familyRoutes.hoje);
}
