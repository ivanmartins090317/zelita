# Plano — Como usar a Zelita

- Status: `approved`
- Data: 2026-11-07
- Origem: research de 2026-11-07 + decisões de 2026-11-07
- Autonomia: `tight` (mexe na apresentação de `accounts` e acrescenta dependência)
- Spec: [`specs/2026-11-07-como-usar-a-zelita.md`](../../specs/2026-11-07-como-usar-a-zelita.md) — `draft`, aguardando aprovação humana da Spec. Sem código até lá.
- Módulo dono: `accounts` (apresentação do painel). A copy nova fica em `apps/web/content/`, fora de `family.ts`, que já passou de 300 linhas.
- Dependência nova: `intro.js`, só em `apps/web`, via `pnpm add intro.js`. Entra só com a Spec aprovada. Nenhuma outra biblioteca.
- Fecha, quando entregue: F4.12 em `docs/state/PENDENCIAS.md` (`/familia/guia` deixa de ser empty state).

`docs/state/ATUAL.md` segue no Gate 2.2 até esta tarefa ser a etapa em execução. Não atualizar o state neste plano.

**Done deste plano:** no painel da família, o nome visível desta função é só **Como usar a Zelita**. O botão do topo, o convite do primeiro acesso, o atalho em Hoje e o modal de boas-vindas abrem um passeio do Intro.js que aponta cada parte do painel. A página `/familia/guia` explica as mesmas partes para ler no próprio tempo. A pessoa refaz o passeio quando quiser. O aplicativo da pessoa cuidada não entra.

---

## Decisões travadas (respostas de 2026-11-07)

1. **Um nome.** Some “Tour”, “Rever o tour” e “Fazer o tour de 1 minuto”. O rótulo visível é **Como usar a Zelita**, igual ao item do menu.
2. **Intro.js.** A biblioteca faz o véu, o recorte e o balão. A Zelita escreve os passos, os rótulos em português e as cores da marca. A licença aberta é AGPL; o uso comercial pede licença paga no site do Intro.js. Fica registrado que esta entrega aceita esse risco para um produto só, sem plano de distribuição da biblioteca. Não compramos a licença nesta tarefa.
3. **As duas entregas juntas.** Passeio no painel e página de leitura em `/familia/guia`.
4. **O painel inteiro.** O passeio aponta o seletor da pessoa, cada item do menu e, quando existirem na tela, os atalhos **+ Remédio** e **+ Exame**. Não percorre tela por tela: o menu já está em todas as áreas, e trocar de rota no meio do passeio brigaria com o carregamento de rota.
5. **Só a família.** Nada em `app/(elder)/**` nem em `elder-access`. O aplicativo da pessoa cuidada não ganha passeio nem esta página.
6. **Não é regra.** Não há “já viu” gravado na conta nem no navegador. Cada toque em **Como usar a Zelita** recomeça do primeiro passo. Sair no meio não bloqueia a próxima vez. O modal de boas-vindas continua aparecendo uma vez por navegador, como hoje: é o convite, não uma trava do passeio.

---

## O que cada entrada faz

O nome é o mesmo. O gesto muda conforme o lugar, para a pessoa achar os dois jeitos.

| Lugar | Rótulo | Gesto |
| --- | --- | --- |
| Menu, seção Ajuda | Como usar a Zelita | Abre `/familia/guia` |
| Botão do topo | Como usar a Zelita | Começa o passeio na área em que a pessoa já está |
| Card do primeiro acesso | Como usar a Zelita | Começa o passeio |
| O mesmo card, segundo botão | Prefiro ler no meu tempo | Abre `/familia/guia` |
| Hoje, em “Sua central” | Como usar a Zelita | Começa o passeio |
| Modal “Sua conta está pronta” | Como usar a Zelita | Fecha o modal e começa o passeio |
| O mesmo modal, segundo botão | Prefiro explorar sozinha | Fecha o modal, sem passeio |
| Página `/familia/guia` | Como usar a Zelita | Começa o passeio por cima da página |

Hoje os dois botões do card e o botão do topo levam todos para a página vazia. Isso acaba nesta entrega.

---

## 1. Abordagem

