# Spec: F4.2 — Primeiro acesso + Hoje maduro

- Status: `approved`
- Data: 2026-08-12
- Autonomia: `medium` (UI + leitura; sem path crítico de domínio sensível)
- Projeto: Zelita (`apps/web`)
- Pedido original: Plano aprovado em `docs/F4/plan.md` (subfase F4.2). Entregar as duas experiências de **Hoje** na mesma rota `/familia`: conta nova com checklist de onboarding e painel do dia maduro — alta fidelidade ao protótipo (`#v-primeiro`, `#v-hoje`, modal `m-bemvinda`), primitivo **Timeline**, leitura via repos (sem consultas inline na page).

## 1. Objetivo

Quem acabou de concluir o cadastro abre `/familia` e vê um **primeiro acesso** acolhedor: saudação personalizada, checklist de quatro tarefas com progresso, widgets laterais honestos sobre o que ainda está vazio, prévia da conversa de WhatsApp e modal de boas-vindas — tudo sem dados inventados.

Quando anota o primeiro remédio, a mesma rota passa a mostrar o **Hoje maduro**: quatro indicadores no topo, linha do tempo do dia, bloco “Sua central” com progresso das quatro tarefas, “Precisa de você” com alertas reais de cartela e seções futuras marcadas como “Em breve” ou omitidas quando não há dado.

A pessoa entende o dia da pessoa cuidada, sabe o que fazer a seguir e nunca confunde **lembrete enviado** com **medicamento tomado**.

## 2. Fora de escopo

- **Shell do painel** — sidebar, topbar, trial bar, seletor (F4.1, já entregue)
- **Modal de nova cartela** — botões “Fazer agora” / “Anotar remédio” navegam para `/familia/remedios` (F4.3)
- **Modais de convite e exame** — botões navegam para destinos placeholder ou área futura (F4.4, F4.6)
- **Tour interativo com spotlight** — modal oferece tour; acionar vai para `/familia/guia` (stub F4.1) ou fecha; tour real na F4.12
- **Dados reais de localização, SOS, avisos, consultas, exames, convites pendentes** — widgets usam estado vazio honesto ou contagem só quando o dado já existir no banco atual (ex.: membros da conta); integração completa nas subfases F4.4–F4.9
- **Resumo semanal automático** — card “Em breve” como no protótipo
- **Detecção de anomalia** — fora do MVP
- **Atividade recente da família** com eventos de convite, exame, observação de cuidador — MVP limitado a eventos de remédio já persistidos (`medication_events` + cadastro de cartela); demais tipos omitidos até subfases respectivas
- **Badge numérico na sidebar** — continua omitido (regra F4.1)
- **Migration / schema novo / RLS novo**
- **Reescrever** `/familia/remedios` (F4.3)
- **Jobs Inngest**, envio real de WhatsApp, PWA idoso
- **Nova dependência** npm
- **Alterar** peças F0 existentes salvo **criar** `timeline.tsx`
- **Texto grande** no topbar (F5)

## 3. Atores e pré-condições

- Quem usa:
  - **Familiar autenticada** (admin ou participante com permissão de ver rotina) — abre Hoje após cadastro ou no dia a dia.
  - **Visualizador** — vê Hoje maduro e checklist, sem CTAs de cadastro de remédio (botões omitidos conforme papel, como no shell F4.1).
- O que precisa existir antes:
  - **F0** — tokens, `Stat`, `Card`, `Tag`, `Note`, `EmptyState`, `ListRow`, `Progress`, `Modal`.
  - **F2** — sessão OTP, contexto de conta.
  - **F3** — cadastro cria conta + pessoa cuidada; redirect para `/familia`.
  - **F4.1** — layout compartilhado, copy base em `content/family.ts`, primitivo `Modal`.
  - Protótipo: `#v-primeiro` (linhas ~924–1019), `#v-hoje` (linhas ~1085–1146), `m-bemvinda` (~2460–2471).

## 4. Comportamento esperado (cenários)

Linguagem de domínio: o que a pessoa vê e faz — não como o sistema organiza arquivos.

### Heurística de qual view mostrar (regra central)

A rota permanece **`/familia`**. O título da topbar continua **Hoje** (mapa F4.1). O miolo alterna entre dois modos:

| Modo | Condição (heurística fechada) |
| --- | --- |
| **Primeiro acesso** | Não existe **nenhum remédio ativo** para a pessoa cuidada da conta |
| **Hoje maduro** | Existe **pelo menos um remédio ativo** |

