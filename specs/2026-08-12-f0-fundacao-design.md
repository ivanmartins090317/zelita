# Spec: F0 — Fundação de design

- Status: `done`
- Data: 2026-08-12
- Autonomia: `medium`
- Projeto: Zelita (`apps/web`)
- Pedido original: Plano aprovado em `docs/f0-f1/plan.md`, fase F0 (origem: `docs/state/PLANO-ALTA-FIDELIDADE.md`). Levar o style guide do protótipo para o código como sistema de tokens + primitivos reutilizáveis, antes de qualquer tela nova.

## 1. Objetivo

Estabelecer a linguagem visual da Zelita como fonte única da verdade: a paleta completa, as duas famílias tipográficas, a escala de raios, a sombra de cartão e o conjunto de peças de interface recorrentes. A partir daqui, qualquer tela nova é montada com essas peças — nenhuma tela redefine cor, raio ou sombra por conta própria.

Esta fase não entrega tela para o usuário final. Entrega a base que faz a F1 (site) e as fases seguintes nascerem fiéis ao protótipo, sem CSS ad-hoc.

## 2. Fora de escopo

- **Peças de sobreposição e navegação temporal** — janela modal, painel deslizante do idoso, linha do tempo e o tour guiado. Ficam para a fase que primeiro as consome (F3 a F4.12): construí-las agora seria desenhar a interface sem caso de uso real.
- **Recurso "Texto grande"** (escala de leitura persistida) — adiado por decisão do humano para a fase do app do idoso (F5).
- **Migrar as telas já existentes** (entrar, onboarding, painel da família, remédios, app do idoso) para as peças novas. Cada uma é reescrita na sua própria fase — F2, F3, F4.1, F4.3 e F5. É isso que mantém a F0 fora do path crítico.
- **Qualquer conteúdo de página**: nenhuma copy, nenhuma seção, nenhuma rota nova nesta fase.
- Cabeçalhos de segurança, páginas de Privacidade e Termos, imagem de compartilhamento, sitemap e analytics.
- Biblioteca de ícones: o protótipo usa emoji e continua assim.
- Nenhuma dependência nova, nenhuma mudança de schema, permissão de acesso ao banco ou armazenamento.

## 3. Atores e pré-condições

- Quem usa:
  - **Quem constrói as telas seguintes** (agente e humano) — consome as peças e os tokens em vez de escrever estilo solto.
  - **Indiretamente, quem visita e quem usa a Zelita** — recebe consistência visual, contraste adequado e alvos de toque grandes o bastante.
- O que precisa existir antes:
  - Scaffold do monorepo em pé, com as cinco telas atuais funcionando.
  - Style guide do protótipo (`zelita-prototipo.html`, aba "Escopo & style guide") e a marca (`marca-zelita.html`) como referência visual.
  - Plano `docs/f0-f1/plan.md` aprovado.

## 4. Comportamento esperado (cenários)

Linguagem de domínio: descrevem o que passa a ser verdade no produto, não como o código faz.

### Cenário 1: Paleta completa disponível (caminho feliz)

- Dado: o style guide do protótipo com a escala de marca do tom mais claro ao mais escuro, os dois tons de areia, os dois tons de linha, os três níveis de tinta de texto e as três cores semânticas (confirmação, atenção e emergência), cada uma com tinta e fundo
- Quando: alguém for construir uma tela nova
- Então: encontra todos esses tons nomeados e prontos para uso, com o mesmo nome que o style guide usa — inclusive os tons que hoje faltam na base

### Cenário 2: Telas existentes continuam funcionando

- Dado: as cinco telas já no ar usam os nomes antigos de "superfície" e "borda"
- Quando: a paleta nova entra
- Então: essas telas continuam renderizando igual, sem serem editadas — os nomes antigos passam a apontar para os tons equivalentes da paleta nova

### Cenário 3: Correção de tom da marca

- Dado: o tom mais claro da marca está registrado hoje com um valor diferente do style guide
- Quando: a paleta é consolidada
- Então: prevalece o valor do style guide, e a divergência fica registrada no relatório de entrega

### Cenário 4: Duas famílias tipográficas com papéis claros

- Dado: o protótipo usa uma família para títulos e números de destaque e outra para o corpo e os dados
- Quando: qualquer tela é renderizada
- Então: os dois papéis estão disponíveis e aplicados por padrão — corpo em uma, títulos e destaques na outra — sem que a tela precise declarar família

### Cenário 5: Peso tipográfico enxuto

- Dado: cada família oferece muitos pesos
- Quando: as fontes são carregadas
- Então: só entram os pesos que o protótipo de fato usa, para não degradar o tempo de carregamento da primeira tela pública

