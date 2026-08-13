# Implementação — F4.4 Quem participa

- Data: 2026-08-13
- Spec: `specs/2026-08-13-f4-04-quem-participa.md`
- Autonomia: `medium`

## Entregue

- Área **Quem participa** em `/familia/participantes` com lista unificada (membros ativos + convites pendentes/expirados), matriz de permissões estática (PRD §6) e modal **Convidar pessoa**
- Convites com token aleatório, validade **7 dias**, reenvio com rotação de token
- Contato de emergência **só telefone** → membro ativo imediato sem aceite/login
- Página pública `/convite/[token]` com aceite pós-OTP (mesmo e-mail) e redirect para `/familia`
- Deep link `?modal=convite`; checklist tarefa 3 aponta para convite
- Fallback honesto: **Copiar link** (sem envio automático e-mail/WA)

## Migration

- `supabase/migrations/005_invites.sql` — tabela `invites`, RLS admin, `account_members.profile_id` nullable para contatos externos

> Aplicar no remoto: `pnpm db:push` (requer Supabase CLI + `.env.local`)

## Comandos Done

```text
pnpm typecheck  ✅
pnpm lint       ✅ (0 errors)
pnpm test       ✅ 177 tests
```

## Segurança (`docs/SECURITY.md`)

| Item | Status |
| --- | --- |
| A01 authz admin convida/reenvia | ✅ `requireAdminForInvites` + RLS |
| A03 validação token/expiração/e-mail aceite | ✅ server-side |
| A07 token forte + rotação no reenvio | ✅ `generateInviteToken` 32 bytes |
| RLS convites por conta | ✅ migration 005 |
| PHI: logs sem contato completo | ✅ sem log de e-mail/telefone |
| N/A uploads, geo, WA webhooks, SOS | declarado |

## Arquivos principais

- `apps/web/modules/accounts/domain/permission-matrix.ts`
- `apps/web/modules/accounts/domain/invite-contact.ts`
- `apps/web/modules/accounts/domain/invite-lifecycle.ts`
- `apps/web/modules/accounts/infrastructure/invite-repo.ts`
- `apps/web/modules/accounts/infrastructure/member-list-repo.ts`
- `apps/web/modules/accounts/application/get-participantes-page.ts`
- `apps/web/modules/accounts/application/send-invite.ts`
- `apps/web/modules/accounts/application/resend-invite.ts`
- `apps/web/modules/accounts/application/accept-invite.ts`
- `apps/web/modules/accounts/application/invite-actions.ts`
- `apps/web/modules/accounts/presentation/participantes-page-view.tsx`
- `apps/web/app/(auth)/convite/[token]/page.tsx`
- `apps/web/content/family.ts` (seção `participantes`)

## Reflexão

A feature ficou modular: domínio puro testável (matriz, contato, expiração), repos Supabase isolados e page RSC fina. Separar `invites` de `account_members` com contatos externos nullable prepara F4.7 (SOS) sem acoplar aceite a telefone. O aceite via service role centraliza a transação membership + convite, evitando ampliar RLS para não-membros. Próximo passo natural: envio transacional de e-mail quando infra existir, e deduplicação de e-mail via profile com RPC única em vez de loop admin.
