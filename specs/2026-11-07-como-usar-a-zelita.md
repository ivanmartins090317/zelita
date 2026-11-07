# Spec: F4.12 — Como usar a Zelita

- Status: `draft`
- Data: 2026-11-07
- Autonomia: `tight` (apresentação do painel da família e dependência nova no app)
- Projeto: Zelita (`apps/web`)
- Pedido original: research de 2026-11-07. O familiar precisa de um jeito único de aprender o painel. O nome visível é **Como usar a Zelita**. O passeio ilumina o painel passo a passo; a página de leitura entra na mesma entrega. Só o painel da família. A pessoa refaz quando quiser.
- Plano: [`docs/plans/2026-11-07-como-usar-a-zelita.md`](../docs/plans/2026-11-07-como-usar-a-zelita.md) — **aprovado** em 2026-11-07
- Depende de: invólucro do painel (menu, topo, seletor), Hoje com primeiro acesso e “Sua central”, modal de boas-vindas, área **Como usar a Zelita** (hoje empty state em Ajuda)

## 1. Objetivo

Quem cuida abre o painel e encontra **Como usar a Zelita** no menu e no alto da tela. No menu, lê cada parte com calma. No alto, no primeiro acesso, em Hoje e no convite da conta pronta, vê o painel com um passeio: um recorte por vez, em português, cobrindo o painel inteiro. Pode sair no meio e começar de novo depois. O aplicativo da pessoa cuidada não muda.

## 2. Fora de escopo

- Aplicativo da pessoa cuidada (`/idoso` e vínculo de aparelho)
- Landing, entrar e cadastro
- Gravar “já fez” na conta, no banco ou no navegador
- Obrigar a pessoa a terminar o passeio para usar o painel
- Abrir cada área durante o passeio (o passeio aponta o menu; não navega)
- Passeio dentro de um modal de remédio, exame ou convite
- Trocar o texto clínico das áreas que já existem
- Licença comercial do Intro.js (o risco AGPL fica aceito; a compra não é desta Spec)
- Relatório formal de homologação. Esta entrega confere os passos no aplicativo local

## 3. Atores e pré-condições

- Quem usa: **familiar no painel**, em qualquer papel. Quem não vê **+ Remédio** ou **+ Exame** simplesmente não vê esse passo.
- O que precisa existir antes: painel aberto, com menu e topo. A página de leitura não exige remédio anotado nem aparelho vinculado.
- A dependência `intro.js` entra só depois da aprovação desta Spec.

## 4. Decisões travadas

1. **Nome único visível:** Como usar a Zelita. Não aparece “Tour”, “passeio” nem “1 minuto” nos rótulos de botão. No texto corrido da página, pode dizer que dá para ver no painel, usando esse mesmo nome.
2. **Dois gestos.** O item do menu abre a **página de leitura** (área Como usar a Zelita). O botão do topo, o botão principal do primeiro acesso, o atalho de Hoje, o botão principal do modal e o botão da própria página começam o passeio. O segundo botão do card (“Prefiro ler no meu tempo”) e o segundo do modal (“Prefiro explorar sozinha”) não começam o passeio.
3. **Painel inteiro, sem trocar de área.** A ordem fixa é a da seção 6. O passo do atalho do topo só entra se o botão estiver na tela na hora de começar.
4. **Celular.** Em tela estreita, se o menu lateral estiver fechado, o passeio abre o menu antes de apontar um item dele. Ao sair, o menu volta ao que estava.
5. **Repetir.** Não existe memória de conclusão. Começar de novo volta ao passo 1, mesmo que o anterior não tenha acabado.
6. **Modal de boas-vindas.** Continua uma vez por navegador, como hoje. “Como usar a Zelita” fecha o modal e começa o passeio. “Prefiro explorar sozinha” só fecha. Fechar não impede um passeio depois, pelo botão do topo.
7. **Biblioteca.** Intro.js desenha véu, recorte e balão. Rótulos do balão: **Voltar**, **Próximo**, **Sair**, e no último passo **Entendi**. Escape e clique no véu saem. O balão mostra “Passo N de T”, com T igual ao número de passos que entraram naquela vez.
8. **Marca.** Fundo do balão claro (sand), texto petróleo, botão principal verde-petróleo, cantos e fonte iguais ao painel. Sem azul padrão da biblioteca. Sem coral no balão. Movimento reduzido: o recorte aparece no lugar, sem animação.
9. **Sem dado de saúde no passo.** O texto não cita remédio de exemplo, telefone, endereço nem nome de pessoa. O passo de Pedidos de ajuda diz que a Zelita avisa a família e não chama o SAMU, e que em risco de vida se liga 192.
10. **Página.** Substitui o empty state. Nota no topo, cartões e perguntas da seção 7. No celular a leitura é uma coluna; em tela larga, duas.
11. **Idoso.** Nenhum arquivo do aplicativo da pessoa cuidada muda, e o pacote do passeio não é importado lá.

