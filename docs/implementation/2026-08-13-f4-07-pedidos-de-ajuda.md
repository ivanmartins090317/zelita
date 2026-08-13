# F4.7 — Pedidos de ajuda (SOS)

**Data:** 2026-08-13  
**Spec:** `specs/2026-08-13-f4-07-pedidos-de-ajuda.md`  
**Autonomia:** medium

## Entregue

- Área `/familia/pedidos-de-ajuda` com disclaimer SAMU (coral), grid duas colunas, último acionamento, ordem de aviso, histórico e modais (ordem + resolver).
- Migration `009_sos.sql`: `sos_alerts`, `sos_escalation_config`, `sos_escalation_entries`, `sos_notification_attempts` + RLS.
- Módulo `apps/web/modules/sos/` (domain, application, infrastructure, presentation).
- Integração Hoje: checklist tarefa 2 (≥2 contatos ordem SOS), Precisa de você (pedido aberto), timeline do dia, widget vazio primeiro acesso.
- Vitest em funções puras do domínio e smoke `content/family.ts`.

## Homologação pendente (manual-report FL-06 parcial)

- Seed ou F5 para detalhe de acionamento aberto/resolvido com notificações reais.
- Visualizador fora da ordem → acesso negado (redirect Hoje).
- Cuidadora resolve; admin reordena; conta pausada bloqueia ordem.

## db push

```bash
pnpm db:push
```

Migration: `supabase/migrations/009_sos.sql`

## Segurança (`docs/SECURITY.md`)

| Item | Status |
| --- | --- |
| A01 authz SOS (RLS + server) | OK — policies por papel |
| A03 Zod ordem/resolução | OK |
| Disclaimer SAMU | OK — UI fixa |
| 2 etapas idoso / DND job | N/A — documentado F5/Inngest |
| Audit mínimo | OK — log dev `sos_config_updated`, `sos_resolved` |
| Coral só emergência | OK |
| Uploads / WA webhooks / elder trigger | N/A nesta subfase |

## Reflexão

A feature ficou isolada no módulo `sos` com API estreita via `index.ts`, o que facilita evoluir F5 (trigger idoso) e jobs Inngest sem acoplar ao shell F4.1. A ordem de escalonamento e os alertas compartilham `care_recipient_id`, preparando multi-recipient futuro sem refactor grande. Integração com Hoje reutiliza `NeedsPriorityItem` e `TimelineItem` existentes via snapshot dedicado, evitando duplicar agregadores de medicamentos/exames.

Risco principal: homologação depende de seed ou F5 para fluxo aberto; notificações permanecem estrutura vazia até job de envio. Próximo passo natural: F5 PWA + insert de alerta via elder-access/service role.
