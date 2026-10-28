# Spec: F6 — Vínculo do aparelho

- Status: `aguardando_aprovacao`
- Data: 2026-10-28
- Autonomia: `tight`
- Projeto: Zelita (`apps/web`)
- Pedido original: escrever a Spec da F6 no padrão da F5, a partir do plano já existente.
- Plano: [`docs/state/PLANO-ALTA-FIDELIDADE.md`](../docs/state/PLANO-ALTA-FIDELIDADE.md) § F6 · [`docs/plans/2026-09-11-producao-real.md`](../docs/plans/2026-09-11-producao-real.md) § 6.2
- Referência visual: `zelita-prototipo.html`, superfície “Instalar no celular dele”
- Depende de: F5 (prévia `/idoso` já no código)

## 1. Objetivo

A administradora liga o celular da pessoa cuidada à conta, uma vez. O atalho abre `/idoso` sem login, sem senha e sem `auth.users`. A prova de que é o celular certo é o WhatsApp já cadastrado, ou a presença dela com o aparelho.

O link vale 15 minutos, serve uma única vez e se prende ao primeiro navegador que confirmar. A família vê o aparelho em Ajustes e pode desvincular. Desvincular faz o atalho parar na hora.

Nesta fase o atalho lê horários, mostra a lista para ligar e obedece às letras. Pedir ajuda no aparelho vinculado ainda não grava alerta e não diz que a família foi avisada. O insert de SOS e o GPS ficam no fechamento do Gate 2.2.

## 2. Fora de escopo

- Insert de SOS, notificação da ordem e resolução no painel (plano § 6.3, FL-06)
- Confirmar Casa, GPS, mapa, cidade do aparelho e alerta de zona
- Lista de sessões da família (o MacBook dela e o celular da cuidadora do protótipo não entram nesta lista)
- Código de barras / biblioteca de QR (dependência nova). O caminho presencial mostra o link em letra grande
- Service worker, push e cache offline de dado de saúde
- Login, senha, OTP ou `auth.users` para a pessoa cuidada
- Template Meta já aprovado em produção — o código prepara o envio; a aprovação do template na conta Zelita é passo de operação, não desta Spec
- Aviso por e-mail ou WhatsApp para os outros membros quando o vínculo conclui. A confirmação fica no painel
- Mais de um aparelho ativo ao mesmo tempo para a mesma pessoa cuidada
- Mudar regra de domínio de `sos`, `medications`, `accounts` ou `agenda`
- Passkey, audit log completo de “últimos acessos à conta” e cobrança

## 3. Atores e pré-condições

- Quem usa:
  - **Administradora** — gera o link, escolhe o caminho e desvincula
  - **Cuidador** — vê se há aparelho ligado; não gera link e não desvincula
  - **Visualizador e contato de emergência** — não entram neste fluxo
  - **Pessoa cuidada** — abre o link, confirma e passa a abrir `/idoso` naquele navegador
  - **Sistema** — grava só o hash do segredo, envia o template e recusa o que estiver fora da regra
- O que precisa existir antes:
  - Prévia F5 em `/idoso`
  - Pessoa cuidada selecionada na sessão da família
  - WhatsApp da pessoa cuidada gravado em Ajustes, para o caminho remoto
  - Opt-in (`wa_opt_in_at`) para o caminho remoto. Sem opt-in, o caminho presencial continua disponível

## 4. Decisões travadas

