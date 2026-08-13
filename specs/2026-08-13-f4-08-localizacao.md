# Spec: F4.8 — Onde ele está (Localização)

- Status: `approved`
- Data: 2026-08-13
- Autonomia: `tight` (geo, consentimento revogável, paths críticos `location` + schema/RLS, PHI de coordenadas, link público temporário)
- Projeto: Zelita (`apps/web`)
- Pedido original: Plano aprovado em `docs/F4/plan.md` (subfase F4.8). Entregar a área **Onde ele está** em alta fidelidade ao protótipo (`#v-local`, linhas ~1305–1372): aviso de consentimento, mapa com última posição, lugares de sempre, compartilhamento temporário, histórico básico e card de limitações — **sem** rastreamento minuto a minuto, **sem** ping contínuo real (device/PWA F5) e **sem** biblioteca de mapas npm.

## 1. Objetivo

Quem administra ou acompanha a conta abre **Onde ele está** e vê, no layout do shell F4.1, a **última localização conhecida** da pessoa cuidada — sempre com **horário ao lado** — ou um estado vazio honesto quando ainda não há autorização ou posição registrada. Uma faixa no topo deixa claro que **nada aparece sem consentimento dele**, que é revogável, e que a Zelita prioriza segurança, não vigilância.

A administradora gerencia **lugares de sempre** (incluindo **Casa**, criada no cadastro só com endereço): nome, endereço, raio e se deve **avisar ao sair**. Enquanto **Casa** não tiver posição confirmada no aparelho dele (F5), a interface degrada com copy honesta — alerta de saída de zona **desligado** até lá. Pode **adicionar, editar e remover** outros lugares; **Casa não pode ser excluída**, só ajustada.

Quem tem permissão pode **compartilhar por um tempo** a posição aproximada via link que expira sozinho (ex.: vizinho ou motorista). O **histórico** mostra os últimos 7 dias — entradas em zona segura, saídas e retornos — conforme registros existentes. Um card **O que este mapa não garante** repete as limitações do protótipo (bateria, GPS indoor, atraso sem internet).

Integração mínima com **Hoje**: stat **Onde ele está** com dado real quando existir; widget **O que ainda está vazio** deixa de mostrar “Pendente” quando consentimento vigente + ao menos uma posição ou Casa configurada; linha do tempo pode incluir eventos de zona. Integração com **Pedidos de ajuda (F4.7)**: botão **Ver no mapa** abre esta área focando a posição do acionamento quando houver coordenadas ou endereço. Nenhum dado inventado; ping periódico, confirmação “Estou em casa” e revogação no PWA ficam para F5 / `elder-access`.

## 2. Fora de escopo

- **Shell do painel** — sidebar, topbar, trial bar (F4.1)
- **PWA do idoso** — consentimento geo, confirmação “Estou em casa”, envio periódico de posição, revogação no device (F5 / F2-05)
- **Jobs Inngest** — detecção automática de saída/entrada de zona, notificação WhatsApp “Saída de zona segura”, ping periódico em segundo plano
- **Feed de Avisos (F4.9)** — eventos de zona **não** entram no histórico geral de avisos nesta subfase
- **Geocodificação automática** de endereço → coordenadas no painel da família — familiar informa endereço textual; coords vêm do device ou seed de homologação
- **Mapa interativo** com pan/zoom, tiles de terceiros embutidos ou dependência npm (Leaflet, Mapbox, Google Maps SDK) — ver decisão de mapa estático na §5
- **Trajeto minuto a minuto**, heatmap ou replay de rota
- **Geofence em produção** — persistir estrutura de eventos e exibir histórico; **disparo** de alerta fica para job + F5
- **Gate de plano Essencial vs Cuidado+** completo — F4.11; nesta subfase UI disponível em trial/contas ativas; copy honesta se plano futuro restringir localização avançada
- **Matriz “Quem recebe o quê” por canal** para eventos de zona — F4.9/F4.10
- **Ajustes — Autorização de localização** (revogar pelo painel família) — revogação é **do idoso** no PWA (F5); painel só **lê** estado
- **OCR / IA**, gateway de pagamento, Playwright, nova dependência npm
- **Multi recipient por conta** — uma pessoa cuidada por conta (F4.1)
- **Badge numérico** na sidebar — omitir
- **Texto grande** no topbar (F5)
- **Simular posição** a partir do painel família — homologação usa seed SQL documentado ou aguarda F5

