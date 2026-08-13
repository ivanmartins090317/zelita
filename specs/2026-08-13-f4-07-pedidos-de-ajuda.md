# Spec: F4.7 — Pedidos de ajuda (SOS)

- Status: `draft`
- Data: 2026-08-13
- Autonomia: `tight` (emergência, paths críticos `sos` + schema/RLS, coral só para SOS, disclaimer SAMU, auditável)
- Projeto: Zelita (`apps/web`)
- Pedido original: Plano aprovado em `docs/F4/plan.md` (subfase F4.7). Entregar a área **Pedidos de ajuda** em alta fidelidade ao protótipo (`#v-sos`, linhas ~1263–1302): aviso legal fixo, detalhe do último acionamento, ordem de quem é avisado, histórico e marcação de resolvido — **sem** acionar serviço público e **sem** botão funcional do idoso (F5).

## 1. Objetivo

Quem administra ou acompanha a conta abre **Pedidos de ajuda** e vê, no layout do shell F4.1, o que aconteceu quando a pessoa cuidada pediu ajuda — ou um estado vazio honesto se ainda não houve acionamento. O aviso de que **a Zelita não substitui SAMU/Bombeiros** permanece sempre visível no topo (coral de emergência).

A administradora configura **quem a Zelita avisa primeiro**: ordem de contatos elegíveis, canais previstos por papel (ligação, WhatsApp, imediato ou após 2 minutos) e pode **reordenar** a lista. Quando existir um pedido **aberto**, quem tem permissão pode **marcar como resolvido** com observação opcional (ex.: “tontura ao levantar, passou; sem queda”). O histórico mostra acionamentos anteriores — resolvidos, cancelados na confirmação ou ainda abertos — com horário e tempo até o desfecho quando aplicável.

Integração mínima com **Hoje**: a tarefa 2 do checklist (“Diga quem chamar numa emergência”) conclui quando a ordem de aviso tiver **ao menos dois contatos** configurados; **Precisa de você** destaca pedido **aberto**; a linha do tempo do dia pode incluir acionamentos recentes. Nenhum dado inventado; disparo real pelo idoso e notificações por WhatsApp/ligação ficam para F5 e jobs Inngest.

## 2. Fora de escopo

- **Shell do painel** — sidebar, topbar, trial bar (F4.1)
- **PWA do idoso** — botão “Preciso de ajuda”, confirmação em 2 etapas, disclaimer pós-envio na tela dele (F5 / Fatia 2 F2-01)
- **Disparo de notificações reais** — WhatsApp, ligação, e-mail, push e escalonamento automático após 2 minutos (job Inngest F2-02); nesta subfase persistir **estrutura** de registro e exibir no detalhe o que já existir; fila de envio documentada como pendente
- **Acionar SAMU, Bombeiros ou central médica** — proibido; copy e disclaimer apenas
- **Mapa interativo** — botão **Ver no mapa** linka para `/familia/localizacao` (F4.8) ou fica desabilitado com hint honesto até lá; exibir endereço/texto de localização **se** já estiver no registro do acionamento
- **Baixar registro em PDF** — botão stub “Em breve” ou omitido com nota na homologação; **sem** geração de PDF nesta subfase
- **Feed de Avisos (F4.9)** — eventos SOS **não** entram no histórico de avisos gerais nesta subfase
- **Matriz “Quem recebe o quê” por canal** — UI em Avisos/Ajustes (F4.9/F4.10); aqui só ordem de escalonamento SOS
- **Preferências de visualizador opt-in** globais — visualizador entra na ordem **somente** se a administradora o incluir explicitamente na lista
- **Geofence, zona segura, trajeto** — F4.8
- **Jobs Inngest** completos, rate limit de produção para SOS, integração WhatsApp Business
- **Badge numérico** na sidebar — omitir (urgência vai para Precisa de você / detalhe aberto)
- **Gateway de pagamento**, Playwright, nova dependência npm (mapa, PDF, ícones)
- **Multi recipient por conta** — uma pessoa cuidada por conta (F4.1)
- **Alterar matriz global de papéis** — UI de Quem participa (F4.4) permanece; regras `can*` globais intactas
- **Texto grande** no topbar (F5)
- **Simular acionamento** a partir do painel da família — homologação usa dados seed ou aguarda F5; botão **Testar o botão na tela do idoso** aponta para PWA (stub até F5)

