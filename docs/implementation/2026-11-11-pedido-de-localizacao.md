# Pedir a posição do aparelho

**Data:** 2026-11-11  
**Spec:** `specs/2026-11-11-pedido-de-localizacao.md`  
**Autonomia:** tight

## Entregue

Na área **Onde ele está**, a administradora pede a posição atual do celular vinculado. Com o aplicativo aberto na tela, consentimento vigente, plano com localização avançada e GPS já concedido, o aparelho grava um ponto `on_demand` sem toque novo e sem tela nova. O painel mostra o estado do pedido ou o motivo de a posição não ter chegado; a cuidadora continua vendo só mapa e histórico, sem botão nem estado do pedido.

Presença: com a aba visível, o PWA renova `last_seen_at` a cada 30 segundos. Presença com mais de 90 segundos indica aplicativo fechado. Um pedido por vez, expiração em 5 minutos, intervalo mínimo de 2 minutos entre pedidos (contados da hora do pedido). Uma leitura de GPS por pedido; falha na primeira encerra com “não conseguiu enviar”. A posição pedida não confirma Casa nem dispara saída de zona.

Migration `014_location_requests.sql` entra no repositório. **Não** foi aplicada no banco remoto nesta entrega.

## Fora desta entrega

- Homologação formal no Vercel e relatório `manual-report`
- `db push` remoto
- Push, segundo plano, WhatsApp ou e-mail ao receber posição

## Comandos Done

Na raiz, em 2026-11-11:

| Comando | Resultado |
| --- | --- |
| `pnpm typecheck` | verde |
| `pnpm lint` | verde (0 erros; aviso pré-existente em `location-actions.ts`) |
| `pnpm test` | verde — 93 arquivos, 475 testes |

Regras puras: `location-request.test.ts` (presença, cooldown, expiração, GPS único, posição em cache, papel admin e pré-condições).

## Segurança (`docs/SECURITY.md`)

| Item | Status |
| --- | --- |
| RLS | OK — `location_requests`: select/insert só administradora; update/delete negado para `authenticated`; cumprimento via `service_role` |
| Autorização no servidor | OK — criar pedido só admin; coordenada só com cookie de aparelho ativo e id do pedido validado (Zod) |
| Elder-access | OK — listener só com aba visível; sem aviso ao idoso |
| Zod | OK — coordenada e `requestId` no cumprimento |
| `service_role` | OK — ponto `on_demand` e fechamento de pedido no servidor após vínculo |
| Webhooks | N/A |
| Upload de exame | N/A |
| Opt-in de lembrete | N/A |
| SOS | N/A |
| Sentry sem PHI | OK — `location_requested`, `location_request_fulfilled`, `location_request_unanswered` com ids, sem coordenada |
| Headers | N/A |
| Dependência nova | N/A |

## Reflexão

O pedido vive em tabela própria, separado de `location_points`, com enum `on_demand` para o histórico. A lógica de cartão e de expiração ficou em domínio puro testável; o sync de prazo e consentimento roda na carga da página e no pulso do aparelho. Escalar para notificações push exigiria outro canal — fora do MVP, como a Spec já delimita.

A checagem fechada do vínculo antes de gravar coordenada é o ponto crítico: sem ela, a família poderia fabricar posição. O cumprimento recusa pedido de outro id ou aparelho revogado. Até a migration ser aplicada no remoto, o fluxo só fecha em ambiente com schema atualizado.

## Arquivos principais

- `supabase/migrations/014_location_requests.sql`
- `apps/web/modules/location/domain/location-request.ts`
- `apps/web/modules/location/application/request-device-location.ts`
- `apps/web/modules/location/application/location-request-sync.ts`
- `apps/web/modules/location/presentation/location-request-card.tsx`
- `apps/web/modules/elder-access/presentation/elder-location-listener.tsx`

## Resultado

- Autonomia usada: tight
- Spec: `specs/2026-11-11-pedido-de-localizacao.md`
- State / implementation: este arquivo; `docs/state/ATUAL.md`; `docs/manual-dev/pedido-de-localizacao.md`
- Comandos Done: typecheck, lint, test — verdes
- Segurança: checklist acima
- Diff crítico para review humano: **sim** — domínio, listener idoso, migration
