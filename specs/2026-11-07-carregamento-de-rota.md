# Spec: Carregamento de rota

- Status: `draft`
- Data: 2026-11-07
- Autonomia: `tight` (o aviso entra no aplicativo da pessoa cuidada, sem login)
- Projeto: Zelita (`apps/web`)
- Pedido original: plano aprovado em 2026-11-07. Escrever a Spec e parar até aprovação humana. Sem código nesta etapa.
- Plano: [`docs/plans/2026-11-07-carregamento-de-rota.md`](../docs/plans/2026-11-07-carregamento-de-rota.md)
- Depende de: painel da família já com menu, topo e faixa de trial; aplicativo do idoso já com banner e barra inferior; tamanho de letra do idoso já existente (“Letras”)

## 1. Objetivo

Ao trocar de área no painel da família ou no aplicativo da pessoa cuidada, o miolo da tela mostra uma frase de cada vez, em português, enquanto a área nova ainda não chegou. As frases se revezam sozinhas, com um brilho suave só no texto. O menu da família e a barra inferior do idoso continuam visíveis. Quando a área nova chega, as frases somem.

A Zelita não está “pensando” nem analisando um cuidado. Está só pedindo que a pessoa aguarde os dados da conta.

## 2. Fora de escopo

- Esqueleto de cartão, tabela ou feed, e reserva de altura por bloco da página
- Quebrar o carregamento de Hoje, ou de qualquer outra área, em pedaços
- Barra de progresso no topo da janela
- Aviso de espera em cada atalho da landing, do menu ou do início do idoso, antes de a troca de área começar
- Entrar, e os formulários que já dizem “Entrando…” ou “Enviando…”
- “Preciso de ajuda” e a frase “Lendo o lugar…” da Casa
- Troca da pessoa cuidada no seletor do painel
- Deixar as áreas mais rápidas
- Frases em inglês da referência visual, e uma tela de demonstração solta
- Mudança de schema, permissão de acesso, ambiente, job ou canal (WhatsApp, voz, e-mail)
- Relatório formal de homologação e a lista de pendências de QA. Esta entrega confere os passos no aplicativo local; a rodada do relatório fica para quando o humano pedir

## 3. Atores e pré-condições

- Quem usa:
  - **Familiar no painel** — troca de área e vê o aviso no miolo, com o menu no lugar.
  - **Pessoa cuidada no aplicativo** — troca de área e vê o aviso no miolo, com a barra inferior no lugar. Sem login.
- O que precisa existir antes:
  - O painel já aberto, com o contorno (menu, topo e, quando couber, a faixa de trial)
  - O aplicativo do idoso já aberto, com banner e barra inferior
  - A dependência de movimento aprovada neste plano, e nenhuma outra biblioteca nova

## 4. Decisões travadas

1. **Uma frase por vez.** A frase entra com um fade e um deslize curto, e o texto tem um brilho que percorre a frase. O brilho é só no texto. O fundo continua claro, como o resto do aplicativo.
2. **A espera é honesta.** A frase não promete um passo que a tela não faz. Não fala em analisar remédio, calcular horário, ler lugar ou avisar a família.
3. **Duas listas.** A da família pode ser uma frase inteira. A do idoso é mais curta, porque a letra é grande e a linha não pode sair da largura do celular.
4. **Ritmo.** Família: a frase troca a cada 2,8 segundos. Idoso: a cada 3,2 segundos. Tempo menor que isso não dá para ler.
5. **Frases da família, nesta ordem:**
   1. Estamos carregando suas informações.
   2. Por favor, aguarde um pouco.
   3. Estamos buscando o que você precisa.
   4. Já vai aparecer aqui.
6. **Frases do idoso, nesta ordem:**
   1. Estamos carregando.
   2. Aguarde um pouco.
   3. Já vai aparecer.