### Cenário 6: Peças de interface recorrentes disponíveis (caminho feliz)

- Dado: o protótipo repete um conjunto de peças ao longo de ~40 telas — botão, cartão com cabeçalho e corpo, etiqueta, aviso destacado, linha de lista, indicador numérico, campo com rótulo e ajuda, entrada de texto, seleção, texto longo, grupo de opções curtas, caixa de código de acesso, barra de passos, linha de opção selecionável, barra de progresso e estado vazio
- Quando: uma tela precisa de qualquer um desses elementos
- Então: usa a peça pronta, com as variações previstas no style guide, sem recriar o visual

### Cenário 7: Nenhum valor solto dentro das peças

- Dado: uma peça qualquer da fundação
- Quando: seu estilo é inspecionado
- Então: toda cor, raio, sombra, tamanho de texto e altura de alvo vem de um token nomeado — nenhum valor cru escrito na peça

### Cenário 8: Coral só em emergência

- Dado: a cor coral existe na paleta
- Quando: uma peça oferece variações
- Então: coral aparece exclusivamente nas variações de emergência (pedido de ajuda, aviso crítico); nenhuma variação comum, de marca ou de destaque usa coral

### Cenário 9: Alvos de toque respeitam os pisos do produto

- Dado: as regras de acessibilidade do produto (alvo mínimo no painel da família e alvo maior no app do idoso; corpo mínimo de leitura e corpo maior para o idoso)
- Quando: as peças são construídas
- Então: esses pisos existem como tokens nomeados e as alturas das peças derivam deles — hoje esses valores só existem na documentação, escritos soltos no CSS

### Cenário 10: Escala de raios fiel ao protótipo

- Dado: o protótipo usa mais degraus de arredondamento do que o plano original previa
- Quando: a escala é definida
- Então: os degraus reais são preservados e documentados; normalizar para menos degraus não é aceitável, porque degradaria campo, etiqueta e painel deslizante

### Cenário 11: Cores hardcoded fora da paleta

- Dado: o protótipo tem tons que só aparecem em contextos específicos — logo em fundo escuro, textos claros sobre fundo escuro e tintas sobre coral
- Quando: a paleta é consolidada
- Então: esses tons entram como tokens nomeados pelo seu papel, e não como exceções escritas dentro de um componente

### Cenário 12: Telefone brasileiro formatado (caminho feliz)

- Dado: um número de celular brasileiro informado com ou sem pontuação
- Quando: ele é exibido
- Então: aparece no formato legível padrão do país, com DDD e o dígito nove

### Cenário 13: Telefone incompleto ou inválido

- Dado: um número com menos dígitos que o esperado, com letras, vazio ou nulo
- Quando: ele é formatado
- Então: a formatação não quebra: devolve o que foi possível formatar (formatação parcial durante a digitação) e nunca lança erro nem inventa dígitos

### Cenário 14: Código de acesso legível

- Dado: um código de seis dígitos
- Quando: ele é exibido para conferência
- Então: aparece agrupado e espaçado como no protótipo, e códigos com menos ou mais dígitos que o esperado não quebram a exibição

### Cenário 15: Valores e datas em padrão brasileiro

- Dado: um valor monetário e uma data
- Quando: são exibidos
- Então: seguem o padrão brasileiro de moeda e de data usando a formatação nativa do ambiente, sem biblioteca nova; entradas inválidas devolvem um valor neutro previsível em vez de quebrar a tela

### Cenário 16: Mudança de token não exige tocar em tela

- Dado: um tom da paleta que precisa ser ajustado depois
- Quando: o valor do token muda
- Então: todas as peças e telas que dependem dele mudam junto, sem edição individual

## 5. Regras de negócio

- **Fidelidade é ao style guide, não ao HTML do protótipo.** Os tokens desta fase passam a ser a fonte da verdade; nenhuma tela futura redefine cor, raio ou sombra localmente.
- **Coral só em emergência.** Nunca em marca, botão comum, ilustração ou destaque.
- **Light-first e mobile-first.** Não há tema escuro nesta fase.
- **Pisos de acessibilidade do produto:** corpo mínimo de leitura e alvo mínimo no painel da família; corpo maior e alvo maior no app do idoso; botão de pedido de ajuda maior que todos. Os pisos viram tokens, não números repetidos.
- **Compatibilidade retroativa obrigatória:** nenhuma das cinco telas existentes pode ser editada nesta fase, e nenhuma pode regredir visualmente.
- **Nenhuma dependência nova.** As peças são próprias, sobre o que já está instalado.
- **A única lógica testável da fase são os formatadores puros.** A camada visual entra como N/A justificado no relatório de Done, com a verificação real acontecendo na F1, quando as peças forem usadas em tela de verdade.