## 5. Comportamento esperado (cenários)

Linguagem de domínio: o que a pessoa vê e faz — não como o sistema organiza arquivos, persistência ou bibliotecas.

### Caminho feliz

#### Cenário 1: Botão do topo

- Dado: o painel está aberto em qualquer área da família
- Quando: a pessoa aciona **Como usar a Zelita** no alto
- Então: o passeio começa no passo 1, por cima da área atual; a área não troca; dá para avançar, voltar, sair com Escape, com Sair ou com o véu; no último passo, **Entendi** fecha o passeio

#### Cenário 2: Menu

- Dado: o painel está aberto
- Quando: a pessoa aciona **Como usar a Zelita** no menu
- Então: abre a página de leitura, com a nota, os cartões e as perguntas; não começa o passeio sozinho

#### Cenário 3: Ler e ver no painel

- Dado: a pessoa está na área **Como usar a Zelita** (página de leitura)
- Quando: aciona **Como usar a Zelita** na página
- Então: o passeio começa por cima da página, no passo 1

#### Cenário 4: Primeiro acesso

- Dado: Hoje está no estado de primeiro acesso
- Quando: a pessoa aciona **Como usar a Zelita** no card
- Então: o passeio começa
- Quando: aciona **Prefiro ler no meu tempo**
- Então: abre a página de leitura e o passeio não começa

#### Cenário 5: Conta pronta

- Dado: o modal de boas-vindas está aberto
- Quando: a pessoa aciona **Como usar a Zelita**
- Então: o modal fecha e o passeio começa no passo 1
- Quando: aciona **Prefiro explorar sozinha**
- Então: o modal fecha e o painel fica como está

#### Cenário 6: Hoje em uso

- Dado: Hoje mostra “Sua central”
- Quando: a pessoa aciona **Como usar a Zelita** nesse bloco
- Então: o passeio começa no passo 1

#### Cenário 7: De novo

- Dado: a pessoa já concluiu o passeio, ou saiu no meio
- Quando: aciona de novo qualquer entrada que começa o passeio
- Então: começa no passo 1; nada pede confirmação e nada diz que já foi feito

### Bordas

#### Cenário 8: Celular

- Dado: tela estreita de celular e o menu lateral está fechado
- Quando: o passeio começa
- Então: o menu abre e os passos do menu apontam itens visíveis; ao sair, o menu volta a ficar fechado se estava fechado antes

#### Cenário 9: Sem atalho de remédio ou exame

- Dado: a pessoa não administra remédios, ou a conta está pausada, e **+ Remédio** / **+ Exame** não estão no topo
- Quando: o passeio começa
- Então: esse passo não aparece; “Passo N de T” usa o total que sobrou; os outros passos permanecem

#### Cenário 10: Movimento reduzido

- Dado: o aparelho pede para reduzir movimento
- Quando: o passeio avança
- Então: o recorte vai ao próximo alvo sem animação de deslize

