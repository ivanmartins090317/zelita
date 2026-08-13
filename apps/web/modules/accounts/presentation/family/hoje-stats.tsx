import Link from "next/link";

import { Stat } from "@/components/ui/stat";
import { familyContent, familyRoutes } from "@/content/family";
import type {
  NextMedicationStat,
  RefillAlertSummary,
} from "@/modules/medications/domain/hoje-timeline";
import type { HojeLocationStat } from "@/modules/location/application/get-hoje-location-snapshot";

interface HojeStatsProps {
  nextMedication: NextMedicationStat | null;
  refillSummary: RefillAlertSummary;
  locationStat: HojeLocationStat | null;
}

function HojeStats({
  nextMedication,
  refillSummary,
  locationStat,
}: HojeStatsProps) {
  const copy = familyContent.hoje.maduro.stats;

  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        label={copy.nextLabel}
        value={nextMedication?.timeLabel ?? copy.nextEmpty}
        hint={
          nextMedication
            ? `${nextMedication.medicationLabel} · ${nextMedication.hint}`
            : undefined
        }
      />
      <Stat
        label={copy.refillLabel}
        value={
          refillSummary.count > 0
            ? String(refillSummary.count)
            : copy.refillEmpty
        }
        tone={refillSummary.count > 0 ? "warning" : "default"}
        hint={
          refillSummary.mostUrgentName && refillSummary.mostUrgentDays !== null
            ? copy.refillHint
                .replace("{nome}", refillSummary.mostUrgentName)
                .replace("{dias}", String(refillSummary.mostUrgentDays))
            : undefined
        }
      />
      <Stat
        label={copy.locationLabel}
        value={locationStat?.value ?? copy.locationValue}
        hint={
          locationStat ? (
            <>
              {locationStat.hint} ·{" "}
              <Link
                href={locationStat.href}
                className="font-semibold text-brand-600"
              >
                ver mapa
              </Link>
            </>
          ) : (
            <>
              {copy.locationHint} ·{" "}
              <Link
                href={familyRoutes.localizacao}
                className="font-semibold text-brand-600"
              >
                saiba mais
              </Link>
            </>
          )
        }
      />
      <Stat
        label={copy.noticesLabel}
        value={copy.noticesValue}
        hint={copy.noticesHint}
      />
    </div>
  );
}

export { HojeStats };
