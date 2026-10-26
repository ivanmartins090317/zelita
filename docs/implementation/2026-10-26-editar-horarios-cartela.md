# Editar horários da cartela

- Data: 2026-10-26
- Spec: `specs/2026-10-26-editar-horarios-cartela.md`
- Autonomia: `tight`

## Entregue

- Botão **Editar horários** no detalhe do remédio, com os atalhos e o horário livre
- Ação `updateMedicationSchedule`: grava os horários do remédio desta conta e reagenda o restante de hoje se a cartela estiver ativa
- A quantidade de horários continua igual às doses por dia; a duração da caixa não muda
- Envio do lembrete ignora horário que saiu da lista, sem marcar enviado nem pulado

## Comandos

```text
pnpm exec tsc --noEmit   ok
eslint nos arquivos tocados   ok
pnpm exec vitest run   ok (394)
```

## Segurança (`docs/SECURITY.md`)

| Item | Status |
| --- | --- |
| RLS | N/A — `schedules_write_admin` já limita update ao admin da conta |
| Authz server-side | ok — `requireAdminForMedications` + `care_recipient_id` da sessão |
| Elder-access | N/A |
| Zod | ok — id e horários `HH:MM`, quantidade = doses por dia, sem repetido |
| service_role no client | N/A — action usa sessão; service role só no job Inngest já existente |
| Webhooks / uploads / SOS | N/A |
| WhatsApp | ok — não cria recorrência nova; o job segue opt-in, pausa e DND |
| Sentry | N/A — sem log de nome de remédio nesta ação |
| Dependência nova | N/A |

## Arquivos

- `apps/web/modules/medications/application/update-medication-schedule.ts`
- `apps/web/modules/medications/presentation/schedule-modal.tsx`
- `apps/web/modules/medications/presentation/remedios-detail-panel.tsx`
- `apps/web/modules/medications/presentation/remedios-page-view.tsx`
- `apps/web/modules/medications/application/get-remedios-page.ts`
- `apps/web/app/(family)/familia/remedios/page.tsx`
- `apps/web/modules/reminders/domain/zoned-time.ts`
- `apps/web/lib/inngest/send-medication-reminder.ts`
- `apps/web/modules/reminders/infrastructure/reminder-job-store.ts`
- `apps/web/content/family.ts`