## 3. Atores e pré-condições

- Quem usa:
  - **Administradora** — ver mapa e histórico, gerenciar lugares de sempre, criar link temporário, ver consentimento.
  - **Cuidadora** — ver mapa e histórico **se** papel permitir ver localização (matriz PRD); **sem** criar/editar lugares nem link temporário.
  - **Visualizadora** — **sem** acesso à área (matriz PRD §6); redirecionar ou empty state de acesso negado conforme padrão do shell.
  - **Contato de emergência** — **sem** acesso rotineiro; **somente durante SOS aberto** (condicional PRD) — nesta subfase: **sem** rota dedicada; link temporário externo é caso separado (vizinho/motorista).
- O que precisa existir antes:
  - **F0** — tokens, `Card`, `Tag`, `ListRow`, `EmptyState`, `Button`, `Modal` (F4.1).
  - **F2** — sessão OTP, contexto de conta, cookie de conta preferida.
  - **F3** — conta + pessoa cuidada + **Casa** (lugar de sempre com endereço, sem coords obrigatórias).
  - **F4.1** — layout, rota `/familia/localizacao` placeholder substituída, copy base em `content/family.ts`.
  - **F4.2** — Hoje maduro com stat e widget geo extensíveis.
  - **F4.7** — Pedidos de ajuda com campos de localização no acionamento e link **Ver no mapa** apontando para esta rota.
  - Protótipo: `#v-local` (~1305–1372); PRD §5.3 Geolocalização, §4.3 entidades de localização, §6 matriz “Ver localização” / “Definir zonas seguras”; `docs/SECURITY.md` (consentimento revogável, falha GPS); domínio existente `hasConfirmedHomeCoords` em `modules/location`.

## 4. Comportamento esperado (cenários)

Linguagem de domínio: o que a pessoa vê e faz — não como o sistema organiza arquivos.

### Estrutura geral da área

#### Cenário 1: Onde ele está carrega dentro do shell (caminho feliz)

- Dado: familiar autenticada com conta completa e papel com permissão de ver localização
- Quando: abre `/familia/localizacao`
- Então: vê topbar F4.1 (“Onde ele está” / “Só para você ficar tranquila”) + miolo da área — **sem** placeholder “em breve”

#### Cenário 2: Layout fiel ao protótipo (caminho feliz)

- Dado: viewport desktop/tablet larga; dados mínimos existentes
- Quando: área carregada
- Então: grid fiel ao protótipo — coluna esquerda card **Onde ele está** (mapa + stats); direita **Lugares de sempre** + **Mostrar por um tempo** empilhados; abaixo grid **Onde ele esteve** + **O que este mapa não garante**
- E: mobile empilha colunas; touch targets ≥44px

#### Cenário 3: Visualizadora sem permissão (erro)

- Dado: visualizadora autenticada
- Quando: tenta abrir `/familia/localizacao`
- Então: acesso negado conforme padrão do shell (redirect ou empty state) — **sem** vazar endereço ou coords

#### Cenário 4: Conta sem consentimento e sem posição (empty state)

- Dado: pessoa cuidada sem consentimento geo; nenhum ponto de localização
- Quando: administradora abre a área
- Então:
  - Faixa de consentimento indica **aguardando autorização dele** (sem data)
  - Mapa com EmptyState — “Localização indisponível” + hint para vínculo/consentimento no aparelho dele (F5)
  - Stats (Atualizado, Bateria, Permissão, Sinal) com “—” ou copy honesta — **sem** valores demo do protótipo (72%, “Bom”)
  - **Lugares de sempre** lista **Casa** com endereço do cadastro e tag **Posição pendente**
  - Histórico vazio
  - **Sem** pins fictícios de Clínica Vida / Casa da Ana

### Consentimento e privacidade

#### Cenário 5: Consentimento vigente (caminho feliz)

