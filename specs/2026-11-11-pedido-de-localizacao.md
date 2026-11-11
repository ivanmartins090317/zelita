# Spec: Pedir a posição do aparelho

- Status: `done` (código 2026-11-11; homologação Vercel posterior)
- Data: 2026-11-11
- Autonomia: `tight` (quem pode pedir, aparelho sem login, coordenada e registro novo de acesso)
- Projeto: Zelita (`apps/web`)
- Pedido original: plano aprovado em 2026-11-11. Escrever a Spec e parar até aprovação humana. Sem código nesta etapa.
- Plano: [`docs/plans/2026-11-11-pedido-de-localizacao.md`](../docs/plans/2026-11-11-pedido-de-localizacao.md)
- Depende de: Onde ele está (F4.8), aparelho vinculado (F6), consentimento de localização e a regra já existente de localização avançada. A leitura de zona ao abrir o aplicativo permanece como está.

## 1. Objetivo

Na área **Onde ele está**, a administradora pede a posição atual do celular vinculado. Se o aplicativo da pessoa cuidada estiver aberto na tela, com consentimento vigente, plano com localização avançada e permissão de GPS já concedida, o aparelho grava essa posição sem um toque novo e sem uma tela nova. O painel mostra a posição, com horário e precisão, ou o motivo de ela não ter chegado.

A cuidadora continua só vendo a última posição no mapa e no histórico. Ela não pede e não acompanha o pedido.

## 2. Fora de escopo

- Acordar o celular fechado, aviso push, trabalho em segundo plano, aplicativo nativo ou leitura com o aplicativo fechado
- Pedido pela cuidadora, pela visualizadora ou pelo contato de emergência
- Mudar o alerta de saída de zona, o pedido de ajuda ou o “Estou em casa”
- Confirmar a Casa ou ligar “avisar ao sair” por causa deste pedido
- Leitura contínua, vigia de GPS ou ping de posição em agenda
- Aviso por WhatsApp ou e-mail quando a posição chegar
- Biblioteca nova de mapa
- Medir bateria ou qualidade de sinal
- Tela no aparelho da pessoa cuidada dizendo que a família pediu a posição
- Aplicar a mudança de acesso no banco remoto. O arquivo da mudança entra no código; aplicar no remoto continua um pedido explícito
- Homologação formal no Vercel e relatório de testes manuais
- Editar PRD, `docs/SECURITY.md` ou a Spec já entregue de Onde ele está

## 3. Atores e pré-condições

- Quem usa:
  - **Administradora** — pede a posição e vê o estado do pedido.
  - **Cuidadora** — vê a posição gravada no mapa e no histórico que já pode ver. Não vê o botão nem o estado do pedido.
  - **Pessoa cuidada no aplicativo vinculado** — não faz um gesto novo. Com o aplicativo aberto na tela, o celular pode responder ao pedido. Sem login.
  - **Visualizadora e contato de emergência** — continuam sem esta área no uso rotineiro.
- O que precisa existir antes:
  - Conta da família com sessão da administradora
  - Pessoa cuidada já cadastrada
  - Celular vinculado e ativo
  - Consentimento de localização vigente
  - Plano com localização avançada
  - Permissão de GPS já concedida no celular, para a posição chegar. Sem essa permissão o pedido existe, mas a posição não sai
  - A área **Onde ele está** já no painel

Não é pré-condição: Casa confirmada, “avisar ao sair” ligado, nem o aplicativo estar aberto no momento do pedido. Se estiver fechado, o pedido espera até o prazo, e o painel diz isso.

## 4. Decisões travadas

