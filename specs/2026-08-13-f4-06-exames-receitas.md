# Spec: F4.6 — Exames e receitas

- Status: `approved`
- Data: 2026-08-13
- Autonomia: `tight` (PHI, armazenamento privado, autorização por item, paths críticos `exams` + schema/RLS/Storage)
- Projeto: Zelita (`apps/web`)
- Pedido original: Plano aprovado em `docs/F4/plan.md` (subfase F4.6). Entregar a área **Exames e receitas** em alta fidelidade ao protótipo (`#v-exames`, modal `m-exame`, linhas ~1376–1420 e ~2500–2517): busca, filtros por categoria, tabela de documentos, detalhe com pré-visualização, upload com escolha de quem pode ver, download e compartilhamento temporário — **sem** leitura automática (OCR/IA).

## 1. Objetivo

Quem administra a conta abre **Exames e receitas** e vê, no layout do shell F4.1, os documentos de saúde da pessoa cuidada — exames em PDF ou foto, receitas médicas — organizados em uma **tabela** com busca, filtros por categoria e indicação de **quem pode ver** cada item.

A administradora pode **adicionar** um documento (arrastar ou escolher arquivo), preencher nome, data, médico/clínica, categoria e observações, e definir **quais membros da família** além dela mesma podem abrir aquele arquivo. Pode **editar metadados**, **excluir** documentos, **baixar** o arquivo original e gerar um **link temporário** para compartilhar com quem está fora da conta (ex.: médico na consulta).

Cuidadoras e visualizadoras **só veem** os documentos para os quais foram autorizadas; administradoras **sempre** veem todos. Ao selecionar um item na tabela, o painel de **detalhe** mostra pré-visualização (PDF ou imagem), metadados completos e ações de baixar/compartilhar. Um card honesto **Leitura automática** explica que extração de dados por IA fica para depois do MVP.

Integração mínima com **Hoje**: a tarefa 4 do checklist (“Guarde um exame ou uma receita”) conclui quando existir ao menos um documento; o widget **Sua central** mostra contagem real; **Precisa de você** alerta sobre exames **sem categoria** definida. Nenhum dado inventado.

## 2. Fora de escopo

- **Shell do painel** — sidebar, topbar, trial bar (F4.1); botão **+ Exame** da topbar abre a mesma modal desta área via deep link
- **Leitura automática / OCR / IA clínica** — card “Depois do MVP” fiel ao protótipo; **não** extrair data, tipo ou resultado do arquivo
- **Interpretação clínica** — nunca sugerir diagnóstico, medicação ou leitura de valores
- **Antivírus de terceiros** — validação server-side de tipo e tamanho conforme `docs/SECURITY.md`; scan AV dedicado fica fora do MVP
- **Jobs Inngest** — aviso “exame novo”, lembrete “levar na consulta”, resumo semanal com exames
- **Feed de Avisos (F4.9)** — eventos de upload/exclusão **não** entram no histórico de avisos nesta subfase
- **Atividade recente da família** em Hoje — omitir linha “Você adicionou o exame …” até F4.9 ou subfase que agregar
- **Visão cuidador dedicada** (app/tab cuidador do protótipo) — F5+; aqui só regras de visibilidade no painel família
- **PWA do idoso** — idoso **não** acessa exames (F5)
- **Meu plano — barra de uso de armazenamento** completa — F4.11; nesta subfase **bloquear upload** ao estourar cota e mensagem clara; exibir uso parcial opcional na área se trivial
- **Gateway de pagamento**, Playwright, nova dependência npm (visualizador PDF nativo do browser / `<img>` / `<iframe>` sandbox)
- **Multi recipient por conta** — uma pessoa cuidada por conta (F4.1)
- **Vínculo exame ↔ consulta** da agenda — cadastros independentes no MVP
- **Badge numérico** na sidebar — omitir
- **Exportar/excluir conta (LGPD)** — F5-03
- **Alterar matriz global de papéis** — UI de Quem participa (F4.4) permanece; aqui só autorização **por documento**
- **Texto grande** no topbar (F5)

