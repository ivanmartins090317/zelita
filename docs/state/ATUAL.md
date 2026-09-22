# Em execução

| Campo | Valor |
| --- | --- |
| Etapa | **Gate 2.1** — código Done; FL-04 no Vercel |
| Spec | [`specs/2026-09-21-gate-2-1-inngest-whatsapp.md`](../../specs/2026-09-21-gate-2-1-inngest-whatsapp.md) |
| Implementation | [`docs/implementation/2026-09-21-gate-2-1-inngest-whatsapp.md`](../implementation/2026-09-21-gate-2-1-inngest-whatsapp.md) |
| Autonomia | `tight` |
| Status | Gate 2.1 commitado. Falta `WHATSAPP_APP_SECRET` na Vercel + sync Inngest + FL-04 |

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
- Falta: deploy na Vercel (após push) · `WHATSAPP_APP_SECRET` · sync Inngest · FL-04

## Próximo (nesta ordem)

1. Push + deploy do Gate 2.1 (HMAC, templates, jobs)
2. Vercel Production: `WHATSAPP_APP_SECRET` + redeploy
3. Inngest Cloud → sync `https://zelita-web.vercel.app/api/webhooks/inngest` (6 functions)
4. Homologar TC-FL04-01…08 em `docs/relatorio-testes-manuais.html` (hoje 0/8 Pendente)
5. Gate 2.2 — Spec F5 (PWA) → F6 (vínculo)
