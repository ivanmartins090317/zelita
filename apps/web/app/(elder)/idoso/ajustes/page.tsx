import { readElderDisplayFromCookie } from "@/modules/elder-access/application/read-elder-display";
import { ElderSettings } from "@/modules/elder-access/presentation/elder-settings";

export default async function ElderSettingsPage() {
  const display = await readElderDisplayFromCookie();
  return <ElderSettings initial={display} />;
}
