# Em execução

| Campo | Valor |
| --- | --- |
| Etapa | **Gate 2.2 — F5** código da prévia entregue; falta homologar FL-05 no Vercel |
| Spec | [`specs/2026-10-28-f5-pwa-idoso.md`](../../specs/2026-10-28-f5-pwa-idoso.md) |
| Entrega | [`docs/implementation/2026-10-28-f5-pwa-idoso.md`](../implementation/2026-10-28-f5-pwa-idoso.md) |
| Plano de telas | [`docs/state/PLANO-ALTA-FIDELIDADE.md`](./PLANO-ALTA-FIDELIDADE.md) § F5 |
| Plano de produção | [`docs/plans/2026-09-11-producao-real.md`](../plans/2026-09-11-producao-real.md) § 6.1 |
| Autonomia | `tight` |
| Status | Prévia `/idoso` no código. SOS desta fase é ensaio e não grava alerta. |

## Gate 2.1 — envio Meta (fechado em 28/10)

Ivan testou no Vercel desde 26/10. Conta comercial **Celular Zelita**. Lembretes recorrentes chegaram em 27/10 e 28/10 para a pessoa cuidada João, nos horários 08:00, 12:00 e 12:19.

Copy observada: “Olá, João. Está na hora de tomar [remédio]. Qualquer coisa é só chamar a família. — Zelita.” Não afirma que o remédio foi tomado.

Evidência: `docs/evidencias/tc-fl04-03-lembretes-whatsapp.png`.

Ainda abertos no FL-04 (não bloqueiam a F5):

- TC-FL04-04 — sem opt-in não envia
- TC-FL04-07 — aviso de cartela
- TC-FL04-08 — pausa de trial no D30

## Próximo

1. Homologar FL-05 no Vercel (faixa de prévia visível; ensaio sem linha em `sos_alerts`)
2. Spec da F6 — vínculo do aparelho
