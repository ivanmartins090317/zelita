# Spec: SOS real e Confirmar Casa

- Status: `draft`
- Data: 2026-11-05
- Autonomia: `tight` (emergência, aparelho sem login, coordenada e aviso que ignora “não incomodar”)
- Projeto: Zelita (`apps/web`)
- Pedido original: plano aprovado em 2026-11-05. Escrever a Spec e parar até aprovação humana. Sem código nesta etapa.
- Plano: [`docs/plans/2026-11-05-sos-real-confirmar-casa.md`](../docs/plans/2026-11-05-sos-real-confirmar-casa.md)
- Depende de: F5 (prévia `/idoso`), F6 (aparelho vinculado), Pedidos de ajuda e Onde ele está já no painel

## 1. Objetivo

No celular vinculado, “Sim, preciso de ajuda” registra o pedido. A família vê esse pedido em Pedidos de ajuda, e cada pessoa da ordem salva recebe o aviso por e-mail ao mesmo tempo. A prévia da família, sem aparelho, continua um ensaio: confirmar não registra nada.

“Estou em casa agora”, no mesmo celular, pede permissão e, se o aparelho devolver a posição, confirma a Casa. Vale em qualquer plano, inclusive trial. O aviso de que a pessoa saiu da Casa só existe no Cuidado+, com a Casa já confirmada e “avisar ao sair” ligado. Abrir o aplicativo não fica vigiando a posição.

## 2. Fora de escopo

- WhatsApp de SOS e o template `zelita_sos`
- Ligação, voz e push
- Espera de 2 minutos entre uma pessoa e outra da ordem
- Leitura contínua de GPS, ping periódico e agenda de posição
- Mudança de schema, policy nova ou coluna nova
- Simular SOS pelo painel da família
- Redesenhar Pedidos de ajuda, Onde ele está ou Avisos — só passam a mostrar o que esta entrega gravar, onde já leem pedido, posição e saída
- Revogar o consentimento de localização por uma tela nova
- Homologação FL-05 / FL-06 no Vercel (rodada única, depois do código; não bloqueia o Done desta Spec)
- Gate 3: e-mail de convite, tour, pagamento, domínio, passkey
- Aprovar o template de vínculo do aparelho (operação, em paralelo)
- Trocar a copy da ordem que ainda diz “se ninguém responder em 2 min” — o aviso desta entrega não espera; a tela de configurar a ordem fica como está

## 3. Atores e pré-condições

- Quem usa:
  - **Pessoa cuidada no aparelho vinculado** — confirma a ajuda e confirma a Casa. Sem login.
  - **Familiar na prévia** — ensaia o botão. Não registra pedido, Casa nem posição.
  - **Administradora e quem já vê Pedidos de ajuda** — vê o pedido, a posição quando existir e se o e-mail saiu ou falhou.
  - **Pessoas da ordem salva** — recebem o e-mail do pedido, juntas.
  - **Administradora e cuidadora** — recebem o e-mail de saída da Casa, só no Cuidado+.
- O que precisa existir antes:
  - Aparelho vinculado e não desligado, para gravar
  - Ordem de aviso já salva em Pedidos de ajuda, para haver destinatário
  - Casa criada no cadastro (endereço basta; a posição ainda pode estar pendente)
  - E-mail transacional já usado pela Zelita (o mesmo caminho do código de entrada)
  - Plano Cuidado+ de verdade para o aviso de saída. Trial não vira Cuidado+.

## 4. Decisões travadas

