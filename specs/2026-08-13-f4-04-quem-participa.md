# Spec: F4.4 — Quem participa

- Status: `approved`
- Data: 2026-08-13
- Autonomia: `tight` (paths críticos: `accounts`, domínio de papéis, schema de convites + RLS)
- Projeto: Zelita (`apps/web`)
- Pedido original: Plano aprovado em `docs/F4/plan.md` (subfase F4.4). Entregar a área **Quem participa** em alta fidelidade ao protótipo (`#v-pessoas`, modal `m-convite`, linhas ~1423–1451 e ~2519–2532): lista de quem cuida, matriz do que cada papel pode fazer, convite com os quatro papéis, reenvio e aceite de convite com validade de 7 dias.

## 1. Objetivo

Quem administra a conta abre **Quem participa** e vê, no layout do shell F4.1, quem já faz parte do cuidado da pessoa cuidada — com nome, contato, papel e situação (ativa ou convite pendente) — além de uma **matriz de permissões** fiel ao protótipo, explicando o que cada papel pode e não pode fazer.

A administradora pode **convidar** irmãos, cuidadores, visualizadores e contatos de emergência pela modal **Convidar pessoa**, escolhendo o papel e informando como chamar a pessoa e o e-mail ou WhatsApp. Convites válidos por **7 dias** geram um link de aceite; quem recebe entra na conta com o papel escolhido após confirmar identidade (mesmo fluxo de entrar por e-mail). Convites pendentes podem ser **reenviados**, renovando prazo e link.

Quem **não** administra vê a lista e a matriz em leitura, **sem** botões de convidar ou reenviar. Nenhum dado inventado: a lista reflete membros ativos e convites pendentes reais; contatos de emergência só com telefone aparecem como ativos para SOS **sem** exigir login no painel.

## 2. Fora de escopo

- **Shell do painel** — sidebar, topbar, trial bar (F4.1)
- **Alterar papéis** de quem já está ativo, **remover** ou **revogar** participante — botões de edição/exclusão; fase futura se aprovada
- **Trocar e-mail** de participante ou fluxo “perdi acesso ao e-mail” — copy de ajuda no Entrar já menciona; implementação em fase futura
- **Limite de participantes por plano** — exibir contagem honesta se existir dado; **sem** bloqueio por plano nesta subfase
- **Persistir convites** digitados no passo 7 do cadastro (F3) — lista local da sessão de cadastro **não** é importada retroativamente
- **Jobs Inngest** de `invite.expiring` / lembrete automático antes de expirar — reenvio manual basta no MVP
- **Envio automático por WhatsApp Business** — quando o contato for telefone/WhatsApp, MVP entrega **link copiável** para a admin compartilhar manualmente; adapter WA fica para fase de canais
- **Notificação por e-mail transacional** completa (template HTML, domínio verificado) — MVP mínimo: gerar link + confirmação na tela; envio automático por e-mail **se** infraestrutura já existir no projeto, senão **Copiar link** com copy honesta (mesma regra do telefone)
- **Multi recipient por conta** — uma pessoa cuidada por conta (F4.1)
- **Integração profunda em Hoje** — checklist da F4.2 já conta membros **ativos**; **não** reescrever widgets de Hoje nesta Spec (salvo revalidação de `/familia` após aceite)
- **Atividade recente** com eventos de convite — omitir até F4.9 ou subfase que agregar avisos
- **Badge numérico** na sidebar para Quem participa — omitir (sem contador urgente)
- **Escalonamento SOS** com lista de contatos — F4.7 consome os registros; aqui só cadastro/listagem
- **Gateway de pagamento**, PWA idoso, Playwright, nova dependência npm
- **Alterar matriz de autorização** já usada em RLS — UI espelha PRD/protótipo; funções `can*` existentes permanecem; **sem** ampliar privilégios além do PRD

## 3. Atores e pré-condições

- Quem usa:
  - **Administradora** — lista, matriz, convidar, reenviar convite pendente, copiar link de aceite quando envio automático não estiver disponível.
  - **Cuidadora, visualizadora, contato de emergência com acesso ao painel** — lista e matriz em leitura.
  - **Convidada** (pessoa com link válido) — aceita convite após entrar ou criar perfil com o mesmo e-mail convidado.
