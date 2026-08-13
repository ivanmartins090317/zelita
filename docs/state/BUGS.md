# Bugs

Formato: `BG-XX` · severidade · status · contexto.

Severidade: 🔴 crítico · 🟠 alto · 🟡 médio · ⚪ baixo  
Status: `aberto` · `resolvido`

## Abertos

_(nenhum)_

## Resolvidos

- **BG-03** · 🔴 crítico · `resolvido` · F4.8 Localização: Build Error ao abrir `/familia/localizacao` — `next/headers` importado em contexto de Client Component.
  - Causa: `safe-place-modal.tsx` (`"use client"`) importava `LOCATION_CONSTANTS` do barrel `@/modules/location/index.ts`, que também reexporta funções server (`getLocalizacaoPage`, etc.) → `get-localizacao-page.ts` → `lib/supabase/server.ts` (`cookies` / `next/headers`). O bundler puxava a cadeia server inteira para o client.
  - Trace: `safe-place-modal` → `index.ts` → `get-localizacao-page.ts` → `get-shell-context.ts` → `lib/supabase/server.ts`.
  - Fix: extrair constantes para `modules/location/constants.ts` (sem deps server); client importa de `@/modules/location/constants`; `location-actions.ts` importa de `../constants` (evita ciclo com o barrel).
  - Verificação: `pnpm build` ok; rota `/familia/localizacao` compila.
  - Detectado: 2026-08-13 · dev local F4.8.

- **BG-02** · 🔴 crítico · `resolvido` · Hoje: painel exibe "Não deu para carregar o Hoje" após integração F4.6 (exames).
  - Causa: recursão infinita nas policies RLS entre `exams` e `exam_member_access` (`42P17` — `infinite recursion detected in policy for relation "exams"`). `getHojeDashboard()` passou a chamar `getHojeExamsSnapshot()` → `fetchExamsForCareRecipient()`; a exceção era engolida no `catch` sem log.
  - Fix: migration `008_exams_rls_recursion_fix.sql` — função `exam_account_id()` (SECURITY DEFINER) + policy `exam_member_access_select` sem referência recursiva a `exams`; log `[getHojeDashboard] load_failed` em dev.
  - Requer: `pnpm db:push` (008 no remoto) + reload de `/familia`.
  - Detectado: 2026-08-13 · homologação local F4.6.

- **BG-01** · 🔴 crítico · `resolvido` · Onboarding: `new row violates row-level security policy for table 'accounts'`.
  - Causa: INSERT direto em `accounts` com client `authenticated` antes de existir membership; policy INSERT ampla ausente/ineficaz no fluxo real.
  - Fix: RPC `bootstrap_family_account` (SECURITY DEFINER) + migration `003_bootstrap_family_account.sql`; onboarding deixa de fazer INSERT direto.
  - Requer: `pnpm db:push` (ou SQL da 003 no remoto) + deploy do app.