Transição é **automática** ao salvar a primeira cartela (F4.3 usará a mesma heurística; nesta Spec basta que, após existir remédio ativo, o próximo carregamento de `/familia` mostre Hoje maduro).

O **checklist de quatro tarefas** aparece no primeiro acesso (card principal) e, no Hoje maduro, reaparece compacto em **Sua central** — progresso calculado pelas mesmas regras abaixo.

#### Regras de conclusão das quatro tarefas

| # | Tarefa (copy do protótipo) | Concluída quando |
| --- | --- | --- |
| 1 | Anote um remédio que ele toma | Existe ≥1 remédio **ativo** para a pessoa cuidada |
| 2 | Diga quem chamar numa emergência | **MVP F4.2:** nunca concluída automaticamente — copy honesta “Configure em Pedidos de ajuda”; link para `/familia/pedidos-de-ajuda`. Conclusão real na F4.7 |
| 3 | Chame um irmão ou a cuidadora | Existe ≥2 membros **ativos** na conta (gestor + outra pessoa). Convites pendentes **não** contam |
| 4 | Guarde um exame ou uma receita | **MVP F4.2:** nunca concluída automaticamente — link para `/familia/exames`. Conclusão real na F4.6 |

Progresso = tarefas concluídas ÷ 4 (mínimo 0%, máximo 100%). Etiqueta: “**X de 4 feitas**” / “**X de 4 prontas**” (primeiro acesso / Sua central).

---

### Primeiro acesso

#### Cenário 1: Conta nova sem remédio (caminho feliz)

- Dado: familiar acabou de concluir cadastro; nenhum remédio ativo
- Quando: abre `/familia`
- Então: vê layout do shell F4.1 + miolo de **primeiro acesso**:
  - Saudação “Bem-vinda, {nome}!” (ou “Bem-vindo” conforme copy neutra se nome ausente)
  - Texto explicando que a conta de **{apelido}** está criada e que a primeira tarefa leva ~40 segundos
  - Card **Comece por aqui** com barra de progresso, etiqueta “0 de 4 feitas” e as quatro tarefas numeradas com copy, tempo estimado e CTAs do protótipo
  - Rodapé do card: “Não precisa fazer as quatro hoje…”
  - Coluna direita: card tour, card **O que ainda está vazio**, card **Enquanto isso, {apelido}…** com balão de WhatsApp estático (copy, não conversa real)

#### Cenário 2: Modal de boas-vindas na primeira visita (caminho feliz)

- Dado: modo primeiro acesso; modal ainda não dispensado neste aparelho para esta conta
- Quando: a página termina de carregar
- Então: após breve atraso (~250 ms), abre Modal **Sua conta está pronta** (`m-bemvinda`): logo Zelita, menção aos dias grátis do trial, botão primário “Sim, me mostre o painel” (fecha modal → `/familia/guia`), secundário “Prefiro explorar sozinha” (só fecha), nota sobre botão 🎓 Tour
- E: copy do modal menciona “8 paradas” **somente se** alinhado ao guia F4.12 — **nesta Spec usar “tour de 1 minuto” sem número fixo** para não contradizer as 9 paradas do plano F4

#### Cenário 3: Modal não reaparece após dispensar (caminho feliz)

- Dado: familiar fechou o modal de boas-vindas (qualquer botão)
- Quando: recarrega `/familia` ou volta depois
- Então: modal **não** abre de novo neste aparelho para esta conta (preferência persistida no client — ex.: armazenamento local keyed por conta)

#### Cenário 4: Tarefa 1 — anotar remédio (caminho feliz)

- Dado: modo primeiro acesso; familiar **pode** gerenciar remédios
- Quando: toca “Fazer agora” na tarefa 1 (ou CTAs equivalentes)
- Então: navega para `/familia/remedios` — **sem** abrir modal de cartela nesta Spec

#### Cenário 5: Tarefas 2–4 — links honestos (caminho feliz)

- Dado: modo primeiro acesso
- Quando: toca CTAs das tarefas 2, 3 ou 4
- Então:
  - Tarefa 2 → `/familia/pedidos-de-ajuda` (placeholder F4.1)
  - Tarefa 3 → `/familia/participantes` (placeholder)
  - Tarefa 4 → `/familia/exames` (placeholder)
- E: widgets **O que ainda está vazio** refletem estado real parcial (ex.: “Nenhum anotado” em Remédios; “Só você seria avisada” se único membro)