- O que precisa existir antes:
  - **F0** — tokens, `Card`, `Tag`, `ListRow`, `EmptyState`, `Button`, `Modal` (F4.1).
  - **F2** — sessão OTP, contexto de conta, cookie de conta preferida.
  - **F3** — conta + pessoa cuidada + administradora bootstrap.
  - **F4.1** — layout, rota `/familia/participantes` placeholder substituída.
  - **F4.2** — heurística de checklist (tarefa “convide alguém” usa contagem de membros ativos).
  - Domínio de papéis (`admin`, `cuidador`, `visualizador`, `contato de emergência`) e funções `canInviteOrChangeRoles` já existentes.
  - Protótipo: `#v-pessoas` (~1423–1451), `m-convite` (~2519–2532); PRD §6 matriz de permissões; FAQ Entrar sobre convite expirado (7 dias).

## 4. Comportamento esperado (cenários)

Linguagem de domínio: o que a pessoa vê e faz — não como o sistema organiza arquivos.

### Estrutura geral da área

#### Cenário 1: Quem participa carrega dentro do shell (caminho feliz)

- Dado: familiar autenticada com conta completa
- Quando: abre `/familia/participantes`
- Então: vê topbar F4.1 (“Quem participa” / subtítulo do protótipo) + miolo da área — **sem** placeholder “em breve”

#### Cenário 2: Conta só com a administradora (empty state parcial)

- Dado: única membro **ativa** é quem administra
- Quando: abre Quem participa
- Então:
  - Card **Quem participa do cuidado de {apelido}** lista ao menos a linha da administradora (iniciais, nome, contato, etiqueta de papel, **Ativa**)
  - Botão **+ Convidar pessoa** visível para admin
  - Matriz **O que cada papel pode fazer** renderizada abaixo — **sem** linhas demo extras

#### Cenário 3: Lista com membros e convites (caminho feliz)

- Dado: conta com administradora ativa, um convite pendente e ao menos um membro ativo além dela (ou contato de emergência telefônico ativo)
- Quando: abre Quem participa
- Então: cada linha mostra:
  - Iniciais no avatar
  - Nome · relação ou papel descritivo (ex.: “filha”, “cuidadora”) quando informado
  - Linha secundária com e-mail e/ou telefone
  - Etiqueta de **papel** (Administrador/a, Cuidador/a, Visualizador/a, Contato de emergência)
  - Etiqueta de **situação**: **Ativa** ou **Convite pendente**
  - Botão **Reenviar** **somente** em convites pendentes (admin)

#### Cenário 4: Matriz de permissões (caminho feliz)

- Dado: área aberta
- Quando: rola até **O que cada papel pode fazer**
- Então: tabela com as onze permissões do protótipo/PRD §6, quatro colunas de papel e legenda “● permitido · ◐ depende de autorização por item · — sem acesso”
- E: células **◐** nas linhas “Ver exames”, “Receber alerta de SOS” e “Ver localização” conforme PRD — **sem** prometer funcionalidade ainda não entregue (exames F4.6, SOS F4.7, geo F4.8)

#### Cenário 5: Leitura para não-admin (caminho feliz)

- Dado: cuidadora ou visualizadora autenticada
- Quando: abre Quem participa
- Então: vê lista e matriz — **sem** **+ Convidar pessoa** e **sem** **Reenviar**

### Modal Convidar pessoa

#### Cenário 6: Abrir modal (caminho feliz)

- Dado: administradora em Quem participa
- Quando: toca **+ Convidar pessoa**
- Então: modal **Convidar pessoa** com campos **Nome**, **E-mail ou WhatsApp**, seleção de **Papel** (quatro opções com descrição do protótipo) e ações **Cancelar** / **Enviar convite**

#### Cenário 7: Enviar convite por e-mail (caminho feliz)

- Dado: modal aberta; nome preenchido; contato é e-mail válido; papel escolhido (ex.: Cuidador)
- Quando: toca **Enviar convite**
- Então:
  - Modal fecha; lista ganha linha **Convite pendente** com nome, e-mail, papel e **Reenviar**
  - Mensagem de confirmação informa que o convite vale **7 dias**
  - Se envio automático por e-mail estiver disponível: copy indica que o link foi enviado; senão: copy honesta + opção **Copiar link** para compartilhar manualmente