#### Cenário 11: Teclado

- Dado: o passeio está aberto
- Quando: a pessoa usa Escape
- Então: o passeio fecha e o painel volta a receber o foco

### O que não muda

#### Cenário 12: Aplicativo da pessoa cuidada

- Dado: o aplicativo do idoso está aberto
- Quando: a pessoa troca de área
- Então: não existe botão **Como usar a Zelita** nem passeio

#### Cenário 13: Resto do painel

- Dado: o passeio está fechado
- Quando: a pessoa anota remédio, vê avisos ou pede ajuda
- Então: essas áreas seguem como hoje

## 6. Passos do passeio

Ordem fixa. O último grupo só entra se o alvo existir na hora de começar.

| # | Alvo | Título | Texto |
| --- | --- | --- | --- |
| 1 | Seletor da pessoa | Quem você acompanha | Tudo neste painel é sobre esta pessoa. Se você cuidar de mais de uma, é aqui que troca. |
| 2 | Hoje | Hoje | O dia dela, num relance: o próximo lembrete, o que está acabando e o que precisa de você. O atalho no celular dela também começa por aqui. |
| 3 | Remédios | Remédios | Anote o que está na caixa. A Zelita calcula quando acaba e avisa antes. Lembrete enviado não quer dizer que o remédio foi tomado. |
| 4 | Consultas e tarefas | Consultas e tarefas | A semana: consultas, exames marcados e quem faz o quê. |
| 5 | Avisos | Avisos | O que a Zelita contou fica guardado aqui. Aqui também se escolhe quem recebe o quê. |
| 6 | Pedidos de ajuda | Pedidos de ajuda | A ordem de quem é avisado quando o botão de ajuda é apertado. A Zelita avisa a família. Ela não chama o SAMU. Em risco de vida, ligue 192. |
| 7 | Onde ele está | Onde ele está | A última localização conhecida, com o horário. A autorização vem antes, e pode ser desligada quando quiser. |
| 8 | Exames e receitas | Exames e receitas | Foto ou PDF de exame e receita, para achar na consulta. Cada arquivo tem quem pode ver. |
| 9 | Quem participa | Quem participa | Irmãos, cuidadora e quem chamar numa emergência. Cada papel vê só o que lhe cabe. |
| 10 | Meu plano | Meu plano | O período grátis e o que está incluído. Nada é cobrado sozinho. |
| 11 | Ajustes | Ajustes | Como a Zelita fala com a pessoa cuidada: canal, tom e o que foi autorizado. O lembrete no WhatsApp só sai depois do aceite. |
| 12 | Como usar a Zelita, no menu | Se esquecer | Esta página explica cada parte: o que é, para que serve e como usar. Dá para refazer este caminho quando quiser, pelo mesmo nome, no alto da tela. |
| 13 | Atalhos do topo | Atalhos | **+ Remédio** e **+ Exame** anotam sem procurar no menu. |

O título da pessoa no passo 2 usa “dela” como no restante do painel quando não há um tratamento escolhido. Não interpola o nome da pessoa cuidada: o seletor já mostra o nome, e o texto do passeio fica estável para o teste.

## 7. Página de leitura

Nota do topo: **Esta página existe para você não precisar adivinhar nada.** Cada função está em três partes: o que é, para que serve e como usar. Para ver no painel, use **Como usar a Zelita**.

Cartões, nesta ordem. Os seis primeiros seguem o texto do protótipo (`zelita-prototipo.html`, view `v-guia`), com “tour” trocado por **Como usar a Zelita** onde o protótipo convida a ver na prática. Os quatro últimos completam o painel.