- Dado: pessoa cuidada autorizou compartilhamento (data registrada); não revogou
- Quando: área carregada
- Então: faixa no topo com copy do protótipo — autorizou em {data}; pode revogar quando quiser; Zelita mostra segurança, não vigilância; **sem** trajeto minuto a minuto

#### Cenário 6: Consentimento revogado (borda)

- Dado: consentimento foi revogado no PWA (F5) ou campo equivalente preenchido
- Quando: familiar com permissão abre a área
- Então: faixa **Revogado**; mapa degrada para última posição **congelada** com aviso “Autorização desligada — posição pode estar desatualizada” ou empty se política MVP ocultar posição pós-revogação (decisão §5: **mostrar última conhecida com banner**, não apagar histórico)
- E: **sem** criar link temporário enquanto revogado

#### Cenário 7: Card O que este mapa não garante (caminho feliz)

- Dado: qualquer estado
- Quando: rola até o card inferior direito
- Então: quatro parágrafos fiel ao protótipo — ele decide; celular sem bateria; erro indoor; atraso sem internet

### Mapa e última posição

#### Cenário 8: Mapa estático com última posição (caminho feliz)

- Dado: consentimento vigente; último ponto registrado com lat/lng, precisão ~20 m, horário 09:14; dentro de Casa confirmada
- Quando: olha card **Onde ele está**
- Então:
  - Mapa **estático estilizado** (CSS/SVG como protótipo — ruas decorativas, sem tiles externos embutidos)
  - Pin da pessoa cuidada posicionado proporcionalmente + rótulo “{apelido} · 09:14”
  - Badge de precisão (~{N} m) quando `accuracy_m` existir
  - Tag **Zona segura · Casa** quando regra de domínio indicar dentro do raio
  - Botão **Abrir no mapa** abre URL externa (OpenStreetMap ou equivalente) em nova aba com coords ou endereço — **sem** iframe de terceiro no MVP

#### Cenário 9: Posição só com endereço textual (borda)

- Dado: acionamento SOS ou ponto com `location_text` mas sem lat/lng
- Quando: área carregada (ou deep link desde Pedidos de ajuda)
- Então: mapa mostra card com endereço legível; pin omitido ou marcador genérico central; botão **Abrir no mapa** usa endereço na URL externa

#### Cenário 10: Deep link desde Pedidos de ajuda (caminho feliz)

- Dado: pedido de ajuda aberto com localização registrada
- Quando: clica **Ver no mapa** em Pedidos de ajuda → `/familia/localizacao?focus=alert` (ou equivalente)
- Então: área abre destacando posição/endereço daquele acionamento; demais conteúdo normal

#### Cenário 11: Stats do device — dados reais ou honestos (borda)

- Dado: último ponto inclui `recorded_at`; device ainda não envia bateria/sinal (F5)
- Quando: olha grid de 4 stats
- Então: **Atualizado** mostra horário + “há X” relativo; **Bateria** / **Sinal** / **Permissão** mostram valor **somente se** existir no registro — senão “—” + hint “Disponível após vínculo do aparelho”

#### Cenário 12: Fora de qualquer zona segura (caminho feliz)

- Dado: última posição fora de todos os lugares com coords confirmadas
- Quando: mapa carregado
- Então: tag **Fora das zonas** (ou equivalente); **sem** tag “Zona segura · Casa”

### Lugares de sempre

#### Cenário 13: Lista inclui Casa do cadastro (caminho feliz)

- Dado: onboarding criou Casa com endereço; coords pendentes
- Quando: olha card **Lugares de sempre**
- Então: linha **Casa** — endereço textual, raio padrão (150 m), tag **Posição pendente**; copy “Confirme no aparelho dele para ligar aviso ao sair”

#### Cenário 14: Casa com posição confirmada (caminho feliz)

- Dado: Casa com lat/lng e `coords_confirmed_at` preenchidos
- Quando: lista carregada
- Então: tag **Dentro** ou **Fora** conforme última posição vs raio; subtítulo “Raio de {N} m · avisar ao sair” se toggle ativo

#### Cenário 15: Administradora adiciona lugar (caminho feliz)