#### Cenário 8: Enviar convite por telefone/WhatsApp (caminho feliz)

- Dado: contato é telefone celular válido (com DDD)
- Quando: envia convite
- Então: convite **pendente** na lista; confirmação com **Copiar link** — **sem** prometer envio automático por WhatsApp nesta subfase

#### Cenário 9: Contato de emergência só telefone (caminho feliz — regra PRD)

- Dado: papel **Contato de emergência**; contato é **somente** telefone (sem e-mail)
- Quando: envia convite
- Então: pessoa entra na lista como **Ativa** para fins de SOS — **sem** convite pendente e **sem** exigir aceite/login no painel
- E: copy discreta na linha ou nota explicando que essa pessoa será avisada em emergências (escalonamento completo na F4.7)

#### Cenário 10: Contato de emergência com e-mail (caminho feliz)

- Dado: papel **Contato de emergência**; contato inclui e-mail válido
- Quando: envia convite
- Então: segue fluxo normal de convite pendente + aceite (acesso limitado conforme matriz após aceitar)

#### Cenário 11: Validação de contato inválido (erro)

- Dado: contato vazio, malformado ou nem e-mail nem telefone reconhecível
- Quando: tenta enviar
- Então: mensagem clara no modal; convite **não** é criado

#### Cenário 12: Nome obrigatório (erro)

- Dado: contato válido; nome vazio ou só espaços
- Quando: tenta enviar
- Então: mensagem pedindo como chamar a pessoa; convite **não** é criado

#### Cenário 13: Convite duplicado pendente (borda)

- Dado: já existe convite **pendente** para o mesmo contato normalizado (mesmo e-mail ou mesmo telefone)
- Quando: tenta convidar de novo
- Então: mensagem informando convite já enviado; sugere **Reenviar** na linha existente — **sem** segundo registro

#### Cenário 14: Convidar quem já é membro ativo (borda)

- Dado: contato já pertence à conta como membro **ativo**
- Quando: tenta convidar
- Então: mensagem clara; convite **não** é criado

### Reenvio e expiração

#### Cenário 15: Reenviar convite pendente (caminho feliz)

- Dado: linha com **Convite pendente**
- Quando: admin toca **Reenviar**
- Então:
  - Novo prazo de **7 dias** a partir de agora
  - Link anterior deixa de valer (token rotacionado)
  - Feedback de sucesso; mesma regra de envio automático vs **Copiar link** do cenário 7

#### Cenário 16: Reenviar convite expirado (caminho feliz)

- Dado: convite passou de 7 dias sem aceite (situação **Expirado** ou ainda listado como pendente expirado)
- Quando: admin toca **Reenviar**
- Então: convite volta a **pendente** com novo prazo e link; etiqueta atualizada

#### Cenário 17: Não-admin tenta reenviar (erro)

- Dado: cuidadora autenticada
- Quando: inspeciona lista
- Então: **sem** botão **Reenviar**; tentativa via URL/action rejeitada no servidor com mensagem de permissão

### Aceite do convite

#### Cenário 18: Aceitar convite — pessoa nova (caminho feliz)

- Dado: link de aceite válido; convidada **não** tem sessão
- Quando: abre o link
- Então: vê tela explicando quem convidou, papel e pessoa cuidada; CTA leva ao **Entrar** (OTP no e-mail convidado); após autenticar com **o mesmo e-mail** do convite, aceite conclui automaticamente
- E: redireciona para `/familia` da conta convidada; linha passa a **Ativa**; checklist F4.2 tarefa 3 pode completar quando houver ≥2 membros ativos

#### Cenário 19: Aceitar convite — já autenticada com e-mail correto (caminho feliz)

- Dado: sessão ativa; e-mail da sessão coincide com o convite
- Quando: abre link válido
- Então: confirma aceite (uma ação); vira membro **ativa**; redireciona ao painel

#### Cenário 20: Aceitar convite — e-mail da sessão diferente (erro)

