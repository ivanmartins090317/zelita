# Gate 2.1 — Inngest + WhatsApp (lembrete de verdade)

| Campo | Valor |
| --- | --- |
| Data | 2026-09-21 |
| Spec | `specs/2026-09-21-gate-2-1-inngest-whatsapp.md` |
| Plano | `docs/plans/2026-09-21-gate-2-1-inngest-whatsapp.md` |
| Autonomia | `tight` |
| Status | Done de código + Vitest. FL-04 no Vercel pendente (templates Meta + `WHATSAPP_APP_SECRET`) |

## Objetivo

Lembrete no WhatsApp no horário de Brasília, só após opt-in, com série diária, webhook assinado, aviso de cartela e pausa de trial D30 sem cobrança.

## O que entrou

- Fuso `America/Sao_Paulo` no DND e na agenda (não mais `setUTCHours`)
- Cron diário 00:10 BRT materializa os horários do dia; ao salvar cartela agenda só o restante de hoje
- Port WhatsApp envia **template** (`zelita_opt_in`, `zelita_med_reminder`)
- Webhook POST exige HMAC `X-Hub-Signature-256`; match de telefone 10–11 dígitos; SIM normalizado
- Jobs `med/pack.refill_check`, `billing/trial_ending`, `billing/pause_if_unconfirmed`
- Idempotência por `pack_id` + `scheduledAt` (sem migration)

## O que ficou de fora

- F5/F6, SOS, voz, gateway, convite por e-mail
- Homologação FL-04 no Vercel (TCs criados em `docs/relatorio-testes-manuais.html`)

## Comandos Done

```bash
pnpm typecheck  # ok
pnpm lint       # ok
pnpm test       # 382 testes ok
```

## Ops (sem valores)

| Integração | Local 2026-09-21 | Falta |
| --- | --- | --- |
| Inngest | Event key + signing key preenchidas | Sync na Vercel + dashboard |
| WhatsApp | Token, phone id, verify preenchidos (sandbox) | `WHATSAPP_APP_SECRET`; templates Approved; keys na Vercel |
| Resend | OTP já usa Resend no Auth | `RESEND_API_KEY` no app para aviso de cartela/trial |

## SECURITY.md (checklist aplicável)

- [x] RLS — N/A (sem tabela nova; jobs usam service role)
- [x] Authz — N/A em UI nova; pausa só no job
- [x] Elder/PWA — N/A
- [x] Zod no webhook WhatsApp
- [x] Service role só Route Handler / Inngest
- [x] Webhook: HMAC antes de mutar; fail closed sem `WHATSAPP_APP_SECRET`
- [x] Uploads — N/A
- [x] Opt-in + DND no fuso de Brasília
- [x] SOS — N/A
- [x] Sentry sem PHI (IDs + tipo de evento)
- [x] Headers — N/A (Spec não tocou config)
- [x] Sem dependência npm nova (Resend via `fetch`)

## Arquivos principais

- `apps/web/modules/reminders/domain/*` (fuso, DND, opt-in, refill, idempotência)
- `apps/web/modules/reminders/infrastructure/whatsapp-port.ts`
- `apps/web/app/api/webhooks/whatsapp/route.ts`
- `apps/web/lib/inngest/*`
- `apps/web/modules/billing/domain/trial-jobs.ts`
- `apps/web/modules/accounts/application/pause-unpaid-account.ts`

## Reflexão

A agenda saiu do “um disparo amanhã em UTC” para uma série diária ancorada em Brasília, com regras de DND/opt-in/pausa testáveis sem I/O. O port de template e o HMAC no webhook fecham os dois buracos que impediam produção Meta (texto livre e opt-in forjável). Jobs de cartela e trial reutilizam cálculos já existentes no painel, então o domínio não duplicou fórmula — só o envio.

Manutenção: novos horários entram pelo cron; troca de BSP fica no port. Risco residual é ops (templates Approved + secret na Vercel). Sem isso o código opera em dry-run ou o webhook recusa POST — fail closed, não painel quebrado.

## Próximos passos (humano)

1. Criar/aprovar templates `zelita_opt_in` e `zelita_med_reminder` na Meta
2. Colocar `WHATSAPP_APP_SECRET` (e as demais keys) na Vercel — **não** commitar
3. Sync Inngest em `https://zelita-web.vercel.app/api/webhooks/inngest`
4. Homologar TC-FL04-01…08 no Vercel
