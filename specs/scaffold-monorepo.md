# Spec — Scaffold do monorepo Zelita

| Campo | Valor |
| --- | --- |
| Status | **aguardando aprovação** |
| Autonomia | `tight` |
| Data | 2026-08-12 |
| State | `docs/state/ATUAL.md` |

## Objetivo

Criar a base do monorepo para desenvolvimento: `apps/web` (Next.js App Router) + tooling alinhado ao `AGENTS.md`, **sem** lógica de negócio da fatia 1.

## Decisões fechadas nesta Spec

| Tema | Decisão |
| --- | --- |
| Workspace | **pnpm workspace apenas** (sem Turborepo no MVP) |
| App | `apps/web` — Next.js App Router + TS + Tailwind |
| Observabilidade | **Sentry** (`@sentry/nextjs`) no scaffold (config mínima; DSN via env) |
| Testes | Vitest; sem Playwright |
| Docs operacionais | Sempre usar `docs/state/` (WIP) e `docs/implementation/` (entregas) |

## Escopo (fazer)

1. Workspace pnpm na raiz (`pnpm-workspace.yaml`, scripts `dev|build|typecheck|lint|test`)
2. App Next em `apps/web` com route groups placeholder: `(marketing)`, `(auth)`, `(family)`, `(elder)`, `api/webhooks/{whatsapp,billing,inngest}`
3. Esqueleto dos 9 módulos em `apps/web/modules/<modulo>/` (`domain`, `application`, `infrastructure`, `index.ts`)
4. Stubs: `lib/supabase/`, `lib/inngest/`, Sentry (instrumentação mínima + `.env.example`)
5. `supabase/migrations/` e `policies/` com `.gitkeep`
6. shadcn/ui mínimo (ex.: `button`)
7. Vitest + 1 teste smoke
8. Home mínima em `(marketing)` (marca Zelita light-first, sem portar protótipo inteiro)
9. Ao Done: atualizar `docs/state/*` e criar `docs/implementation/YYYY-MM-DD-scaffold-monorepo.md`

## Fora de escopo (não fazer)

- Auth OTP real, schema de domínio, RLS de negócio
- Jobs de lembrete, WhatsApp, billing real
- Landing/PWA completas a partir do HTML do protótipo
- Turborepo, Playwright, BullMQ, Nest

## Done

```bash
pnpm typecheck
pnpm lint
pnpm test
```

- `pnpm dev` sobe a home sem erro de build
- Sentry configurado de forma que **build local funcione sem DSN** (opcional em dev)
- State + implementation atualizados
- Relatório no formato do `AGENTS.md`

## Riscos

- Dependências Sentry/Supabase/Inngest sem env não podem quebrar `build`/`dev`
- Não expandir para fatia 1 nesta Spec