1. **Quem manda.** Só `admin` (`canInviteOrChangeRoles`) cria link e desvincula. Cuidador lê a lista. Os outros papéis recebem a página que já nega Ajustes.
2. **Uma pessoa, um aparelho ativo.** O vínculo é da pessoa cuidada já selecionada. Enquanto houver aparelho não revogado, o painel não emite outro link. Perdeu o celular: desvincula e manda um link novo.
3. **Dois caminhos, um token.** “Estou longe” envia o link no WhatsApp cadastrado. “Estou com o celular dele” mostra o mesmo link na tela dela, em letra grande, por 15 minutos. Os dois compartilham expiração, uso único e invalidação do link anterior ainda não usado.
4. **Abrir não prende. Confirmar prende.** `GET /ativar/[token]` mostra a tela de confirmação e não grava aparelho. “Agora não” volta sem consumir o token. “Sim, quero usar” é o que prende este navegador, marca o token como usado e grava o cookie.
5. **Segredo em duas peças.** O token da URL dura 15 minutos e morre no uso. O cookie do aparelho é outro segredo, de vida longa, também guardado só como hash. Nenhum dos dois vai para `localStorage`, Sentry ou log.
6. **WhatsApp só por template.** O caminho remoto usa um template novo de utilidade (nome proposto `zelita_device_link`), no número `care_recipients.whatsapp`. Não reutiliza `zelita_med_reminder` nem `zelita_opt_in`. Sem token da Meta configurado, o ambiente local pode registrar dry-run. Em produção, falha fechada: a administradora vê que a mensagem não saiu e o link presencial continua valendo.
7. **Sem opt-in, sem mensagem.** Caminho remoto exige `wa_opt_in_at`. O texto do painel manda confirmar o WhatsApp em Ajustes. O caminho presencial não envia mensagem.
8. **Sem número, sem caminho remoto.** WhatsApp vazio bloqueia só o envio. O presencial segue.
9. **A porta do `/idoso` passa a ter duas chaves.** Sessão de família com `canViewCareRoutine` continua a prévia, com a faixa âmbar. Cookie de aparelho válido e não revogado abre a mesma leitura sem faixa de prévia e sem sessão Supabase. Sem as duas chaves, a página calma da F5 permanece.
10. **SOS deste aparelho ainda não avisa.** No celular vinculado não existe a frase “Sua família foi avisada”. A confirmação explica que o pedido ainda não é enviado e oferece ligar para a família e o SAMU 192. Nada é gravado em `sos_alerts`. A prévia da família conserva o ensaio da F5, faixa inclusive.
11. **Lista honesta.** Ajustes lista só aparelhos da pessoa cuidada: rótulo grosseiro (iPhone, Android ou computador), data e “Desvincular”. Sem cidade, sem sessão da família, sem aparelho de exemplo.
12. **Conta pausada.** Pode vincular, ler e desvincular. Esta fase não mexe em cobrança nem em lembrete.
13. **Sem dependência nova.** Sem biblioteca de QR, sem leitor de cidade por IP.

## 5. Comportamento esperado (cenários)

### Cenário 1: Administradora abre o fluxo

- Dado: admin, pessoa cuidada selecionada, nenhum aparelho ativo
- Quando: em Ajustes toca Gerenciar
- Então: `/familia/instalar` oferece os dois caminhos, mostra o WhatsApp mascarado dela e lembra que o link vale 15 minutos e serve uma vez

### Cenário 2: Cuidador só olha

- Dado: papel cuidador
- Quando: abre Ajustes ou `/familia/instalar`
- Então: vê o estado (nenhum, ou o aparelho ligado). Não há botão de enviar, de mostrar link nem de desvincular

### Cenário 3: Papel sem Ajustes

- Dado: visualizador ou contato de emergência
- Quando: abre `/familia/instalar`
- Então: não vê token, telefone da pessoa cuidada nem lista. Volta ao destino que o painel já usa para quem não vê Ajustes

### Cenário 4: Sem opt-in ou sem WhatsApp

- Dado: admin, `wa_opt_in_at` vazio ou WhatsApp vazio
- Quando: escolhe “Estou longe”
- Então: o envio não acontece; o texto diz a causa e aponta Ajustes. “Estou com o celular dele” continua disponível

### Cenário 5: Envio remoto

- Dado: admin, WhatsApp preenchido, opt-in feito, template configurado
- Quando: confirma “Enviar o link para ele”
- Então: sai uma mensagem de template para esse número, com o primeiro nome e o link. O link anterior ainda não usado da mesma pessoa deixa de valer. A tela diz que o link foi enviado e até quando vale