## 3. Atores e pré-condições

- Quem usa:
  - **Administradora** — ver histórico e detalhe, configurar/reordenar quem é avisado, marcar resolvido, ver todos os acionamentos da pessoa cuidada.
  - **Cuidadora** — ver histórico e detalhe, marcar resolvido, **sem** alterar ordem de aviso.
  - **Visualizadora** — ver histórico e detalhe **somente** se incluída na ordem de aviso ou se política de conta permitir leitura de pedidos (MVP: **mesma regra de “receber SOS”** — quem não recebe alerta **não** vê a área; redirecionar ou empty state de acesso negado conforme padrão do shell).
  - **Contato de emergência** — recebe alerta (futuro); acesso ao painel **opcional**; se **sem** login, **não** usa esta rota (telefone only).
- O que precisa existir antes:
  - **F0** — tokens, `Card`, `Tag`, `ListRow`, `EmptyState`, `Button`, `Modal` (F4.1); **coral só para SOS/emergência**.
  - **F2** — sessão OTP, contexto de conta, cookie de conta preferida.
  - **F3** — conta + pessoa cuidada (nome, apelido, idade, telefone para retorno quando cadastrado).
  - **F4.1** — layout, rota `/familia/pedidos-de-ajuda` placeholder substituída, copy base em `content/family.ts`.
  - **F4.2** — Hoje maduro, checklist tarefa 2 (conclusão real nesta Spec), widgets **Precisa de você** e linha do tempo extensível.
  - **F4.4** — membros ativos e contatos de emergência telefônicos para montar lista de escalonamento.
  - Protótipo: `#v-sos` (~1263–1302); PRD §5.2 SOS, §4.3 entidade de alerta, §6 matriz “Receber SOS”; `docs/SECURITY.md` (2 etapas, ignora DND do familiar, disclaimer, auditável).

## 4. Comportamento esperado (cenários)

Linguagem de domínio: o que a pessoa vê e faz — não como o sistema organiza arquivos.

### Estrutura geral da área

#### Cenário 1: Pedidos de ajuda carrega dentro do shell (caminho feliz)

- Dado: familiar autenticada com conta completa e papel com acesso à rotina / receber SOS
- Quando: abre `/familia/pedidos-de-ajuda`
- Então: vê topbar F4.1 (“Pedidos de ajuda” / “Quando ele apertou o botão e o que aconteceu”) + miolo da área — **sem** placeholder “em breve”

#### Cenário 2: Aviso legal SAMU sempre visível (caminho feliz)

- Dado: qualquer estado da área
- Quando: olha o topo do miolo
- Então: faixa/nota em tom coral com copy do protótipo — Zelita **não** substitui serviço público; números **192 (SAMU)** e **193 (Bombeiros)** destacados; menção de que o mesmo aviso aparece na tela do idoso após acionamento (F5)

#### Cenário 3: Conta sem acionamentos (empty state)

- Dado: nenhum pedido de ajuda registrado; ordem de aviso ainda não salva ou padrão vazia
- Quando: abre Pedidos de ajuda
- Então:
  - Card **Último acionamento** com EmptyState — “Nenhum pedido de ajuda ainda” + copy tranquilizadora
  - Card **Quem a Zelita avisa primeiro** com lista vazia ou sugestão de configurar + botão **Mudar ordem** (admin)
  - Card **Histórico** vazio
  - Rodapé do histórico: botão **Testar o botão na tela do idoso** (link PWA ou stub honesto)
  - **Sem** linhas demo do protótipo (Cintia 19:42, etc.)

