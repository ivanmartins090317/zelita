# Em execução

| Campo | Valor |
| --- | --- |
| Etapa | **Pedir a posição do aparelho** — código entregue (Done técnico) |
| Spec | [`specs/2026-11-11-pedido-de-localizacao.md`](../../specs/2026-11-11-pedido-de-localizacao.md) |
| Plano | [`docs/plans/2026-11-11-pedido-de-localizacao.md`](../plans/2026-11-11-pedido-de-localizacao.md) |
| Autonomia | `tight` |
| Entrega | [`docs/implementation/2026-11-11-pedido-de-localizacao.md`](../implementation/2026-11-11-pedido-de-localizacao.md) |
| Roteiro local | [`docs/manual-dev/pedido-de-localizacao.md`](../manual-dev/pedido-de-localizacao.md) |

## Pendências desta fatia

- ~~Aplicar `014_location_requests.sql` no banco remoto~~ — feito em 11/11 (`db push`)
- Homologação TC no Vercel com aparelho real (não bloqueia o Done técnico)
- Review humano: domínio `location-request`, listener PWA, migration

## Gate 2.2 — SOS / Confirmar Casa

Código feito em 05/11. Homologação FL-05 / FL-06 continua aberta na rodada única.

## Próximo

Após migration remota e review: homologação de pedido de posição junto à rodada única no Vercel. Template Meta `zelita_device_link` segue operação em paralelo.
