# Dois atalhos: família e pessoa cuidada

- Data: 2026-11-16
- Spec: pedido direto nesta conversa (separa a decisão 10 da F5, que tinha um manifesto só com `start_url: /idoso`)
- Autonomia: `tight` — o layout de `/idoso` é path crítico; a porta do aparelho não mudou

## O que entrou

O site deixou de publicar um manifesto global. Cada superfície aponta para o seu:

| Superfície | Manifesto | Abre em | Nome no ícone |
| --- | --- | --- | --- |
| Painel | `/pwa/familia` | `/familia` | Família |
| Pessoa cuidada | `/pwa/idoso` | `/idoso` | Zelita |

O link enviado continua `/ativar/<token>`. Depois do “Sim, quero usar”, a pessoa cai em `/idoso/instalado`, e é ali que o atalho dela é adicionado. Landing, login e `/ativar` não têm manifesto.

Em Ajustes, no cartão Privacidade e autorizações, a linha “Atalho deste painel” explica: ícone adicionado com o painel aberto abre a Zelita família; o link enviado abre o app dele. A linha “Atalho no celular dele” diz que aquele ícone abre o app da pessoa cuidada.

## Verificação

- `pnpm typecheck`, `pnpm test` (485), `pnpm lint` (0 erros; aviso antigo em `location-actions.ts`)
- No local: `/pwa/familia` e `/pwa/idoso` devolvem o JSON de cada superfície; `/pwa/entrar` e `/manifest.webmanifest` respondem 404
- O HTML de `/idoso` aponta o manifesto para `/pwa/idoso` e o título do ícone Apple para Zelita. `/entrar` não publica manifesto
- `/familia/ajustes` sem sessão redireciona para `/entrar`, então a linha nova de Ajustes não foi vista logada

## Segurança (`docs/SECURITY.md`)

- N/A: RLS, authz, Zod, service role, webhook, upload, WhatsApp, SOS, Sentry
- Elder-access: vínculo, cookie e revogação não foram alterados. O manifesto não autentica ninguém
- Sem segredo no manifesto (nome, ícone, cor e rota)
