# F4.2 · Primeiro acesso + Hoje maduro

- Data: 2026-08-12
- Spec: `specs/2026-08-12-f4-02-hoje-primeiro-acesso.md`
- Autonomia: `medium`

## Resumo

A rota `/familia` alterna entre **primeiro acesso** (nenhum remédio ativo) e **Hoje maduro** (≥1 remédio), com checklist de 4 tarefas, modal de boas-vindas (dismiss por conta/aparelho), stats honestos, timeline do dia, alertas de cartela reais e feed de atividade limitado a eventos de remédio.

Leitura encapsulada em `getHojeDashboard` → `getHojeMedications` → `medication-read-repo`; a page só orquestra views.

## Comandos Done

```text
pnpm typecheck  ✅
pnpm lint       ✅
pnpm test       ✅ (136 testes)
```

## Segurança (`docs/SECURITY.md`)

| Item | Status |
| --- | --- |
| A01 authz via membership + care_recipient | ok — repos filtram por recipient da sessão |
| A03 leitura only | ok — sem mutações novas |
| PHI no Sentry | ok — sem log de nomes de remédio |
| Uploads / SOS / geo / webhooks | N/A |

## Arquivos principais

- `apps/web/app/(family)/familia/page.tsx`
- `apps/web/content/family.ts` (+ testes)
- `apps/web/components/ui/timeline.tsx` (+ teste)
- `apps/web/modules/accounts/application/get-hoje-dashboard.ts`
- `apps/web/modules/accounts/application/onboarding-checklist.ts` (+ teste)
- `apps/web/modules/accounts/presentation/family/*-view.tsx`, `welcome-modal.tsx`, `hoje-*.tsx`
- `apps/web/modules/medications/domain/hoje-timeline.ts` (+ teste)
- `apps/web/modules/medications/infrastructure/medication-read-repo.ts`
- `apps/web/modules/medications/application/get-hoje-medications.ts`
- `apps/web/modules/accounts/application/family-context.ts` — `countActiveAccountMembers`

## Reflexão (escala / manutenção)

O agregador `getHojeDashboard` concentra orquestração sem misturar SQL na page, o que facilita evoluir stats/timeline quando F4.5–F4.9 entrarem — basta estender o view model e as funções puras de `hoje-timeline.ts`. A heurística binária (0 vs ≥1 remédio) mantém o protótipo simples; se produto quiser “primeiro acesso” até 4/4, só troca `isFirstAccessMode` e os gates de modal.

Risco conhecido: fuso `America/Sao_Paulo` fixo até existir timezone no cadastro; eventos “de hoje” usam bounds simplificados — validar com dados reais na homologação manual F4.2.

## Homologação

Smoke manual F4.1+F4.2 pendente via skill `manual-report` (depende sessão Supabase).
