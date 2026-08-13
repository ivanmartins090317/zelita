# Spec: F4.5 — Consultas e tarefas

- Status: `approved`
- Data: 2026-08-13
- Autonomia: `medium` (módulo novo + schema/RLS; sem paths críticos SOS/billing/elder-access)
- Projeto: Zelita (`apps/web`)
- Pedido original: Plano aprovado em `docs/F4/plan.md` (subfase F4.5). Entregar a área **Consultas e tarefas** em alta fidelidade ao protótipo (`#v-agenda`, linhas ~1209–1232): grade da semana (remédios + consultas), card **Próximas consultas**, card **Tarefas da família**, modais de cadastro, persistência real e integração mínima com **Hoje** (timeline + **Precisa de você**).

## 1. Objetivo

Quem cuida abre **Consultas e tarefas** e vê, no layout do shell F4.1, a semana da pessoa cuidada em uma **grade** que combina horários de remédios (leitura do módulo de medicamentos) com **consultas e compromissos** cadastrados pela família — com o dia de hoje destacado e navegação entre semanas.

Abaixo da grade, dois cards lado a lado (empilhados no mobile): **Próximas consultas** lista compromissos futuros com local, horário, quem acompanha e observações de preparo (ex.: jejum); **Tarefas da família** lista o que falta fazer, com prazo e pessoa responsável. Quem administra ou cuida pode **adicionar** consultas e tarefas por modais dedicadas, **editar**, **cancelar** consultas e **concluir** tarefas.

Na rota **Hoje** (`/familia`, modo maduro), consultas do dia entram na **linha do tempo** e tarefas abertas relevantes aparecem em **Precisa de você** — substituindo os placeholders honestos da F4.2. Nenhum dado inventado: grade, listas e integrações refletem remédios, consultas e tarefas reais da conta.

## 2. Fora de escopo

- **Shell do painel** — sidebar, topbar, trial bar (F4.1)
- **Exames e receitas** (módulo F4.6) — “Coleta de sangue” nesta subfase é **tipo de consulta** cadastrada manualmente; **sem** vínculo com documentos/upload
- **Jobs Inngest** — lembrete automático de consulta por WhatsApp/voz, aviso “amanhã tem consulta”, envio de endereço ao acompanhante
- **Notificações transacionais** (e-mail/WA) sobre consultas ou tarefas — F4.9 / canais futuros
- **Sincronização com calendário externo** (Google, iCal)
- **Recorrência** de consultas ou tarefas (ex.: fisio toda quinta) — cada ocorrência é registro individual no MVP
- **Resumo semanal automático** — card em Hoje permanece “Em breve” (F4.2)
- **Badge numérico** na sidebar para Consultas — omitir (sem contador urgente)
- **Multi recipient por conta** — uma pessoa cuidada por conta (F4.1)
- **PWA idoso** — idoso **não** cadastra consultas; só consulta quando F5 entregar (fora desta Spec)
- **Alterar horários de remédio** a partir desta área — remédios são somente leitura na grade; edição continua em Remédios (F4.3)
- **Observações clínicas / care_notes** — PRD §4.4; fase futura
- **Gateway de pagamento**, Playwright, nova dependência npm
- **Alterar regras de domínio** de medicamentos (`pack-end`, lembretes)
- **Avisos** (feed F4.9) — eventos de consulta/tarefa **não** entram no histórico de avisos nesta subfase
- **Texto grande** no topbar (F5)

## 3. Atores e pré-condições

- Quem usa:
  - **Administradora** — grade, listas, adicionar/editar/cancelar consultas, adicionar/editar/concluir/reabrir tarefas.
  - **Cuidadora** — mesmas capacidades de coordenação (criar/editar consultas e tarefas, concluir qualquer tarefa aberta).
  - **Visualizadora** — grade e listas em **leitura**; **sem** botões de adicionar, editar, cancelar ou concluir.
  - **Contato de emergência** — **sem** acesso a esta área (matriz PRD §6: não vê rotina).