- Dado: logada com outro e-mail que não o convidado
- Quando: abre link
- Então: mensagem pedindo entrar com o e-mail convidado ou pedir reenvio à administradora — **sem** vincular à conta errada

#### Cenário 21: Link expirado (erro)

- Dado: convite com mais de 7 dias
- Quando: abre link
- Então: copy alinhada ao FAQ do Entrar (“Convite vale 7 dias. Peça para quem convidou clicar em **Reenviar**”); **sem** aceite

#### Cenário 22: Link já usado (borda)

- Dado: convite já aceito
- Quando: abre link antigo
- Então: mensagem informando que convite já foi aceito; CTA para **Entrar** no painel se já for membro

#### Cenário 23: Token inválido ou adulterado (erro)

- Dado: link inexistente ou token corrompido
- Então: mensagem genérica de convite não encontrado — **sem** vazar se conta existe

### Autorização, conta e falhas

#### Cenário 24: Conta pausada — convidar bloqueado (borda)

- Dado: banner de conta pausada no shell
- Quando: admin tenta convidar ou reenviar
- Então: ação bloqueada com copy de conta pausada; lista permanece legível

#### Cenário 25: Falha ao carregar participantes (erro)

- Dado: erro ao buscar lista
- Então: mensagem genérica; shell intacto; recarregar página como retry

#### Cenário 26: Leitura via caso de uso — sem consulta na page (caminho feliz técnico)

- Dado: implementação desta Spec
- Quando: inspeciona `app/(family)/familia/participantes/page.tsx`
- Então: page só orquestra RSC + repassa props; **nenhuma** consulta direta ao banco na page

#### Cenário 27: Deep link modal convite (caminho feliz)

- Dado: administradora
- Quando: abre `/familia/participantes?modal=convite` (ou equivalente acordado na implementação)
- Então: modal **Convidar pessoa** abre ao carregar

#### Cenário 28: Topbar ou checklist Hoje apontam para convite (caminho feliz)

- Dado: administradora no checklist de primeiro acesso (F4.2) ou widget “convide alguém”
- Quando: segue link para Quem participa
- Então: área real carrega (não placeholder); opcionalmente abre modal se query `modal=convite` for usada no href do checklist

---

## 5. Regras de negócio

- **Quatro papéis:** Administrador, Cuidador, Visualizador, Contato de emergência — slugs alinhados ao domínio existente.
- **Quem convida:** somente quem passa em `canInviteOrChangeRoles` (admin).
- **Validade do convite:** **7 dias** corridos desde criação ou reenvio; expirado não aceita até reenvio.
- **Token:** valor aleatório longo, uso único no aceite; reenvio **rotaciona** token.
- **Normalização de contato:** e-mail em minúsculas; telefone normalizado (E.164 ou padrão BR do cadastro) para deduplicação.
- **Contato de emergência telefônico:** ativo imediato, sem aceite — prepara F4.7; **não** cria sessão de painel.
- **Demais papéis:** exigem aceite → membro com status **ativa**, `accepted_at` preenchido.
- **Matriz na UI:** dados estáticos derivados do PRD §6 / protótipo — função pura testável em domínio (`permission-matrix.ts` ou equivalente); **não** altera regras RLS existentes.
- **Lista unificada:** membros ativos + convites pendentes/expirados visíveis ao admin; convidados não autenticados não listam a área.
- **Relação/nome exibido:** prioriza nome informado no convite; para admin bootstrap, nome do perfil + sufixo “(você)” quando for a própria pessoa logada.
- **Server-first:** agregação no servidor; client mínimo (modal convite, copiar link, estados pendentes).
- **Copy:** textos novos em `content/family.ts` (seção `participantes`); reutilizar descrições de papéis do cadastro quando fizer sentido.
- **Revalidação:** após convite, reenvio ou aceite, revalidar `/familia/participantes` e `/familia` (checklist membros).
- **LGPD / logs:** Sentry e logs só IDs + tipo de evento (`invite_sent`, `invite_accepted`); **não** logar e-mail/telefone completos.
- **Persistência de convites:** migration aprovada nesta Spec cria armazenamento de convites com RLS por conta; aceite cria vínculo de membro ou marca convite aceito conforme desenho da migration.
- **Domínio puro testável:** normalização de contato, deduplicação, cálculo de expiração, labels de papel/situação, células da matriz — Vitest ≥ 80% nas funções novas.
- **Arquivos ≤ ~300 linhas:** dividir lista, matriz, modal convite, página aceite.

