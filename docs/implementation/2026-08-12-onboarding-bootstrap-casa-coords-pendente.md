# 2026-08-12 — Onboarding: bootstrap accounts + Casa sem coordenadas

## Resultado
- Autonomia usada: `tight` (accounts/RLS + schema location)
- Spec: ajuste em `specs/2026-08-12-fatia-1-auth-care-recipient-cartela-lembrete.md` + PRD §5.3
- State: `docs/state/ATUAL.md`, `BUGS.md` (BG-01), `PENDENCIAS.md`
- Comandos Done: `pnpm typecheck` · `pnpm lint` · `pnpm test` (25 testes) · `pnpm db:push` (003 já; 004 nesta entrega)
- Segurança: INSERT `accounts` só via RPC SECURITY DEFINER autenticada; sem service_role no client; coords Casa deferidas ao PWA com consentimento (LGPD)
- Arquivos alterados (principais):
  - `supabase/migrations/003_bootstrap_family_account.sql`
  - `supabase/migrations/004_safe_places_coords_optional.sql`
  - `apps/web/modules/accounts/infrastructure/bootstrap-family-account.ts`
  - `apps/web/modules/care-recipients/application/complete-onboarding.ts`
  - `apps/web/modules/care-recipients/presentation/onboarding-form.tsx`
  - `apps/web/modules/location/**`
  - `docs/prd-mvp.md`
- Diff crítico para review humano: **sim** (RPC accounts + nullable geo)

## Reflexão
O bootstrap atômico evita o deadlock clássico “precisa de membership para criar conta / precisa de conta para criar membership”. Casa sem coords no onboarding alinha o modelo ao ator certo (device do idoso) e deixa alerta de zona desligado até F2-05 — menos falso positivo e menos fricção na primeira sessão da família.