- Dado: administradora
- Quando: clica **+ Adicionar**, preenche nome (“Mercado do bairro”), endereço, raio (80 m), ícone opcional, salva
- Então: nova linha na lista; lugar aparece no mapa **somente** quando tiver coords confirmadas — até lá, só endereço na lista

#### Cenário 16: Editar lugar existente (caminho feliz)

- Dado: lugar não-Casa existente
- Quando: edita nome ou raio, salva
- Então: lista e mapa (se coords) atualizam; toast discreto

#### Cenário 17: Remover lugar não-Casa (caminho feliz)

- Dado: administradora; lugar “Mercado do bairro”
- Quando: confirma exclusão
- Então: linha removida; histórico passado permanece legível — **sem** apagar eventos já registrados

#### Cenário 18: Casa não pode ser excluída (borda)

- Dado: administradora
- Quando: tenta excluir **Casa**
- Então: ação indisponível ou mensagem clara — Casa é permanente; só editável

#### Cenário 19: Toggle avisar ao sair desligado sem coords (borda)

- Dado: Casa sem coords confirmadas
- Quando: administradora tenta ligar “avisar ao sair”
- Então: toggle desabilitado ou aviso — só após confirmação de posição no aparelho dele (regra `hasConfirmedHomeCoords`)

#### Cenário 20: Cuidadora vê lugares sem editar (caminho feliz)

- Dado: cuidadora com permissão de ver localização
- Então: lista visível; **sem** botões + Adicionar / editar / excluir

#### Cenário 21: Cuidadora tenta mutação (erro)

- Dado: cuidadora
- Quando: envia mutação direta (action)
- Então: rejeitada server-side — **sem** efeito

### Compartilhamento temporário

#### Cenário 22: Criar link por 1 hora (caminho feliz)

- Dado: administradora; consentimento vigente; última posição existente
- Quando: clica **Criar link** (card **Mostrar por um tempo** ou botão no mapa), escolhe duração (1 h padrão), confirma
- Então: modal exibe URL copiável; copy explica escopo limitado (só posição aproximada, expira sozinho, revogável)

#### Cenário 23: Terceiro abre link válido (caminho feliz)

- Dado: link ativo não expirado
- Quando: terceiro abre `/l/{token}` (rota pública mínima)
- Então: página simples com mapa estático ou endereço aproximado, horário da leitura, aviso de privacidade — **sem** login, **sem** medicamentos/exames/dados pessoais

#### Cenário 24: Link expirado (erro)

- Dado: token expirado ou revogado
- Quando: terceiro abre
- Então: mensagem genérica “Link expirado ou inválido” — **sem** vazar metadados

#### Cenário 25: Criar link sem consentimento ou posição (erro)

- Dado: consentimento ausente ou revogado; ou zero pontos de localização
- Quando: administradora tenta criar link
- Então: botão desabilitado ou erro claro — **sem** gerar token

#### Cenário 26: Cuidadora tenta criar link (erro)

- Dado: cuidadora
- Então: **sem** botão Criar link; action rejeitada se forçada

### Histórico

#### Cenário 27: Histórico com eventos dos últimos 7 dias (caminho feliz)

- Dado: registros de posição e eventos de zona na janela
- Quando: olha tabela **Onde ele esteve**
- Então: colunas Quando / Onde / Situação; tags **Zona segura**, **Saída de zona segura**, **Retornou** conforme tipo; ordenação cronológica decrescente; tag “Últimos 7 dias”

#### Cenário 28: Histórico vazio (borda)

- Dado: nenhum evento na janela
- Então: EmptyState na tabela — **sem** linhas demo do protótipo

#### Cenário 29: Evento de saída sem retorno ainda (borda)

- Dado: saída de Casa registrada; sem entrada posterior
- Quando: linha exibida
- Então: situação **Saída de zona segura**; integração futura com Precisa de você (F4.2) opcional nesta subfase — se implementada, card Hoje destaca; senão documentar N/A homologação

### Autorização e falhas

#### Cenário 30: Administradora e cuidadora veem mesma posição (caminho feliz)

- Dado: ambos com permissão de ver localização
- Então: mesma última posição e histórico autorizado

#### Cenário 31: Membro removido da conta (borda)