7. **A primeira frase é a âncora.** É a que fica parada quando a pessoa prefere menos movimento, e a única que o leitor de tela anuncia.
8. **Cor.** O brilho vai do verde-petróleo escuro ao tom médio da marca e volta ao escuro. Coral continua só em ajuda e emergência. Este aviso não usa coral.
9. **A frase cabe na tela.** Quebra em mais de uma linha, centralizada. A troca não empurra o que está em volta: o aviso reserva a altura de duas linhas.
10. **Menos movimento.** Com a preferência do aparelho por movimento reduzido: só a primeira frase, parada, sem deslize e sem brilho em loop.
11. **Contraste forte do idoso.** O brilho sai. O texto fica sólido, na cor do aplicativo, legível sobre o fundo claro. O meio claro do brilho não pode sumir no branco.
12. **Leitor de tela.** A frase que se move não é anunciada. Um texto só, invisível na tela e educado para o leitor, repete a primeira frase da lista. A troca visual não é lida de novo a cada intervalo.
13. **Sem dado de saúde.** A frase não leva nome, remédio, telefone nem lugar. Nada disso vai para o registro de erro.
14. **O contorno fica.** No painel, o aviso ocupa o miolo: Hoje, Remédios, Exames, Consultas, Avisos, Localização, Participantes, Plano, Ajustes, Guia, Instalar e Pedidos de ajuda. No idoso, o aviso ocupa o miolo de Casa, Família, Horários, Ajustes e Instalado. O tamanho da frase do idoso acompanha “Letras” e já nasce acima de 17px.
15. **Quem já tem a própria frase de espera não muda.** Entrar, formulários e o pedido de ajuda continuam com o texto que já mostram hoje.
16. **Referência visual.** O movimento vem do exemplo de texto com brilho (licença MIT). O aviso de licença permanece no arquivo do aviso. O produto não chama isso de inteligência e não usa as frases em inglês do exemplo.

## 5. Comportamento esperado (cenários)

Linguagem de domínio: o que a pessoa vê. Sem desenho de rota interna, tabela ou classe.

### Caminho feliz

#### Cenário 1: Familiar troca de área

- Dado: o painel já está aberto
- Quando: a pessoa vai de uma área a outra, por exemplo Hoje, Remédios e Exames
- Então: o menu, o topo e a faixa de trial continuam visíveis; o miolo mostra uma frase da lista da família por vez; as quatro frases se revezam a cada 2,8 segundos, com fade, deslize curto e brilho no texto; quando a área nova chega, as frases somem e o conteúdo da área aparece

#### Cenário 2: Pessoa cuidada troca de área

- Dado: o aplicativo já está aberto no celular
- Quando: a pessoa vai de Casa para Família ou Horários, e também para Ajustes ou Instalado
- Então: o banner e a barra inferior continuam visíveis; o miolo mostra uma frase da lista do idoso por vez; as três frases se revezam a cada 3,2 segundos; a letra acompanha o tamanho escolhido em “Letras”; quando a área nova chega, as frases somem

#### Cenário 3: A área demora

- Dado: a área nova ainda não chegou
- Quando: passa mais de um intervalo
- Então: as frases continuam se revezando na ordem da lista, e voltam ao começo depois da última; nenhuma frase promete um passo que a tela não está fazendo

### Bordas

#### Cenário 4: Celular estreito

- Dado: a largura é a de um celular
- Quando: aparece “Estamos carregando suas informações.” ou uma frase do idoso em letra grande
- Então: a frase quebra em linhas e permanece centralizada; não nasce rolagem horizontal

#### Cenário 5: Contraste forte no idoso

- Dado: em Ajustes do aplicativo, o contraste está em “Contraste forte”
- Quando: a pessoa troca de área
- Então: a frase fica em texto sólido e legível; o brilho não corre pelo texto

#### Cenário 6: Movimento reduzido

- Dado: o aparelho pede para reduzir movimento
- Quando: a pessoa troca de área no painel ou no aplicativo
- Então: aparece só a primeira frase da lista daquela superfície, parada, sem deslize e sem brilho em loop; no painel, “Estamos carregando suas informações.”; no idoso, “Estamos carregando.”

#### Cenário 7: Leitor de tela

- Dado: um leitor de tela está ativo
- Quando: as frases se revezam na tela
- Então: o leitor anuncia uma vez a primeira frase da lista; não anuncia de novo a cada troca

#### Cenário 8: A área chega no meio da frase

- Dado: o aviso está no miolo
- Quando: o conteúdo da área nova fica pronto, mesmo que a frase ainda não tenha terminado o intervalo
- Então: o aviso sai na hora; a Zelita não segura a área pronta só para completar o ciclo de frases

#### Cenário 9: Primeira entrada no painel