#### Cenário 4: Layout em duas colunas (caminho feliz)

- Dado: viewport desktop/tablet larga
- Quando: área carregada
- Então: grid fiel ao protótipo — coluna esquerda **Último acionamento**; direita **Quem avisa primeiro** + **Histórico** empilhados
- E: mobile empilha colunas; touch targets ≥44px

### Ordem de aviso (escalonamento)

#### Cenário 5: Lista padrão sugerida na primeira configuração (caminho feliz)

- Dado: administradora; membros ativos: ela (admin), irmão (admin), cuidadora, contato de emergência telefônico
- Quando: abre **Mudar ordem** pela primeira vez (sem configuração salva)
- Então: modal/lista pré-populada com contatos **elegíveis** a receber SOS (admins, cuidadores, contatos de emergência); visualizadores **fora** por padrão
- E: cada linha mostra posição, nome, papel, resumo de canal (“Ligação + WhatsApp · imediato” ou “Ligação · se ninguém responder em 2 min” conforme papel)

#### Cenário 6: Salvar ordem com dois contatos (caminho feliz)

- Dado: administradora reordenou lista com ≥2 contatos
- Quando: confirma **Salvar ordem**
- Então: card **Quem a Zelita avisa primeiro** reflete ordem; `/familia` revalida (checklist tarefa 2); toast ou feedback discreto de sucesso

#### Cenário 7: Reordenar contatos (caminho feliz)

- Dado: ordem já salva com 4 contatos
- Quando: abre **Mudar ordem**, move cuidadora para posição 2, salva
- Então: números 1…N atualizados; persistência imediata no servidor

#### Cenário 8: Incluir visualizador na ordem (borda)

- Dado: visualizadora ativa na conta
- Quando: administradora adiciona explicitamente à lista (toggle ou botão “Incluir”)
- Então: linha com canal reduzido (ex.: “WhatsApp · imediato”); copy indica que alerta SOS para visualizador é opt-in

#### Cenário 9: Membro removido ou convite pendente (borda)

- Dado: ordem salva incluía membro que foi removido da conta
- Quando: recarrega Pedidos de ajuda
- Então: entrada inválida omitida ou marcada para revisão; administradora vê aviso para atualizar ordem — **sem** erro 500

#### Cenário 10: Cuidadora tenta mudar ordem (erro)

- Dado: cuidadora autenticada
- Então: **sem** botão **Mudar ordem**; tentativa direta rejeitada no servidor

#### Cenário 11: Conta pausada — ordem bloqueada (borda)

- Dado: banner de conta pausada
- Quando: administradora tenta salvar nova ordem
- Então: mutação bloqueada com copy de conta pausada; leitura de histórico permitida

#### Cenário 12: Ordem com um único contato (borda)

- Dado: administradora tenta salvar lista com 1 contato
- Então: aviso — “Com pelo menos dois contatos, o botão avisa mais gente” — **permite salvar** mas checklist tarefa 2 **permanece pendente**

### Último acionamento e detalhe

#### Cenário 13: Pedido aberto — detalhe completo (caminho feliz)

- Dado: acionamento **aberto** registrado (seed, F5 futuro ou homologação)
- Quando: abre Pedidos de ajuda
- Então: card **Último acionamento** com etiqueta **Aberto** (coral) e bloco destacado “🆘 {apelido} pediu ajuda” contendo:
  - Pessoa (nome civil, apelido, idade)
  - Horário do acionamento (fuso `America/Sao_Paulo`)
  - Tipo: “Botão de ajuda no aplicativo (confirmado pelo idoso)” ou equivalente
  - Localização — endereço/texto + precisão e hora **se** disponíveis; senão “Localização indisponível”
  - Telefone para retorno da pessoa cuidada
  - Notificados — lista “Nome (hora, canal · status)” conforme registros existentes; se job ainda não rodou, copy honesta “Avisos serão registrados quando o envio estiver ativo”
  - Desfecho — vazio enquanto aberto