## 3. Atores e pré-condições

- Quem usa:
  - **Administradora** — listar (todos), buscar, filtrar, adicionar, editar metadados, excluir, baixar, compartilhar link temporário, definir quem vê cada documento.
  - **Cuidadora** — listar e abrir **somente** documentos autorizados; baixar os autorizados; **sem** adicionar, editar, excluir ou compartilhar.
  - **Visualizadora** — mesmas regras da cuidadora (leitura autorizada).
  - **Contato de emergência** — **sem** acesso a esta área (matriz PRD §6).
- O que precisa existir antes:
  - **F0** — tokens, `Card`, `Tag`, `ListRow`, `EmptyState`, `Button`, `Modal` (F4.1).
  - **F2** — sessão OTP, contexto de conta, cookie de conta preferida.
  - **F3** — conta + pessoa cuidada.
  - **F4.1** — layout, rota `/familia/exames` placeholder substituída, copy base em `content/family.ts`.
  - **F4.2** — Hoje maduro, checklist tarefa 4, widgets **Sua central** e **Precisa de você** (integração nesta Spec).
  - **F4.4** — membros ativos da conta para chips “Quem pode ver”.
  - Protótipo: `#v-exames` (~1376–1420), `m-exame` (~2500–2517); PRD §4.4 entidades de documentos; PRD §6 “Ver exames” / “Enviar e excluir exames”; `docs/SECURITY.md` § Upload de exames.

## 4. Comportamento esperado (cenários)

Linguagem de domínio: o que a pessoa vê e faz — não como o sistema organiza arquivos.

### Estrutura geral da área

#### Cenário 1: Exames e receitas carrega dentro do shell (caminho feliz)

- Dado: familiar autenticada com conta completa e papel com acesso à rotina
- Quando: abre `/familia/exames`
- Então: vê topbar F4.1 (“Exames e receitas” / “Guarde aqui e ache na hora da consulta”) + miolo da área — **sem** placeholder “em breve”

#### Cenário 2: Conta sem documentos (empty state)

- Dado: nenhum exame ou receita cadastrado
- Quando: abre Exames e receitas
- Então:
  - Card principal com campo de busca e filtros visíveis, tabela vazia com EmptyState curto
  - Botão **+ Adicionar exame** (administradora)
  - Grid inferior: card de detalhe vazio ou mensagem “Selecione um exame na lista” + card **Leitura automática** com etiqueta **Depois do MVP**
  - **Sem** linhas demo do protótipo

#### Cenário 3: Lista com documentos (caminho feliz)

- Dado: cinco documentos cadastrados (hemograma, ECG, raio-X, receita, glicemia) conforme protótipo
- Quando: abre a área
- Então: tabela com colunas **Exame**, **Data**, **Médico / clínica**, **Categoria**, **Quem vê**, ação **Abrir**
- E: cada linha mostra título em negrito, linha secundária com nome do arquivo + tamanho legível (ex.: “hemograma-02-08.pdf · 1,2 MB”)
- E: ordenação padrão por **data do exame** decrescente (mais recente primeiro)

### Busca e filtros

#### Cenário 4: Buscar por texto (caminho feliz)

- Dado: documentos variados na lista
- Quando: digita “hemograma” ou “Aurélio” ou “02/08” no campo de busca
- Então: tabela filtra em tempo real (debounce) por título, médico/clínica, nome do arquivo ou data — **somente** entre documentos que a pessoa **pode ver**

#### Cenário 5: Filtrar por categoria (caminho feliz)

- Dado: documentos em categorias Sangue, Imagem, Cardiologia, Receitas
- Quando: toca chip **Sangue** (ou Imagem, Cardiologia, Receitas)
- Então: lista mostra só itens da categoria; chip ativo destacado; **Todos** restaura lista completa
- E: documentos **sem categoria** aparecem só em **Todos** e com etiqueta **Sem categoria** / **Definir categoria** no detalhe

#### Cenário 6: Busca sem resultado (borda)