- O que precisa existir antes:
  - **F0** — tokens, `Card`, `Tag`, `ListRow`, `EmptyState`, `Button`, `Modal` (F4.1).
  - **F2** — sessão OTP, contexto de conta, cookie de conta preferida.
  - **F3** — conta + pessoa cuidada.
  - **F4.1** — layout, rota `/familia/consultas` placeholder substituída, copy base em `content/family.ts`.
  - **F4.2** — Hoje maduro, timeline, **Precisa de você**, botão “Ver semana” → `/familia/consultas`.
  - **F4.3** — remédios com horários para popular linhas da grade (conta sem remédios: grade mostra só consultas ou empty honesto).
  - **F4.4** — membros ativos da conta para atribuição de tarefas e “quem acompanha”.
  - Protótipo: `#v-agenda` (~1209–1232); timeline Hoje com consulta (~1107–1108); PRD §3.2 “Consultas e tarefas — lista leve”; PRD §4.4 entidades `tasks` / `appointments`.

## 4. Comportamento esperado (cenários)

Linguagem de domínio: o que a pessoa vê e faz — não como o sistema organiza arquivos.

### Estrutura geral da área

#### Cenário 1: Consultas e tarefas carrega dentro do shell (caminho feliz)

- Dado: familiar autenticada com conta completa e papel com acesso à rotina
- Quando: abre `/familia/consultas`
- Então: vê topbar F4.1 (“Consultas e tarefas” / “A semana dele e quem faz o quê”) + miolo da área — **sem** placeholder “em breve”

#### Cenário 2: Conta sem consultas nem tarefas (empty state parcial)

- Dado: nenhuma consulta futura nem tarefa aberta cadastrada; pode haver remédios
- Quando: abre Consultas e tarefas
- Então:
  - Card **Semana de {intervalo}** renderiza grade com remédios (se existirem) ou células vazias honestas
  - Card **Próximas consultas** com EmptyState curto + **+ Adicionar** (quem pode gerenciar)
  - Card **Tarefas da família** com EmptyState curto + **+ Adicionar** (quem pode gerenciar)
  - **Sem** linhas demo do protótipo

#### Cenário 3: Grade da semana com remédios (caminho feliz)

- Dado: remédios ativos com horários fixos (ex.: 08:00, 12:00, 20:00)
- Quando: olha o card **Semana de {intervalo}**
- Então:
  - Cabeçalho com título “Semana de {dia início} a {dia fim} de {mês}” e botões **‹ anterior** / **próxima ›**
  - Colunas: **Horário** + sete dias (abreviatura + número, ex.: “Dom 9”)
  - Linhas por horário com etiquetas de remédio (nome; combinações no mesmo horário unidas com “ + ”)
  - Coluna do **dia de hoje** com etiquetas coloridas (verde/info); demais dias com estilo neutro/atenuado
  - Células sem item: “—”

#### Cenário 4: Grade com remédios e consultas (caminho feliz)

- Dado: remédios nos horários usuais; consulta agendada hoje 15:00 “Dr. Aurélio”; fisioterapia quinta 15:00
- Quando: navega a semana correspondente
- Então:
  - Remédios aparecem nas linhas de horário conforme cenário 3
  - Consultas aparecem na linha do horário correspondente com etiqueta **âmbar/laranja** (compromisso, não remédio)
  - Dias sem consulta naquele horário: “—”
  - Hoje 15:00 mostra “Dr. Aurélio” colorido; outros dias no mesmo horário neutros ou com consulta daquele dia

#### Cenário 5: Navegar semanas (caminho feliz)

- Dado: área aberta na semana corrente
- Quando: toca **próxima ›** ou **‹ anterior**
- Então: título e colunas atualizam para a semana adjacente; consultas e remédios recalculados para o intervalo; URL reflete a semana visível (para compartilhar/recarregar)

#### Cenário 6: Sem remédios — grade só de consultas (borda)

- Dado: conta sem remédios cadastrados; ao menos uma consulta na semana
- Quando: abre a área
- Então: grade mostra **somente** linhas de horário onde há consultas (ou horários derivados das consultas da semana); **sem** slots falsos de remédio

### Próximas consultas

#### Cenário 7: Lista de consultas futuras (caminho feliz)