- E: ações **Marcar como resolvido** (primária) e secundárias conforme escopo (mapa stub, PDF stub)

#### Cenário 14: Pedido resolvido — último acionamento (caminho feliz)

- Dado: acionamento mais recente já **resolvido**
- Então: etiqueta **Resolvido**; linha de desfecho “Resolvido por {nome} às {hora} — {observação}”
- E: botões secundários de PDF/mapa conforme stubs

#### Cenário 15: Selecionar item do histórico (caminho feliz)

- Dado: três itens no histórico
- Quando: toca linha “02/06 · 22:15”
- Então: card **Último acionamento** atualiza para aquele registro (não necessariamente o cronologicamente último se UX escolher “selecionado”; **padrão MVP:** sempre mostrar o **mais recente** e histórico só navega via scroll — **ou** toque no histórico troca detalhe — **decisão fechada:** toque no histórico **atualiza** o card de detalhe)

#### Cenário 16: Acionamento cancelado na confirmação (borda)

- Dado: registro com status **cancelado** (idoso desistiu na 2ª etapa — F5)
- Então: histórico mostra ícone ↩, copy “Cancelado pelo idoso na confirmação”; **sem** etiqueta de urgência em Hoje

### Marcar como resolvido

#### Cenário 17: Resolver pedido aberto (caminho feliz)

- Dado: administradora ou cuidadora; pedido **aberto**
- Quando: toca **Marcar como resolvido**, preenche observação opcional “tontura ao levantar, passou; sem queda”, confirma
- Então: status → **resolvido**; `resolved_by` e horário registrados; detalhe e histórico atualizam; **Precisa de você** em Hoje remove item; revalidação `/familia`

#### Cenário 18: Resolver sem observação (caminho feliz)

- Dado: pedido aberto
- Quando: confirma resolução deixando observação vazia
- Então: resolvido com desfecho “Resolvido por {nome} às {hora}” sem texto extra

#### Cenário 19: Visualizadora tenta resolver (erro)

- Dado: visualizadora **sem** papel de resolver
- Então: **sem** botão; ação direta rejeitada no servidor

#### Cenário 20: Resolver pedido já resolvido (erro)

- Dado: pedido resolvido
- Quando: tenta resolver de novo
- Então: mensagem clara; estado idempotente, sem duplicar registro

#### Cenário 21: Dois familiares resolvem quase ao mesmo tempo (borda)

- Dado: pedido aberto; cuidadora e administradora resolvem em sequência rápida
- Então: primeiro resolve; segundo vê “Este pedido já foi marcado como resolvido por {nome}” — **sem** sobrescrever observação do primeiro

### Histórico

#### Cenário 22: Lista de histórico (caminho feliz)

- Dado: mix de resolvidos, cancelados e um aberto antigo
- Quando: olha card **Histórico**
- Então: linhas com data/hora, resumo (“Resolvido em 5 min”, “Resolvido em 11 min · Ana foi até a casa”, “Cancelado…”) — dados **reais**, truncados com reticências se observação longa

#### Cenário 23: Histórico paginado ou limitado (borda)

- Dado: >20 acionamentos
- Então: MVP mostra últimos 20 com link “Ver histórico completo” **ou** scroll infinito simples — **decisão fechada:** últimos **50** em ordem decrescente; suficiente para MVP

#### Cenário 24: Testar botão na tela do idoso (caminho feliz — stub)

- Dado: F5 PWA ainda não entregue
- Quando: toca **Testar o botão na tela do idoso**
- Então: navega para rota idoso se existir stub **ou** modal explicando que o teste real será na área do idoso (F5) — **sem** simular SOS pelo painel família

### Autorização e falhas

#### Cenário 25: Quem pode ver a área (caminho feliz)