1. Remédios — com a dica de remédio “se necessário”, sem horário e sem lembrete.
2. Pedidos de ajuda — com o aviso de que a Zelita não chama SAMU nem Bombeiros; em risco de vida, 192 ou 193. Esse aviso pode usar o tom de alerta que o protótipo já usa nessa dica.
3. Onde ele está — com a dica do raio de pelo menos 80 metros.
4. Exames e receitas — com a dica da receita de uso contínuo para a cuidadora.
5. Quem participa — com os quatro papéis: administrador, cuidador, visualizador, contato de emergência.
6. Avisos — com a diferença entre “lembrete enviado” e tomada confirmada.
7. Hoje — o que é a primeira tela; para que serve o relance do dia; como abrir pelo menu; o atalho do celular começa por aqui; a Zelita não afirma que o remédio foi tomado.
8. Consultas e tarefas — a semana, quem leva e quem acompanha; abre pelo menu e anota dia, hora e quem vai junto.
9. Meu plano — período grátis e o que está incluído; nada é cobrado sozinho; sem resposta, a conta pausa e os dados ficam guardados.
10. Ajustes — canal, tom e autorizações; lembrete no WhatsApp só depois do aceite.

Perguntas, na ordem do protótipo:

1. Meu pai precisa instalar algo?
2. Ele precisa confirmar que tomou o remédio?
3. Ele vai saber que estou vendo onde ele está?
4. Vou ser cobrada quando os 30 dias acabarem?
5. E se ele receber uma mensagem pedindo cartão?

O texto de cada resposta é o do protótipo. Não entra pergunta nova.

## 8. Regras de negócio

- O passeio não altera conta, remédio, aviso, pedido de ajuda, lugar nem plano.
- O passeio não envia WhatsApp e não pede permissão de localização.
- “Lembrete enviado” continua diferente de tomada confirmada, na página e no passo de Remédios.
- Pedidos de ajuda continuam avisando a família, sem acionar serviço público.
- Qualquer papel que já entra no painel pode ler a página e começar o passeio. O passeio não libera botão que o papel não tem.

## 9. Segurança

Checklist de `docs/SECURITY.md` aplicável a esta entrega (referência técnica no relatório de Done; o comportamento em si não abre nova superfície de ataque):

- Não há dado novo guardado na conta, arquivo enviado, mensagem automática, integração de pagamento nem segredo novo por causa desta função.
- O texto do passeio e da página não leva nome, remédio, telefone nem endereço da conta. Nada disso vai para registro de erro por esta função.
- A única dependência nova no app da família é a biblioteca do passeio (`intro.js`), conforme o plano. No Done, auditoria de dependências não pode deixar vulnerabilidade crítica aberta sem mitigação. O risco de licença AGPL fica escrito no relatório, como decisão aceita, sem compra da licença comercial nesta entrega.
- A biblioteca não entra no aplicativo da pessoa cuidada.
- N/A nesta entrega: regras novas de quem vê o quê no banco, vínculo de aparelho, validação de formulário novo, papel de serviço no servidor, webhook, upload, WhatsApp, SOS operacional, cabeçalhos de segurança adicionais — o painel segue as mesmas barreiras de acesso de hoje.

## 10. Critérios de Done

- [ ] Cenários 1 a 13 conferidos no aplicativo local (`pnpm dev`), inclusive celular estreito e uma conta sem os atalhos do topo
- [ ] Teste de `family-guide`: 13 passos na ordem da seção 6; sem o 13º quando o alvo não entra; rótulos de botão iguais a “Como usar a Zelita”; nenhum passo com nome de remédio de exemplo; nenhuma string “Tour”
- [ ] `pnpm typecheck`, `pnpm lint` e `pnpm test` verdes
- [ ] Checklist aplicável de `docs/SECURITY.md`, com N/A e o risco AGPL explícitos no relatório
- [ ] Nenhuma mudança fora da seção 11
- [ ] No Done: `docs/state/` (F4.12 sai da pendência aberta) e `docs/implementation/2026-11-07-como-usar-a-zelita.md`
- [ ] Reflexão curta sobre escalabilidade e manutenibilidade

