# Fatia 1 — Auth OTP + pessoa cuidada + cartela + lembrete

| Campo | Valor |
| --- | --- |
| Data | 2026-08-12 |
| Spec | `specs/2026-08-12-fatia-1-auth-care-recipient-cartela-lembrete.md` |
| Autonomia | `medium` |
| Status | Done (código + testes; homologação UI adiada no state) |

## Objetivo

Gestora entra sem senha, cadastra pessoa cuidada + Casa (lat/lng) + DND, anota cartela com preview de fim, e o sistema agenda lembretes com opt-in/DND (`reminder_sent` ≠ tomada).

## O que foi entregue

- Migrations `001_fatia1_core` + `002_fatia1_rls` (matriz de papéis)
- Domínio + Vitest: papéis, fim de cartela, elegibilidade de lembrete / copy segura
- Auth OTP (código + magic link) via Supabase SSR
- Onboarding (conta placeholder trial, care recipient sem auth user, Casa, DND)
- CRUD cartela + painel Hoje / Remédios mínimo
- Inngest functions + port WhatsApp Meta (dry-run sem token)
- Webhooks Inngest e WhatsApp (challenge + opt-in SIM)

## Comandos Done

```bash
pnpm typecheck  # ok
pnpm lint       # ok
pnpm test       # 20 testes ok
```

## Chaves / modo seco

| Integração | Estado no Done |
| --- | --- |
| Supabase | Precisa `.env.local` + migrations aplicadas para Auth/UI real |
| Inngest | Sem `INNGEST_EVENT_KEY` → schedule em modo degradado |
| WhatsApp | Sem `WHATSAPP_*` → dry-run com registro de evento |

## SECURITY.md (checklist aplicável)

- [x] RLS + matriz de papéis nas tabelas da fatia
- [x] Authz server-side (admin CRUD meds)
- [x] Elder/PWA — N/A (fora da Spec)
- [x] Zod em forms/actions
- [x] Service role só server/Inngest/webhooks
- [x] Webhook WA: verify token no GET; POST processa opt-in
- [x] Uploads exames — N/A
- [x] Opt-in + DND no domínio de lembretes
- [x] SOS — N/A
- [x] Sem PHI em logs de domínio; Sentry já no scaffold
- [ ] Headers de segurança — N/A (Spec não tocou config de headers)
- [x] Deps aprovadas na Spec (`@supabase/*`, `inngest`, `zod`)

## Reflexão

A fatia nasce com fronteiras claras por módulo (`accounts`, `care-recipients`, `medications`, `reminders`) e regras puras testáveis (cartela/DND/opt-in), o que reduz risco de “lembrete = tomada” e facilita trocar o adapter WhatsApp. O custo é a Spec larga: Auth + schema + jobs juntos exigem chaves e `db:push` antes da homologação UI completa — por isso FL-01…FL-04 ficaram adiados no state sem bloquear o Done de domínio.

## Próximos passos técnicos

1. Rodar migrations no projeto Supabase
2. Preencher `.env.local` e homologar FL-01…FL-04 com `manual-report`
3. Endurecer assinatura do webhook WA (app secret) quando o sandbox estiver ativo