- Dado: papéis conforme PRD §6 “Receber SOS”
- Então: administradora e cuidadora **sempre** acessam; contato de emergência **com login** acessa; visualizadora **somente** se na ordem de aviso; quem não recebe SOS **não** acessa rota (403 ou redirect padrão do app)

#### Cenário 26: Falha ao carregar dados (erro)

- Dado: erro ao buscar histórico ou ordem
- Então: mensagem genérica; shell intacto; recarregar como retry

#### Cenário 27: Leitura via caso de uso — sem consulta na page (caminho feliz técnico)

- Dado: implementação desta Spec
- Quando: inspeciona `app/(family)/familia/pedidos-de-ajuda/page.tsx`
- Então: page só orquestra RSC + repassa props; **nenhuma** consulta direta ao banco na page

### Integração com Hoje

#### Cenário 28: Checklist tarefa 2 concluída (caminho feliz)

- Dado: ordem de aviso salva com **≥2** contatos elegíveis
- Quando: abre `/familia` (primeiro acesso ou maduro)
- Então: tarefa 2 **Diga quem chamar numa emergência** marcada concluída; progresso atualizado

#### Cenário 29: Checklist tarefa 2 pendente (borda)

- Dado: zero ou um contato na ordem
- Então: tarefa 2 pendente; CTA leva a `/familia/pedidos-de-ajuda`

#### Cenário 30: Precisa de você — pedido aberto (caminho feliz)

- Dado: acionamento **aberto**
- Quando: abre Hoje maduro
- Então: card **Precisa de você** inclui linha urgente em coral — “{apelido} pediu ajuda · {horário}” com link para Pedidos de ajuda
- E: prioridade **acima** de cartela acabando e exame sem categoria

#### Cenário 31: Precisa de você sem pedido aberto (borda)

- Dado: nenhum acionamento aberto
- Então: **sem** linha SOS em Precisa de você

#### Cenário 32: Widget “O que ainda está vazio” — primeiro acesso (caminho feliz)

- Dado: modo primeiro acesso; ordem não configurada (0 contatos)
- Quando: olha widget Pedidos de ajuda
- Então: status pendente + botão **Configurar** → `/familia/pedidos-de-ajuda`

#### Cenário 33: Linha do tempo — acionamento no dia (caminho feliz)

- Dado: acionamento hoje (aberto ou resolvido)
- Quando: olha **O dia do {apelido}** em Hoje maduro
- Então: entrada “Botão de ajuda acionado” ou “Pedido de ajuda resolvido” com horário — **somente** eventos reais do dia

#### Cenário 34: Sua central — linha de pedidos de ajuda (caminho feliz)

- Dado: Hoje maduro; checklist compacto
- Então: linha checklist id `sos` reflete estado real (configurado / pendente) com link correto

---

## 5. Regras de negócio