- Dado: termo que não corresponde a nenhum documento visível
- Quando: busca
- Então: EmptyState “Nenhum exame encontrado” + sugestão de limpar busca ou mudar filtro

### Detalhe e pré-visualização

#### Cenário 7: Selecionar documento na tabela (caminho feliz)

- Dado: lista com hemograma selecionável
- Quando: toca linha ou **Abrir**
- Então: card de detalhe atualiza para **{título} · {data}** com:
  - Área de **pré-visualização** — PDF embutido ou imagem conforme tipo
  - Tabela de metadados: Nome, Data do exame, Médico/clínica, Categoria, Observações, Adicionado por · data/hora
  - Botões **Baixar** e **Compartilhar** (administradora)

#### Cenário 8: Pré-visualização de imagem (caminho feliz)

- Dado: documento JPG/PNG/WebP
- Quando: abre detalhe
- Então: imagem renderizada na área tracejada do protótipo; alt text com título do exame

#### Cenário 9: Pré-visualização de PDF (caminho feliz)

- Dado: documento PDF
- Quando: abre detalhe
- Então: visualização embutida (iframe/object) ou fallback “Abrir em nova aba” se browser não renderizar inline — **sem** baixar automaticamente

#### Cenário 10: Categoria pendente no detalhe (borda)

- Dado: documento salvo sem categoria
- Quando: abre detalhe
- Então: etiqueta **Definir categoria** / **Sem categoria** (âmbar) fiel ao protótipo; administradora pode editar e salvar categoria

#### Cenário 11: Card Leitura automática (caminho feliz — stub)

- Dado: qualquer estado da área
- Quando: olha coluna direita inferior
- Então: card **Leitura automática** com copy do protótipo explicando extração futura de data/tipo + aviso **O que ela nunca vai fazer** (interpretar resultado, diagnóstico, medicação)
- E: etiqueta **Depois do MVP** — **sem** botão funcional de processar

### Adicionar exame (upload)

#### Cenário 12: Abrir modal Adicionar exame (caminho feliz)

- Dado: administradora em Exames e receitas (ou topbar **+ Exame**)
- Quando: toca **+ Adicionar exame**
- Então: modal **Adicionar exame** com:
  - Zona de arrastar/soltar + botão escolher arquivo
  - Copy “Foto pelo celular também funciona · até 25 MB”
  - Campos: **Nome do exame**, **Data do exame**, **Médico ou clínica**, **Categoria** (Sangue, Imagem, Cardiologia, Receitas, Outros), **Observações**, **Quem pode ver** (chips por membro ativo com acesso ao painel)
  - Ações **Cancelar** / **Salvar exame**

#### Cenário 13: Enviar arquivo válido (caminho feliz)

- Dado: PDF ou imagem ≤ 25 MB, tipo permitido
- Quando: seleciona arquivo
- Então: feedback de progresso (nome do arquivo, “Enviando…” / “Envio concluído”); campos habilitados para preenchimento antes ou depois do upload conforme UX acordada — **metadados só persistem ao Salvar**

#### Cenário 14: Salvar exame completo (caminho feliz)

- Dado: arquivo enviado; nome e data preenchidos
- Quando: toca **Salvar exame**
- Então: modal fecha; novo item na tabela; detalhe seleciona o item; `/familia` revalida (checklist, Sua central, Precisa de você)

#### Cenário 15: Quem pode ver — padrão e chips (caminho feliz)

- Dado: modal aberta; membros Ana (cuidadora), Paula (visualizadora), Marcelo (admin pendente **não** listado como ativo)
- Quando: observa **Quem pode ver**
- Então:
  - **Administradoras ativas** sempre têm acesso — chip implícito, **não** desligável
  - Chips toggláveis para cada membro **ativo** elegível (cuidador, visualizador, outro admin)
  - Coluna **Quem vê** na tabela resume: “Família” quando só admins; “Família + {nome}” quando membros extras marcados — rótulo legível, fiel ao protótipo