- Dado: três consultas futuras cadastradas (cardiologia hoje, fisioterapia quinta, coleta de sangue em data futura)
- Quando: olha card **Próximas consultas**
- Então: cada linha mostra:
  - Ícone conforme **tipo** (consulta médica, fisioterapia, exame/laboratório, outro)
  - Título principal (ex.: “Dr. Aurélio Campos · cardiologia” ou “Fisioterapia”)
  - Linha secundária com data/hora legível (ex.: “Hoje 15:00”, “Quinta 13/08, 15:00”) + local quando informado
  - Etiqueta opcional **quem acompanha** (ex.: “Ana acompanha”) quando membro designado
  - Etiqueta opcional de **preparo** (ex.: “Jejum de 12h”) quando observação de preparo preenchida
- E: ordenação cronológica ascendente; consultas **passadas** ou **canceladas** **não** aparecem aqui

#### Cenário 8: Abrir modal Nova consulta (caminho feliz)

- Dado: administradora ou cuidadora em Consultas e tarefas
- Quando: toca **+ Adicionar** em Próximas consultas
- Então: modal **Nova consulta** com campos:
  - **O que é** (obrigatório) — ex.: nome do médico ou “Fisioterapia”
  - **Especialidade ou tipo** (opcional) — ex.: cardiologia; ou seleção de tipo (consulta, fisioterapia, exame/laboratório, outro)
  - **Data e hora** (obrigatório)
  - **Local** (opcional) — clínica, endereço ou sala
  - **Quem acompanha** (opcional) — membro ativo da conta
  - **Observação de preparo** (opcional) — ex.: jejum, documentos
  - Ações **Cancelar** / **Salvar**

#### Cenário 9: Salvar consulta (caminho feliz)

- Dado: modal preenchida com título e data/hora futuras válidas
- Quando: toca **Salvar**
- Então: modal fecha; consulta aparece na lista e na grade da semana correta; `/familia` revalida (timeline Hoje se for hoje)

#### Cenário 10: Editar consulta (caminho feliz)

- Dado: consulta futura existente; quem pode gerenciar
- Quando: abre edição (ação na linha ou detalhe acordado na implementação)
- Então: modal com dados atuais; salvar atualiza lista e grade; cancelar descarta

#### Cenário 11: Cancelar consulta (caminho feliz)

- Dado: consulta futura; quem pode gerenciar
- Quando: confirma **Cancelar consulta**
- Então: consulta some de Próximas consultas e da grade; permanece registrada como cancelada para auditoria — **sem** excluir silenciosamente do histórico interno

#### Cenário 12: Validação de consulta (erro)

- Dado: modal aberta
- Quando: tenta salvar sem título, sem data/hora, ou data/hora inválida
- Então: mensagens claras no modal; nada persistido

#### Cenário 13: Acompanhante inválido (borda)

- Dado: membro selecionado foi removido ou inativo após abrir modal
- Quando: salva
- Então: mensagem pedindo escolher outro membro ou deixar em branco; **sem** salvar vínculo quebrado

### Tarefas da família

#### Cenário 14: Lista de tarefas abertas (caminho feliz)

- Dado: três tarefas abertas (comprar remédio, ligar convênio, levar na consulta)
- Quando: olha card **Tarefas da família**
- Então: cada linha mostra:
  - Ícone conforme **tipo** (compras, ligação, transporte/logística, outro)
  - Título (ex.: “Comprar Losartana”)
  - Linha secundária: prazo quando houver (ex.: “Até 25/08”) + **atribuída a {nome}** ou **atribuída a você** quando for a pessoa logada
  - Tarefas **concluídas** aparecem abaixo, atenuadas, ou em seção “Concluídas” — **não** misturadas como pendentes

#### Cenário 15: Abrir modal Nova tarefa (caminho feliz)

- Dado: quem pode gerenciar
- Quando: toca **+ Adicionar** em Tarefas da família
- Então: modal **Nova tarefa** com:
  - **O que fazer** (obrigatório)
  - **Tipo** (opcional) — compras, ligação, transporte, outro (define ícone)
  - **Prazo** (opcional) — data; **sem** hora obrigatória
  - **Atribuir a** (opcional) — membro ativo; vazio = “qualquer um da família”
  - **Vincular a consulta** (opcional) — consulta futura da mesma conta (ex.: “Levar na consulta de quinta”)
  - **Cancelar** / **Salvar**

#### Cenário 16: Salvar tarefa (caminho feliz)

- Dado: título preenchido
- Quando: salva
- Então: tarefa aparece na lista; se prazo é hoje ou vencido, pode aparecer em **Precisa de você** em Hoje; `/familia` revalida

