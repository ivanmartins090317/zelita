# Bugs

Formato: `BG-XX` · severidade · status · contexto.

Severidade: 🔴 crítico · 🟠 alto · 🟡 médio · ⚪ baixo  
Status: `aberto` · `resolvido`

## Abertos

_(nenhum)_

## Resolvidos

- **BG-01** · 🔴 crítico · `resolvido` · Onboarding: `new row violates row-level security policy for table 'accounts'`.
  - Causa: INSERT direto em `accounts` com client `authenticated` antes de existir membership; policy INSERT ampla ausente/ineficaz no fluxo real.
  - Fix: RPC `bootstrap_family_account` (SECURITY DEFINER) + migration `003_bootstrap_family_account.sql`; onboarding deixa de fazer INSERT direto.
  - Requer: `pnpm db:push` (ou SQL da 003 no remoto) + deploy do app.