1. **Aviso junto.** Toda a ordem salva é avisada ao mesmo tempo. Ninguém espera 2 minutos.
2. **Ajuda ignora silêncio.** “Não incomodar” não segura o pedido nem o e-mail. Conta pausada também registra e avisa: é ajuda, não lembrete.
3. **Canal desta entrega.** A linha em Pedidos de ajuda e o e-mail. Sem WhatsApp, sem ligação, sem texto livre.
4. **Posição no pedido é extra.** Só tenta o GPS se a pessoa já autorizou a localização. A espera é curta, no máximo 8 segundos. GPS lento, negado ou ausente não cancela o pedido.
5. **Casa é um toque.** Uma leitura em primeiro plano, no gesto “Sim”. Sem vigiar o GPS e sem agenda de posição.
6. **O pedido e a posição são coisas separadas.** O pedido não carrega a coordenada dentro dele. A posição do pedido, quando existir, é a leitura feita na mesma confirmação. Pedidos de ajuda usa essa leitura. Sem leitura, a tela continua “localização indisponível” e o pedido permanece.
7. **Casa em qualquer plano.** Confirmar Casa vale no Essencial, no trial e no Cuidado+. O aviso de saída só com localização avançada (Cuidado+). Trial não promove o plano.
8. **Toque duplo.** Pedido aberto da mesma pessoa nos últimos 2 minutos não cria outro e não reenvia e-mail. Pedido já resolvido não bloqueia um pedido novo.
9. **Quem recebe a saída.** E-mail, ao mesmo tempo, para administradora e cuidadora com e-mail na conta. Visualizador e contato de emergência não entram. A ordem do SOS não é reaproveitada para a zona. Sem e-mail nesses papéis, a saída fica só registrada.
10. **E-mail sem coordenada.** O e-mail diz quem pediu ajuda, o horário e que o detalhe está em Pedidos de ajuda. A saída diz que a pessoa saiu da Casa e que o detalhe está em Onde ele está. A coordenada fica no painel.
11. **Frase verdadeira só no aparelho.** No celular vinculado, a tela passa a dizer que a família foi avisada, com o aviso do SAMU 192. Na prévia, a faixa âmbar e o ensaio continuam; confirmar não grava.

## 5. Comportamento esperado (cenários)

Linguagem de domínio: o que a pessoa vê e o que fica registrado. Sem desenho de rota interna, tabela ou classe.

### Pedir ajuda

#### Cenário 1: Celular vinculado confirma a ajuda (caminho feliz)

- Dado: aparelho vinculado e ativo; ordem salva com ao menos uma pessoa que tem e-mail; nenhum pedido aberto nos últimos 2 minutos
- Quando: a pessoa toca “Preciso de ajuda” e depois “Sim, preciso de ajuda”
- Então: o pedido fica aberto em Pedidos de ajuda; cada pessoa da ordem recebe o e-mail ao mesmo tempo; cada tentativa fica registrada como enviada ou como falha; a tela dele diz que a família foi avisada e lembra o SAMU 192 e os Bombeiros 193
- E: a Zelita não liga para o SAMU nem para os Bombeiros

#### Cenário 2: Cancelar na confirmação (caminho feliz)

- Dado: aparelho vinculado, tela “Você precisa de ajuda agora?”
- Quando: toca “Cancelar”
- Então: volta ao início; nenhum pedido; nenhum e-mail

#### Cenário 3: Prévia da família não grava (borda)

- Dado: familiar autenticada na prévia, sem aparelho vinculado naquela abertura
- Quando: confirma a ajuda
- Então: nada é registrado; nenhum e-mail; a faixa de prévia continua; a copy segue a de ensaio, sem prometer aviso real

#### Cenário 4: Sem aparelho, aparelho desligado ou sessão da família no lugar do celular (erro)

- Dado: porta fechada, aparelho revogado, ou só a sessão da família
- Quando: algo tenta registrar o pedido como se fosse o celular dele
- Então: o pedido não nasce; a família não é avisada

#### Cenário 5: Segundo toque com pedido aberto (borda)

- Dado: pedido aberto da mesma pessoa há menos de 2 minutos
- Quando: confirma de novo no aparelho
- Então: não nasce outro pedido; o e-mail não sai de novo; a tela continua calma, com o aviso do SAMU
- E: se o pedido aberto tiver mais de 2 minutos, um pedido novo é registrado e a ordem é avisada de novo
- E: se o pedido anterior já foi marcado como resolvido, um pedido novo pode nascer mesmo dentro dos 2 minutos

#### Cenário 6: GPS falha ou a pessoa ainda não autorizou (borda)

- Dado: aparelho vinculado confirma a ajuda
- Quando: não há autorização de localização, ou o aparelho não responde em até 8 segundos, ou a permissão falha
- Então: o pedido fica registrado mesmo assim; Pedidos de ajuda mostra localização indisponível; a tela dele não trata isso como erro do pedido

#### Cenário 7: Posição do pedido aparece no painel (caminho feliz)

- Dado: autorização de localização já vigente; o aparelho devolve a posição dentro dos 8 segundos
- Quando: a ajuda é confirmada
- Então: Pedidos de ajuda mostra essa posição no pedido; “Ver no mapa” usa essa posição
- E: a confirmação da ajuda não abre um pedido novo de permissão. Sem autorização prévia, vale o cenário 6

#### Cenário 8: Conta pausada e horário de silêncio (borda)

