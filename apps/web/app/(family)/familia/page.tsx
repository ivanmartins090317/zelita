import { redirect } from "next/navigation";

import { getFamilyContext } from "@/modules/accounts";
import {
  DEFAULT_REFILL_ALERT_DAYS,
  shouldWarnRefill,
} from "@/modules/medications";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isWhatsAppConfigured } from "@/modules/reminders";

export default async function FamiliaHojePage() {
  const ctx = await getFamilyContext();
  if (!ctx.accountId || !ctx.careRecipientId) {
    redirect("/onboarding");
  }

  const supabase = await createSupabaseServerClient();
  const { data: meds } = await supabase
    .from("medications")
    .select(
      "id, name, dosage_label, active, medication_packs(id, end_date_estimated, status, refill_alert_days), medication_schedules(times)",
    )
    .eq("care_recipient_id", ctx.careRecipientId)
    .eq("active", true);

  const today = new Date();
  const items =
    meds?.flatMap((med) => {
      const pack = Array.isArray(med.medication_packs)
        ? med.medication_packs[0]
        : med.medication_packs;
      const schedule = Array.isArray(med.medication_schedules)
        ? med.medication_schedules[0]
        : med.medication_schedules;
      if (!pack || pack.status !== "active") return [];
      const end = new Date(`${pack.end_date_estimated}T00:00:00.000Z`);
      const daysRemaining = Math.round(
        (end.getTime() -
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) /
          (24 * 60 * 60 * 1000),
      );
      return [
        {
          id: med.id,
          label: `${med.name} ${med.dosage_label}`,
          times: (schedule?.times as string[] | undefined) ?? [],
          daysRemaining,
          warn: shouldWarnRefill(
            daysRemaining,
            pack.refill_alert_days ?? DEFAULT_REFILL_ALERT_DAYS,
          ),
        },
      ];
    }) ?? [];

  return (
    <>
      <p className="text-muted">
        Olá{ctx.profileName ? `, ${ctx.profileName}` : ""}. Resumo do dia —
        lembrete enviado não confirma tomada.
      </p>

      {!isWhatsAppConfigured() ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          WhatsApp em modo seco (sem token). Lembretes ficam registrados; envio
          real quando WHATSAPP_* estiver no .env.local.
        </p>
      ) : null}

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
          <h2 className="text-xl font-bold text-brand-900">
            Nenhum remédio anotado ainda
          </h2>
          <p className="mt-2 text-muted">
            Quando você anotar o primeiro, o dia aparece aqui: horários, se o
            lembrete foi enviado e quantos dias faltam para a caixa acabar.
          </p>
          <a
            href="/familia/remedios"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-600 px-5 font-semibold text-white"
          >
            Anotar o primeiro remédio
          </a>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-border bg-white px-4 py-4"
            >
              <div className="font-bold text-brand-900">{item.label}</div>
              <div className="mt-1 text-sm text-muted">
                {item.times.join(" · ") || "Sem horário"} · lembrete no WhatsApp
                após opt-in
              </div>
              {item.warn ? (
                <div className="mt-2 text-sm font-semibold text-amber-800">
                  Cartela prevista para acabar em {item.daysRemaining} dia(s) —
                  verifique reposição com o idoso ou cuidador.
                </div>
              ) : (
                <div className="mt-2 text-sm text-muted">
                  Fim estimado em {item.daysRemaining} dia(s).
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