- Dado: a pessoa ainda está em Entrar
- Quando: confirma a entrada e o painel ainda não montou o contorno
- Então: o botão continua “Entrando…”; este aviso não substitui essa espera. Se, depois que o contorno existe, a primeira área ainda demorar, o miolo pode mostrar as frases. Se essa primeira espera continuar curta demais, o complemento é outra tarefa

#### Cenário 10: Primeira abertura do aplicativo do idoso

- Dado: o aplicativo ainda não montou banner e barra
- Quando: a pessoa abre o aplicativo pela primeira vez naquela visita
- Então: a espera segue até o contorno existir; este aviso não aparece no lugar do contorno. As trocas seguintes, com o contorno já na tela, usam as frases

#### Cenário 11: Troca muito rápida

- Dado: a área nova chega quase na hora
- Quando: a pessoa troca de área
- Então: o aviso pode piscar por pouco tempo e some com a chegada do conteúdo. Não é erro, e a Zelita não inventa uma espera mínima

### O que não muda

#### Cenário 12: Entrar

- Dado: a pessoa está na tela de entrar
- Quando: pede para entrar
- Então: o botão segue “Entrando…” e o painel abre como hoje

#### Cenário 13: Pedir ajuda

- Dado: a pessoa está no aplicativo, no fluxo “Preciso de ajuda”
- Quando: confirma ou cancela a ajuda
- Então: o fluxo atual permanece; este aviso não toma o lugar da confirmação nem da frase que o pedido de ajuda já usa

#### Cenário 14: Casa e formulários que já explicam a espera

- Dado: a pessoa confirma a Casa, ou envia um formulário que já diz o que está acontecendo
- Quando: a ação está em curso
- Então: continua a frase daquela ação (“Lendo o lugar…”, “Enviando…”, “Entrando…”). Este aviso não a substitui

#### Cenário 15: Trocar a pessoa cuidada

- Dado: o familiar usa o seletor de pessoa no painel
- Quando: escolhe outra pessoa
- Então: o comportamento de hoje permanece. Esta entrega não cria um aviso novo para essa troca

## 6. Regras de negócio

- O aviso só ocupa o miolo, e só enquanto a área nova não chegou.
- Família e idoso não compartilham a mesma lista nem o mesmo intervalo.
- A ordem das frases é fixa. Não há frase aleatória e não há frase com dado da conta.
- Movimento reduzido e contraste forte são preferências do aparelho ou do aplicativo. O aviso obedece às duas sem pedir configuração nova.
- Nenhuma regra de cuidado muda: lembrete, tomada, pedido de ajuda, Casa, silêncio e plano continuam como estão.
- A sessão da família e o vínculo do aparelho não são relidos por este aviso. Ele não decide quem pode ver a área; só preenche a espera visual.

## 7. Segurança

Checklist de `docs/SECURITY.md` aplicável a esta entrega:

- O aviso não lê nem grava cuidado, conta, aparelho ou lugar. Não escolhe família e não recebe identificador da tela.
- Não há dado de saúde na frase e não há registro de erro novo. Se um erro de tela já existente for registrado, continua valendo a regra atual: identificador e tipo do acontecimento, sem nome, remédio, telefone ou lugar.
- A dependência nova é só a de movimento, já nomeada no plano aprovado. Nenhuma outra entra. No Done, a auditoria de pacotes não pode deixar crítico aberto sem mitigação.
- Itens que esta entrega não toca, para o relatório marcar N/A: permissão por papel no banco, autorização de membership, vínculo de aparelho, validação de entrada, segredo no navegador, acesso privilegiado, webhook, upload, WhatsApp, pedido de ajuda, cabeçalho de segurança.

## 8. Critérios de Done

- [ ] Cenários 1 a 15 conferidos no aplicativo local (`pnpm dev`), nos sete passos do plano: troca no painel, troca no idoso, celular estreito, contraste forte, movimento reduzido, Entrar e “Preciso de ajuda”
- [ ] Teste curto da lista: quatro frases na família, três no idoso, nesta ordem, nenhuma em inglês, intervalos 2,8 s e 3,2 s, e a primeira frase de cada lista identificada como âncora
- [ ] `pnpm typecheck`, `pnpm lint` e `pnpm test` verdes
- [ ] Checklist aplicável de `docs/SECURITY.md`, com N/A explícito no relatório da entrega
- [ ] Nenhuma mudança fora da seção 9
- [ ] `docs/state/` atualizado só no Done, quando esta tarefa passar a ser a etapa em execução, e entrega em `docs/implementation/2026-11-07-carregamento-de-rota.md`
- [ ] Reflexão curta sobre escalabilidade e manutenibilidade do aviso compartilhado