- Dado: conta pausada, ou o horário cai em “não incomodar”
- Quando: o aparelho confirma a ajuda
- Então: o pedido é registrado e a ordem recebe o e-mail do mesmo jeito. Silêncio e pausa valem para lembrete, não para ajuda

#### Cenário 9: Ordem vazia ou e-mail que não sai (erro)

- Dado: aparelho confirma a ajuda
- Quando: a ordem não tem ninguém, ou a pessoa da ordem não tem e-mail, ou o envio falha
- Então: o pedido permanece em Pedidos de ajuda; cada pessoa da ordem fica com a tentativa registrada como não enviada, com a causa; a tela dele ainda diz que a família foi avisada, porque o pedido está no painel
- E: ninguém é avisado por WhatsApp nem por ligação para “compensar” a falha

### Confirmar Casa

#### Cenário 10: Está em casa e o GPS responde (caminho feliz)

- Dado: aparelho vinculado; Casa ainda sem posição confirmada, ou com posição antiga; qualquer plano, inclusive trial
- Quando: no início toca “Estou em casa”, abre a pergunta “Você está em casa agora?” e confirma
- Então: o aparelho pede permissão; se devolver a posição, a autorização de localização fica vigente, a Casa passa a ter posição confirmada e essa leitura fica guardada como confirmação da Casa
- E: texto ≥17px e alvo ≥56px; uma decisão na tela

#### Cenário 11: Permissão negada ou GPS falho (erro)

- Dado: aparelho vinculado na pergunta da Casa
- Quando: a pessoa nega a permissão, ou o aparelho não devolve posição
- Então: a Casa continua sem posição confirmada; a autorização não é marcada como dada; a tela explica que pode tentar de novo e que, sem isso, a família não recebe aviso de saída

#### Cenário 12: Prévia não confirma Casa (borda)

- Dado: familiar na prévia
- Quando: olha o início
- Então: o alvo “Estou em casa” não aparece. A prévia não grava Casa nem autorização

### Saída da Casa

#### Cenário 13: Saiu da Casa no Cuidado+ (caminho feliz)

- Dado: plano Cuidado+; Casa com posição confirmada; “avisar ao sair” ligado; autorização vigente; a leitura anterior estava dentro do raio; não há saída em aberto desde a última volta
- Quando: a pessoa abre o aplicativo e a leitura nova cai fora do raio
- Então: fica registrada uma saída; administradora e cuidadora com e-mail recebem um e-mail, juntas; o histórico que já mostra saída passa a incluir essa
- E: a mesma abertura não dispara uma segunda saída

#### Cenário 14: Não repete até voltar (borda)

- Dado: já existe uma saída em aberto
- Quando: abre o aplicativo de novo e continua fora
- Então: não nasce outra saída e não sai outro e-mail
- E: uma leitura nova dentro do raio registra a volta, sem e-mail; a saída seguinte, depois dessa volta, pode avisar de novo

#### Cenário 15: Saída não dispara (borda)

- Dado: uma destas condições — plano Essencial ou trial; Casa sem posição confirmada; “avisar ao sair” desligado; autorização revogada ou ausente; não há leitura anterior dentro do raio
- Quando: abre o aplicativo, ou confirma uma ajuda
- Então: nenhum aviso de saída e nenhum e-mail de zona
- E: no Essencial e no trial, Confirmar Casa continua disponível
- E: se o GPS da abertura falhar, o início abre do mesmo jeito e a ajuda do cenário 1 não quebra

#### Cenário 16: Leitura na ajuda também pode notar a saída (borda)

- Dado: as condições do cenário 13; a confirmação da ajuda devolve uma posição fora do raio, com a anterior dentro
- Quando: o pedido é registrado
- Então: além do pedido, vale a mesma regra de uma saída só. A falha dessa leitura não desfaz o pedido

## 6. Regras de negócio