#### Cenário 17: Concluir tarefa (caminho feliz)

- Dado: tarefa aberta; quem pode gerenciar **ou** pessoa **atribuída** à tarefa
- Quando: marca como concluída
- Então: tarefa move para concluídas/atenuada; some de **Precisa de você**; data de conclusão registrada

#### Cenário 18: Visualizadora tenta criar (erro)

- Dado: visualizadora autenticada
- Quando: inspeciona a área
- Então: **sem** botões **+ Adicionar**, editar ou concluir; tentativa via ação direta rejeitada no servidor com mensagem de permissão

#### Cenário 19: Tarefa sem prazo (borda)

- Dado: tarefa aberta sem data limite
- Quando: exibida na lista
- Então: linha secundária omite “Até …” e mostra só atribuição; **não** entra em **Precisa de você** por vencimento (pode entrar se atribuída ao usuário e regra MVP definir “tarefas suas abertas” — ver cenário 24)

#### Cenário 20: Reabrir tarefa concluída (borda)

- Dado: tarefa concluída por engano; quem pode gerenciar
- Quando: marca **Reabrir**
- Então: volta a aberta; reaparece nas listas pertinentes

### Integração com Hoje

#### Cenário 21: Consulta de hoje na timeline (caminho feliz)

- Dado: Hoje maduro; consulta hoje 15:00 com acompanhante Ana
- Quando: abre `/familia`
- Então: card **O dia de {apelido}** inclui item **previsto** às 15:00 — título da consulta (+ especialidade se houver); subtítulo “{nome} acompanha” e local quando existirem; estilo atenuado como horários futuros de remédio
- E: botão **Ver semana** continua → `/familia/consultas`

#### Cenário 22: Timeline sem consulta inventada (borda)

- Dado: nenhuma consulta hoje
- Quando: abre Hoje maduro
- Então: timeline **sem** item de consulta — comportamento F4.2 preservado para remédios

#### Cenário 23: Tarefa urgente em Precisa de você (caminho feliz)

- Dado: tarefa aberta com prazo **hoje** ou **vencido** (ex.: “Ligar para o convênio” até ontem)
- Quando: abre Hoje maduro
- Então: card **Precisa de você** inclui linha com título da tarefa, prazo legível e atribuição; ícone coerente com tipo; link ou ação rápida para ir a Consultas e tarefas
- E: tarefas de **comprar remédio** por cartela acabando **continuam** vindas do módulo de medicamentos (F4.2) — **ambas** podem coexistir

#### Cenário 24: Tarefa atribuída a você sem prazo (borda — MVP)

- Dado: tarefa aberta atribuída à pessoa logada; sem prazo
- Quando: abre Hoje maduro
- Então: **opcionalmente** uma linha em **Precisa de você** (“{título} · atribuída a você”) — **no máximo** 3 itens no card, medicamentos urgentes primeiro; se card ficar cheio, priorizar vencidas > hoje > atribuídas

#### Cenário 25: Precisa de você sem tarefas inventadas (borda)

- Dado: sem tarefas abertas relevantes e sem alertas de cartela
- Então: EmptyState F4.2 preservado

### Autorização, conta e falhas

#### Cenário 26: Conta pausada — mutações bloqueadas (borda)

- Dado: banner de conta pausada no shell
- Quando: tenta adicionar consulta, tarefa ou concluir tarefa
- Então: ação bloqueada com copy de conta pausada; leitura da grade e listas permitida

#### Cenário 27: Falha ao carregar agenda (erro)

- Dado: erro ao buscar consultas ou tarefas
- Então: mensagem genérica; shell intacto; recarregar como retry

#### Cenário 28: Leitura via caso de uso — sem consulta na page (caminho feliz técnico)

- Dado: implementação desta Spec
- Quando: inspeciona `app/(family)/familia/consultas/page.tsx`
- Então: page só orquestra RSC + repassa props; **nenhuma** consulta direta ao banco na page

#### Cenário 29: Deep link modal (caminho feliz)

- Dado: quem pode gerenciar
- Quando: abre `/familia/consultas?modal=consulta` ou `?modal=tarefa`
- Então: modal correspondente abre ao carregar

#### Cenário 30: Semana via URL (caminho feliz)

