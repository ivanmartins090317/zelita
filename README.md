# Zelita

SaaS de coordenação familiar para cuidado de idosos. O familiar gerencia o cuidado. A pessoa cuidada recebe lembretes e SOS sem criar login.

App em `apps/web` (Next.js, React, TypeScript, Tailwind). Dados e login no Supabase. Jobs no Inngest. Hospedagem na Vercel.

## Começar na sua máquina

Requisitos: Git, Node.js 20+, pnpm 9.15.9.

```powershell
pnpm install
Copy-Item .env.example apps\web\.env.local
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000).

As chaves de `apps/web/.env.local` vêm de quem já está no time, por um canal privado. Esse arquivo fica fora do Git.

O passo a passo para quem entra no repositório (convite no GitHub, instalação e pull request) está em [docs/onboarding-desenvolvedor.md](docs/onboarding-desenvolvedor.md).

## Conferir

Na raiz do repositório:

```powershell
pnpm typecheck
pnpm lint
pnpm test
```

## Mapa curto

| Pasta ou arquivo | Conteúdo |
| --- | --- |
| `apps/web` | Aplicação Next.js |
| `apps/web/modules` | Módulos de domínio (contas, remédios, lembretes, SOS, etc.) |
| `docs/prd-mvp.md` | Produto |
| `docs/arquitetura-solucao.md` | Arquitetura |
| `docs/SECURITY.md` | Segurança |
| `docs/state/` | O que está em andamento, pendências e bugs |
| `AGENTS.md` | Contrato de trabalho no repositório |
