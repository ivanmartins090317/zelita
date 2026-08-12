"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  createMedicationWithPack,
  type MedicationActionResult,
} from "@/modules/medications/application/medication-actions";
import { computePackEnd } from "@/modules/medications/domain/pack-end";

const initial: MedicationActionResult = { ok: false };

export function NewMedicationForm({
  careRecipientId,
}: {
  careRecipientId: string;
}) {
  const [quantityTotal, setQuantityTotal] = useState(30);
  const [doseUnits, setDoseUnits] = useState(1);
  const [dosesPerDay, setDosesPerDay] = useState(1);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [state, action, pending] = useActionState(
    createMedicationWithPack,
    initial,
  );

  const preview = useMemo(() => {
    try {
      return computePackEnd({
        quantityTotal,
        doseUnits,
        dosesPerDay,
        startDate: new Date(`${startDate}T00:00:00.000Z`),
      });
    } catch {
      return null;
    }
  }, [quantityTotal, doseUnits, dosesPerDay, startDate]);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-white p-5">
      <input type="hidden" name="careRecipientId" value={careRecipientId} />
      <h3 className="text-lg font-bold text-brand-900">Anotar remédio</h3>
      <p className="text-sm text-muted">
        Antes de salvar você já vê quando a cartela tende a acabar. Lembrete
        enviado não significa que o remédio foi tomado.
      </p>

      <label className="block text-sm font-semibold">
        Nome
        <input
          name="name"
          required
          className="mt-1 h-11 w-full rounded-xl border border-border px-3"
          placeholder="Losartana"
        />
      </label>
      <label className="block text-sm font-semibold">
        Dosagem
        <input
          name="dosageLabel"
          required
          className="mt-1 h-11 w-full rounded-xl border border-border px-3"
          placeholder="50 mg"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-semibold">
          Qtd. na cartela
          <input
            name="quantityTotal"
            type="number"
            min={1}
            required
            value={quantityTotal}
            onChange={(e) => setQuantityTotal(Number(e.target.value))}
            className="mt-1 h-11 w-full rounded-xl border border-border px-3"
          />
        </label>
        <label className="block text-sm font-semibold">
          Por dose
          <input
            name="doseUnits"
            type="number"
            min={0.5}
            step="0.5"
            required
            value={doseUnits}
            onChange={(e) => setDoseUnits(Number(e.target.value))}
            className="mt-1 h-11 w-full rounded-xl border border-border px-3"
          />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Doses por dia
        <input
          name="dosesPerDay"
          type="number"
          min={1}
          required
          value={dosesPerDay}
          onChange={(e) => setDosesPerDay(Number(e.target.value))}
          className="mt-1 h-11 w-full rounded-xl border border-border px-3"
        />
      </label>
      <label className="block text-sm font-semibold">
        Data de início
        <input
          name="startDate"
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-border px-3"
        />
      </label>
      <label className="block text-sm font-semibold">
        Horários (vírgula)
        <input
          name="times"
          required
          className="mt-1 h-11 w-full rounded-xl border border-border px-3"
          placeholder="08:00"
          defaultValue="08:00"
        />
      </label>
      <label className="block text-sm font-semibold">
        Instruções (opcional)
        <input
          name="instructions"
          className="mt-1 h-11 w-full rounded-xl border border-border px-3"
        />
      </label>

      {preview ? (
        <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-900">
          Cartela prevista para terminar em{" "}
          <strong>{preview.endDateEstimated.toISOString().slice(0, 10)}</strong>{" "}
          ({preview.daysRemaining} dias restantes). Verifique com o idoso ou
          cuidador na hora da reposição.
        </div>
      ) : (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Ajuste quantidade e doses para ver a data de fim.
        </div>
      )}

      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-brand-700" : "text-red-700"}`}>
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar cartela"}
      </Button>
    </form>
  );
}