- **Escopo da conta:** pedidos de ajuda pertencem à **pessoa cuidada** da conta ativa (MVP: uma por conta).
- **Disclaimer:** copy SAMU/Bombeiros **obrigatória** nesta área; cor **coral** exclusiva para emergência/SOS.
- **Quem configura ordem:** **somente administradora**.
- **Quem resolve:** administradora e cuidadora; visualizadora e contato de emergência **não** (salvo evolução futura explícita).
- **Quem vê a área:** quem **recebe SOS** na matriz PRD; visualizador **condicional** (incluído na ordem).
- **Ordem de aviso:** lista ordenada 1…N de membros/contatos elegíveis; cada entrada tem atraso padrão por papel (imediato vs 2 min para contato de emergência no fim da fila); canais exibidos conforme papel (admin: ligação+WhatsApp; cuidador: WhatsApp; etc.) — rótulos em domínio puro testável.
- **Checklist tarefa 2:** concluída quando ordem salva tem **≥2** contatos elegíveis.
- **Status do pedido:** `aberto` · `resolvido` · `cancelado` (cancelado só via fluxo idoso F5).
- **Resolução:** registra quem resolveu, horário e observação opcional (texto livre, limite razoável ex. 500 chars); irreversível no MVP.
- **Localização no detalhe:** exibir se campos existirem no registro; precisão em metros; menção a zona segura **somente** se F4.8 já tiver dado — senão omitir linha de zona.
- **Notificados:** lista derivada de registros de tentativa de aviso; se vazia, copy honesta sobre envio futuro — **nunca** inventar “WhatsApp lido”.
- **Ordenação histórico:** `triggered_at` decrescente.
- **Último acionamento:** registro mais recente por padrão; seleção no histórico troca detalhe.
- **Integração Hoje:** estender `computeOnboardingChecklist` com contagem de contatos na ordem; estender agregador Hoje para Precisa de você, timeline e widget vazio — **sem** duplicar lógica de medicamentos/exames.
- **Server-first:** mutações via Server Action; client mínimo (modal ordem, modal resolver, seleção histórico).
- **Copy:** textos novos em `content/family.ts` (seção `pedidosDeAjuda` / `sos`); remover placeholder do fluxo real.
- **Revalidação:** após mutação, revalidar `/familia/pedidos-de-ajuda` e `/familia`.
- **LGPD / logs:** Sentry e logs só IDs + tipo (`sos_config_updated`, `sos_resolved`, `sos_viewed`); **não** logar observação clínica completa nem coordenadas precisas em ferramentas externas.
- **Persistência:** migration aprovada nesta Spec cria registros de alerta, ordem de escalonamento, tentativas de notificação (estrutura) e políticas RLS alinhadas à matriz de papéis.
- **Domínio puro testável:** elegibilidade na ordem, rótulos de canal/atraso, duração até resolução, prioridade em Precisa de você — Vitest ≥ 80% nas funções novas.
- **Arquivos ≤ ~300 linhas:** dividir detalhe, histórico, modal ordem, modal resolver, repos, casos de uso.

---

## 6. Critérios de Done desta feature

- [ ] Cenários 1–34 verificados (smoke manual via `manual-report`; FL-06 parcial — UI, ordem, resolver; acionamento real depende F5 ou seed documentado)
- [ ] `pnpm typecheck` passa
- [ ] `pnpm lint` passa
- [ ] `pnpm test` passa — Vitest em funções puras novas (ordem, elegibilidade, status, labels, checklist, prioridade Hoje) ≥ 80%; smoke `content/family.ts`
- [ ] `/familia/pedidos-de-ajuda` fiel ao protótipo — disclaimer, grid, último acionamento, ordem, histórico
- [ ] Ordem de aviso persistida; administradora reordena; cuidadora não altera
- [ ] Marcar resolvido funcional para admin e cuidadora
- [ ] RLS + authz server-side conforme papéis PRD
- [ ] Integração Hoje: checklist tarefa 2 (28–29), Precisa de você aberto (30), timeline (33), widget vazio (32)
- [ ] **Nenhuma** query inline em `page.tsx` — casos de uso + repositórios
- [ ] Migration + policies aplicadas no remoto (skill `supabase-migrations` ou equivalente documentado)
- [ ] Copy 100% dos textos novos em `content/family.ts`
- [ ] Placeholder `pedidos-de-ajuda` removido do fluxo real da rota
- [ ] Checklist `docs/SECURITY.md` — A01 authz SOS; A03 validação Zod; RLS alertas + ordem; SOS: disclaimer, 2 etapas **documentado para F5**, ignora DND **documentado para job**; audit mínimo; coral só emergência; N/A: uploads, geo completo, webhooks WA ativos, elder-access trigger, billing, OCR
- [ ] `docs/state/ATUAL.md` e `docs/state/PENDENCIAS.md` atualizados; entrega em `docs/implementation/2026-08-13-f4-07-pedidos-de-ajuda.md`
- [ ] Nenhuma dependência npm nova
- [ ] Reflexão curta sobre escalabilidade/manutenibilidade

---

## 7. Escopo de arquivos permitido

### Pode criar

