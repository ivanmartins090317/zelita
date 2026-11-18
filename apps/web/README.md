# App web da Zelita

Os comandos do monorepo rodam na **raiz** do repositório (`pnpm dev`, `pnpm typecheck`, `pnpm lint`, `pnpm test`). O guia para clonar, instalar e abrir pull request está em [`docs/onboarding-desenvolvedor.md`](../../docs/onboarding-desenvolvedor.md). O README da raiz resume o projeto.

Este pacote é o app [Next.js](https://nextjs.org) (App Router) do monorepo. Variáveis locais ficam em `apps/web/.env.local` (modelo na raiz: `.env.example`).

Para subir só este pacote, ainda na raiz do repositório:

```powershell
pnpm dev
```

A página abre em [http://localhost:3000](http://localhost:3000).