## 11. Escopo de arquivos permitido

Pode criar, depois da aprovação:

- `apps/web/content/family-guide.ts`
- `apps/web/content/family-guide.test.ts`
- `apps/web/components/family-guide/family-guide-tour.tsx`
- `apps/web/components/family-guide/family-guide.css`
- `apps/web/modules/accounts/presentation/family/guia-view.tsx`

Pode alterar, depois da aprovação:

- `apps/web/package.json` e o lockfile — somente `intro.js`
- `apps/web/content/family.ts` — só as frases que ainda dizem Tour
- `apps/web/modules/accounts/presentation/family/family-topbar.tsx`
- `apps/web/modules/accounts/presentation/family/family-sidebar.tsx`
- `apps/web/modules/accounts/presentation/family/welcome-modal.tsx`
- `apps/web/modules/accounts/presentation/family/primeiro-acesso-view.tsx`
- `apps/web/modules/accounts/presentation/family/hoje-maduro-view.tsx`
- `apps/web/app/(family)/familia/guia/page.tsx`
- O arquivo de shell da família estritamente necessário para montar o passeio uma vez e abrir o menu no celular
- `docs/state/**` e `docs/implementation/**` — no Done
- `specs/2026-11-07-como-usar-a-zelita.md` — somente o status, quando houver aprovação ou quando a entrega fechar

Não pode:

- `apps/web/app/(elder)/**` e `apps/web/modules/elder-access/**`
- `apps/web/modules/sos/**`, `billing`, domínio de `accounts`
- `apps/web/app/(auth)/**` e `apps/web/app/(marketing)/**`
- `supabase/migrations/**`, `supabase/policies/**`, `.env*`
- `AGENTS.md`, Specs já aprovadas, PRD, `docs/SECURITY.md`, `docs/arquitetura-solucao.md`
- Outra dependência além de `intro.js`
- `git push`, merge em `main`

Os arquivos de `modules/accounts/presentation/family/**` são path crítico de apresentação. Não mudam regra de papel, sessão nem convite. O diff pede review humano.

## 12. Testes manuais (aplicativo local)

| Passo | O que observar |
| --- | --- |
| 1 | No topo, **Como usar a Zelita** abre o passeio na área atual, com “Passo 1 de …”, Voltar, Próximo e Sair |
| 2 | O passeio aponta o seletor e cada item do menu, sem mudar de área, e termina em **Entendi** |
| 3 | Sair no meio e acionar de novo recomeça no passo 1 |
| 4 | O menu abre a página de leitura, com cartões e perguntas, sem passeio automático |
| 5 | Na página, **Como usar a Zelita** começa o passeio |
| 6 | No primeiro acesso, um botão começa o passeio e o outro abre a página |
| 7 | No celular estreito, o menu abre para o passeio e fecha de novo ao sair, se estava fechado |
| 8 | Sem **+ Remédio** no topo, esse passo não aparece e a contagem fecha com o total certo |
| 9 | No aplicativo do idoso, não há este botão nem este passeio |
| 10 | Balão claro, botão verde-petróleo, sem azul padrão da biblioteca |

## 13. Riscos e dúvidas abertas

- A licença AGPL do Intro.js não autoriza SaaS fechado sem a licença comercial. Esta Spec segue a decisão de usar a biblioteca mesmo assim, num produto só, sem comprar a licença agora.
- No celular, o menu aberto cobre parte do miolo. Os passos do menu continuam visíveis porque o alvo é o próprio menu.
- O nome longo no topo pode quebrar linha em tela estreita. A barra já quebra em mais de uma linha; não se abrevia o nome.
- Se o Intro.js mudar o nome da API entre versões, a entrega usa a API da versão instalada no `pnpm add`, sem fixar um major inventado nesta Spec.

## 14. Aprovação humana

- Aprovado por:
- Data:
- Observações:

Sem aprovação explícita desta Spec, nenhum código começa.