- `supabase/migrations/009_sos.sql` — alertas, ordem de escalonamento, tentativas de notificação, índices, RLS
- `apps/web/modules/sos/domain/sos-alert-status.ts` — mapas de status (sem enum TS)
- `apps/web/modules/sos/domain/sos-alert-status.test.ts`
- `apps/web/modules/sos/domain/sos-escalation-labels.ts` — rótulos canal/atraso por papel
- `apps/web/modules/sos/domain/sos-escalation-labels.test.ts`
- `apps/web/modules/sos/domain/sos-eligibility.ts` — quem pode entrar na ordem / ver área
- `apps/web/modules/sos/domain/sos-eligibility.test.ts`
- `apps/web/modules/sos/domain/sos-resolution.ts` — regras resolver, duração, idempotência
- `apps/web/modules/sos/domain/sos-resolution.test.ts`
- `apps/web/modules/sos/domain/sos-hoje-priority.ts` — prioridade Precisa de você
- `apps/web/modules/sos/domain/sos-hoje-priority.test.ts`
- `apps/web/modules/sos/infrastructure/sos-alert-repo.ts`
- `apps/web/modules/sos/infrastructure/sos-escalation-repo.ts`
- `apps/web/modules/sos/infrastructure/sos-notification-repo.ts` — leitura/gravação estrutural; envio real fora
- `apps/web/modules/sos/application/get-pedidos-de-ajuda-page.ts`
- `apps/web/modules/sos/application/get-pedidos-de-ajuda-page.test.ts`
- `apps/web/modules/sos/application/update-sos-escalation.ts`
- `apps/web/modules/sos/application/resolve-sos-alert.ts`
- `apps/web/modules/sos/application/can-manage-sos-escalation.ts`
- `apps/web/modules/sos/application/can-resolve-sos-alert.ts`
- `apps/web/modules/sos/application/can-view-sos-area.ts`
- `apps/web/modules/sos/application/get-hoje-sos-snapshot.ts`
- `apps/web/modules/sos/presentation/pedidos-de-ajuda-page-view.tsx`
- `apps/web/modules/sos/presentation/sos-disclaimer-banner.tsx`
- `apps/web/modules/sos/presentation/sos-last-alert-card.tsx`
- `apps/web/modules/sos/presentation/sos-escalation-card.tsx`
- `apps/web/modules/sos/presentation/sos-history-card.tsx`
- `apps/web/modules/sos/presentation/sos-escalation-modal.tsx` — client mínimo
- `apps/web/modules/sos/presentation/sos-resolve-modal.tsx` — client mínimo
- `docs/implementation/2026-08-13-f4-07-pedidos-de-ajuda.md` (no Done)

### Pode editar

- `apps/web/app/(family)/familia/pedidos-de-ajuda/page.tsx` — substituir placeholder; orquestração RSC
- `apps/web/modules/sos/index.ts` — API pública estreita (substituir esqueleto)
- `apps/web/content/family.ts` — copy pedidos de ajuda, modais, erros, integração Hoje; remover placeholder do fluxo real
- `apps/web/content/family.test.ts` — smoke das novas chaves
- `apps/web/modules/accounts/application/onboarding-checklist.ts` — **somente** tarefa 2 (contagem ordem SOS)
- `apps/web/modules/accounts/application/get-hoje-dashboard.ts` — **somente** integrar snapshot SOS (Precisa de você, timeline, widget vazio, checklist)
- `docs/state/ATUAL.md`, `docs/state/PENDENCIAS.md`
- `specs/2026-08-13-f4-07-pedidos-de-ajuda.md` — somente campo status desta Spec

### Pode editar com cautela

- `apps/web/modules/accounts/presentation/family/hoje-maduro-view.tsx` — **somente** render de novos itens needs/timeline se view model exigir pequeno ajuste de props
- `apps/web/modules/accounts/presentation/family/primeiro-acesso-view.tsx` — **somente** widget pedidos de ajuda se necessário
- `apps/web/modules/accounts/presentation/family/hoje-timeline.tsx` — **somente** tipo de evento SOS se necessário
- `apps/web/lib/supabase/**` — **somente** se indispensável; diff mínimo