1. **Só com o aplicativo aberto na tela.** A leitura acontece enquanto a aba está visível. O card da administradora diz: “A posição só chega se o aplicativo estiver aberto na tela deste celular. Com o aplicativo fechado, a Zelita não lê o lugar.”
2. **Quem pede é a administradora.** Cuidadora não vê o botão nem o estado. A posição gravada entra no mapa e no histórico que a cuidadora já pode ver.
3. **Um pedido por vez.** Enquanto houver pedido aberto daquela pessoa cuidada, outro pedido não nasce. Vale também se outra administradora da mesma conta tentar.
4. **Dois minutos entre pedidos.** O prazo conta da hora em que o pedido foi feito, não da hora em que ele terminou. Antes disso, o pedido novo é recusado com: “Espere 2 minutos para pedir de novo.”
5. **O pedido fica aberto no máximo 5 minutos.** Sem posição nesse prazo, ele encerra com o motivo da seção 5. Não fica aberto para sempre.
6. **Presença.** Com a aba visível, o aplicativo renova a presença a cada 30 segundos. Presença com mais de 90 segundos significa “o aplicativo não está aberto”. Aba em segundo plano não renova. O celular não avisa que foi fechado; o painel usa essa presença.
7. **Uma leitura por pedido.** Não repete o GPS a cada renovação de presença. A primeira falha encerra aquele pedido como “não enviou”. Outro pedido só depois de 2 minutos.
8. **Como o celular lê.** Só com consentimento vigente, vínculo ativo e permissão de GPS já concedida. Não abre pedido novo de permissão. Não usa posição antiga guardada no aparelho. Espera no máximo 8 segundos, na maior precisão daquela tentativa.
9. **O que o pedido não faz.** Não depende de “avisar ao sair” nem de a Casa estar confirmada. Não confirma a Casa. Não liga o aviso de saída. Não dispara sozinho o alerta de zona. A leitura de zona ao abrir o aplicativo continua como está, em separado.
10. **Conta pausada ou consentimento que deixou de valer.** Não nasce pedido. O aparelho não lê o GPS. Se o pedido já estava aberto, ele encerra sem posição.
11. **A família não fabrica coordenada.** Só o celular vinculado e ativo grava a posição daquele pedido. A sessão da família grava o pedido, não o lugar.
12. **Sem tela nova para a pessoa cuidada.** Nenhum aviso de que a família pediu. Letra, alvos e o botão de ajuda do aplicativo permanecem como estão.
13. **Log sem lugar.** No registro de erro entram o identificador do pedido ou da pessoa e o tipo do acontecimento. Não entram latitude, longitude, nome nem telefone. Quem pediu fica no próprio pedido, visível para a administradora.

### Frases do card (só a administradora)

| Situação | Frase |
| --- | --- |
| Pedido aberto e o aplicativo está na tela, ainda sem resultado | Pedindo a posição neste celular. |
| Pedido aberto e a presença está velha | O aplicativo não está aberto neste celular. |
| Aplicativo na tela e a leitura não saiu | O celular não conseguiu enviar a posição. |
| O aplicativo chegou a estar aberto e os 5 minutos terminam sem posição | O aplicativo pode ter sido fechado ou o celular ficou sem acesso. |
| Posição gravada | A posição aparece no mapa que já existe, com horário e precisão em metros. O card confirma que ela chegou. |

Se os 5 minutos terminam e o aplicativo não chegou a estar aberto naquele pedido, a frase que permanece é “O aplicativo não está aberto neste celular.” O pedido não continua aberto.

### Recusa antes de criar o pedido

- Conta pausada: “Conta pausada — ações indisponíveis até reativar.”
- Sem consentimento vigente: “Ele ainda não autorizou compartilhar a localização.”
- Sem localização avançada no plano: “Pedir a posição agora faz parte da localização avançada.”
- Sem celular vinculado e ativo: “Ainda não há um celular vinculado para pedir a posição.”
- Papel que não é administradora: o botão não aparece. Se a ação for tentada mesmo assim, nada é gravado.

## 5. Comportamento esperado (cenários)

Linguagem de domínio: o que a pessoa vê e o que fica registrado. Sem desenho de rota interna, tabela ou classe.

### Caminho feliz

#### Cenário 1: Administradora pede e o aplicativo está aberto