### Cenário 6: Produção sem template

- Dado: admin no Vercel, template ausente ou a Meta recusa
- Quando: pede o envio
- Então: nada é dado como enviado. Mensagem com a causa e o caminho presencial. Nenhum texto livre parte da API

### Cenário 7: Caminho presencial

- Dado: admin com o celular dela na mão
- Quando: escolhe “Estou com o celular dele agora”
- Então: a tela mostra a URL em letra grande e o prazo. Não dispara WhatsApp

### Cenário 8: Link inválido

- Dado: token expirado, já usado, trocado ou de outra conta
- Quando: abre `/ativar/[token]`
- Então: página calma, sem remédio, sem telefone, sem nome. Diz que o link não serve mais e que a família pode mandar outro

### Cenário 9: Confirmar neste celular

- Dado: token válido, ainda não usado
- Quando: a pessoa toca “Sim, quero usar”
- Então: este navegador recebe o cookie, o token morre, `/idoso` abre os horários reais sem faixa de prévia e sem sessão de família. A tela seguinte é o guia de três passos para adicionar à tela de início

### Cenário 10: Agora não

- Dado: token válido
- Quando: toca “Agora não”
- Então: não grava aparelho, não cria cookie, o token continua válido até expirar ou até a família gerar outro

### Cenário 11: Segundo aparelho

- Dado: já existe aparelho não revogado
- Quando: a admin tenta gerar outro link, ou alguém confirma um token antigo
- Então: o painel pede para desvincular antes. Token já substituído cai no cenário 8

### Cenário 12: Leitura no aparelho vinculado

- Dado: cookie válido
- Quando: abre `/idoso`, `/idoso/horarios`, `/idoso/familia` e `/idoso/ajustes`
- Então: os mesmos dados e pisos da F5. Sem exame, mapa, plano, campo de texto ou botão de tomada. Letras persistem no cookie de leitura, separado do cookie de vínculo

### Cenário 13: Ajuda no aparelho vinculado

- Dado: cookie válido, início
- Quando: toca “Preciso de ajuda” e confirma
- Então: a tela não diz que a família foi avisada. Explica que o aviso ainda não sai por aqui e oferece `tel:` da família e `tel:192`. Nenhuma linha em `sos_alerts`

### Cenário 14: Prévia da família intacta

- Dado: sessão de família com permissão de ver a rotina, sem usar o cookie do aparelho
- Quando: abre `/idoso`
- Então: a faixa de prévia e o ensaio da F5 continuam iguais

### Cenário 15: Desvincular

- Dado: admin e um aparelho ativo
- Quando: toca Desvincular
- Então: o próximo carregamento daquele navegador cai na página calma, mesmo com o cookie ainda no aparelho. A lista volta a “Nenhum aparelho vinculado”

### Cenário 16: Conta pausada

- Dado: conta pausada, admin
- Quando: vincula ou a pessoa abre `/idoso`
- Então: o vínculo e a leitura funcionam. Lembrete e cobrança não mudam

## 6. Telas e rotas

| Rota | Quem | Conteúdo |
| --- | --- | --- |
| `/familia/instalar` | Admin cria; cuidador só lê | Escolha do caminho, link presencial, estado do aparelho |
| `/familia/ajustes` | Quem já vê Ajustes | A linha “Aparelhos com acesso” deixa de ser stub e aponta para Gerenciar |
| `/ativar/[token]` | Quem tem o link | Confirmação. Sem sessão |
| `/idoso/instalado` | Navegador que acabou de confirmar | Guia “Adicionar à tela de início” e botão para o início |
| `/idoso` e subrotas | Prévia da família ou aparelho vinculado | As quatro telas da F5 |

Copy nova em `content/family.ts` (painel) e `content/elder.ts` (confirmação, guia, página de link morto, ajuda que ainda não avisa).