#### Cenário 16: Validação de upload — tipo inválido (erro)

- Dado: arquivo .exe, .docx ou tipo não permitido
- Quando: tenta enviar
- Então: mensagem clara (“Use PDF ou foto (JPG, PNG, WebP)”); nada persistido

#### Cenário 17: Validação de upload — tamanho (erro)

- Dado: arquivo > 25 MB
- Quando: tenta enviar
- Então: mensagem com limite; nada persistido

#### Cenário 18: Cota de armazenamento estourada (erro)

- Dado: conta no limite do plano (Essencial 2 GB / Cuidado+ 20 GB — PRD §8)
- Quando: administradora tenta novo upload
- Então: bloqueio com copy explicando cota e sugerindo excluir arquivos ou aguardar Meu plano (F4.11); **sem** upload parcial órfão

#### Cenário 19: Salvar sem nome ou data (erro)

- Dado: arquivo enviado; nome ou data vazios
- Quando: salva
- Então: mensagens no modal; metadados não gravados (arquivo órfão removido ou reutilizado na mesma sessão de modal — implementação deve evitar lixo no armazenamento)

#### Cenário 20: Conta pausada — upload bloqueado (borda)

- Dado: banner de conta pausada
- Quando: tenta adicionar ou excluir
- Então: mutação bloqueada com copy de conta pausada; leitura de documentos já autorizados permitida

### Editar, excluir, baixar

#### Cenário 21: Editar metadados (caminho feliz)

- Dado: documento existente; administradora
- Quando: edita categoria, observações ou quem pode ver no detalhe (ou modal de edição)
- Então: tabela e detalhe atualizam; quem perdeu autorização **deixa de ver** o item na próxima carga

#### Cenário 22: Excluir exame (caminho feliz)

- Dado: administradora; documento selecionado
- Quando: confirma **Excluir exame**
- Então: some da lista e do armazenamento; uso de cota atualizado; detalhe limpo ou próximo item selecionado

#### Cenário 23: Baixar arquivo (caminho feliz)

- Dado: quem pode ver o documento
- Quando: toca **Baixar**
- Então: download do arquivo original com nome seguro; link de acesso **curta duração** gerado no servidor

#### Cenário 24: Cuidadora tenta adicionar ou excluir (erro)

- Dado: cuidadora autenticada
- Quando: inspeciona a área
- Então: **sem** botão **+ Adicionar exame**, editar metadados ou excluir; tentativa via ação direta rejeitada no servidor

#### Cenário 25: Visualizadora vê só autorizados (borda)

- Dado: visualizadora autorizada em 1 de 5 documentos
- Quando: abre Exames e receitas
- Então: tabela com **1 linha**; **sem** mencionar existência de outros arquivos
- E: rodapé opcional discreto “Os demais exames não foram liberados pela administradora da conta” quando houver itens ocultos (fiel ao protótipo cuidador)

### Compartilhamento temporário

#### Cenário 26: Gerar link temporário (caminho feliz)

- Dado: administradora; documento selecionado
- Quando: toca **Compartilhar** → modal **Compartilhamento temporário**
- Então: escolhe validade (**1 hora**, **4 horas**, **Até o fim do dia**); link gerado somente leitura/baixar aquele documento; botão copiar
- E: copy de segurança: link não dá acesso ao painel; revogável ao excluir documento ou expirar

#### Cenário 27: Link expirado (erro)

- Dado: link compartilhado fora da validade
- Quando: terceiro abre
- Então: página ou resposta genérica “Link expirado ou inválido” — **sem** vazar metadados

#### Cenário 28: Cuidadora tenta compartilhar (erro)

- Dado: cuidadora com acesso ao documento
- Então: **sem** botão Compartilhar; ação direta rejeitada

### Autorização e falhas

#### Cenário 29: Administradora vê todos (caminho feliz)

- Dado: mix de visibilidades na conta
- Então: administradora lista **todos** os documentos da pessoa cuidada

#### Cenário 30: Membro removido da conta (borda)

