# Em execução

| Campo | Valor |
| --- | --- |
| Etapa | **Gate 2.2 — SOS real e Confirmar Casa** — código feito em 05/11 |
| Spec | [`specs/2026-11-05-sos-real-confirmar-casa.md`](../../specs/2026-11-05-sos-real-confirmar-casa.md) |
| Entrega | [`docs/implementation/2026-11-05-sos-real-confirmar-casa.md`](../implementation/2026-11-05-sos-real-confirmar-casa.md) |
| Plano | [`docs/plans/2026-11-05-sos-real-confirmar-casa.md`](../plans/2026-11-05-sos-real-confirmar-casa.md) |
| Plano de produção | [`docs/plans/2026-09-11-producao-real.md`](../plans/2026-09-11-producao-real.md) § 6.3 |
| Autonomia | `tight` |
| Status | Código desta Spec entregue. Homologação FL-05 / FL-06 continua para a rodada única no Vercel. |

## Última entrega de código (07/11)

Como usar a Zelita, autonomia `medium`. Spec [`specs/2026-11-07-como-usar-a-zelita.md`](../../specs/2026-11-07-como-usar-a-zelita.md). Entrega [`docs/implementation/2026-11-07-como-usar-a-zelita.md`](../implementation/2026-11-07-como-usar-a-zelita.md). Roteiro local [`docs/manual-dev/como-usar-a-zelita.md`](../manual-dev/como-usar-a-zelita.md).

No painel da família, o topo, Hoje em uso e a página de leitura começam o passeio. O menu abre a página. Conferido no `pnpm dev`. O relatório formal de QA não entra nesta entrega. O diff da apresentação do painel pede review humano.

Carregamento de rota segue entregue no mesmo dia: [`docs/implementation/2026-11-07-carregamento-de-rota.md`](../implementation/2026-11-07-carregamento-de-rota.md).

## Gate 2.1 — envio Meta (fechado em 28/10)

Ivan testou no Vercel desde 26/10. Conta comercial **Celular Zelita**. Lembretes recorrentes chegaram em 27/10 e 28/10 para a pessoa cuidada João, nos horários 08:00, 12:00 e 12:19.

Copy observada: “Olá, João. Está na hora de tomar [remédio]. Qualquer coisa é só chamar a família. — Zelita.” Não afirma que o remédio foi tomado.

Evidência: `docs/evidencias/tc-fl04-03-lembretes-whatsapp.png`.

Ainda abertos no FL-04 (não bloqueiam a F5):

- TC-FL04-04 — sem opt-in não envia
- TC-FL04-07 — aviso de cartela
- TC-FL04-08 — pausa de trial no D30

## Próximo

Homologação única no Vercel, com celular vinculado de verdade. Casos TC-FL06-01 a TC-FL06-10 estão em [`docs/relatorio-testes-manuais.html`](../relatorio-testes-manuais.html). Em 05/11 o caminho feliz de confirmar a Casa foi visto (TC-FL06-07); negar a permissão e os outros casos seguem abertos. Roteiro: [`docs/manual-dev/sos-real-confirmar-casa.md`](../manual-dev/sos-real-confirmar-casa.md). FL-05 e FL-06 não foram marcados como aprovados.

O template Meta `zelita_device_link` continua passo de operação, em paralelo.
