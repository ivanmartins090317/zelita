# Plano — Gate 2.1 (Inngest + WhatsApp)

- Status: `codigo_done` — FL-04 / templates Meta ainda são ops humanas
- Data: 2026-09-21
- Origem: Gate 2.1 de [`docs/plans/2026-09-11-producao-real.md`](./2026-09-11-producao-real.md) + `docs/state/PENDENCIAS.md`
- Autonomia: `tight` (toca `reminders/domain`, webhook, `billing`, `accounts`)
- Spec: [`specs/2026-09-21-gate-2-1-inngest-whatsapp.md`](../../specs/2026-09-21-gate-2-1-inngest-whatsapp.md)
- App: [https://zelita-web.vercel.app/](https://zelita-web.vercel.app/)

**Done do gate:** lembrete chega no WhatsApp no horário de Brasília, só após opt-in, com série diária, webhook assinado, aviso de cartela enviado e conta pausada no D30 sem cobrança.

---

## 1. Evidência de ops (local) — sem valores

Checagem em `.env` (trecho Inngest + WhatsApp). **Nenhum segredo é copiado neste doc.**

| Chave | Local (2026-09-21) | Nota |
| --- | --- | --- |
| `INNGEST_EVENT_KEY` | Preenchida | App `zelita` consegue enviar eventos |
| `INNGEST_SIGNING_KEY` | Preenchida | Formato de signing key de produção |
| `WHATSAPP_ACCESS_TOKEN` | Preenchida | Comentário no `.env`: sandbox Meta Cloud API |
| `WHATSAPP_PHONE_NUMBER_ID` | Preenchida | Número Cloud API apontado |
| `WHATSAPP_VERIFY_TOKEN` | Preenchida | Challenge GET do webhook |
| `WHATSAPP_APP_SECRET` | **Ausente** | Obrigatória para HMAC `X-Hub-Signature-256` — preencher depois (não commitar) |

Ainda precisa conferir **fora do repo** (não dá para ver no `.env`):

1. Vercel → `zelita-web` → as mesmas chaves em Production
2. Meta for Developers → Phone number ID bate com o env; token permanente (System User) vs temporário
3. Webhook callback: `https://zelita-web.vercel.app/api/webhooks/whatsapp`
4. WhatsApp Manager → templates **Approved** UTILITY: `zelita_opt_in` e `zelita_med_reminder`
5. Inngest Cloud → sync em `https://zelita-web.vercel.app/api/webhooks/inngest`

Código envia **template** (não texto livre). Sem `WHATSAPP_APP_SECRET` o webhook POST falha fechado (não grava opt-in). Sem templates Approved o envio real é recusado pela Meta; dry-run continua observável.

---

## 2. Diagnóstico

O esqueleto da Fatia 1 existe, mas não fecha UC-03/UC-04.

| Peça | Hoje | Gap |
| --- | --- | --- |
| Agenda | `scheduleMedicationReminders` manda só o **dia seguinte** com `setUTCHours` | Sem série diária; 08:00 vira 08:00 UTC |
| DND | `getUTCHours`; job **pula** `defer_dnd` | Fuso errado; “adiar” não reagenda |
| WhatsApp | `type: text` | Cloud API rejeita mensagem iniciada pelo negócio fora de 24 h |
| Webhook | GET com verify token; POST sem HMAC | Qualquer POST pode marcar opt-in; match por 8 dígitos |
| Jobs | Só `med-reminder-send` e `wa-opt-in-request` | Faltam cron, refill e trial |
| Cartela / trial | UI e cálculo prontos | Sem job de envio nem pausa |

Regras que permanecem: opt-in obrigatório; `reminder_sent` ≠ tomada; conta pausada não envia; service role só no webhook/Inngest; sem PHI no Sentry.

---

## 3. Decisões

1. **Agenda:** cron diário `TZ=America/Sao_Paulo` (~00:10) materializa os horários de hoje. Ao salvar cartela, pede opt-in e agenda o restante de **hoje**.
2. **Fuso:** `America/Sao_Paulo` no domínio e nos jobs. DND compara HH:MM nesse fuso.
3. **DND:** adiar para o fim da janela no mesmo dia; se o fim passa do dia ou colide com o próximo slot, skip auditável. Não enviar de madrugada.
4. **Idempotência:** `medication_events` do mesmo `pack_id` + `scheduledAt` + tipo sent/skipped. Sem migration.
5. **WhatsApp:** `sendTemplate` — `zelita_opt_in` e `zelita_med_reminder`. Texto livre só em dry-run.
6. **Webhook:** HMAC `X-Hub-Signature-256` com `WHATSAPP_APP_SECRET` antes de mutar. SIM normalizado. Telefone 10–11 dígitos nacionais.
7. **Cartela:** cron ~09:00 BRT. Eventos `pack_refill_warning` / `pack_last_day`. Canal: painel + e-mail Resend ao admin.
8. **Trial:** aviso em trial −5 dias; no/após `trial_ends_at` sem plano pago → `paused`, sem cobrança.
9. **Fora:** F5/F6, SOS real, voz, gateway, convite por e-mail, editar horários, domínio custom.

---

## 4. Ordem de implementação

1. Spec + `docs/state/ATUAL.md`
2. Domínio: fuso, DND, slots do dia, opt-in, refill/trial — Vitest
3. Port WhatsApp (templates) + webhook assinado
4. Inngest: schedule, cron, send idempotente, refill, trial
5. `.env.example` (só nomes de chave)
6. `pnpm typecheck && pnpm lint && pnpm test`
7. FL-04 (homologação no Vercel — humano + templates Approved)
8. `docs/implementation/2026-09-21-gate-2-1-inngest-whatsapp.md`

---

## 5. Riscos

- Templates Meta demoram; Done de “mensagem chegou” depende de Approved + keys na Vercel
- Token de sandbox / temporário expira; preferir System User permanente
- Pausa de trial é mutação em `accounts` — só status `paused`, sem cobrança
- `WHATSAPP_APP_SECRET` ainda não está no `.env` local