- Dado: documento compartilhado com membro que foi removido
- Quando: lista recarrega
- Então: autorização daquele membro ignorada; registro de compartilhamento limpo ou inativo — **sem** erro para quem administra

#### Cenário 31: Falha ao carregar documentos (erro)

- Dado: erro ao buscar lista ou arquivo
- Então: mensagem genérica; shell intacto; recarregar como retry

#### Cenário 32: Leitura via caso de uso — sem consulta na page (caminho feliz técnico)

- Dado: implementação desta Spec
- Quando: inspeciona `app/(family)/familia/exames/page.tsx`
- Então: page só orquestra RSC + repassa props; **nenhuma** consulta direta ao banco ou Storage na page

#### Cenário 33: Deep link modal (caminho feliz)

- Dado: administradora
- Quando: abre `/familia/exames?modal=exame`
- Então: modal Adicionar exame abre ao carregar (checklist tarefa 4, topbar)

#### Cenário 34: Mobile — tabela rolável (caminho feliz)

- Dado: viewport estreita
- Então: tabela com scroll horizontal; busca e chips utilizáveis; touch targets ≥44px

### Integração com Hoje

#### Cenário 35: Checklist tarefa 4 concluída (caminho feliz)

- Dado: ao menos um documento cadastrado; Hoje em modo maduro ou primeiro acesso
- Quando: abre `/familia`
- Então: tarefa 4 **Guarde um exame ou uma receita** marcada concluída; progresso atualizado

#### Cenário 36: Sua central — contagem de exames (caminho feliz)

- Dado: cinco documentos na conta; administradora em Hoje maduro
- Quando: olha **Sua central**
- Então: linha “Exames · **5 guardados**” com link para `/familia/exames` — substituindo placeholder F4.2

#### Cenário 37: Precisa de você — exame sem categoria (caminho feliz)

- Dado: documento recente sem categoria (ou categoria “Outros” vazia conforme regra de domínio)
- Quando: abre Hoje maduro
- Então: card **Precisa de você** inclui linha “Um exame sem categoria” com título e data (ex.: “Hemograma de 02/08 · diga do que é”); link para `/familia/exames` focando o item
- E: **no máximo** convive com outros itens (medicamentos, tarefas F4.5); prioridade abaixo de cartela acabando e tarefas vencidas

#### Cenário 38: Precisa de você sem exame pendente (borda)

- Dado: todos os documentos categorizados
- Então: **sem** linha de exame sem categoria

#### Cenário 39: Primeiro acesso — widget “O que ainda está vazio” (caminho feliz)

- Dado: modo primeiro acesso; zero documentos
- Quando: olha widget Exames
- Então: “Nenhum guardado” + botão **Enviar** → `/familia/exames?modal=exame`

---

## 5. Regras de negócio