- Dado: link `/familia/consultas?semana=2026-08-09` (domingo da semana, formato acordado na implementação)
- Quando: abre
- Então: grade posicionada nessa semana; botões anterior/próxima ajustam a partir dela

#### Cenário 31: Mobile — grade rolável (caminho feliz)

- Dado: viewport estreita
- Quando: visualiza grade da semana
- Então: tabela/grille com scroll horizontal; coluna Horário fixa ou legível; touch targets ≥44px nos controles de semana

---

## 5. Regras de negócio

- **Escopo da conta:** consultas e tarefas pertencem à **pessoa cuidada** da conta ativa (MVP: uma por conta).
- **Fuso horário:** `America/Sao_Paulo` — mesmo padrão documentado em Hoje/remédios; datas “Hoje”/“Quinta” derivadas desse fuso.
- **Semana na grade:** intervalo **domingo a sábado** (fiel ao protótipo “Dom 9 … Qui 13”); semana corrente como padrão ao abrir.
- **Remédios na grade:** somente **leitura** via API do módulo de medicamentos; horários de cartelas ativas; combinar múltiplos remédios no mesmo slot com “ + ”.
- **Consultas na grade:** apenas status **agendada**; horário da coluna = hora local de início; duração não gera múltiplas células no MVP.
- **Destaque visual:** coluna do dia atual com etiquetas coloridas; outros dias atenuados — **sem** coral (reservado a SOS).
- **Próximas consultas:** `starts_at` ≥ agora (início do dia para passadas do mesmo dia já ocorridas); status agendada; limite razoável (ex.: 20) com ordenação ascendente.
- **Quem gerencia:** administradora e cuidadora — criar, editar, cancelar consultas; criar, editar, concluir, reabrir tarefas. Visualizadora: somente leitura. Authz **server-side** espelhando UI.
- **Concluir tarefa:** atribuído + admin + cuidadora.
- **Atribuição:** somente membros **ativos** da conta; rótulo “atribuída a você” quando `assignee` = perfil logado.
- **Acompanhante em consulta:** membro ativo opcional; etiqueta “{Nome curto} acompanha”.
- **Tipos visuais:** mapa fixo consulta/fisioterapia/exame/outro → ícone+cor de fundo do protótipo; tarefa compras/ligação/transporte/outro.
- **Vínculo tarefa ↔ consulta:** opcional; validar que consulta pertence à mesma pessoa cuidada e não está cancelada.
- **Cancelamento vs exclusão:** consultas **canceladas**, não apagadas; tarefas concluídas permanecem consultáveis na lista atenuada.
- **Integração Hoje:** estender agregador existente (`getHojeDashboard`) para injetar itens de timeline e **Precisa de você** — **sem** duplicar lógica de cartela acabando.
- **Server-first:** agregação no servidor; client mínimo (modais, navegação de semana, marcar tarefa, query params).
- **Copy:** textos novos em `content/family.ts` (seção `consultas`); reutilizar padrões de data relativa já usados no painel.
- **Revalidação:** após mutação, revalidar `/familia/consultas` e `/familia`.
- **LGPD / logs:** Sentry e logs só IDs + tipo de evento (`appointment_created`, `task_completed`); **não** logar endereço clínico ou observações de saúde completas.
- **Persistência:** migration aprovada nesta Spec cria armazenamento de consultas e tarefas com RLS por conta/pessoa cuidada.
- **Domínio puro testável:** montagem da grade semanal, rótulos de data (“Hoje”, “Quinta DD/MM”), merge remédio+consulta por célula, prioridade **Precisa de você** — Vitest ≥ 80% nas funções novas.
- **Arquivos ≤ ~300 linhas:** dividir grade, listas, modais, repos, casos de uso.

---

## 6. Critérios de Done desta feature

