# Gate 2.1 — Inngest + WhatsApp (lembrete de verdade)

| Campo | Valor |
| --- | --- |
| Data | 2026-09-21 |
| Spec | `specs/2026-09-21-gate-2-1-inngest-whatsapp.md` |
| Plano | `docs/plans/2026-09-21-gate-2-1-inngest-whatsapp.md` |
| Autonomia | `tight` |
| Status | Done de código + Vitest. Envio Meta homologado em 26–28/10. Abertos: TC-FL04-04, 07 e 08 |

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
- Homologação restante do FL-04: TC-FL04-04 (sem opt-in), TC-FL04-07 (aviso de cartela) e TC-FL04-08 (pausa D30)

## Comandos Done

```bash
pnpm typecheck  # ok
pnpm lint       # ok
pnpm test       # 382 testes ok
```

## Ops (sem valores)

| Integração | Situação em 28/10 |
| --- | --- |
| Inngest | Sync em produção desde 22/09 |
| WhatsApp | Número BR + token permanente na Vercel; templates ativos; envio real homologado 26–28/10 |
| Resend | OTP ok. Aviso de cartela/trial (TC-FL04-07 e 08) ainda não homologado |

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

## Homologação do envio (28/10/2026)

Ivan testou em produção desde 26/10 e declarou o disparo Meta 100%. Evidência em `docs/evidencias/tc-fl04-03-lembretes-whatsapp.png`: conta comercial Celular Zelita, lembretes de 27/10 e 28/10 (08:00, 12:00, 12:19). Copy de lembrete, sem afirmar tomada.

| TC | Status |
| --- | --- |
| TC-FL04-01 opt-in ao salvar | Aprovado — ciclo real; sem opt-in o job não envia |
| TC-FL04-02 SIM autoriza | Aprovado — mesma rodada |
| TC-FL04-03 horário de Brasília | Aprovado — print |
| TC-FL04-04 sem opt-in não envia | Pendente |
| TC-FL04-05 webhook sem assinatura | Aprovado em 22/09 (POST → 403) |
| TC-FL04-06 copy não afirma tomada | Aprovado — print |
| TC-FL04-07 aviso de cartela | Pendente |
| TC-FL04-08 pausa D30 | Pendente |

Ops de template, token permanente, Phone Number ID e sync Inngest já estavam na Vercel em 26/10 (`docs/state/PENDENCIAS.md`).

## Próximo

Spec da F5 (PWA do idoso), autonomia `tight`, sem código antes da aprovação.