#### Cenário 6: Card “O dia de {apelido}” vazio (caminho feliz)

- Dado: nenhum remédio ativo
- Quando: olha a coluna esquerda abaixo do checklist
- Então: EmptyState com ícone 💊, título “Nenhum remédio anotado ainda”, copy do protótipo e botão “Anotar o primeiro remédio” → `/familia/remedios`

#### Cenário 7: Card tour (caminho feliz)

- Dado: coluna direita do primeiro acesso
- Quando: toca “Fazer o tour de 1 minuto”
- Então: vai para `/familia/guia` (comportamento stub F4.1)
- Quando: toca “Prefiro ler no meu tempo”
- Então: idem, `/familia/guia`

#### Cenário 8: Visualizador no primeiro acesso (borda — papel)

- Dado: papel **sem** permissão de cadastrar cartelas
- Quando: vê checklist e empty states
- Então: botões “Fazer agora” / “Anotar” **omitidos**; copy orienta pedir ao administrador

#### Cenário 9: Conta pausada (borda)

- Dado: conta em status pausado (banner do shell F4.1)
- Quando: modo primeiro acesso
- Então: miolo renderiza normalmente; CTAs de cadastro desabilitados ou com mensagem de conta pausada — **sem** permitir nova cartela

---

### Hoje maduro

#### Cenário 10: Transição após primeiro remédio (caminho feliz)

- Dado: familiar cadastrou ao menos um remédio ativo (via fluxo existente em Remédios)
- Quando: abre `/familia`
- Então: vê **Hoje maduro** — **não** o layout de primeiro acesso; modal de boas-vindas segue regra de dispensado (não reabre se já fechado)

#### Cenário 11: Saudação e contexto do dia (caminho feliz)

- Dado: Hoje maduro; data atual conhecida
- Quando: olha o topo do miolo
- Então: “Bom dia/tarde/noite, {nome}” conforme horário local do servidor (faixas: manhã <12h, tarde <18h, noite); linha secundária com dia da semana, data por extenso e frase de urgência derivada dos dados (ex.: “nada urgente com {apelido} agora” se nenhum alerta de cartela; se houver, copy âmbar honesta)

#### Cenário 12: Quatro indicadores (Stat) — caminho feliz com remédios

- Dado: remédios ativos com horários e cartelas
- Quando: olha a grade de quatro stats
- Então:
  1. **Próximo remédio** — horário do próximo lembrete previsto hoje (ou amanhã se todos passaram); nome + dosagem; hint “daqui a XhYm” quando aplicável
  2. **Remédio acabando** — contagem de cartelas em alerta (regra de domínio `shouldWarnRefill` já existente); hint com nome do remédio mais urgente
  3. **Onde ele está** — copy honesta **sem dado geo**: “Em breve” ou “—” + hint “Disponível após autorização” + link opcional para `/familia/localizacao` — **sem** inventar “Em casa”
  4. **Avisos para ver** — copy honesta **sem módulo de avisos**: “0” ou “—” + hint “Histórico em breve” — **sem** número demo “3”

#### Cenário 13: Nota lembrete ≠ tomada (caminho feliz)

- Dado: Hoje maduro
- Quando: lê abaixo dos stats
- Então: bloco Note (🛡) com copy do protótipo: Zelita nunca diz que tomou; só confirmação humana altera isso

#### Cenário 14: Linha do tempo do dia (caminho feliz)

- Dado: remédios com horários hoje; eventos de remédio registrados hoje quando existirem
- Quando: olha card **O dia de {apelido}**
- Então: Timeline ordenada cronologicamente com itens:
  - **Concluído** — horários passados com evento `reminder_sent` hoje: “{medicamento} — lembrete enviado no WhatsApp”; subtítulo “tomada não confirmada” salvo evento `manual_confirmation`
  - **Previsto** — horários futuros hoje: opacidade reduzida, “lembrete será enviado”
  - **Alerta cartela** — cartelas em `shouldWarnRefill`: item destacado âmbar “{medicamento} deve acabar em N dias” + link “anotar a nova caixa” → `/familia/remedios`
- E: botão “Ver semana” → `/familia/consultas` (placeholder)
- E: **sem** itens de consulta ou localização inventados — só entram quando módulos existirem (F4.5, F4.8)

#### Cenário 15: Timeline vazia parcial (borda)