- Dado: administradora; conta ativa; consentimento vigente; plano com localização avançada; celular vinculado; permissão de GPS já concedida; aplicativo aberto na tela; nenhum pedido aberto; o pedido anterior, se houve, tem 2 minutos ou mais
- Quando: em **Onde ele está**, pede a posição atual
- Então: nasce um pedido; o card diz “Pedindo a posição neste celular.”; o celular faz uma leitura nova, sem toque e sem tela nova; a posição fica registrada como pedida pela família; o mapa mostra horário e precisão em metros; o card confirma que a posição chegou
- E: a pessoa cuidada não vê um aviso de que a família pediu

#### Cenário 2: O aplicativo abre depois do pedido

- Dado: o pedido está aberto; a presença está velha; ainda não se passaram 5 minutos
- Quando: a pessoa cuidada abre o aplicativo na tela, com consentimento, vínculo e permissão de GPS já concedida
- Então: o card deixa de dizer que o aplicativo não está aberto; o celular faz a leitura única daquele pedido; se a posição sair, vale o fim do cenário 1

#### Cenário 3: Cuidadora vê a posição e não vê o pedido

- Dado: a posição do cenário 1 já foi gravada; cuidadora com permissão de ver localização
- Quando: abre **Onde ele está**
- Então: o mapa e o histórico mostram essa posição, com horário; o histórico a distingue de uma entrada ou saída de zona, dentro da janela de 7 dias que já existe
- E: não há botão de pedir, nem frase de pedido aberto, nem motivo de falha

#### Cenário 4: A administradora acompanha sem sair da área

- Dado: a administradora permanece em **Onde ele está** com um pedido aberto
- Quando: a posição chega, ou o pedido encerra sem posição
- Então: a mesma área passa a mostrar o resultado ou o motivo, sem exigir que ela abra outra área

### Erros e bordas

#### Cenário 5: Aplicativo fechado

- Dado: pedido recém-criado; presença com mais de 90 segundos, ou aba fora de vista
- Quando: a administradora olha o card
- Então: lê “O aplicativo não está aberto neste celular.”; o pedido continua aberto até os 5 minutos; nenhuma posição é lida enquanto a aba não estiver visível
- E: se ninguém abrir o aplicativo nesse prazo, o pedido encerra com essa mesma frase

#### Cenário 6: Aplicativo aberto e o GPS não sai

- Dado: pedido aberto; aplicativo na tela; consentimento vigente
- Quando: a permissão de GPS não está concedida, a leitura volta vazia, ou os 8 segundos estouram
- Então: o pedido encerra na hora, com “O celular não conseguiu enviar a posição.”; não há segunda leitura naquele pedido; não abre pedido de permissão
- E: outro pedido só depois de 2 minutos contados da hora deste

#### Cenário 7: Esteve aberto e o prazo acaba sem posição

- Dado: durante o pedido a presença chegou a estar fresca; a leitura não concluiu e também não falhou no critério do cenário 6
- Quando: completam 5 minutos sem posição
- Então: o pedido encerra com “O aplicativo pode ter sido fechado ou o celular ficou sem acesso.”

#### Cenário 8: Pedido aberto ou intervalo de 2 minutos

- Dado: já existe pedido aberto, ou o último pedido foi feito há menos de 2 minutos
- Quando: a administradora pede de novo
- Então: não nasce outro pedido; com pedido aberto, o card continua no estado atual; dentro dos 2 minutos, a frase é “Espere 2 minutos para pedir de novo.”

#### Cenário 9: Sem plano, sem consentimento, sem celular ou conta pausada

- Dado: falta localização avançada, ou o consentimento não está vigente, ou não há celular vinculado e ativo, ou a conta está pausada
- Quando: a administradora tenta pedir
- Então: o pedido não nasce; o card explica o motivo com a frase da seção 4; o aparelho não lê o GPS

#### Cenário 10: Consentimento cai ou a conta pausa no meio do pedido

- Dado: o pedido está aberto
- Quando: o consentimento deixa de valer, ou a conta é pausada, antes da leitura
- Então: o celular não lê; o pedido encerra sem posição; nenhuma coordenada nova entra no mapa por causa desse pedido