- Dado: ex-membro tinha link copiado (não aplicável — links não são por membro) ou sessão antiga
- Quando: ex-membro removido tenta abrir área autenticada
- Então: acesso negado pelo shell — **sem** leak

#### Cenário 32: Falha ao carregar localização (erro)

- Dado: erro ao buscar dados
- Então: mensagem genérica; shell intacto; recarregar como retry

#### Cenário 33: Leitura via caso de uso — sem consulta na page (caminho feliz técnico)

- Dado: implementação desta Spec
- Quando: inspeciona `app/(family)/familia/localizacao/page.tsx`
- Então: page só orquestra RSC + repassa props; **nenhuma** consulta direta ao banco na page

### Integração com Hoje

#### Cenário 34: Stat Onde ele está com dado real (caminho feliz)

- Dado: última posição dentro de Casa às 09:14; Hoje maduro
- Quando: abre `/familia`
- Então: stat mostra “Casa” (ou nome do lugar) + hint “Atualizado às 09:14” — substituindo “Em breve” F4.2

#### Cenário 35: Stat sem dados (borda)

- Dado: sem consentimento ou sem pontos
- Então: stat mantém fallback honesto + link para `/familia/localizacao`

#### Cenário 36: Widget primeiro acesso — geo deixa de pendente (caminho feliz)

- Dado: consentimento vigente **e** (última posição **ou** Casa com endereço configurado)
- Quando: modo primeiro acesso
- Então: widget **Onde ele está** perde tag **Pendente**; status concluído parcial conforme regra de domínio

#### Cenário 37: Linha do tempo — evento de zona (caminho feliz)

- Dado: evento “Saída de zona segura” ontem
- Quando: Hoje maduro com timeline extensível
- Então: entrada opcional na linha do tempo com link para `/familia/localizacao` — **somente** se agregador já suportar extensão; senão documentar como melhoria mínima ou N/A

#### Cenário 38: Precisa de você — Casa pendente (caminho feliz opcional)

- Dado: Casa criada no cadastro; coords ainda pendentes após 48 h (heurística configurável na Spec técnica ou omitida)
- Quando: Hoje maduro
- Então: **opcional:** linha “Confirme a posição de Casa no aparelho dele” com link — se escopo estourar, **fora** desta subfase e registrar em PENDENCIAS

### Integração com Pedidos de ajuda

#### Cenário 39: Zona no detalhe do acionamento (caminho feliz)

- Dado: acionamento com coords dentro de Casa confirmada; F4.7 implementado
- Quando: detalhe do último acionamento
- Então: linha de localização inclui menção **dentro da zona “Casa”** (regra de domínio compartilhada ou duplicada mínima no módulo `sos` consumindo helper público de `location`)

---

## 5. Regras de negócio