- Dado: remédio “se necessário” sem horário fixo
- Quando: monta timeline
- Então: remédio **não** gera slot horário; pode aparecer em “Precisa de você” se cartela acabando

#### Cenário 16: Sua central (caminho feliz)

- Dado: Hoje maduro
- Quando: olha coluna direita
- Então: card **Sua central** com barra de progresso (X/4), lista das quatro áreas com ✓ ou ○ conforme regras de conclusão, copy de rodapé do protótipo; botão “🎓 Rever o tour” → `/familia/guia`; etiqueta “X de 4 prontas”

#### Cenário 17: Precisa de você (caminho feliz)

- Dado: ao menos uma cartela em alerta de reposição
- Quando: olha card **Precisa de você**
- Então: item “Comprar {medicamento}” com datas de fim e “compre até” derivadas do domínio de cartela
- E: **sem** itens fake de exame sem categoria ou convite pendente — omitir até F4.6/F4.4

#### Cenário 18: Precisa de você vazio (borda)

- Dado: nenhum alerta de cartela; tarefas 2 e 4 não concluídas
- Então: EmptyState curto ou uma linha orientando completar checklist — **sem** lista inventada

#### Cenário 19: Resumo da semana (caminho feliz — stub)

- Dado: Hoje maduro
- Quando: olha card **Resumo da semana**
- Então: copy “Em breve” do protótipo; etiqueta `Em breve`; **sem** gerar resumo

#### Cenário 20: Atividade recente da família (caminho feliz — MVP)

- Dado: eventos de remédio ou cadastro recente na conta
- Quando: olha card inferior
- Então: até **5** entradas reais derivadas de `medication_events` (tipos relevantes: lembrete, aviso de cartela, confirmação manual) + evento sintético honesto “Você anotou {medicamento}” quando aplicável — com iniciais, papel quando conhecido, data relativa
- E: **sem** “Ana registrou observação” ou “Marcelo convidado” até módulos existirem

#### Cenário 21: Atividade recente vazia (borda)

- Dado: conta com remédio recém-criado sem eventos ainda
- Então: mensagem honesta “Nada registrado ainda hoje” ou omitir card se vazio total

---

### Dados, erros e bordas transversais

#### Cenário 22: Leitura via caso de uso — sem consulta na page (caminho feliz técnico)

- Dado: implementação desta Spec
- Quando: inspeciona `app/(family)/familia/page.tsx`
- Então: page só orquestra RSC + repassa props; **nenhuma** consulta direta ao banco na page — leitura encapsulada em repos + caso de uso (`get-hoje-dashboard` ou equivalente)

#### Cenário 23: Falha ao carregar dados (erro)

- Dado: erro de rede ou banco ao montar Hoje
- Quando: familiar abre `/familia`
- Então: mensagem genérica com o que fazer (tentar de novo); shell permanece; **sem** stack trace; **sem** vazar IDs internos

#### Cenário 24: Sem sessão ou cadastro incompleto (borda)

- Dado: visitante anônimo ou conta sem pessoa cuidada
- Quando: tenta `/familia`
- Então: comportamento existente (redirect Entrar / Cadastro) — miolo F4.2 **não** renderiza

#### Cenário 25: WhatsApp em modo seco (borda)

- Dado: variáveis WhatsApp ausentes (dev)
- Quando: Hoje maduro ou primeiro acesso
- Então: nota âmbar existente pode permanecer **uma vez** no miolo ou ser centralizada — **sem** afirmar que mensagem foi enviada na timeline se não houve evento

#### Cenário 26: Múltiplas contas (borda)

- Dado: familiar troca conta no shell
- Quando: volta a `/familia`
- Então: heurística e checklist recalculados para a **conta ativa**; preferência de modal de boas-vindas **por conta**

#### Cenário 27: Primitivo Timeline reutilizável (caminho feliz técnico)

- Dado: componente Timeline entregue
- Quando: fases futuras (SOS F4.7, Avisos F4.9) precisarem de linha do tempo
- Então: API estável: lista de itens com horário, título, subtítulo opcional, variante (`default` | `muted` | `warning`); acessível (lista semântica ou equivalente)

---

## 5. Regras de negócio