- [ ] Cenários 1–31 verificados (smoke manual via `manual-report`; FL-08 parcial para consultas/tarefas/semana)
- [ ] `pnpm typecheck` passa
- [ ] `pnpm lint` passa
- [ ] `pnpm test` passa — Vitest em funções puras novas (grade, datas, labels, prioridade needs) ≥ 80%; smoke `content/family.ts`
- [ ] `/familia/consultas` fiel ao protótipo — grade + Próximas consultas + Tarefas da família + modais
- [ ] CRUD mínimo de consultas (criar, editar, cancelar) e tarefas (criar, editar, concluir, reabrir) funcional
- [ ] Grade combina remédios reais + consultas reais; navegação de semana funcional
- [ ] Integração Hoje: timeline com consulta do dia (cenário 21); **Precisa de você** com tarefas vencidas/hoje (cenário 23)
- [ ] **Nenhuma** query inline em `page.tsx` — casos de uso + repositórios
- [ ] Migration + RLS de consultas/tarefas aplicadas no remoto (skill `supabase-migrations` ou equivalente documentado)
- [ ] Visualizadora sem CTAs de mutação; authz server-side em todas as mutações
- [ ] Copy 100% dos textos novos em `content/family.ts`
- [ ] Placeholder `consultas` removido do fluxo real da rota
- [ ] Checklist `docs/SECURITY.md` — A01 authz por papel; A03 validação server-side; RLS por conta + care_recipient; PHI: logs sem endereço/observação completos; N/A: Storage, webhooks WA, SOS, geo, elder-access, uploads
- [ ] `docs/state/ATUAL.md` e `docs/state/PENDENCIAS.md` atualizados; entrega em `docs/implementation/2026-08-13-f4-05-consultas-tarefas.md`
- [ ] Nenhuma dependência npm nova
- [ ] Reflexão curta sobre escalabilidade/manutenibilidade

---

## 7. Escopo de arquivos permitido

### Pode criar

- `supabase/migrations/006_agenda.sql` — consultas, tarefas, tipos/status, índices
- `supabase/policies/006_agenda_rls.sql` — ou policies no mesmo arquivo migration, conforme padrão do repo
- `apps/web/modules/agenda/domain/appointment-types.ts` — mapas de tipo/status (sem enum TS)
- `apps/web/modules/agenda/domain/appointment-types.test.ts`
- `apps/web/modules/agenda/domain/task-types.ts`
- `apps/web/modules/agenda/domain/task-types.test.ts`
- `apps/web/modules/agenda/domain/week-grid.ts` — merge remédios + consultas por célula
- `apps/web/modules/agenda/domain/week-grid.test.ts`
- `apps/web/modules/agenda/domain/agenda-labels.ts` — “Hoje”, “atribuída a você”, etc.
- `apps/web/modules/agenda/domain/agenda-labels.test.ts`
- `apps/web/modules/agenda/domain/needs-priority.ts` — ordenação Precisa de você
- `apps/web/modules/agenda/domain/needs-priority.test.ts`
- `apps/web/modules/agenda/infrastructure/appointment-repo.ts`
- `apps/web/modules/agenda/infrastructure/task-repo.ts`
- `apps/web/modules/agenda/application/get-consultas-page.ts` — agregador da rota
- `apps/web/modules/agenda/application/get-consultas-page.test.ts`
- `apps/web/modules/agenda/application/create-appointment.ts`
- `apps/web/modules/agenda/application/update-appointment.ts`
- `apps/web/modules/agenda/application/cancel-appointment.ts`
- `apps/web/modules/agenda/application/create-task.ts`
- `apps/web/modules/agenda/application/update-task.ts`
- `apps/web/modules/agenda/application/complete-task.ts`
- `apps/web/modules/agenda/application/reopen-task.ts`
- `apps/web/modules/agenda/application/get-today-agenda-snapshot.ts` — leitura para Hoje
- `apps/web/modules/agenda/application/can-manage-agenda.ts` — regra de papel (puras + testes)
- `apps/web/modules/agenda/presentation/consultas-page-view.tsx`
- `apps/web/modules/agenda/presentation/week-grid-card.tsx`
- `apps/web/modules/agenda/presentation/upcoming-appointments-card.tsx`
- `apps/web/modules/agenda/presentation/family-tasks-card.tsx`
- `apps/web/modules/agenda/presentation/appointment-modal.tsx` — client mínimo
- `apps/web/modules/agenda/presentation/task-modal.tsx` — client mínimo
- `apps/web/modules/agenda/index.ts` — API pública estreita
- `docs/implementation/2026-08-13-f4-05-consultas-tarefas.md` (no Done)

### Pode editar

