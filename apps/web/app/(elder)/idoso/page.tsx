import { getElderSurface } from "@/modules/elder-access/application/get-elder-surface";
import { ElderHome } from "@/modules/elder-access/presentation/elder-home";

export default async function ElderHomePage() {
  const surface = await getElderSurface();
  if (surface.kind !== "ready") return null;

  return (
    <ElderHome
      greeting={surface.greeting}
      dateLabel={surface.dateLabel}
      homeCard={surface.homeCard}
      loadWarning={surface.loadWarning}
      linkedDevice={surface.door === "device"}
      familyTel={surface.calls.find((call) => call.tel)?.tel ?? null}
    />
  );
}