- **Uma rota, duas views:** `/familia` only; alternância por heurística de remédio ativo (§4).
- **Checklist persistente:** mesmas quatro tarefas e mesmas regras de conclusão nos dois modos; tarefas 2 e 4 ficam manualmente incompletas até F4.7/F4.6.
- **Sem mock em dev/prod:** stats, timeline e widgets **nunca** exibem números ou eventos de demonstração; omitir ou “Em breve” / “0” / “—”.
- **Lembrete ≠ tomada:** copy obrigatória no Hoje maduro; timeline usa “lembrete enviado” / “tomada não confirmada” salvo confirmação manual.
- **Coral:** só emergência — alertas de cartela usam âmbar, não coral.
- **Server-first:** dados agregados no servidor; client mínimo (modal boas-vindas + dismiss local).
- **Papéis:** quem não administra remédios não vê CTAs de cadastro.
- **Copy:** textos novos em `content/family.ts` (checklist, saudações, modal, timeline labels, empty states, stats fallback).
- **Domínio puro testável:** cálculo de progresso do checklist, próximo horário do dia, ordenação da timeline, saudação por hora — funções puras com Vitest ≥ 80%.
- **Arquivos ≤ ~300 linhas:** dividir views (`primeiro-acesso-view`, `hoje-maduro-view`, `welcome-modal`, timeline).
- **Fuso horário:** horários de remédio e “hoje” usam timezone da conta/pessoa cuidada se já existir no cadastro; senão `America/Sao_Paulo` como fallback documentado no código.

## 6. Critérios de Done desta feature

- [ ] Cenários 1–27 verificados (smoke manual documentado via `manual-report` — replanejar FL-02/03 conforme `docs/F4/plan.md`)
- [ ] `pnpm typecheck` passa
- [ ] `pnpm lint` passa
- [ ] `pnpm test` passa — Vitest em funções puras (checklist, heurística primeiro acesso, timeline sort, saudação, stats derivados) ≥ 80% onde aplicável; smoke de `content/family.ts`
- [ ] `/familia` alterna primeiro acesso ↔ Hoje maduro pela heurística fechada
- [ ] Checklist 4 tarefas + progresso + Sua central conforme regras §4
- [ ] Modal boas-vindas (`m-bemvinda`) com dismiss persistente por conta/aparelho
- [ ] Quatro Stats no Hoje maduro com dados reais de remédio e fallbacks honestos para geo/avisos
- [ ] Timeline do dia com primitivo `components/ui/timeline.tsx`
- [ ] Card Precisa de você com alertas reais de cartela apenas
- [ ] Resumo da semana e itens não implementados marcados “Em breve” ou omitidos
- [ ] **Nenhuma** query inline em `page.tsx` — repos em `infrastructure/`
- [ ] Copy 100% dos textos novos em `content/family.ts`
- [ ] Peças F0 + Modal F4.1 consumidas; tokens sem valores crus locais
- [ ] Checklist aplicável de `docs/SECURITY.md` — A01 authz via contexto existente, A03 N/A (sem mutação nova), PHI: não logar nomes de remédio no Sentry (IDs + tipo); itens N/A justificados
- [ ] `docs/state/ATUAL.md` e `docs/state/PENDENCIAS.md` atualizados; entrega em `docs/implementation/2026-08-12-f4-02-hoje-primeiro-acesso.md`
- [ ] Nenhuma migration; nenhuma dependência nova
- [ ] Reflexão curta sobre escalabilidade/manutenibilidade do caso de uso agregador de Hoje

## 7. Escopo de arquivos permitido

### Pode criar

- `apps/web/components/ui/timeline.tsx` — primitivo Timeline
- `apps/web/components/ui/timeline.test.tsx` — smoke/a11y básico se aplicável
- `apps/web/modules/medications/infrastructure/medication-read-repo.ts` — leitura de remédios, cartelas, horários, eventos do dia
- `apps/web/modules/medications/application/get-hoje-medications.ts` — caso de uso / agregação para Hoje (ou nome equivalente)
- `apps/web/modules/medications/application/get-hoje-medications.test.ts`
- `apps/web/modules/medications/domain/hoje-timeline.ts` — regras puras timeline + próximo horário
- `apps/web/modules/medications/domain/hoje-timeline.test.ts`
- `apps/web/modules/accounts/application/onboarding-checklist.ts` — regras puras das 4 tarefas + progresso
- `apps/web/modules/accounts/application/onboarding-checklist.test.ts`
- `apps/web/modules/accounts/application/get-hoje-dashboard.ts` — orquestra contexto + meds + checklist
- `apps/web/modules/accounts/presentation/family/primeiro-acesso-view.tsx`
- `apps/web/modules/accounts/presentation/family/hoje-maduro-view.tsx`
- `apps/web/modules/accounts/presentation/family/welcome-modal.tsx` — client mínimo
- `apps/web/modules/accounts/presentation/family/hoje-stats.tsx`
- `apps/web/modules/accounts/presentation/family/hoje-checklist-card.tsx`
- `apps/web/modules/accounts/presentation/family/hoje-activity-feed.tsx`
- `docs/implementation/2026-08-12-f4-02-hoje-primeiro-acesso.md` (no Done)