#### Cenário 11: Cuidadora, visualizadora ou sessão da família no lugar do celular

- Dado: cuidadora, visualizadora, contato de emergência, ou só a sessão da família
- Quando: algo tenta criar o pedido sem ser administradora, ou tenta gravar a coordenada sem o celular vinculado e ativo
- Então: o pedido não nasce se o papel não for de administradora; a coordenada não é gravada se não vier do celular daquele pedido
- E: a visualizadora continua sem a área, como hoje

#### Cenário 12: Posição antiga do aparelho

- Dado: o celular tem uma coordenada guardada de uma leitura anterior
- Quando: responde ao pedido
- Então: essa coordenada guardada não vale; só entra uma leitura nova, dentro dos 8 segundos

#### Cenário 13: Casa e aviso de saída não mudam

- Dado: Casa sem posição confirmada, ou “avisar ao sair” desligado, ou plano sem o aviso de zona
- Quando: a posição pedida é gravada
- Então: a Casa não fica confirmada; “avisar ao sair” não liga; não nasce alerta de saída por causa desta leitura
- E: abrir o aplicativo, fora deste pedido, continua tentando a leitura de zona só quando as regras atuais dessa leitura já permitem

#### Cenário 14: Histórico não vira rastro

- Dado: já existem entradas e saídas de zona nos últimos 7 dias, e uma posição pedida
- Quando: administradora ou cuidadora olha **Onde ele esteve**
- Então: a posição pedida aparece junto, com horário e precisão, sem apagar os eventos de zona e sem listar cada abertura do aplicativo

### O que não muda

#### Cenário 15: Pedido de ajuda e “Estou em casa”

- Dado: a pessoa cuidada usa o botão de ajuda ou confirma a Casa
- Quando: confirma
- Então: esses fluxos seguem como estão. Este pedido não os dispara e não os substitui

#### Cenário 16: Mapa, lugares e link temporário

- Dado: a administradora usa lugares de sempre ou “Mostrar por um tempo”
- Quando: pede a posição
- Então: esses cartões continuam com as regras atuais. O pedido novo não cria link e não altera lugar

## 6. Regras de negócio

- Só a administradora cria o pedido. A decisão é refeita no servidor, com a sessão da conta. O botão escondido não é a única trava.
- Pré-condições para criar: conta não pausada, consentimento vigente, celular vinculado e ativo, plano com localização avançada, nenhum pedido aberto daquela pessoa e pelo menos 2 minutos desde o pedido anterior.
- O pedido guarda quem pediu, a hora, o prazo de 5 minutos e, se encerrar sem posição, o motivo.
- Presença fresca: renovada há 90 segundos ou menos, e só enquanto a aba está visível. O pulso é de 30 segundos.
- Estado do pedido, nesta ordem de leitura:
  - posição gravada: concluído
  - leitura tentada e não enviada: encerrado com a frase do GPS
  - prazo de 5 minutos esgotado depois de presença fresca, sem posição: encerrado com a frase de aplicativo fechado ou sem acesso
  - prazo esgotado sem presença fresca em nenhum momento: encerrado com a frase de aplicativo não aberto
  - aberto com presença fresca e leitura ainda não concluída: pedindo
  - aberto com presença velha: aplicativo não aberto, e o pedido segue até o prazo
- Uma leitura por pedido. Falha na primeira encerra. Sucesso grava uma posição ligada àquele pedido e encerra como concluído.
- A posição pedida não confirma Casa, não avalia saída de zona e não passa pela regra de “pode tentar ler a zona ao abrir”.
- A posição pedida entra no mapa e no histórico já existentes. O histórico segue a janela de 7 dias e não vira trajeto minuto a minuto.
- Lembrete enviado continua sem significar remédio tomado. Esta entrega não mexe em lembrete.
- Fuso dos horários mostrados à família: `America/Sao_Paulo`.
- Nome, telefone e coordenada não entram em log de erro.

## 7. Segurança (`docs/SECURITY.md`)

