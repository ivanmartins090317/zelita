# F4.5 — Consultas e tarefas

**Data:** 2026-08-13  
**Spec:** `specs/2026-08-13-f4-05-consultas-tarefas.md`  
**Autonomia:** medium

## Resultado

- Módulo `agenda` criado com domain, application, infrastructure e presentation
- Migration `006_agenda.sql`: tabelas `appointments` e `family_tasks` + RLS (`can_manage_agenda`, leitura via `can_view_care_routine`)
- Rota `/familia/consultas`: grade semanal (remédios leitura + consultas), cards Próximas consultas / Tarefas da família, modais CRUD
- Integração Hoje: timeline com consultas do dia; **Precisa de você** com tarefas vencidas/hoje/atribuídas (máx. 3, refill primeiro)
- Copy em `content/family.ts` seção `consultas`

## Comandos Done

```text
pnpm typecheck — OK
pnpm lint — OK (0 errors)
pnpm test — OK (202 tests)
```

## Segurança (`docs/SECURITY.md`)

| Item | Status |
| --- | --- |
| A01 authz por papel | OK — `canManageAgenda` server-side; visualizadora sem CTAs |
| A03 validação server-side | OK — Zod + validação membro/consulta vinculada |
| RLS por conta + care_recipient | OK — via `care_recipient_account_id` |
| PHI em logs | OK — sem endereço/observação completa em actions |
| Storage, webhooks, SOS, elder-access | N/A |

## Arquivos principais

- `supabase/migrations/006_agenda.sql`
- `apps/web/modules/agenda/**`
- `apps/web/app/(family)/familia/consultas/page.tsx`
- `apps/web/content/family.ts` (seção `consultas`)
- `apps/web/modules/accounts/application/get-hoje-dashboard.ts`
- `apps/web/modules/accounts/presentation/family/hoje-maduro-view.tsx`
- `apps/web/modules/medications/application/get-medication-schedules-for-agenda.ts`

## Pendente operacional

- [ ] `pnpm db:push` remoto
- [ ] Homologação manual FL-08 parcial (`manual-report`)

## Reflexão

O módulo `agenda` orquestra leitura de remédios via API pública de `medications`, mantendo fronteiras limpas entre módulos. A lógica de grade, labels e prioridade de **Precisa de você** ficou no domain puro (Vitest), facilitando evolução (recorrência, lembretes WA) sem reescrever UI. RLS espelha a matriz admin/cuidador=escrita, visualizador=leitura — alinhado ao PRD §6.

Escalabilidade: índices em `starts_at` e `due_date`; uma query agregada por página. Limite de 20 consultas futuras evita listas enormes no MVP.
