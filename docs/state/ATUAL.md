# Em execução

| Campo | Valor |
| --- | --- |
| Etapa | **Gate 2.2 — F6** código entregue; homologação fica na rodada final |
| Spec | [`specs/2026-10-28-f6-vinculo-aparelho.md`](../../specs/2026-10-28-f6-vinculo-aparelho.md) |
| Entrega | [`docs/implementation/2026-10-28-f6-vinculo-aparelho.md`](../implementation/2026-10-28-f6-vinculo-aparelho.md) |
| Plano de telas | [`docs/state/PLANO-ALTA-FIDELIDADE.md`](./PLANO-ALTA-FIDELIDADE.md) § F6 |
| Plano de produção | [`docs/plans/2026-09-11-producao-real.md`](../plans/2026-09-11-producao-real.md) § 6.2 |
| Autonomia | `tight` |
| Status | Vínculo no código e migration `013` no remoto. SOS real e Confirmar Casa ainda não começaram. |

## Gate 2.1 — envio Meta (fechado em 28/10)

Ivan testou no Vercel desde 26/10. Conta comercial **Celular Zelita**. Lembretes recorrentes chegaram em 27/10 e 28/10 para a pessoa cuidada João, nos horários 08:00, 12:00 e 12:19.

Copy observada: “Olá, João. Está na hora de tomar [remédio]. Qualquer coisa é só chamar a família. — Zelita.” Não afirma que o remédio foi tomado.

Evidência: `docs/evidencias/tc-fl04-03-lembretes-whatsapp.png`.

Ainda abertos no FL-04 (não bloqueiam a F5):

- TC-FL04-04 — sem opt-in não envia
- TC-FL04-07 — aviso de cartela
- TC-FL04-08 — pausa de trial no D30

## Próximo

Homologação manual continua para o fim das tarefas de implementação.

1. Spec seguinte: SOS real e Confirmar Casa
2. Aprovar o template Meta `zelita_device_link` antes do caminho remoto em produção
3. Rodada no Vercel: FL-05, FL-06 e os casos ainda abertos