- Quem pode pedir é a administradora, revisto no servidor e no acesso aos registros do pedido. Cuidadora lê a posição que já podia ver; não cria pedido e não lê o estado do pedido.
- A pessoa cuidada não é usuária com login. O celular continua sendo o vínculo já revogável. Sem vínculo ativo, o pedido não é cumprido.
- A sessão da família não grava coordenada. A escrita da posição segue o caminho privilegiado que já existe para posição vinda do aparelho, e só depois de o vínculo daquele pedido ser válido.
- A família autenticada não insere a posição. O aparelho autenticado também não altera o pedido por conta própria fora do cumprimento desta leitura.
- Entrada validada no servidor antes de gravar: identificador do pedido e coordenada, quando a leitura existe. Identificador livre vindo da tela não escolhe outra família nem outro pedido.
- Pedido aberto e prazo de 5 minutos limitam repetição. Dois minutos separam um pedido do seguinte.
- Log de erro: identificador e tipo do acontecimento (`location_requested`, `location_request_fulfilled`, `location_request_unanswered`). Sem latitude, longitude, nome, telefone ou segredo do aparelho.
- Consentimento revogado ou conta pausada não cria pedido e o aparelho não lê o GPS.
- Itens do checklist que esta entrega não toca, para o relatório marcar N/A: webhook novo, upload de exame, cabeçalho de segurança, dependência nova, WhatsApp, opt-in de lembrete, pedido de ajuda e “não incomodar”.

## 8. Critérios de Done

- [ ] Cenários 5, 6, 7, 8, 12 e 13 cobertos por regra pura em Vitest: presença velha; uma falha encerra como “não enviou”; prazo de 5 minutos com e sem presença fresca; intervalo de 2 minutos e pedido aberto; posição antiga não vale; a posição pedida não confirma Casa nem dispara saída de zona. Cobertura ≥ 80% nessas regras
- [ ] Papel de administradora, conta pausada, consentimento e plano com localização avançada entram na mesma regra pura de “pode pedir”
- [ ] `pnpm typecheck`, `pnpm lint` e `pnpm test` verdes
- [ ] Checklist aplicável de `docs/SECURITY.md`, com N/A explícito no relatório da entrega
- [ ] Nenhuma mudança fora da seção 9
- [ ] `docs/state/` atualizado e entrega em `docs/implementation/2026-11-11-pedido-de-localizacao.md`
- [ ] O arquivo de acesso novo fica no repositório. Aplicar no banco remoto não faz parte deste Done
- [ ] Homologação formal e relatório de testes manuais não bloqueiam este Done

## 9. Escopo de arquivos permitido

Pode criar, depois da aprovação:

- `supabase/migrations/014_location_requests.sql` — o pedido, quem pode criá-lo e lê-lo, e a origem nova da posição pedida pela família. A mudança de acesso não grava uma posição de exemplo
- `apps/web/modules/location/domain/location-request.ts` e `location-request.test.ts` — quem pode pedir, intervalos e o estado do pedido
- `apps/web/modules/location/infrastructure/location-request-repo.ts`
- `apps/web/modules/location/application/request-device-location.ts` — criar o pedido pela família e cumpri-lo pelo celular
- `apps/web/modules/location/presentation/location-request-card.tsx`
- `apps/web/modules/elder-access/presentation/elder-location-listener.tsx` — presença e leitura só com a aba visível

Pode alterar, depois da aprovação:

- `apps/web/modules/location/constants.ts` — 30 segundos, 90 segundos, 2 minutos, 5 minutos e a espera de GPS de 8 segundos
- `apps/web/modules/location/infrastructure/location-point-repo.ts` — aceitar a posição pedida pela família
- `apps/web/modules/location/application/get-localizacao-page.ts` — pedido atual só no que a administradora vê
- `apps/web/modules/location/presentation/localizacao-page-view.tsx` — o card do pedido
- `apps/web/modules/location/presentation/location-map-card.tsx` e `location-history-card.tsx` — mostrar a posição pedida sem duplicar a regra de zona
- `apps/web/content/family.ts` — as frases da seção 4
- `apps/web/modules/elder-access/presentation/elder-home.tsx` — montar o listener no celular vinculado
- `apps/web/modules/location/index.ts` — só o que a rota da família precisa. A ação de cumprir o pedido não entra aqui; o listener importa essa ação pelo arquivo dela
- `docs/state/**` e `docs/implementation/**` — no Done
- `specs/2026-11-11-pedido-de-localizacao.md` — somente o status desta Spec, quando o humano aprovar ou quando a entrega fechar