- Fuso dos horários mostrados à família: `America/Sao_Paulo`.
- Ajuda em duas etapas. Cancelar não registra.
- Só o aparelho vinculado e ativo registra pedido, Casa, posição e saída. A prévia não registra.
- Janela de repetição: 2 minutos, só com pedido ainda aberto, da mesma pessoa.
- O aviso do pedido percorre a ordem já salva, inteira, no mesmo momento. A espera descrita na tela de ordem não é executada.
- Cada pessoa da ordem gera uma tentativa, com resultado real: enviada ou não enviada. Sem e-mail, a tentativa fica não enviada.
- “Não incomodar” e conta pausada não bloqueiam o pedido nem o e-mail da ajuda.
- Lembrete enviado continua sem significar remédio tomado. Esta entrega não mexe em lembrete.
- Confirmar Casa grava autorização e posição só quando o aparelho devolve uma coordenada válida. Negar ou falhar não grava nada.
- A posição do pedido só é tentada se a autorização já estiver vigente.
- Espera de GPS: no máximo 8 segundos. Estourar o tempo segue sem posição.
- Saída: plano com localização avançada, Casa confirmada, “avisar ao sair” ligado, autorização vigente, leitura anterior dentro do raio e leitura nova fora, sem saída em aberto desde a última volta.
- Volta: leitura nova dentro do raio depois de uma saída em aberto. Fica registrada e não gera e-mail.
- Abrir o aplicativo só tenta GPS quando as condições da saída estão maduras, menos a comparação dos dois pontos. Sem essas condições, a abertura não pede GPS.
- Reusar as regras já existentes de Casa confirmada, ponto dentro do raio e autorização vigente. Não reescrever essas regras.
- Trial não liga localização avançada.
- Nome, telefone e coordenada não entram em log de erro. No erro, só o identificador do pedido ou da pessoa e o tipo do acontecimento.

## 7. Segurança (`docs/SECURITY.md`)

- A pessoa cuidada não é usuária com login. O aparelho continua sendo o vínculo já revogável da F6.
- A sessão da família não serve como aparelho. A prévia lê e ensaia; não grava pedido, Casa nem posição.
- Quem pode gravar é decidido no servidor, a partir do aparelho ativo. Identificador livre vindo da tela não escolhe outra família.
- A escrita do pedido, da posição, da Casa e da saída usa acesso privilegiado do servidor, porque a família autenticada não insere esses registros. Esse acesso só corre depois de o vínculo válido ser encontrado, e só para aquela pessoa. Não fica em código que o navegador execute.
- O job que envia o e-mail lê a ordem já salva. Não consulta “não incomodar”. Não reenvia um pedido que a janela de 2 minutos já segurou.
- Entrada da confirmação validada no servidor antes de gravar.
- E-mail sem coordenada, sem telefone completo e sem texto livre. WhatsApp de SOS não é chamado.
- Log de erro: identificadores e tipo do acontecimento (`sos_requested`, `sos_notify_failed`, `home_confirmed`, `zone_exit`). Sem nome, telefone, coordenada ou segredo do aparelho.
- Sem policy nova. Quem não participa da conta continua sem ver o pedido.
- Itens do checklist que esta entrega não toca, para o relatório marcar N/A: webhook novo, upload de exame, header de segurança, dependência nova, opt-in de lembrete recorrente.

## 8. Critérios de Done

- [ ] Cenários 5, 13, 14 e 15 cobertos por regra pura em Vitest: janela de 2 minutos do pedido aberto; saída só na transição de dentro para fora; sem segunda saída até a volta; sem saída quando falta plano, Casa, “avisar ao sair” ou autorização. Cobertura ≥ 80% nessas regras
- [ ] `pnpm typecheck`, `pnpm lint` e `pnpm test` verdes
- [ ] Checklist aplicável de `docs/SECURITY.md`, com N/A explícito no relatório da entrega
- [ ] Nenhuma mudança fora da seção 9
- [ ] `docs/state/` atualizado e entrega em `docs/implementation/2026-11-05-sos-real-confirmar-casa.md`
- [ ] Homologação FL-05 / FL-06 fica para a rodada única posterior. Não bloqueia este Done

## 9. Escopo de arquivos permitido

Pode criar, depois da aprovação:

- `apps/web/modules/sos/domain/sos-repeat.ts` e `sos-repeat.test.ts` — janela de 2 minutos
- `apps/web/modules/sos/application/trigger-elder-sos.ts` — só aparelho ativo registra e pede o aviso
- `apps/web/lib/inngest/notify-sos.ts` — e-mail da ordem, com tentativa real
- `apps/web/modules/location/domain/zone-transition.ts` e `zone-transition.test.ts`
- `apps/web/modules/location/application/confirm-home-from-device.ts`
- `apps/web/modules/location/application/record-foreground-position.ts` — leitura ao abrir, sem laço
- `apps/web/modules/elder-access/presentation/elder-confirm-home.tsx`
- `apps/web/app/(elder)/idoso/casa/page.tsx`

Pode alterar, depois da aprovação:

- `apps/web/modules/elder-access/presentation/elder-home.tsx` — confirmar ajuda só grava com aparelho; alvo “Estou em casa” só no aparelho
- `apps/web/modules/elder-access/domain/elder-schedule.ts` e o teste ao lado — o ensaio da prévia continua sem gravar
- `apps/web/modules/elder-access/domain/device-link.ts` e o teste ao lado — só a regra da frase “família avisada”, que hoje vale na prévia e passa a valer no aparelho
- `apps/web/content/elder.ts` — copy do SOS vinculado e da Casa
- `apps/web/modules/sos/infrastructure/sos-alert-repo.ts` — registrar o pedido pelo servidor
- `apps/web/modules/sos/infrastructure/sos-notification-repo.ts` — registrar a tentativa
- `apps/web/modules/sos/application/get-pedidos-de-ajuda-page.ts` — usar a posição do pedido quando existir
- `apps/web/modules/location/infrastructure/location-point-repo.ts`
- `apps/web/modules/location/infrastructure/geofence-event-repo.ts`
- `apps/web/modules/location/infrastructure/safe-place-repo.ts` — confirmar a posição da Casa pelo servidor
- `apps/web/lib/inngest/functions.ts` — registrar o aviso do pedido
- `apps/web/modules/sos/index.ts` e `apps/web/modules/location/index.ts` — só o que a tela do idoso precisa
- `docs/state/**` e `docs/implementation/**` — no Done

Não pode:

- `supabase/migrations/**`, `supabase/policies/**`
- `apps/web/modules/accounts/**`, `apps/web/modules/billing/**` (só reusa a regra de localização avançada já publicada)
- `apps/web/modules/sos/domain/**` além de `sos-repeat`
- `apps/web/modules/location/domain/**` além de `zone-transition` (as regras de Casa, raio e autorização são reusadas, não reescritas)
- `.env*`, dependência nova, service worker
- `AGENTS.md`, Specs já aprovadas, PRD, `docs/SECURITY.md`, `docs/arquitetura-solucao.md`
- `git push`, merge em `main`

## 10. Testes manuais (rodada posterior)

Não entram no Done desta Spec. Gravar no relatório quando a rodada única de homologação começar. Ambiente: Vercel, celular vinculado de verdade e, para a saída, conta Cuidado+.

| Código | O que observar |
| --- | --- |
| TC-FL06-01 | No aparelho, “Sim, preciso de ajuda” aparece em Pedidos de ajuda |
| TC-FL06-02 | A ordem recebe e-mail junto; a tentativa mostra enviada ou falha |
| TC-FL06-03 | Cancelar não cria pedido |
| TC-FL06-04 | A prévia confirma e não cria pedido; a faixa continua |
| TC-FL06-05 | Segundo toque em menos de 2 minutos não duplica pedido nem e-mail |
| TC-FL06-06 | Sem GPS, o pedido fica e a localização aparece indisponível |
| TC-FL06-07 | “Estou em casa” no aparelho confirma a Casa; negar permissão não confirma |
| TC-FL06-08 | No trial ou Essencial, a Casa confirma e não sai e-mail de zona |
| TC-FL06-09 | No Cuidado+, com “avisar ao sair”, uma saída gera um e-mail e a seguinte só depois da volta |
| TC-FL06-10 | A tela do aparelho diz que a família foi avisada e mostra o SAMU 192; o botão de ajuda segue maior que 100px |

## 11. Riscos e dúvidas abertas

- Acesso privilegiado do servidor escreve pedido e posição. Se a checagem do aparelho falhar aberta, a prévia grava ajuda de verdade. A checagem é critério de Done.
- O pedido não guarda a coordenada. Se a leitura não entrar, “Ver no mapa” continua sem posição e o pedido segue válido.
- Safari e Chrome pedem um gesto para o GPS. A Casa nasce do toque. A leitura ao abrir pode falhar em silêncio e não pode derrubar o início nem a ajuda.
- O e-mail de entrada já cai no spam. O aviso de ajuda usa o mesmo caminho. O painel é o canal que não depende da caixa de entrada.
- A conta de piloto nasce Essencial. Dá para confirmar a Casa. O e-mail de saída exige Cuidado+ de verdade.
- A tela da ordem ainda fala em espera de 2 minutos. Esta entrega avisa todo mundo junto e não muda essa tela. Se a copy precisar acompanhar o comportamento, fica para uma Spec seguinte.
- O e-mail de saída vai para administradora e cuidadora, não para a ordem do SOS. Se a ordem for a lista certa, esta Spec muda antes do código.

## 12. Aprovação humana

- Aprovado por:
- Data:
- Observações:

Sem aprovação explícita desta Spec, nenhum código começa.