## 6. Critérios de Done desta feature

- [ ] Cenários 1–28 verificados (smoke manual via `manual-report`; FL-08 parcial para convites)
- [ ] `pnpm typecheck` passa
- [ ] `pnpm lint` passa
- [ ] `pnpm test` passa — Vitest em funções puras novas (matriz, contato, expiração, labels) ≥ 80%; smoke `content/family.ts`
- [ ] `/familia/participantes` fiel ao protótipo — lista + matriz + modal `m-convite`
- [ ] Convite, reenvio e aceite funcionais com validade de 7 dias
- [ ] Contato de emergência só telefone ativo sem aceite (cenário 9)
- [ ] **Nenhuma** query inline em `page.tsx` — caso de uso + repositório
- [ ] Migration + RLS de convites aplicadas no remoto (skill `supabase-migrations` ou equivalente documentado)
- [ ] Página/rota de aceite de convite acessível por link gerado
- [ ] Não-admin sem CTAs de convite/reenvio; authz server-side em todas as mutações
- [ ] Copy 100% dos textos novos em `content/family.ts`
- [ ] Placeholder `participantes` removido do fluxo real da rota
- [ ] Revalidação `/familia` após aceite (checklist tarefa 3)
- [ ] Checklist `docs/SECURITY.md` — A01 authz admin; A03 validação server-side; A07 token de convite não previsível; RLS por conta; PHI: não logar contatos; convite expirado inutilizável; N/A: uploads, geo, webhooks WA, SOS acionamento
- [ ] `docs/state/ATUAL.md` e `docs/state/PENDENCIAS.md` atualizados; entrega em `docs/implementation/2026-08-13-f4-04-quem-participa.md`
- [ ] Nenhuma dependência npm nova
- [ ] Reflexão curta sobre escalabilidade/manutenibilidade

## 7. Escopo de arquivos permitido

### Pode criar

- `supabase/migrations/005_invites.sql` — tabela de convites, tipos/status, índices
- `supabase/policies/005_invites_rls.sql` — ou policies no mesmo arquivo migration, conforme padrão do repo
- `apps/web/modules/accounts/domain/permission-matrix.ts` — linhas/colunas da matriz UI (puras)
- `apps/web/modules/accounts/domain/permission-matrix.test.ts`
- `apps/web/modules/accounts/domain/invite-contact.ts` — normalização e validação de contato
- `apps/web/modules/accounts/domain/invite-contact.test.ts`
- `apps/web/modules/accounts/domain/invite-lifecycle.ts` — expiração 7d, labels de situação
- `apps/web/modules/accounts/domain/invite-lifecycle.test.ts`
- `apps/web/modules/accounts/infrastructure/invite-repo.ts` — CRUD convites + listagem unificada
- `apps/web/modules/accounts/infrastructure/member-list-repo.ts` — membros ativos + join perfil (ou estender repo existente ≤300 linhas)
- `apps/web/modules/accounts/application/get-participantes-page.ts` — agregador da rota
- `apps/web/modules/accounts/application/get-participantes-page.test.ts`
- `apps/web/modules/accounts/application/send-invite.ts` — criar convite + token
- `apps/web/modules/accounts/application/send-invite.test.ts`
- `apps/web/modules/accounts/application/resend-invite.ts`
- `apps/web/modules/accounts/application/resend-invite.test.ts`
- `apps/web/modules/accounts/application/accept-invite.ts` — aceite pós-auth
- `apps/web/modules/accounts/application/accept-invite.test.ts`
- `apps/web/modules/accounts/presentation/participantes-page-view.tsx`
- `apps/web/modules/accounts/presentation/participants-list-card.tsx`
- `apps/web/modules/accounts/presentation/permission-matrix-card.tsx`
- `apps/web/modules/accounts/presentation/invite-modal.tsx` — client mínimo
- `apps/web/app/(auth)/convite/[token]/page.tsx` — ou `(auth)/aceitar-convite/` conforme padrão de rotas públicas do projeto
- `apps/web/modules/accounts/presentation/accept-invite-view.tsx`
- `docs/implementation/2026-08-13-f4-04-quem-participa.md` (no Done)