- **Escopo da conta:** localização pertence à **pessoa cuidada** da conta ativa (MVP: uma por conta).
- **Quem vê:** administradora e cuidadora conforme matriz PRD (`view_location`); visualizadora **negado**; contato de emergência **somente durante SOS** — fora do escopo desta rota autenticada.
- **Quem gerencia lugares:** **somente administradora** (`manage_safe_zones`).
- **Consentimento:** vigente quando registrado e não revogado; UI sempre mostra estado; **nada** de posição ao vivo sem consentimento (exceto última congelada pós-revogação conforme cenário 6).
- **Casa:** criada no onboarding com endereço; **não excluível**; coords confirmadas **somente** no aparelho vinculado do idoso (F5) — familiar **nunca** usa GPS do próprio celular para definir Casa.
- **Alerta ao sair:** só ativo se lugar tiver coords confirmadas (`hasConfirmedHomeCoords`); toggle persistido por lugar; disparo real via job **fora** desta Spec.
- **Raio padrão Casa:** 150 m (`LOCATION_CONSTANTS`); outros lugares 80–200 m validados no servidor.
- **Última posição:** registro mais recente em pontos de localização por `recorded_at`; fontes: SOS, periódico, confirmação Casa, share — exibir origem só se útil (“No pedido de ajuda”, “Atualização automática”).
- **Mapa MVP (decisão fechada):** visual **estático estilizado** (protótipo CSS); pin posicionado por normalização simples de lat/lng quando existir; **Abrir no mapa** → URL externa HTTPS; **proibido** npm de mapas e iframe de tiles sem Spec futura.
- **Precisão:** exibir metros quando `accuracy_m` existir; omitir se ausente.
- **Histórico:** janela **7 dias**; merge de pontos significativos + eventos de zona; ordenação decrescente.
- **Compartilhamento temporário:** token opaco; durações MVP: **1 h** (padrão), **3 h**, **24 h**; escopo posição aproximada + horário; revogável pela administradora; página pública mínima sem indexação; expiração fail-closed.
- **Plano:** trial trata como tudo liberado; gate Essencial vs Cuidado+ **documentado para F4.11** — não bloquear implementação desta área no trial.
- **Integração Hoje:** estender agregador Hoje para stat geo, widget primeiro acesso, timeline opcional — **sem** duplicar lógica SOS/exames.
- **Integração SOS:** helper de “dentro de qual zona” reutilizável via API pública `location`; editar **somente** leitura de zona no detalhe F4.7.
- **Server-first:** mutações via Server Action; client mínimo (modais adicionar/editar lugar, criar link, copiar URL).
- **Copy:** textos novos em `content/family.ts` (seção `localizacao`); remover placeholder do fluxo real.
- **Revalidação:** após mutação, revalidar `/familia/localizacao` e `/familia`.
- **LGPD / logs:** Sentry e logs só IDs + tipo (`location_place_created`, `location_share_created`, `geofence_event_viewed`); **não** logar lat/lng completos em ferramentas externas — arredondar ou omitir.
- **Persistência:** migration aprovada nesta Spec cria pontos de localização, eventos de zona, links temporários, extensões em lugares de sempre e políticas RLS alinhadas à matriz.
- **Domínio puro testável:** dentro/fora de zona, Casa confirmada, elegibilidade de visualização, labels de histórico, expiração de link — Vitest ≥ 80% nas funções novas.
- **Arquivos ≤ ~300 linhas:** dividir mapa, lugares, share, histórico, repos, casos de uso.

---

## 6. Critérios de Done desta feature

- [ ] Cenários 1–39 verificados (smoke manual via `manual-report`; FL-08 parcial — UI, lugares, link share, consentimento, acesso negado visualizadora; posição real depende F5 ou seed documentado)
- [ ] `pnpm typecheck` passa
- [ ] `pnpm lint` passa
- [ ] `pnpm test` passa — Vitest em funções puras novas (zona, Casa, consentimento, histórico, share, elegibilidade) ≥ 80%; smoke `content/family.ts`
- [ ] `/familia/localizacao` fiel ao protótipo — faixa consentimento, mapa estático, stats honestos, lugares, share, histórico, card limitações
- [ ] CRUD lugares de sempre (exceto excluir Casa) funcional para administradora
- [ ] Link temporário criado e página pública `/l/{token}` funcional
- [ ] RLS + authz server-side conforme papéis PRD
- [ ] Integração Hoje: stat geo (34–35), widget primeiro acesso (36); timeline/Precisa de você (37–38) conforme escopo implementado ou N/A documentado
- [ ] Integração SOS: zona no detalhe + deep link Ver no mapa (39–40)
- [ ] **Nenhuma** query inline em `page.tsx` — casos de uso + repositórios
- [ ] Migration + policies aplicadas no remoto (skill `supabase-migrations` ou equivalente documentado)
- [ ] Copy 100% dos textos novos em `content/family.ts`
- [ ] Placeholder `localizacao` removido do fluxo real da rota
- [ ] Checklist `docs/SECURITY.md` — A01 authz geo; A03 validação Zod; RLS pontos + lugares + links; consentimento revogável documentado; link público escopo mínimo; PHI: logs sem coords precisas; audit mínimo; N/A: uploads, webhooks WA, SOS mutações, elder-access implementação, billing gateway, jobs Inngest geo
- [ ] `docs/state/ATUAL.md` e `docs/state/PENDENCIAS.md` atualizados; entrega em `docs/implementation/2026-08-13-f4-08-localizacao.md`
- [ ] Nenhuma dependência npm nova
- [ ] Reflexão curta sobre escalabilidade/manutenibilidade

