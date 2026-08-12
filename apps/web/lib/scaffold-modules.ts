import { accountsModule } from "@/modules/accounts";
import { billingModule } from "@/modules/billing";
import { careRecipientsModule } from "@/modules/care-recipients";
import { elderAccessModule } from "@/modules/elder-access";
import { examsModule } from "@/modules/exams";
import { locationModule } from "@/modules/location";
import { medicationsModule } from "@/modules/medications";
import { remindersModule } from "@/modules/reminders";
import { sosModule } from "@/modules/sos";

/** IDs dos 9 módulos verticais do monólito modular Zelita. */
export const ZELITA_MODULE_IDS = [
  accountsModule.id,
  careRecipientsModule.id,
  medicationsModule.id,
  remindersModule.id,
  sosModule.id,
  locationModule.id,
  examsModule.id,
  billingModule.id,
  elderAccessModule.id,
] as const;

export type ZelitaModuleId = (typeof ZELITA_MODULE_IDS)[number];

/** Confirma que o esqueleto do scaffold expõe exatamente os módulos esperados. */
export function hasScaffoldModules(
  ids: readonly string[] = ZELITA_MODULE_IDS,
): boolean {
  const expected = new Set<string>(ZELITA_MODULE_IDS);
  if (ids.length !== expected.size) return false;
  return ids.every((id) => expected.has(id));
}