1. **Copy.** `apps/web/content/family-guide.ts` guarda os passos, os cartões da página (o que é / para que serve / como usar) e as perguntas frequentes. `family.ts` só troca as frases que ainda dizem “Tour”.
2. **Passos estáveis.** Cada alvo do shell ganha `data-tour`. A lista de passos é uma função pura: recebe quais alvos estão na tela e devolve só esses, na ordem fixa. Atalho de remédio ou exame some do passeio quando o papel ou a conta pausada já escondem o botão.
3. **Cliente único.** Um componente cliente no shell do painel carrega o Intro.js só no navegador (`dynamic` / import dentro do gesto, sem rodar no servidor). Os botões chamam `start()`. Uma segunda chamada encerra a instância anterior e começa de novo no passo 1.
4. **Celular.** Abaixo de `md` o menu fica fora da tela. Antes do primeiro passo que aponta o menu, o passeio abre o menu. Se foi o passeio que abriu, fechar o passeio devolve o menu ao estado anterior.
5. **Visual.** O CSS padrão do Intro.js não fica azul. Um arquivo nosso cobre balão, botões e véu com sand, verde-petróleo e a fonte do painel. Coral não entra no balão, nem no passo de Pedidos de ajuda: o balão explica, não é o botão de emergência. Com movimento reduzido, o recorte não anima.
6. **Página.** `/familia/guia` deixa o empty state. Os seis cartões e as cinco perguntas do protótipo entram com o texto de lá, trocando “tour” pelo nome desta função. Entram também cartões de Hoje, Consultas e tarefas, Meu plano e Ajustes, que o protótipo não tinha na página e o passeio agora cita.
7. **Idoso.** Nenhum arquivo de `(elder)` muda.

---

## 2. Arquivos

### Criar

- `apps/web/content/family-guide.ts` — passos, cartões, perguntas, rótulos do balão
- `apps/web/content/family-guide.test.ts` — ordem, rótulo único, filtro de alvo ausente, sem nome de remédio de exemplo
- `apps/web/components/family-guide/family-guide-tour.tsx` — cliente que fala com o Intro.js
- `apps/web/components/family-guide/family-guide.css` — cor e tipo da marca por cima do CSS da biblioteca
- `apps/web/modules/accounts/presentation/family/guia-view.tsx` — página de leitura

### Alterar

- `apps/web/package.json` e o lockfile — somente `intro.js`
- `apps/web/content/family.ts` — frases que ainda dizem Tour
- `apps/web/modules/accounts/presentation/family/family-topbar.tsx` — o botão começa o passeio
- `apps/web/modules/accounts/presentation/family/family-sidebar.tsx` — `data-tour` e abertura do menu no celular
- `apps/web/modules/accounts/presentation/family/welcome-modal.tsx` — o botão principal começa o passeio
- `apps/web/modules/accounts/presentation/family/primeiro-acesso-view.tsx` — os dois botões do card se separam
- `apps/web/modules/accounts/presentation/family/hoje-maduro-view.tsx` — “Sua central” começa o passeio
- `apps/web/app/(family)/familia/guia/page.tsx` — renderiza a página de leitura
- O shell da família, no ponto em que o layout cliente já existe, para montar o passeio uma vez

### Não tocar

- `app/(elder)/**`, `modules/elder-access/**`, `modules/sos/**` (domínio), `billing`, migrations, `.env*`
- Landing, entrar, cadastro
- `AGENTS.md`, PRD, `docs/SECURITY.md`, Specs já aprovadas

---

## 3. Riscos

| Risco | O que o plano faz |
| --- | --- |
| AGPL do Intro.js num SaaS fechado | Decisão aceita nesta conversa, para um produto. A licença paga não entra agora. O relatório de Done repete o risco. |
| Biblioteca no bundle de toda página | O import fica no clique, dentro do cliente do painel. O aplicativo do idoso não importa o pacote. |
| Menu fechado no celular | O passeio abre o menu antes de apontar um item. |
| Botão + Remédio invisível para quem só olha, ou com a conta pausada | O passo desse atalho sai da lista quando o elemento não está na tela. |
| `family.ts` crescer de novo | A copy longa nasce em `family-guide.ts`. |
| Balão azul da biblioteca | CSS nosso, carregado só com o passeio. |
| Dado de saúde no texto do passo | Os passos falam da função, sem nome de remédio, telefone ou endereço. |

---

## 4. Aprovação humana

- [x] Plano aprovado · Data: 2026-11-07
- [ ] Spec aprovada · Data: __________
- [ ] Intro.js aceito com o risco de licença AGPL, sem compra da licença comercial nesta tarefa
- [ ] Nome único **Como usar a Zelita**, com os gestos da tabela acima

Sem aprovação explícita da Spec, nenhum código começa.