---

## 7. Escopo de arquivos permitido

### Pode criar

- `supabase/migrations/010_location.sql` — pontos de localização, eventos de zona, links temporários, extensões em lugares de sempre (ex.: `alert_on_exit`), índices, RLS
- `apps/web/modules/location/domain/safe-zone-status.ts` — dentro/fora, labels
- `apps/web/modules/location/domain/safe-zone-status.test.ts`
- `apps/web/modules/location/domain/location-consent.ts` — vigente/revogado/pendente
- `apps/web/modules/location/domain/location-consent.test.ts`
- `apps/web/modules/location/domain/location-history-labels.ts`
- `apps/web/modules/location/domain/location-history-labels.test.ts`
- `apps/web/modules/location/domain/location-share.ts` — durações, expiração
- `apps/web/modules/location/domain/location-share.test.ts`
- `apps/web/modules/location/domain/can-view-location.ts`
- `apps/web/modules/location/domain/can-view-location.test.ts`
- `apps/web/modules/location/domain/can-manage-safe-zones.ts`
- `apps/web/modules/location/domain/can-manage-safe-zones.test.ts`
- `apps/web/modules/location/infrastructure/location-point-repo.ts`
- `apps/web/modules/location/infrastructure/safe-place-repo.ts`
- `apps/web/modules/location/infrastructure/geofence-event-repo.ts`
- `apps/web/modules/location/infrastructure/location-share-repo.ts`
- `apps/web/modules/location/application/get-localizacao-page.ts`
- `apps/web/modules/location/application/get-localizacao-page.test.ts`
- `apps/web/modules/location/application/create-safe-place.ts`
- `apps/web/modules/location/application/update-safe-place.ts`
- `apps/web/modules/location/application/delete-safe-place.ts`
- `apps/web/modules/location/application/create-location-share-link.ts`
- `apps/web/modules/location/application/get-location-share-page.ts` — rota pública
- `apps/web/modules/location/application/get-hoje-location-snapshot.ts`
- `apps/web/modules/location/application/resolve-location-for-sos.ts` — helper zona/endereço para SOS
- `apps/web/modules/location/presentation/localizacao-page-view.tsx`
- `apps/web/modules/location/presentation/location-consent-banner.tsx`
- `apps/web/modules/location/presentation/location-map-card.tsx` — mapa estático
- `apps/web/modules/location/presentation/safe-places-card.tsx`
- `apps/web/modules/location/presentation/safe-place-modal.tsx` — client mínimo
- `apps/web/modules/location/presentation/location-share-card.tsx`
- `apps/web/modules/location/presentation/location-share-modal.tsx` — client mínimo
- `apps/web/modules/location/presentation/location-history-card.tsx`
- `apps/web/modules/location/presentation/location-limitations-card.tsx`
- `apps/web/modules/location/presentation/location-share-public-view.tsx` — página pública
- `apps/web/app/l/[token]/page.tsx` — rota pública do link temporário (ou equivalente fora de `(family)`)
- `docs/implementation/2026-08-13-f4-08-localizacao.md` (no Done)

### Pode editar

- `apps/web/app/(family)/familia/localizacao/page.tsx` — substituir placeholder; orquestração RSC
- `apps/web/modules/location/index.ts` — API pública estreita (expandir esqueleto)
- `apps/web/modules/location/domain/home-coords.ts` — **somente** se regras precisarem de extensão mínima
- `apps/web/content/family.ts` — copy localização, modais, erros, integração Hoje; remover placeholder do fluxo real
- `apps/web/content/family.test.ts` — smoke das novas chaves
- `apps/web/modules/accounts/application/get-hoje-dashboard.ts` — **somente** integrar snapshot geo (stat, widget, timeline opcional)
- `apps/web/modules/accounts/application/onboarding-checklist.ts` — **somente** status widget geo se aplicável
- `apps/web/modules/sos/application/get-pedidos-de-ajuda-page.ts` — **somente** linha de zona via helper `location`
- `docs/state/ATUAL.md`, `docs/state/PENDENCIAS.md`
- `specs/2026-08-13-f4-08-localizacao.md` — somente campo status desta Spec

### Pode editar com cautela