O guia tem três passos, como no protótipo: compartilhar, Adicionar à Tela de Início, Adicionar. Mais a frase de que, se não conseguir, a família já vê o aparelho no painel e pode ajudar por telefone. Não há detecção obrigatória de iOS ou Android.

## 7. Dados

Duas tabelas, com `account_id` e `care_recipient_id`. Sem coluna de token em claro.

`care_recipient_device_links`

- hash do token da URL, `expires_at` (15 minutos), `used_at`, `created_by`, caminho (`whatsapp` ou `in_person`)
- criar um link preenche `used_at` dos links anteriores ainda abertos da mesma pessoa

`care_recipient_devices`

- hash do segredo do cookie, rótulo grosseiro, `linked_at`, `last_seen_at`, `revoked_at`, `revoked_by`
- no máximo uma linha com `revoked_at` nulo por pessoa cuidada

RLS:

- Membro da conta não lê hash. A interface da família lê uma visão sem segredo (rótulo, datas, revogação).
- Insert do link e do aparelho, e a leitura de horários pelo cookie, passam por Route Handler ou Server Action no servidor. O cookie do idoso não é usuário Supabase: essa leitura usa `service_role` só depois de o caso de uso achar o hash e a linha não revogada, e só para aquele `care_recipient_id`.
- Revogar pode usar o client autenticado da admin, com policy de update limitada à conta dela.
- Anon não seleciona essas tabelas.

Cookie do aparelho: `HttpOnly`, `Secure`, `SameSite=Lax`, path das rotas do idoso. O servidor confere o hash em todo carregamento. `last_seen_at` atualiza sem gravar IP.

Rótulo: recorte simples do User-Agent em iPhone, Android ou computador. Sem biblioteca e sem cidade.

## 8. Regras de negócio

- Fuso dos prazos e da data no painel: `America/Sao_Paulo`.
- Token: 32 bytes, encoding URL-safe. Persistência e comparação pelo hash SHA-256, em tempo constante.
- Vida do link: 15 minutos a partir da criação. Um uso. Substituição invalida o anterior.
- Limite: no máximo 5 links criados por pessoa cuidada a cada hora. O sexto explica que é preciso esperar.
- O cookie de leitura (letra, contraste, som) não autentica. O cookie de vínculo não guarda tamanho de letra.
- Discagem, rótulos de horário e pisos de toque continuam os da F5.
- “Já avisamos” no horário continua sem significar tomada.
- Desvincular é imediato no servidor. Não depende de o celular estar online.

## 9. Segurança (`docs/SECURITY.md`)

- Sem `auth.users` para a pessoa cuidada.
- O cookie da família não é aceito como aparelho do idoso. A prévia segue sessão; o atalho segue o hash do device.
- Autorização no servidor em criar, confirmar, ler e revogar. `careRecipientId` vem da sessão da admin ou do aparelho já vinculado, nunca do corpo livre.
- Token, hash, telefone completo e nome de remédio não vão para Sentry. Eventos: `elder_link_created`, `elder_link_sent`, `elder_link_rejected`, `elder_device_bound`, `elder_device_revoked`, com id da conta, id da pessoa e o caminho.
- WhatsApp: template tipado; opt-in antes do caminho remoto; sem texto livre.
- `service_role` só no handler que confirma o aparelho e no handler que lê a rotina para um cookie válido. A prévia da família continua no client autenticado.
- RLS nova nas duas tabelas, como na seção 7. Nenhuma policy abre dado de outra conta.
- Rate limit dos 5 links por hora mora no caso de uso, não só na UI.

## 10. Critérios de Done