### Não pode editar nesta Spec

- `apps/web/app/(family)/layout.tsx` e componentes shell salvo copy/deep link documentado
- `apps/web/modules/accounts/**` salvo arquivos listados acima
- `apps/web/modules/accounts/domain/roles.ts` — **sem** alterar `can*` globais; regras SOS ficam no módulo `sos`
- `apps/web/modules/exams/**`, `location/**`, `billing/**`, `elder-access/**`, `agenda/**`, `medications/**`, `reminders/**`
- `apps/web/app/(marketing)/**`, `app/(elder)/**` salvo link stub documentado para teste idoso
- `apps/web/components/ui/**` salvo consumo de componentes existentes
- `.env*`, CI/CD, `AGENTS.md`, `docs/prd-mvp.md`, `docs/arquitetura-solucao.md`, `docs/SECURITY.md`
- Specs já aprovadas (F0–F3, F4.1–F4.6)
- `package.json` / lockfile
- Jobs Inngest / `api/inngest/**` — envio SOS fica fora; **não** criar job nesta subfase
- Outras rotas `/familia/*` salvo `pedidos-de-ajuda` e efeito indireto em `/familia` (Hoje)

---

## 8. Riscos e dúvidas abertas

- **SOS ≠ emergência pública** — autonomia `tight`; revisão humana obrigatória em copy, cor coral e checklist SECURITY antes do merge.
- **UI sem acionamento real até F5** — homologação FL-06 parcial com seed SQL documentado ou fixture controlado; **não** mock em produção.
- **Escalonamento 2 min** — UI mostra regra; timer e job Inngest **fora** desta Spec; registrar dívida explícita.
- **Notificações inventadas** — proibido preencher “WhatsApp lido” sem registro real; empty state honesto.
- **Visualizador e contato de emergência** — matriz PRD complexa; MVP: elegibilidade centralizada em domínio `sos` + testes; dúvidas escaladas ao humano no review.
- **Coordenadas / PHI em logs** — arredondar ou omitir lat/lng em Sentry; endereço ok na UI autorizada.
- **Concorrência na resolução** — optimistic lock ou checagem de status no update.
- **Homologação** — FL-06 parcial: disclaimer, ordem 2+ contatos, checklist Hoje, resolver seed, cuidadora resolve, admin reordena, acesso negado visualizador fora da ordem.
- **Dúvida fechada na Spec:** PDF download — **fora do MVP** nesta subfase (stub).
- **Dúvida fechada na Spec:** simular SOS pelo painel família — **fora**; teste via PWA F5 ou seed homologação.

### Segurança (`docs/SECURITY.md`) — itens aplicáveis

- **A01:** RLS por `account_id` + `care_recipient_id`; select alertas conforme papel; update ordem **só admin**; resolve **admin + cuidador**; insert alerta **somente** via caminho idoso/service (F5) — painel família **não** cria alerta real.
- **A03:** Zod em ordem (IDs de membro, posições), resolução (observação limitada), IDs de alerta; transições de status explícitas.
- **SOS:** disclaimer fixo; registro auditável; preparar campos para confirmação 2 etapas (F5); DND familiar ignorado **no job**, não nesta UI.
- **Audit:** `sos_config_updated`, `sos_resolved` com IDs — tabela `audit_log` se migration incluir, ou log estruturado mínimo no Done.
- **N/A:** uploads, Storage exames, geo completo, webhooks WA ativos, elder-access implementação, billing, OCR/LLM.

---

## 9. Aprovação humana

- Aprovado por:
- Data:
- Observações:

---

**Próximo passo após aprovação:** implementar somente o escopo desta Spec; atualizar `docs/state/ATUAL.md`; registrar Done em `docs/implementation/`.