Não pode:

- `apps/web/modules/accounts/**`
- `apps/web/modules/billing/**` — só reusa a regra de localização avançada já publicada
- `apps/web/modules/sos/**`
- `apps/web/modules/location/domain/**` além de `location-request`
- `apps/web/modules/elder-access/**` além do listener novo e da montagem em `elder-home.tsx`
- `apps/web/app/(auth)/**`, `apps/web/app/(marketing)/**` e `apps/web/lib/inngest/**`
- `.env*`, dependência nova, service worker
- `AGENTS.md`, Specs já aprovadas, PRD, `docs/SECURITY.md`, `docs/arquitetura-solucao.md`
- `git push`, merge em `main`
- Aplicar a mudança no banco remoto neste passo

Paths críticos, com review humano do diff: a regra nova em `location/domain`, o listener no aplicativo sem login e o arquivo novo em `supabase/migrations`.

## 10. Testes manuais (rodada posterior)

Não entram no Done desta Spec. Gravar no relatório quando a rodada única de homologação começar. Ambiente: Vercel, celular vinculado de verdade, consentimento vigente e plano com localização avançada.

| Passo | O que observar |
| --- | --- |
| 1 | Com o aplicativo aberto na tela e GPS já permitido, a administradora pede e o mapa mostra horário e precisão, sem tela nova no celular |
| 2 | Com o aplicativo fechado, o card diz que não está aberto e, se a pessoa abrir dentro de 5 minutos, a posição ainda pode chegar |
| 3 | Sem permissão de GPS, o card diz que o celular não conseguiu enviar, e o celular não pede permissão de novo |
| 4 | Um segundo pedido antes de 2 minutos não nasce |
| 5 | A cuidadora vê a posição no mapa e no histórico, sem botão e sem o estado do pedido |
| 6 | Sem localização avançada, sem consentimento ou com a conta pausada, o pedido não nasce |
| 7 | A Casa não fica confirmada e não sai alerta de zona só porque a posição foi pedida |

## 11. Riscos e dúvidas abertas

- Sem o pulso de presença a cada 30 segundos com a aba visível, o painel diria que o aplicativo está fechado mesmo com a tela deixada aberta. Aba em segundo plano para o pulso: isso significa “não está aberto”, não prova que a rede caiu.
- A origem nova da posição não pode ser usada dentro do próprio arquivo de acesso, no mesmo passo em que essa origem passa a existir. O uso começa no aplicativo, depois que a mudança estiver aplicada no banco.
- A posição continua gravada pelo acesso privilegiado do servidor, porque a família autenticada não insere posição. Se a checagem do vínculo falhar aberta, a sessão da família poderia fabricar coordenada. A checagem fechada é critério de Done.
- Sem permissão de GPS já concedida, o estado é “não conseguiu enviar”, mesmo com o aplicativo aberto. Não há tela pedindo essa permissão nesta entrega.
- Repetir o GPS em todo pulso gastaria bateria. A falha da primeira leitura encerra o pedido.
- Exportar a ação do celular junto da constante de localização, no mesmo ponto que o navegador importa, pode quebrar a tela. A ação fica de fora desse ponto.
- A área da administradora precisa acompanhar o pedido aberto sem trocar de página. O ritmo disso não pode virar leitura contínua de GPS.

## 12. Aprovação humana

- Aprovado por:
- Data:
- Observações:

Sem aprovação explícita desta Spec, nenhum código começa.