- [ ] Cenários 1–16 cobertos: regras puras (expiração, uso único, um aparelho ativo, papel, opt-in, hash) em Vitest ≥ 80% nesses módulos
- [ ] `pnpm typecheck`, `pnpm lint` e `pnpm test` verdes
- [ ] Checklist aplicável de `docs/SECURITY.md`, com N/A explícito no implementation
- [ ] Migration e policies aplicadas só depois desta Spec aprovada
- [ ] Nenhuma mudança fora da seção 11
- [ ] `docs/state/` atualizado e entrega em `docs/implementation/2026-10-28-f6-vinculo-aparelho.md`
- [ ] Homologação dos casos da seção 12 fica na rodada final no Vercel, junto com o FL-05. Não corre no meio da implementação

## 11. Escopo de arquivos permitido

- Pode editar, depois da aprovação:
  - `apps/web/app/(elder)/**` e a rota nova `apps/web/app/(elder)/ativar/`
  - `apps/web/app/(family)/**` só na entrada de Ajustes e na página `/familia/instalar`
  - `apps/web/modules/elder-access/**`
  - `apps/web/content/elder.ts` e `apps/web/content/family.ts`
  - `apps/web/modules/reminders/infrastructure/whatsapp-port.ts` — um kind novo de template, sem mudar o lembrete
  - `supabase/migrations/**` e `supabase/policies/**` — as duas tabelas e a visão sem segredo
  - `docs/state/**`, `docs/implementation/**`
- Com review tight:
  - leitura do WhatsApp e de `wa_opt_in_at` pela API pública de `care-recipients`, se ainda não existir função de leitura para este caso
  - nenhuma linha nova de regra em `accounts/domain/**`, salvo uma função pura `canManageElderDevice` ao lado das permissões já existentes, se a Spec aprovada preferir a matriz no módulo `accounts`
- Não pode:
  - `apps/web/modules/sos/**` (o botão no aparelho só muda copy em `elder-access`)
  - `apps/web/modules/billing/**`, `location/**`
  - `AGENTS.md`, Specs já aprovadas, PRD, `docs/SECURITY.md`, `docs/arquitetura-solucao.md`
  - `.env*`, service worker, dependência nova
  - `git push`, merge em `main`

## 12. Testes manuais (rodada final)

Gravar no relatório quando a implementação existir e a rodada única de homologação começar. Ambiente: Vercel.

| Código | O que observar |
| --- | --- |
| TC-FL05-08 | Admin envia o link; cuidador não vê o botão |
| TC-FL05-09 | Sem opt-in, o WhatsApp não sai e o presencial aparece |
| TC-FL05-10 | Link expirado ou repetido não mostra remédio nem telefone |
| TC-FL05-11 | “Sim, quero usar” abre `/idoso` sem login e sem faixa de prévia |
| TC-FL05-12 | Confirmar a ajuda no aparelho não cria `sos_alerts` e não diz que a família foi avisada |
| TC-FL05-13 | Desvincular derruba o atalho no carregamento seguinte |
| TC-FL05-14 | A prévia da família, com sessão, continua com a faixa |

## 13. Riscos

- Tratar o `GET` como vínculo prende o aparelho de quem só espiou o link. A prisão é no botão “Sim, quero usar”.
- Guardar o token em claro, ou devolvê-lo na lista da família, entrega o atalho a quem não está com o celular. A lista não tem segredo.
- Reusar a sessão da família como se fosse o idoso mistura as duas portas. O cookie de device é outra credencial.
- Dizer “Sua família foi avisada” no celular real mente enquanto o SOS não grava. Essa frase fica só na prévia, com a faixa.
- Enviar texto livre no WhatsApp quebra a regra da Meta e o Gate 2.1. Sem template aprovado, o remoto falha fechado.
- `service_role` lendo além da pessoa do cookie vaza outra família. A query nasce do hash encontrado, não de um id vindo do browser.

## 14. Próximo depois do Done

Spec do fechamento do Gate 2.2: SOS real a partir do aparelho vinculado (insert, ordem, ignora DND, painel) e Confirmar Casa. Aí a tela do cenário 13 passa a gravar e a frase de “avisada” volta a ser verdadeira. A homologação manual dessa fase entra na mesma rodada final, não antes.