### Pode editar

- `apps/web/app/(family)/familia/page.tsx` — substituir miolo legado; remover queries inline
- `apps/web/content/family.ts` — copy Hoje / primeiro acesso / modal / checklist
- `apps/web/content/family.test.ts` — smoke das novas chaves
- `apps/web/modules/medications/index.ts` — exportar leitura pública se necessário
- `apps/web/modules/accounts/index.ts` — exportar `getHojeDashboard` ou API pública estreita
- `docs/state/ATUAL.md`, `docs/state/PENDENCIAS.md`
- `specs/2026-08-12-f4-02-hoje-primeiro-acesso.md` — somente campo status desta Spec

### Pode editar com cautela (path crítico — diff revisado)

- `apps/web/modules/accounts/application/family-context.ts` — **somente** se precisar estender leitura (ex.: contagem de membros) **sem** alterar contrato quebrando F4.1
- `apps/web/modules/accounts/application/shell-context.ts` — **preferir não tocar**; dados de Hoje via caso de uso separado

### Não pode editar nesta Spec

- `apps/web/app/(family)/layout.tsx` e componentes shell F4.1 (`family-sidebar`, `family-topbar`, …) — salvo import de tipos
- `apps/web/app/(family)/familia/remedios/**` e demais rotas placeholder
- `apps/web/modules/medications/application/medication-actions.ts`, `domain/pack-end.ts` — salvo **import** de funções existentes; **sem** alterar regras de cartela
- `apps/web/modules/medications/presentation/**`
- `supabase/migrations/**`, `supabase/policies/**`
- `apps/web/modules/sos/**`, `billing/**`, `exams/**`, `location/**`, `elder-access/**`, `reminders/**` (salvo tipos públicos já exportados)
- `apps/web/app/(auth)/**`, `app/(marketing)/**`, `app/(elder)/**`
- `apps/web/components/ui/**` salvo **criar** `timeline.tsx`
- `apps/web/lib/supabase/**` — consultas só dentro de `infrastructure/` dos módulos
- `.env*`, CI/CD, `AGENTS.md`, PRD, arquitetura, `SECURITY.md`
- Specs aprovadas F0–F4.1
- `package.json` / lockfile

## 8. Riscos e dúvidas abertas

- **Heurística binária (0 vs ≥1 remédio)** — simples e alinhada ao protótipo; contas que importarem remédios depois sempre verão Hoje maduro. Revisitar se produto quiser “primeiro acesso” até 4/4 (adiaria stats por meses).
- **Tarefas 2 e 4 sempre incompletas no MVP** — Sua central nunca chega a 100% até F4.6/F4.7; copy deve comunicar que é esperado.
- **Timeline sem eventos reais em dev** — Inngest/WhatsApp ausentes: timeline mostra só slots **previstos**; honesto.
- **Atividade recente limitada** — pode parecer “vazia”; preferir poucos itens reais a mocks.
- **Modal boas-vindas vs tour** — número de paradas do tour diverge no protótipo (8) vs plano (9); Spec evita número fixo até F4.12.
- **Homologação F2/F3 pendente** — registrar dependência; FL-02 pode rodar em paralelo após esta entrega.
- **Segurança (`docs/SECURITY.md`):**
  - **A01:** dashboard só para membership ativa + `care_recipient_id` da conta; repos filtram por recipient da sessão.
  - **A03:** leitura only — validação de ownership via RLS Supabase + contexto server-side.
  - **PHI:** não logar nomes de medicamentos/eventos no Sentry; IDs + tipo de agregação.
  - **N/A:** uploads, SOS, geo, webhooks, Storage, mutações novas.
- **Dúvidas fechadas nesta Spec:** mesma rota; geo/avisos honestos; checklist 4 itens do protótipo; repos obrigatórios; autonomia `medium`.

## 9. Aprovação humana

- Aprovado por:
- Data:
- Observações:

---

**Aguardando aprovação explícita desta Spec antes de qualquer implementação.**