### Pode editar

- `apps/web/app/(family)/familia/participantes/page.tsx` — substituir placeholder; orquestração RSC
- `apps/web/content/family.ts` — copy participantes, modal, matriz, erros, aceite
- `apps/web/content/family.test.ts` — smoke das novas chaves
- `apps/web/modules/accounts/index.ts` — exportar API pública estreita
- `apps/web/modules/accounts/application/family-context.ts` — **somente** se necessário para listagem; **sem** quebrar consumidores F4.1/F4.2
- `apps/web/modules/accounts/domain/roles.ts` — **somente** adicionar helpers de label/display ou reexport da matriz; **sem** alterar `can*` existentes
- `docs/state/ATUAL.md`, `docs/state/PENDENCIAS.md`
- `specs/2026-08-13-f4-04-quem-participa.md` — somente campo status desta Spec

### Pode editar com cautela (path crítico — diff revisado)

- `apps/web/modules/accounts/application/auth-actions.ts` — **somente** gancho pós-login para aceite pendente de convite
- `apps/web/app/(auth)/entrar/page.tsx` — **somente** query param de retorno para aceite
- `apps/web/content/family.ts` — links do checklist Hoje com `?modal=convite` se aprovado na implementação
- `apps/web/lib/supabase/**` — **somente** se indispensável para aceite server-side; diff mínimo

### Não pode editar nesta Spec

- `apps/web/app/(family)/layout.tsx` e componentes shell salvo links de copy
- `apps/web/modules/medications/**`, `care-recipients/**` (salvo revalidação indireta)
- `apps/web/modules/sos/**`, `billing/**`, `exams/**`, `location/**`, `elder-access/**`, `reminders/**`
- `apps/web/app/(marketing)/**`, `app/(elder)/**`
- `apps/web/components/ui/**` salvo consumo de `Modal` existente
- `.env*`, CI/CD, `AGENTS.md`, `docs/prd-mvp.md`, `docs/arquitetura-solucao.md`, `docs/SECURITY.md`
- Specs já aprovadas (F0–F3, F4.1–F4.3)
- `package.json` / lockfile
- Outras rotas `/familia/*` salvo participantes

## 8. Riscos e dúvidas abertas

- **Path crítico** — convites + papéis + RLS exigem review humano do diff (`tight`).
- **Envio transacional** — se e-mail automático não estiver pronto, **Copiar link** é fallback obrigatório e honesto; não simular “enviado” sem prova.
- **Contato de emergência sem login** — desenho da migration deve permitir registro na conta sem `profile_id`; alinhar com F4.7 antes de Done de SOS.
- **Aceite + OTP** — convidada deve usar o **mesmo** e-mail do convite; documentar limitação para convites por telefone (aceite exige e-mail ou fluxo F6).
- **Duplicidade admin bootstrap** — garantir que administradora do cadastro não apareça também como convite pendente.
- **Segurança (`docs/SECURITY.md`):**
  - **A01:** só admin convida/reenvia; listagem exige membership ativa na conta.
  - **A03:** validar token, expiração e e-mail da sessão no aceite server-side.
  - **A07:** token criptograficamente forte; invalidar no reenvio.
  - **RLS:** convites visíveis só a membros da mesma conta; insert/update admin; aceite via função controlada ou service role mínima em handler dedicado.
  - **PHI:** nomes na UI ok; logs sem contato completo.
  - **N/A:** Storage, geo, webhooks WA, acionamento SOS.
- **Homologação acumulada** — FL-08 parcial nesta subfase; documentar cenários manuais de convite/aceite/expiração.
- **Dúvida fechada na Spec:** persistência retroativa de convites do cadastro F3 — **fora de escopo**.

## 9. Aprovação humana

- Aprovado por:
- Data:
- Observações:

---

**Próximo passo após aprovação:** implementar somente o escopo desta Spec; atualizar `docs/state/ATUAL.md`; registrar Done em `docs/implementation/`.
