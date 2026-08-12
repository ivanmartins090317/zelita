---
name: supabase-migrations
description: >-
  Aplica migrations SQL do Supabase no projeto remoto via CLI (db push).
  Use quando o usuário pedir rodar migrations, atualizar schema, criar tabelas
  RLS, buckets storage ou sincronizar supabase/migrations com o banco da Zelita.
---

# Supabase Migrations — Zelita

## Pré-requisitos

1. `.env.local` na **raiz do monorepo** com:
   - `NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
   - **`SUPABASE_DB_PASSWORD=...`** (Settings → Database → Database password)

2. Migrations em `supabase/migrations/` (ordem lexicográfica: `001_`, `002_`, …).

3. **Nunca** commitar `.env.local` nem expor `SUPABASE_DB_PASSWORD` no chat/código.
4. **Nunca** sobrescrever `.env.local` sem confirmação explícita do usuário.

## Comando padrão (sempre preferir)

Na raiz do projeto:

```bash
npm run db:push
```

Dry-run (lista o que seria aplicado):

```bash
npm run db:push:dry
```

Script: `.cursor/skills/supabase-migrations/scripts/push-migrations.mjs`

> Se os scripts ainda não existirem no `package.json` do monorepo, criar ao scaffoldar a fundação — o script acima já resolve o caminho da raiz.

## Fluxo do agente

1. Confirmar que `SUPABASE_DB_PASSWORD` está em `.env.local` (não sobrescrever o arquivo sem pedir).
2. Se o usuário pediu nova migration, criar `supabase/migrations/NNN_descricao.sql` idempotente quando possível (`if not exists`, `on conflict do nothing`).
3. Rodar `npm run db:push:dry` antes, se houver dúvida sobre o delta.
4. Rodar `npm run db:push` e reportar sucesso ou erro.
5. Aviso Docker no final da CLI é cache local — **ignorar** se migrations aplicaram.

## Domínio de dados (MVP — ver PRD §4)

Ordem sugerida de migrations (criar conforme fatias; nomes ilustrativos):

| Sequência | Conteúdo |
|-----------|----------|
| `001_profiles_accounts.sql` | `profiles`, `accounts`/`families`, `account_members`, trigger signup |
| `002_care_recipients.sql` | `care_recipients` (**sem** auth.users), `invites` |
| `003_medications.sql` | `medications`, `medication_schedules`, `medication_packs`, `medication_events` |
| `004_sos_location.sql` | `sos_alerts`, `safe_places`, `location_points` (fatia 2+) |
| `005_exams_storage.sql` | metadados de exames + bucket Storage + policies |
| `006_billing_audit.sql` | `subscriptions` / status + `audit_log` / `notification_log` |

Atualizar esta tabela quando as migrations reais forem criadas.

## Nova migration — checklist

- [ ] RLS em toda tabela nova
- [ ] Policies por membership/`account_id` (e papel quando aplicável) — **não** só `auth.uid() = user_id` genérico de produto single-tenant
- [ ] Care recipient **nunca** vira `auth.users`
- [ ] Storage: bucket privado + policy por conta/pasta autorizada
- [ ] Service role não necessária no client
- [ ] Nome sequencial `NNN_snake_case.sql`
- [ ] Rodar `npm run db:push` após criar

## Troubleshooting

| Erro | Ação |
|------|------|
| `password authentication failed` | Senha errada em `SUPABASE_DB_PASSWORD` — resetar no dashboard Supabase |
| `SUPABASE_DB_PASSWORD` ausente | Usuário deve adicionar ao `.env.local` |
| Policy já existe | Tornar migration idempotente: `drop policy if exists ...` antes de `create policy` |
| `link` / privileges | **Não** usar `supabase link`; usar `npm run db:push` (conexão direta Postgres) |

## Alternativa manual

SQL Editor no dashboard Supabase → colar conteúdo dos arquivos em ordem. Preferir o script para histórico consistente na tabela `supabase_migrations.schema_migrations`.