- `apps/web/modules/accounts/presentation/family/hoje-maduro-view.tsx` — **somente** render de stat/timeline geo se view model exigir pequeno ajuste de props
- `apps/web/modules/accounts/presentation/family/primeiro-acesso-view.tsx` — **somente** widget geo se necessário
- `apps/web/modules/sos/presentation/sos-last-alert-card.tsx` — **somente** se props de mapa/zona exigirem ajuste mínimo

### Não pode editar nesta Spec

- `apps/web/app/(family)/layout.tsx` e componentes shell salvo copy/deep link documentado
- `apps/web/modules/accounts/**` salvo arquivos listados acima
- `apps/web/modules/accounts/domain/roles.ts` — **sem** alterar `can*` globais; regras geo ficam no módulo `location`
- `apps/web/modules/exams/**`, `billing/**`, `elder-access/**`, `agenda/**`, `medications/**`, `reminders/**`, `care-recipients/**` (salvo tipos públicos)
- `apps/web/app/(marketing)/**`, `app/(elder)/**` — implementação de consentimento/ping no PWA é F5
- `apps/web/components/ui/**` salvo consumo de componentes existentes
- `.env*`, CI/CD, `AGENTS.md`, `docs/prd-mvp.md`, `docs/arquitetura-solucao.md`, `docs/SECURITY.md`
- Specs já aprovadas (F0–F3, F4.1–F4.7)
- `package.json` / lockfile
- Jobs Inngest / `api/inngest/**` — detecção de zona e ping ficam fora
- Outras rotas `/familia/*` salvo `localizacao` e efeito indireto em `/familia` (Hoje) e leitura cruzada em `pedidos-de-ajuda`

---

## 8. Riscos e dúvidas abertas

- **Geo = dado sensível** — autonomia `tight`; revisão humana obrigatória em RLS, link público e checklist SECURITY antes do merge.
- **UI sem ping real até F5** — homologação FL-08 parcial com seed SQL documentado; **não** mock em produção.
- **Mapa estático vs embed OSM** — decisão fechada: estático + link externo; revisitar só com Spec e CSP explícitos.
- **Coords de lugares não-Casa** — MVP: endereço na lista; pin no mapa só com coords; geocode automático **fora**.
- **Consentimento revogado** — mostrar última posição congelada vs ocultar: Spec adota **congelada com banner**; confirmar na aprovação.
- **Contato de emergência durante SOS** — matriz PRD condicional; **sem** implementar rota autenticada extra nesta subfase; link temporário atende terceiros sem login.
- **Plan gating Cuidado+** — adiar enforcement completo para F4.11; trial liberado.
- **Precisa de você / Casa pendente** — cenário 38 opcional; se omitido, registrar em PENDENCIAS.
- **Homologação** — FL-08 parcial: consentimento, lugares CRUD, share link, visualizadora negada, deep link SOS, stats honestos sem device.
- **Dúvida fechada na Spec:** bateria/sinal no mapa — **somente** se registro existir; senão “—”.
- **Dúvida fechada na Spec:** excluir Casa — **proibido**.

### Segurança (`docs/SECURITY.md`) — itens aplicáveis

- **A01:** RLS por `account_id` + `care_recipient_id`; select conforme `view_location`; mutações lugares **só admin**; insert pontos **somente** via device/service (F5) — painel família **não** fabrica ping falso.
- **A03:** Zod em lugares (nome, endereço, raio), share (duração), tokens; validar coords se algum campo aceitar lat/lng no futuro.
- **A04:** consentimento explícito; falha GPS → “indisponível”; link público escopo mínimo.
- **A09:** logs sem lat/lng precisos; eventos tipados.
- **Link público:** token alto entropia; expiração; sem PHI além de posição aproximada + horário; revogação admin.
- **N/A:** uploads Storage, webhooks WA, SOS mutações, elder-access implementação PWA, billing gateway, jobs Inngest, OCR/LLM.

---

## 9. Aprovação humana

- Aprovado por:
- Data:
- Observações:

---

**Próximo passo após aprovação:** implementar somente o escopo desta Spec; atualizar `docs/state/ATUAL.md`; registrar Done em `docs/implementation/`.
