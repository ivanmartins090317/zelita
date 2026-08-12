# Scaffold do monorepo Zelita

| Campo | Valor |
| --- | --- |
| Data | 2026-08-12 |
| Spec | `specs/scaffold-monorepo.md` |
| Autonomia | `medium` |
| Status | Done |

## Objetivo

Base do monorepo para desenvolvimento: `apps/web` (Next.js App Router) + tooling alinhado ao `AGENTS.md`, sem lógica de negócio da fatia 1.

## O que foi entregue

- Workspace pnpm na raiz (`pnpm-workspace.yaml`) com scripts `dev|build|typecheck|lint|test`
- App `@zelita/web` em `apps/web` (Next.js 16 App Router + TS + Tailwind 4)
- Route groups: `(marketing)`, `(auth)`, `(family)`, `(elder)` + `api/webhooks/{whatsapp,billing,inngest}`
- Esqueleto dos 9 módulos em `apps/web/modules/<modulo>/` (`domain`, `application`, `infrastructure`, `index.ts`)
- Stubs: `lib/supabase/`, `lib/inngest/`, Sentry (DSN opcional) + `.env.example`
- `supabase/migrations/` e `policies/` com `.gitkeep`
- shadcn/ui mínimo (`components/ui/button`)
- Vitest + smoke test dos módulos / stubs
- Home mínima em `(marketing)` (marca Zelita light-first)

## Comandos Done

```bash
pnpm typecheck  # ok
pnpm lint       # ok
pnpm test       # 2 testes ok
pnpm build      # ok (sem DSN)
```

## Arquivos principais

- `package.json`, `pnpm-workspace.yaml`
- `apps/web/**` (app, modules, lib, components)
- `supabase/migrations/.gitkeep`, `supabase/policies/.gitkeep`
- `.env.example`, `apps/web/.env.example`

## Reflexão

O monólito modular já nasce com fronteiras claras (`modules/*/index.ts` + route groups), o que reduz o risco de misturar painel família e PWA idoso nas próximas Specs. Stubs de Supabase/Inngest/Sentry evitam acoplamento prematuro a env e mantêm `dev`/`build` usáveis desde o dia 1.

Próximo passo natural: Spec da fatia 1 sem alterar o esqueleto além do necessário — Auth OTP e care recipient no módulo dono, sem expandir webhooks reais ainda.

## Riscos / dúvidas

- Paths críticos (`accounts`, `billing`, `elder-access`, `sos`, `supabase/*`) só receberam esqueleto vazio conforme Spec — sem schema/RLS/regras.
- Pacote `lucide-react` não foi mantido (button não depende dele); pode entrar com o design system nas Specs de UI.
