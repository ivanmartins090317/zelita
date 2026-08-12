import { redirect } from "next/navigation";

import { getFamilyContext, canManageMedications } from "@/modules/accounts";
import { NewMedicationForm } from "@/modules/medications/presentation/new-medication-form";
import { pausePackAction } from "@/modules/medications/application/pause-pack-action";
import {
  DEFAULT_REFILL_ALERT_DAYS,
  shouldWarnRefill,
} from "@/modules/medications/domain/pack-end";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function RemediosPage() {
  const ctx = await getFamilyContext();
  if (!ctx.accountId || !ctx.careRecipientId) {
    redirect("/onboarding");
  }

  const canEdit = ctx.role ? canManageMedications(ctx.role) : false;
  const supabase = await createSupabaseServerClient();
  const { data: meds } = await supabase
    .from("medications")
    .select(
      "id, name, dosage_label, medication_packs(id, end_date_estimated, status, refill_alert_days)",
    )
    .eq("care_recipient_id", ctx.careRecipientId)
    .order("created_at", { ascending: false });

  const today = new Date();

  return (
    <>
      <p className="text-muted">
        Lista de cartelas. Só o admin altera. Nunca afirmamos que o idoso
        &quot;tomou&quot; só porque o lembrete saiu.
      </p>

      <ul className="mt-6 space-y-3">
        {(meds ?? []).map((med) => {
          const pack = Array.isArray(med.medication_packs)
            ? med.medication_packs[0]
            : med.medication_packs;
          if (!pack) return null;
          const end = new Date(`${pack.end_date_estimated}T00:00:00.000Z`);
          const daysRemaining = Math.round(
            (end.getTime() -
              Date.UTC(
                today.getUTCFullYear(),
                today.getUTCMonth(),
                today.getUTCDate(),
              )) /
              (24 * 60 * 60 * 1000),
          );
          const warn = shouldWarnRefill(
            daysRemaining,
            pack.refill_alert_days ?? DEFAULT_REFILL_ALERT_DAYS,
          );

          return (
            <li
              key={med.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-4"
            >
              <div>
                <div className="font-bold text-brand-900">
                  {med.name} {med.dosage_label}
                </div>
                <div className="text-sm text-muted">
                  Status: {pack.status} · fim estimado {pack.end_date_estimated}
                  {warn ? ` · atenção: faltam ${daysRemaining} dia(s)` : null}
                </div>
              </div>
              {canEdit && pack.status === "active" ? (
                <form action={pausePackAction}>
                  <input type="hidden" name="packId" value={pack.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Pausar
                  </Button>
                </form>
              ) : null}
            </li>
          );
        })}
      </ul>

      {canEdit ? (
        <div className="mt-8">
          <NewMedicationForm careRecipientId={ctx.careRecipientId} />
        </div>
      ) : (
        <p className="mt-8 rounded-xl bg-surface px-4 py-3 text-sm text-muted">
          Seu papel não permite cadastrar cartelas. Peça ao admin da conta.
        </p>
      )}
    </>
  );
}