## 9. Escopo de arquivos permitido

Pode criar, depois da aprovação:

- `apps/web/content/route-loading.ts` — as duas listas, os dois intervalos e qual frase é a âncora
- `apps/web/content/route-loading.test.ts` — o teste curto da seção 8
- `apps/web/components/ui/route-loading.tsx` — o aviso de frases, com o comentário de licença MIT da referência
- `apps/web/app/(family)/familia/loading.tsx` — aviso da família no miolo do painel
- `apps/web/app/(elder)/idoso/loading.tsx` — aviso do idoso no miolo do aplicativo

Pode alterar, depois da aprovação:

- `apps/web/package.json` e o lockfile — somente para acrescentar a dependência de movimento (`motion`)
- `docs/state/**` e `docs/implementation/**` — no Done
- `specs/2026-11-07-carregamento-de-rota.md` — somente o status desta Spec, quando o humano aprovar ou quando a entrega fechar

Não pode:

- `apps/web/app/(family)/layout.tsx`, `apps/web/app/(elder)/idoso/layout.tsx` e qualquer página já existente
- `apps/web/modules/**` — inclusive `elder-access`, `sos`, `accounts` e `billing`
- `apps/web/app/(auth)/**` e `apps/web/app/(marketing)/**`
- `supabase/migrations/**`, `supabase/policies/**`, `.env*`
- `AGENTS.md`, Specs já aprovadas, PRD, `docs/SECURITY.md`, `docs/arquitetura-solucao.md`
- Outra dependência além de `motion`
- `git push`, merge em `main`

O arquivo `apps/web/app/(elder)/idoso/loading.tsx` é o único path crítico. Não altera regra de aparelho, de ajuda nem de Casa. O diff dele pede review humano.

## 10. Testes manuais (desta entrega, no aplicativo local)

Fazem parte do Done. Ambiente: `pnpm dev`, painel autenticado e aplicativo do idoso já aberto.

| Passo | O que observar |
| --- | --- |
| 1 | No painel, Hoje → Remédios → Exames: o menu fica; o miolo reveza as quatro frases, com brilho no texto, e some quando a área chega |
| 2 | No aplicativo, Casa, Família e Horários: a barra inferior fica; as três frases cabem na largura e acompanham “Letras” |
| 3 | No celular estreito, a frase quebra em linha e não aparece rolagem horizontal |
| 4 | Com contraste forte no idoso, o texto fica sólido e legível |
| 5 | Com movimento reduzido, uma frase parada, sem deslize e sem brilho em loop |
| 6 | Em Entrar, o botão segue “Entrando…” e o painel abre como hoje |
| 7 | “Preciso de ajuda” não passa a exibir este aviso no lugar do fluxo atual |

## 11. Riscos e dúvidas abertas

- Na primeira entrada, o contorno do painel ainda não existe enquanto Entrar resolve a conta. O botão “Entrando…” continua sendo a espera dessa etapa. Se ainda parecer pouco, não se resolve nesta Spec.
- Na primeira abertura do aplicativo, a espera até o banner e a barra existirem continua como hoje. O aviso cobre as trocas depois disso.
- O brilho no texto falha no contraste forte, porque o meio do brilho é claro. Nessa preferência o texto fica sólido.
- Frase longa sem quebra de linha gera rolagem horizontal. A frase quebra.
- Anunciar cada troca faria o leitor de tela reler a lista inteira. O anúncio é uma frase só, fora da animação.
- A área que chega muito rápido pode fazer o aviso piscar. Não há espera artificial.
- Não existe hoje uma tela de falha dedicada para a área que não abre. Esta Spec não cria essa tela: se a área não chega, as frases continuam; se a navegação nem começa, o aviso não aparece.

## 12. Aprovação humana

- Aprovado por:
- Data:
- Observações:

Sem aprovação explícita desta Spec, nenhum código começa.
