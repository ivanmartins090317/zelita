# Em execução

| Campo | Valor |
| --- | --- |
| Etapa | **Gate 2.1** — código Done; FL-04 no Vercel |
| Spec | [`specs/2026-09-21-gate-2-1-inngest-whatsapp.md`](../../specs/2026-09-21-gate-2-1-inngest-whatsapp.md) |
| Implementation | [`docs/implementation/2026-09-21-gate-2-1-inngest-whatsapp.md`](../implementation/2026-09-21-gate-2-1-inngest-whatsapp.md) |
| Autonomia | `tight` |
| Status | Edição de horários da cartela antecipada do Gate 3 (26/10). Opt-in segue bloqueado enquanto a conta de teste estiver pausada |

## Entregue (código Gate 2.1)

- Recorrência diária em `America/Sao_Paulo` + restante de hoje ao salvar cartela
- Templates WhatsApp (não texto livre) + webhook HMAC
- Jobs de cartela (5 dias / véspera / último dia) e trial (aviso D-5 + pausa D30)
- `pnpm typecheck` / `lint` / `test` (382) ok

## Ops (21/09, sem valores)

- Conta: **Test WhatsApp Business Account** · número sandbox `+1555…79440` Conectado
- `INNGEST_*` e `WHATSAPP_ACCESS_TOKEN` / `PHONE_NUMBER_ID` / `VERIFY_TOKEN`: preenchidas (sandbox local)
- Templates **Approved** (22/09), Utilidade, `pt_BR`:
  - `zelita_opt_in` — `{{1}}` nome
  - `zelita_med_reminder` — `{{1}}` nome + `{{2}}` medicamento
- Webhook Meta: callback `https://zelita-web.vercel.app/api/webhooks/whatsapp` — GET challenge devolve `123` (22/09)
- Inngest sync **22/09 20:26**: 6 functions (opt-in, lembrete, cron BRT, cartela, trial)
- Deploy + HMAC no ar (POST sem assinatura → 403)
- FL-04: jobs dispararam (`wa/opt_in.request` Completed; `med/reminder.send` Queued)
- Envio real **falhou**: Meta **#130497** — sandbox `+1555` (EUA) não pode mandar para `+55` (Brasil)
- **Não** usar WAHA/VPS (ToS, ban, fora do PRD)
- Token “Gerar token” da Etapa 1 expira (~24 h); no número BR usar System User permanente
- Falta: templates na conta **Zelita** (não na de teste) · token permanente + Phone Number ID na Vercel · se 130497 persistir, Etapa 3 · FL-04

## Número BR (23/10/2026)

Conta antiga de teste (`+1555`) **não** envia para o Brasil. Número de produção inscrito na Etapa 2, fuso `America/Sao_Paulo`. WhatsApp do chip foi excluído antes do registro. Não reinstalar o app nesse chip.

| Campo | Valor |
| --- | --- |
| Conta | Zelita |
| Messaging Account ID | `2569543983548855` |
| Número | `+55 13 97401-0646` |
| Phone Number ID | `1343091472226387` |
| Status na Meta | Inscrito · webhooks da conta ligados |
| `.env` local | Token permanente do System User `zelita-api` + Phone Number ID `1343091472226387` (23/10). Valor só no `.env`, fora do Git |
| Vercel | Production no número BR (26/10): Phone Number ID `1343091472226387` + token permanente. Redeploy confirmado pelo Ivan |

## Editar horários (26/10)

Botão do detalhe em Remédios grava os horários do remédio já cadastrado. A quantidade continua igual às doses por dia e a duração da caixa não muda. Lembrete de horário removido não dispara.

## Aviso de trial e pausa (26/10)

Faixa calma no período grátis, faixa âmbar nos últimos 5 dias e, com a conta pausada, badge **Pausado** no header mais a lista do que parou. Coral continua só no SOS. Salvar cartela com conta pausada devolve a mensagem no formulário.

## Próximo

1. Templates na conta **Zelita** `2569543983548855`, Utilidade, Português (BR), **Ativo** em 26/10: `zelita_opt_in` e `zelita_med_reminder`
2. Token permanente do System User `zelita-api` no `.env` local e na Vercel (26/10). Não colar o token no chat
3. Vercel Production no Phone Number ID `1343091472226387` + redeploy confirmado (26/10)
4. Disparar o opt-in: salvar a cartela em `/familia/remedios` → template no WhatsApp do destinatário (`55`, outro aparelho, não o chip da Zelita)
5. Homologar TC-FL04-01…08
6. Se a Meta recusar o país de novo, Etapa 3 (verificação da empresa)
7. Gate 2.2 — Spec F5 (PWA) → F6 (vínculo)
