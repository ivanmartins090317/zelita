# Em execução

| Campo | Valor |
| --- | --- |
| Etapa | **Gate 2.2 — F5** código da prévia entregue. Homologação manual só no fim da implementação |
| Spec | [`specs/2026-10-28-f5-pwa-idoso.md`](../../specs/2026-10-28-f5-pwa-idoso.md) |
| Entrega | [`docs/implementation/2026-10-28-f5-pwa-idoso.md`](../implementation/2026-10-28-f5-pwa-idoso.md) |
| Plano de telas | [`docs/state/PLANO-ALTA-FIDELIDADE.md`](./PLANO-ALTA-FIDELIDADE.md) § F5 |
| Plano de produção | [`docs/plans/2026-09-11-producao-real.md`](../plans/2026-09-11-producao-real.md) § 6.1 |
| Autonomia | `tight` |
| Status | Prévia no Vercel. FL-05 segue pendente até a rodada final de testes. |

## Gate 2.1 — envio Meta (fechado em 28/10)

Ivan testou no Vercel desde 26/10. Conta comercial **Celular Zelita**. Lembretes recorrentes chegaram em 27/10 e 28/10 para a pessoa cuidada João, nos horários 08:00, 12:00 e 12:19.

Copy observada: “Olá, João. Está na hora de tomar [remédio]. Qualquer coisa é só chamar a família. — Zelita.” Não afirma que o remédio foi tomado.

Evidência: `docs/evidencias/tc-fl04-03-lembretes-whatsapp.png`.

Ainda abertos no FL-04 (não bloqueiam a F5):

- TC-FL04-04 — sem opt-in não envia
- TC-FL04-07 — aviso de cartela
- TC-FL04-08 — pausa de trial no D30

## Próximo

Homologação manual (FL-05 e o que restar) fica para o fim das tarefas de implementação.

1. Spec da F6 — vínculo do aparelho
2. SOS real e Confirmar Casa, conforme o Gate 2.2
3. Só então a rodada no Vercel: FL-05, FL-06 e os casos ainda abertos