- `apps/web/app/(family)/familia/consultas/page.tsx` — substituir placeholder; orquestração RSC
- `apps/web/content/family.ts` — copy consultas, modais, erros, timeline/needs
- `apps/web/content/family.test.ts` — smoke das novas chaves
- `apps/web/modules/accounts/application/get-hoje-dashboard.ts` — **somente** integrar snapshot de agenda (timeline + needs)
- `apps/web/modules/medications/application/get-hoje-medications.ts` — **somente** se necessário exportar horários para grade via agenda (preferir agenda chamar API pública de medications)
- `docs/state/ATUAL.md`, `docs/state/PENDENCIAS.md`
- `specs/2026-08-13-f4-05-consultas-tarefas.md` — somente campo status desta Spec

### Pode editar com cautela

- `apps/web/modules/medications/index.ts` — **somente** exportar leitura de horários semanais se ainda não existir na API pública
- `apps/web/modules/accounts/presentation/family/hoje-maduro-view.tsx` — **somente** render de novos itens needs/timeline se view model exigir pequeno ajuste de props
- `apps/web/lib/supabase/**` — **somente** se indispensável; diff mínimo

### Não pode editar nesta Spec

- `apps/web/app/(family)/layout.tsx` e componentes shell salvo links de copy
- `apps/web/modules/accounts/**` salvo `get-hoje-dashboard.ts` conforme acima
- `apps/web/modules/sos/**`, `billing/**`, `exams/**`, `location/**`, `elder-access/**`, `reminders/**`
- `apps/web/modules/accounts/domain/roles.ts` — **sem** alterar `can*` existentes; regra de agenda fica no módulo `agenda`
- `apps/web/app/(marketing)/**`, `app/(elder)/**`
- `apps/web/components/ui/**` salvo consumo de `Modal`, `Card`, `Tag`, `ListRow` existentes
- `.env*`, CI/CD, `AGENTS.md`, `docs/prd-mvp.md`, `docs/arquitetura-solucao.md`, `docs/SECURITY.md`
- Specs já aprovadas (F0–F3, F4.1–F4.4)
- `package.json` / lockfile
- Outras rotas `/familia/*` salvo `consultas` e efeito indireto em `/familia` (Hoje)

---

## 8. Riscos e dúvidas abertas

- **Complexidade da grade** — merge remédios (módulo existente) + consultas (novo) exige contrato claro entre módulos; preferir `agenda` orquestrando leitura via API pública de `medications`.
- **Performance da semana** — uma leitura agregada por página; evitar N+1; índices em `starts_at` e `due_at`.
- **Permissões PRD** — matriz §6 não lista CRUD de agenda explicitamente; esta Spec adota **ver rotina** = ver; **admin+cuidador** = gerenciar. Revisar na aprovação.
- **Conta pausada** — leitura ok; mutações bloqueadas (alinhado a Remédios/participantes).
- **Tarefas vs comprar remédio** — “Comprar Losartana” pode ser tarefa manual **ou** alerta automático de cartela; **não** deduplicar no MVP — ambos podem aparecer se existirem.
- **Horário de tarefa** — MVP: tarefas com **data** opcional, sem hora; grade **não** mostra tarefas (só remédios + consultas), fiel ao protótipo.
- **Segurança (`docs/SECURITY.md`):**
  - **A01:** RLS por `account_id` + `care_recipient_id`; mutações só admin/cuidador; leitura admin/cuidador/visualizador.
  - **A03:** validar datas, UUIDs de membro/consulta vinculada, status transitions no servidor.
  - **RLS:** insert/update/delete conforme papel; select para membros com acesso à rotina.
  - **PHI:** endereço clínico e preparo são sensíveis — ok na UI autorizada; logs sem texto completo.
  - **N/A:** Storage, geo, webhooks WA, SOS, elder-access, uploads, billing.
- **Homologação** — FL-08 parcial: cadastrar consulta, ver na grade, tarefa vencida em Hoje, visualizadora leitura, semana anterior/próxima.
- **Dúvida fechada na Spec:** recorrência e lembretes WA de consulta — **fora de escopo** (subfase futura).

---

## 9. Aprovação humana

- Aprovado por:
- Data:
- Observações:

---

**Próximo passo após aprovação:** implementar somente o escopo desta Spec; atualizar `docs/state/ATUAL.md`; registrar Done em `docs/implementation/`.