- **Escopo da conta:** documentos pertencem à **pessoa cuidada** da conta ativa (MVP: uma por conta).
- **Quem envia e exclui:** **somente administradora** (PRD §6); cuidadora e visualizadora **não**.
- **Quem vê:** administradora **sempre** vê todos; cuidadora e visualizadora veem **◐ conforme autorização por item**; contato de emergência **sem** acesso.
- **Autorização por item:** ao salvar, chips selecionam membros **ativos** com login no painel; persistência de compartilhamento por documento; revogável ao editar ou excluir membro.
- **Categorias fixas (MVP):** Sangue, Imagem, Cardiologia, Receitas, Outros; vazio = **sem categoria** (alerta em Precisa de você).
- **Tipos de arquivo permitidos:** PDF, JPEG, PNG, WebP — validação **server-side** (MIME real + extensão); máximo **25 MB** por arquivo (protótipo).
- **Armazenamento privado:** bucket privado; acesso ao blob só via URL assinada de curta duração; path lógico segregado por conta e pessoa cuidada (detalhe de implementação na migration).
- **Cota por plano:** Essencial **2 GB**, Cuidado+ **20 GB** (PRD §8); somar `size_bytes` dos documentos da conta; trial MVP trata como Cuidado+ até F4.11 refinar — **documentar** escolha no Done.
- **Nome de arquivo exibido:** preservar nome original sanitizado na UI; nome no armazenamento gerado pelo servidor (UUID), nunca confiar no client.
- **Data do exame:** campo de calendário; fuso `America/Sao_Paulo` para exibição relativa.
- **Ordenação lista:** data do exame desc; empate por data de adição desc.
- **Busca:** case-insensitive em título, clínica, nome de arquivo, data formatada.
- **Exclusão:** remove metadados **e** blob; irreversível após confirmação.
- **Compartilhamento externo:** token opaco, expiração conforme modal, escopo **um documento**, sem login; registrar evento mínimo para auditoria (tipo + IDs, sem PHI).
- **Integração Hoje:** estender `computeOnboardingChecklist` (ou input equivalente) com contagem de documentos; estender agregador Hoje para Sua central, Precisa de você — **sem** duplicar lógica de medicamentos/agenda.
- **Server-first:** upload via Route Handler ou Server Action confiável; client mínimo (modal, busca, filtros, progresso de arquivo).
- **Copy:** textos novos em `content/family.ts` (seção `exames`); remover placeholder `exames` do fluxo real.
- **Revalidação:** após mutação, revalidar `/familia/exames` e `/familia`.
- **LGPD / logs:** Sentry e logs só IDs + tipo (`exam_uploaded`, `exam_deleted`, `exam_share_created`); **não** logar título clínico, observações ou conteúdo de arquivo.
- **Persistência:** migration aprovada nesta Spec cria armazenamento de metadados, compartilhamentos, bucket Storage e políticas alinhadas à RLS.
- **Domínio puro testável:** rótulos “Quem vê”, filtro busca/categoria, elegibilidade de visibilidade, detecção “sem categoria”, resumo de cota — Vitest ≥ 80% nas funções novas.
- **Arquivos ≤ ~300 linhas:** dividir lista, detalhe, modal upload, share, repos, casos de uso.

---

## 6. Critérios de Done desta feature

- [ ] Cenários 1–39 verificados (smoke manual via `manual-report`; FL-08 parcial para exames/upload/share)
- [ ] `pnpm typecheck` passa
- [ ] `pnpm lint` passa
- [ ] `pnpm test` passa — Vitest em funções puras novas (visibilidade, categorias, busca, cota, labels) ≥ 80%; smoke `content/family.ts`
- [ ] `/familia/exames` fiel ao protótipo — busca, chips, tabela, detalhe, preview, card Leitura automática stub
- [ ] Upload PDF/imagem funcional; metadados + quem pode ver persistidos
- [ ] Download e compartilhamento temporário funcionais para administradora
- [ ] RLS + autorização por item: cuidadora/visualizadora só veem autorizados; admin vê todos
- [ ] Integração Hoje: checklist tarefa 4 (35), Sua central contagem (36), Precisa de você sem categoria (37)
- [ ] **Nenhuma** query inline em `page.tsx` — casos de uso + repositórios
- [ ] Migration + bucket Storage + policies aplicadas no remoto (skill `supabase-migrations` ou equivalente documentado)
- [ ] Cota de armazenamento respeitada no upload
- [ ] Copy 100% dos textos novos em `content/family.ts`
- [ ] Placeholder `exames` removido do fluxo real da rota
- [ ] Checklist `docs/SECURITY.md` — A01 authz por papel **e** por item; A03 validação MIME/tamanho/Zod; RLS metadados + Storage; uploads: bucket privado, path servidor, URL assinada curta; PHI: logs sem título/observação completos; audit mínimo; N/A: webhooks WA, SOS, geo, elder-access, billing gateway, OCR
- [ ] `docs/state/ATUAL.md` e `docs/state/PENDENCIAS.md` atualizados; entrega em `docs/implementation/2026-08-13-f4-06-exames-receitas.md`
- [ ] Nenhuma dependência npm nova
- [ ] Reflexão curta sobre escalabilidade/manutenibilidade

---