## 6. Critérios de Done desta feature

- [ ] Todos os cenários acima verificados (1 a 11 e 16 por inspeção do resultado; 12 a 15 por teste automatizado)
- [ ] Testes unitários dos formatadores (telefone, código de acesso, moeda, data) passam, com cobertura ≥ 80% nesses arquivos
- [ ] `pnpm typecheck` passa
- [ ] `pnpm lint` passa
- [ ] `pnpm test` passa
- [ ] As cinco telas existentes abrem e continuam visualmente iguais (conferência manual registrada no relatório; sem edição nesses arquivos)
- [ ] Checklist aplicável de `docs/SECURITY.md` — esperado majoritariamente N/A (fase sem dado, sem autenticação, sem rede, sem PHI); os N/A ficam justificados item a item no relatório
- [ ] Divergências entre protótipo e style guide (tom da marca, número de degraus de raio, tons fora da paleta) documentadas no relatório
- [ ] `docs/state/ATUAL.md` e `docs/state/PENDENCIAS.md` atualizados; entrega registrada em `docs/implementation/2026-08-12-f0-fundacao-design.md`
- [ ] Nenhuma mudança fora do escopo sem aprovação
- [ ] Reflexão curta sobre escalabilidade/manutenibilidade da fundação

## 7. Escopo de arquivos permitido

- Pode criar/editar (com esta Spec aprovada):
  - `apps/web/app/globals.css` (paleta, tipografia, raios, sombra, pisos de toque e leitura)
  - `apps/web/app/layout.tsx` (somente a segunda família tipográfica e sua aplicação)
  - `apps/web/components/ui/button.tsx` (variantes e alturas do style guide)
  - `apps/web/components/ui/*.tsx` — novas peças: cartão, etiqueta, aviso, linha de lista, indicador numérico, campo, entrada, seleção, texto longo, opções curtas, caixa de código, barra de passos, linha de opção, barra de progresso, estado vazio
  - `apps/web/lib/format/**` + testes Vitest correspondentes
  - `docs/state/ATUAL.md`, `docs/state/PENDENCIAS.md`, `docs/implementation/2026-08-12-f0-fundacao-design.md`
  - `specs/2026-08-12-f0-fundacao-design.md` (somente o campo de status desta Spec)

- Não pode editar nesta Spec:
  - Qualquer arquivo em `apps/web/modules/**` (inclusive as telas que hoje usam os tokens antigos)
  - `apps/web/app/(auth)/**`, `apps/web/app/(family)/**`, `apps/web/app/(elder)/**`, `apps/web/app/(marketing)/**`
  - `apps/web/app/api/**`, `apps/web/lib/supabase/**`, `apps/web/lib/inngest/**`
  - `supabase/migrations/**`, `supabase/policies/**`
  - `.env*`, segredos, configuração de produção, CI/CD
  - `AGENTS.md`, `docs/prd-mvp.md`, `docs/arquitetura-solucao.md`, `docs/SECURITY.md`, Specs já aprovadas
  - `package.json` / lockfile — nenhuma dependência nova

Nenhum arquivo desta lista cai nos paths críticos do `AGENTS.md`, por isso a autonomia `medium`.

## 8. Riscos e dúvidas abertas

- **Segurança (`docs/SECURITY.md`):** fase sem dado, sem autenticação, sem chamada de rede e sem PHI — o checklist deve sair quase todo N/A justificado. Único ponto de atenção real: o carregamento das fontes não pode introduzir requisição a terceiro fora do que o projeto já faz.
- **Renomear tokens quebrar tela existente:** maior risco da fase. Mitigado mantendo os nomes antigos como apelido dos novos, o que também é o que mantém a F0 fora do path crítico.
- **Desempenho da primeira tela pública:** duas famílias tipográficas podem pesar. Contido cortando os pesos ao mínimo em uso; a medição real só é possível na F1.
- **Cobertura estruturalmente baixa:** a meta de 80% se aplica só aos formatadores; a maior parte da entrega é visual e não tem teste automatizado no MVP (sem Playwright).
- **Peças definidas sem consumidor:** existe risco de projetar variação que ninguém usa. Mitigado limitando o conjunto ao que o protótipo repete e adiando modal, painel deslizante e linha do tempo para a fase que os consome.
- **Dúvida aberta:** confirmar que o adiamento de "Texto grande" para a F5 segue valendo — ele muda a forma como a escala de leitura é ancorada e é mais barato decidir agora do que depois.

## 9. Aprovação humana

- Aprovado por:
- Data:
- Observações:
