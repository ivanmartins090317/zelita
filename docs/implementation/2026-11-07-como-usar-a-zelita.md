# Como usar a Zelita

**Data:** 2026-11-07  
**Spec:** `specs/2026-11-07-como-usar-a-zelita.md`  
**Autonomia:** medium  
**Path crítico:** apresentação de `apps/web/modules/accounts/presentation/family/**` — pede review humano. Não altera papel, sessão nem convite.

## Entregue

No painel da família, o nome visível é **Como usar a Zelita**. O botão do topo, o atalho em “Sua central”, o botão principal do primeiro acesso, o botão principal do modal de boas-vindas e o botão da página começam um passeio por cima da área atual. O item do menu e **Prefiro ler no meu tempo** abrem a página de leitura. **Prefiro explorar sozinha** só fecha o modal.

O passeio aponta o seletor, os itens do menu e, quando **+ Remédio** e **+ Exame** estão no topo, os atalhos. Não troca de área. Dá para voltar, avançar, sair com Sair, Escape ou o véu, e o último passo fecha com **Entendi**. Começar de novo volta ao passo 1. Nada fica gravado na conta nem no navegador.

A página `/familia/guia` substitui o empty state: nota, dez cartões e as cinco perguntas do protótipo. No celular a leitura é uma coluna; em tela larga, duas.

A biblioteca do passeio (`intro.js` 8.6.0) entra só no clique, no cliente do painel. O aplicativo da pessoa cuidada não importa o pacote.

## Fora desta entrega

- Aplicativo da pessoa cuidada, landing, entrar e cadastro
- Memória de “já fez”, no banco ou no navegador
- Compra da licença comercial do Intro.js
- Relatório formal de homologação

## Comandos Done

Na raiz, em 2026-11-07:

| Comando | Resultado |
| --- | --- |
| `pnpm typecheck` | verde |
| `pnpm lint` | verde (0 erros; aviso antigo em `location-actions.ts`, fora desta entrega) |
| `pnpm test` | verde — 92 arquivos, 456 testes |

O teste está em `apps/web/content/family-guide.test.ts`: 13 passos na ordem da Spec; sem o 13º quando o alvo do atalho não entra; rótulos de botão iguais a “Como usar a Zelita”; balão com Voltar, Próximo, Sair e Entendi; nenhuma string “Tour”; nenhum passo com nome de remédio de exemplo.

## Conferência no aplicativo local

`pnpm dev` em `http://localhost:3000`, sessão da família já aberta em Hoje (conta em uso, com “Sua central” e com **+ Remédio** / **+ Exame** no topo).

| Passo | O que foi visto |
| --- | --- |
| 1 | No topo, **Como usar a Zelita** abriu o passeio em `/familia`, com “Passo 1 de 13”, título “Quem você acompanha”, **Voltar**, **Próximo** e **Sair**. Fundo do balão `rgb(250, 247, 242)`, texto `rgb(7, 43, 39)`, botão principal `rgb(18, 118, 110)`, canto 20px. O recorte coincidiu com o seletor |
| 2 | Os 13 títulos passaram na ordem da Spec, sem trocar de área, e o último passo mostrou **Entendi** e “Passo 13 de 13” nos atalhos. **Entendi** fechou e devolveu o foco ao botão |
| 3 | Abrir de novo começou no passo 1. Escape fechou e devolveu o foco. O clique no véu também fechou |
| 4 | O item do menu abriu `/familia/guia` com a nota, os dez cartões e as perguntas, sem passeio |
| 5 | Na página, **Como usar a Zelita** começou no passo 1, ainda em `/familia/guia`. Em 1282px a grade tinha duas colunas; em 390px, uma |
| 6 | Em “Sua central”, **Como usar a Zelita** começou no passo 1. O card de primeiro acesso e o modal “Sua conta está pronta” não estavam nesta conta: Hoje já está em uso, e o modal só monta no primeiro acesso |
| 7 | Em 390px, com o menu fechado (`x: -288`), o passeio abriu o menu (`x: 0`) nos passos do menu, fechou o menu no passo dos atalhos para o alvo ficar visível e, ao sair no passo do menu, devolveu o menu fechado |
| 8 | Com o alvo dos atalhos retirado da tela antes de começar, o passeio foi “Passo 1 de 12” até “Passo 12 de 12”, sem o título “Atalhos”, e terminou em **Entendi**. A conta aberta ainda mostra os botões; o passo só entra se o elemento está na tela, que é o mesmo critério de quem não administra ou está com a conta pausada |
| 9 | Em `/idoso` não havia **Como usar a Zelita** nem passeio |
| 10 | Com o aparelho pedindo movimento reduzido, a transição do recorte, do véu e do balão ficou `none` ao avançar |

## Segurança (`docs/SECURITY.md`)

| Item | Status |
| --- | --- |
| RLS | N/A — nenhuma tabela |
| Autorização de membership | N/A — não escolhe quem vê o quê. O passo do atalho só aponta um botão que o papel já mostra |
| Elder-access / vínculo | N/A — nenhum arquivo de `(elder)` nem de `elder-access` |
| Zod | N/A — sem entrada nova |
| Segredo no navegador / `service_role` | N/A |
| Webhook | N/A |
| Upload | N/A |
| WhatsApp / opt-in | N/A — o texto lembra que o lembrete só sai depois do aceite; não envia mensagem |
| SOS | N/A — o passo e o cartão dizem que a Zelita avisa a família e não chama o SAMU. O fluxo de ajuda não foi alterado |
| Sentry sem PHI | OK — o único registro novo é uma frase fixa se a biblioteca não abrir. O texto do passeio não leva nome, remédio, telefone nem endereço |
| Headers | N/A |
| Dependência nova | `intro.js` 8.6.0, a única acrescentada, como a Spec aprovou. `pnpm audit` não aponta aviso nesse pacote. Os 6 críticos já abertos estão em `next` e `@sentry/nextjs`, anteriores a esta entrega. Subir esses pacotes fica fora do escopo |

**Licença:** o Intro.js 8.6.0 está sob AGPL-3.0. Esta entrega aceita esse risco para um produto, sem comprar a licença comercial e sem plano de distribuir a biblioteca. O uso num SaaS fechado continua pendente dessa licença.

## Reflexão

Os passos, os cartões e o rótulo único ficam num módulo de conteúdo. A página e o passeio leem dali, e o filtro de alvo é uma função pura: some o 13º passo quando o atalho não está na tela, sem o componente decidir a ordem. Trocar uma frase não abre layout, papel nem banco.

O cliente do passeio monta uma vez no shell e só então carrega a biblioteca, no clique. O menu do celular continua dono do próprio estado; o passeio pede para abrir e, ao sair, devolve o que estava. O ponto de atenção é a apresentação de `accounts`: o diff pede review humano para confirmar que papel, sessão e convite não entraram nesses arquivos. O outro ponto é a AGPL: se o produto permanecer fechado, a licença comercial precisa de uma decisão própria, fora desta entrega.

## Arquivos principais

- `apps/web/content/family-guide.ts`
- `apps/web/content/family-guide.test.ts`
- `apps/web/components/family-guide/family-guide-tour.tsx`
- `apps/web/components/family-guide/family-guide.css`
- `apps/web/modules/accounts/presentation/family/guia-view.tsx`
- `apps/web/package.json` e `pnpm-lock.yaml` — dependência `intro.js`