## 7. Escopo de arquivos permitido

### Pode criar

- `supabase/migrations/007_exams_storage.sql` — metadados de documentos, compartilhamentos por membro, índices, bucket Storage + policies
- `supabase/policies/007_exams_rls.sql` — ou policies no mesmo arquivo migration, conforme padrão do repo
- `apps/web/modules/exams/domain/exam-categories.ts` — mapas de categoria (sem enum TS)
- `apps/web/modules/exams/domain/exam-categories.test.ts`
- `apps/web/modules/exams/domain/visibility-labels.ts` — rótulos “Família + Ana”
- `apps/web/modules/exams/domain/visibility-labels.test.ts`
- `apps/web/modules/exams/domain/exam-filters.ts` — busca + chip categoria
- `apps/web/modules/exams/domain/exam-filters.test.ts`
- `apps/web/modules/exams/domain/storage-quota.ts` — limites por plano, soma de uso
- `apps/web/modules/exams/domain/storage-quota.test.ts`
- `apps/web/modules/exams/domain/needs-exam-category.ts` — regra Precisa de você
- `apps/web/modules/exams/domain/needs-exam-category.test.ts`
- `apps/web/modules/exams/infrastructure/exam-repo.ts`
- `apps/web/modules/exams/infrastructure/exam-storage.ts` — upload, signed URL, delete blob
- `apps/web/modules/exams/infrastructure/exam-share-repo.ts` — links temporários
- `apps/web/modules/exams/application/get-exames-page.ts` — agregador da rota
- `apps/web/modules/exams/application/get-exames-page.test.ts`
- `apps/web/modules/exams/application/create-exam.ts`
- `apps/web/modules/exams/application/update-exam.ts`
- `apps/web/modules/exams/application/delete-exam.ts`
- `apps/web/modules/exams/application/get-exam-download-url.ts`
- `apps/web/modules/exams/application/create-exam-share-link.ts`
- `apps/web/modules/exams/application/get-exam-share-page.ts` — rota pública do link temporário
- `apps/web/modules/exams/application/can-manage-exams.ts` — só admin
- `apps/web/modules/exams/application/can-view-exam.ts` — admin ou autorizado
- `apps/web/modules/exams/application/get-hoje-exams-snapshot.ts` — leitura para Hoje
- `apps/web/modules/exams/presentation/exames-page-view.tsx`
- `apps/web/modules/exams/presentation/exam-table-card.tsx`
- `apps/web/modules/exams/presentation/exam-detail-card.tsx`
- `apps/web/modules/exams/presentation/exam-auto-read-stub-card.tsx`
- `apps/web/modules/exams/presentation/exam-upload-modal.tsx` — client mínimo
- `apps/web/modules/exams/presentation/exam-share-modal.tsx` — client mínimo
- `apps/web/app/api/exams/upload/route.ts` — **somente** se multipart exigir Route Handler dedicado
- `apps/web/app/(public)/l/[token]/page.tsx` — **somente** se link temporário for página pública (path acordado na implementação)
- `docs/implementation/2026-08-13-f4-06-exames-receitas.md` (no Done)

### Pode editar

- `apps/web/app/(family)/familia/exames/page.tsx` — substituir placeholder; orquestração RSC
- `apps/web/modules/exams/index.ts` — API pública estreita (substituir esqueleto)
- `apps/web/content/family.ts` — copy exames, modais, erros, integração Hoje; remover placeholder exames do fluxo real
- `apps/web/content/family.test.ts` — smoke das novas chaves
- `apps/web/modules/accounts/application/onboarding-checklist.ts` — **somente** tarefa 4 (contagem de documentos)
- `apps/web/modules/accounts/application/get-hoje-dashboard.ts` — **somente** integrar snapshot de exames (Sua central, Precisa de você)
- `docs/state/ATUAL.md`, `docs/state/PENDENCIAS.md`
- `specs/2026-08-13-f4-06-exames-receitas.md` — somente campo status desta Spec

### Pode editar com cautela

- `apps/web/modules/accounts/presentation/family/hoje-maduro-view.tsx` — **somente** render de novos itens needs/central se view model exigir pequeno ajuste de props
- `apps/web/modules/accounts/presentation/family/primeiro-acesso-view.tsx` — **somente** widget exames vazio se necessário
- `apps/web/lib/supabase/**` — **somente** se indispensável; diff mínimo

### Não pode editar nesta Spec

- `apps/web/app/(family)/layout.tsx` e componentes shell salvo copy/deep link documentado
- `apps/web/modules/accounts/**` salvo arquivos listados acima
- `apps/web/modules/sos/**`, `billing/**`, `location/**`, `elder-access/**`, `agenda/**`, `medications/**`, `reminders/**`
- `apps/web/modules/accounts/domain/roles.ts` — **sem** alterar `can*` globais; regras de exame ficam no módulo `exams`
- `apps/web/app/(marketing)/**`, `app/(elder)/**`
- `apps/web/components/ui/**` salvo consumo de `Modal`, `Card`, `Tag`, `ListRow` existentes
- `.env*`, CI/CD, `AGENTS.md`, `docs/prd-mvp.md`, `docs/arquitetura-solucao.md`, `docs/SECURITY.md`
- Specs já aprovadas (F0–F3, F4.1–F4.5)
- `package.json` / lockfile
- Outras rotas `/familia/*` salvo `exames` e efeito indireto em `/familia` (Hoje)

---

## 8. Riscos e dúvidas abertas

- **PHI em repouso e trânsito** — autonomia `tight`; revisão humana obrigatória em migration Storage + RLS por item + checklist SECURITY completo antes do merge.
- **Upload multipart** — Next.js App Router pode exigir Route Handler; manter authz no caso de uso, não só na rota.
- **Preview PDF cross-browser** — fallback honesto “Abrir em nova aba” se inline falhar; **sem** lib pesada de PDF.
- **Cota vs plano real** — billing completo é F4.11; esta Spec assume leitura de plano existente ou default trial = limites Cuidado+ até lá — **confirmar na aprovação**.
- **Compartilhamento externo** — link público é superfície de ataque; token longo, expiração curta, rate limit se infra existir; **sem** listar outros documentos.
- **Órfãos de Storage** — falha entre upload blob e salvar metadados deve limpar blob ou job de reconciliação documentado.
- **Permissões PRD** — matriz §6: só admin envia/exclui; ver ◐ por item. Alinhado nesta Spec.
- **Homologação** — FL-08 parcial: upload foto, filtrar categoria, cuidadora vê só liberado, link expira, checklist Hoje, excluir libera cota.
- **Dúvida fechada na Spec:** OCR/leitura automática — **fora do MVP**; card stub apenas.
- **Dúvida fechada na Spec:** antivírus dedicado — **fora do MVP**; validação MIME/tamanho conforme SECURITY.

### Segurança (`docs/SECURITY.md`) — itens aplicáveis

- **A01:** RLS por `account_id` + `care_recipient_id`; select filtrado por papel **e** registro de compartilhamento; insert/update/delete metadados e blob **só admin**.
- **A03:** Zod em metadados, IDs de membros, token de share; validação MIME/tamanho no upload; transições de estado explícitas.
- **Storage:** bucket privado; path com conta/pessoa cuidada; URL assinada curta para preview/download; policies espelham RLS de metadados.
- **PHI:** título e observações ok na UI autorizada; logs/Sentry sem texto clínico completo; share link não indexável.
- **Audit:** registrar upload/delete/share (IDs + tipo) — tabela `audit_log` se migration incluir, ou log estruturado mínimo documentado no Done.
- **N/A:** WhatsApp, SOS, geo, elder-access, billing gateway, webhooks, OCR/LLM.

---

## 9. Aprovação humana

- Aprovado por:
- Data:
- Observações:

---

**Próximo passo após aprovação:** implementar somente o escopo desta Spec; atualizar `docs/state/ATUAL.md`; registrar Done em `docs/implementation/`.
