# Plano — recriar o protótipo em alta fidelidade

Documento vivo. Roadmap de fases para portar `zelita-prototipo.html` para o código real (`apps/web`).
Cada fase roda o ciclo completo: **research → Spec em `specs/` → aprovação humana → implementar → Done**.

Fonte visual: `zelita-prototipo.html/zelita-prototipo.html` (style guide na aba "Escopo & style guide", linhas 1987+).
Marca: `marca-zelita.html`.

## Decisões travadas (2026-08-12)

| Tema | Decisão |
| --- | --- |
| Telas sem backend | **Criar as migrations** quando a fase exigir (schema + RLS aprovados caso a caso na Spec) |
| Ícones | **Emoji em tudo**, inclusive painel da família — como o protótipo renderiza. Sem biblioteca de ícones |
| Cadastro | **Os 8 passos**, com o passo 8 (plano) registrando a escolha sem cobrança real |
| "WhatsApp & voz" e "Cuidador" | **Não viram tela neste projeto.** A prévia da mensagem continua existindo dentro de Cadastro (passo 6) e Ajustes, como componente |
| Dependências | **Nenhuma nova.** Primitivos próprios sobre Tailwind v4 + `Button` shadcn + `cva` + `clsx`/`tailwind-merge` já instalados |
| Aprovação | **Uma Spec por fase**, sequencial |

## Regras que valem para todas as fases

- Fidelidade é ao **style guide do protótipo**, não ao HTML: os tokens da fase F0 são a fonte da verdade; nenhuma tela redefine cor, raio ou sombra localmente.
- **Coral (`#E4572E`) só em emergência.** Nunca em marca, botão comum, ilustração ou destaque.
- **Lembrete ≠ tomada** em toda copy: "lembrete enviado", nunca "tomou o remédio".
- Sem mock em dev/prod. Onde ainda não há dado, o estado vazio diz o que vai aparecer ali e traz a ação.
- Server-first: RSC por padrão, `use client` só onde há interação local.
- Cada fase termina com `pnpm typecheck`, `pnpm lint`, `pnpm test` verdes + checklist aplicável de `docs/SECURITY.md` + registro em `docs/implementation/`.

### Como resolvemos sem dependência nova

| Precisa | Solução |
| --- | --- |
| Modal | `<dialog>` nativo (foco e Escape de graça) |
| Sheet do idoso/cuidador | Container fixo animado por CSS |
| Select | `<select>` nativo estilizado com os tokens |
| Abas / chips | Botões com estado e `aria-pressed` |
| Aviso transitório | Região própria com `aria-live` |
| Datas e moeda | `Intl` nativo |
| Telefone e código OTP | Formatadores próprios em função pura, cobertos por Vitest |

## Resumo das fases

| Fase | Entrega | Módulo dono | Schema novo |
| --- | --- | --- | --- |
| F0 | Fundação de design | transversal | não |
| F1 | Site (landing) | marketing | não |
| F2 | Entrar (6 estados) | accounts | não |
| F3 | Cadastro (8 passos) | care-recipients / accounts | pequeno |
| F4.1 | Shell do painel | accounts | não |
| F4.2 | Hoje + Primeiro acesso | accounts / medications | não |
| F4.3 | Remédios + modal de cartela | medications | não |
| F4.4 | Quem participa (convites) | accounts | sim |
| F4.5 | Consultas e tarefas | novo módulo `agenda` | sim |
| F4.6 | Exames e receitas | exams | sim + Storage |
| F4.7 | Pedidos de ajuda (SOS) | sos | sim |
| F4.8 | Onde ele está | location | sim |
| F4.9 | Avisos | novo módulo `alerts` | sim |
| F4.10 | Ajustes | accounts / reminders | pequeno |
| F4.11 | Meu plano | billing | pequeno |
| F4.12 | Como usar a Zelita + tour | transversal | não |
| F5 | App do idoso (PWA) | elder-access / sos | não |
| F6 | Instalar no celular dele | elder-access | sim |

---

## F0 · Fundação de design

**Por quê primeiro:** hoje existem 11 tokens de cor, 1 fonte e 1 componente. O protótipo usa 26 tokens, 2 famílias tipográficas e ~20 componentes recorrentes. Sem essa base, cada tela vira CSS ad-hoc e a fidelidade se perde na terceira.

**Entrega**
- Tokens completos em `globals.css`: `brand-50…900` (incluindo os que faltam: 100, 400, 500), `sand`/`sand-2`, `line`/`line-2`, `ink`/`muted`/`muted-2`, e as três semânticas com tinta e fundo (`ok`, `amber`, `coral`), raios (9/12/14/20/99) e a sombra única de cartão.
- Duas famílias via `next/font`: Plus Jakarta Sans nos títulos e números de destaque, Inter no corpo e nos dados.
- Primitivos próprios: Card (header/body), Tag nas 5 variantes, Note (neutro/âmbar/coral), ListRow de 64px, Stat, Field/Input/Select/Textarea, Chips, CodeBox de OTP, StepBar, OptRow, Modal, Sheet, Timeline, Progress, EmptyState.
- Botão nas 4 variantes do style guide (primário, secundário, emergência, botão grande do idoso) e 3 alturas (48/42/38px).
- Recurso transversal "Texto grande": escala na raiz persistida em cookie e aplicada no servidor, sem piscar.

**Risco:** tentação de portar CSS do protótipo literalmente. O alvo é o sistema de tokens, não o arquivo.
**Autonomia:** `medium`.

## F1 · Site

**Entrega:** landing completa em RSC — hero com cartão de demonstração, comparação "como é hoje / com a Zelita", 4 pilares, faixa de 30 dias grátis, 3 planos, 6 regras de usabilidade, 6 dores, 5 passos de como funciona, bloco "você não precisa preencher tudo hoje" e rodapé com o aviso de SAMU 192 / Bombeiros 193.

**Nota:** a copy vive em `content/`, separada do layout, para o texto mudar sem tocar em componente.
**Depende de:** F0. **Autonomia:** `loose`.

## F2 · Entrar

**Entrega:** os 6 estados sobre o OTP que já funciona — e-mail, código de 6 dígitos com reenvio em 45s, código inválido com contagem de tentativas, escolher quem acompanhar (quando a pessoa tem acesso a mais de uma conta), e a página de saídas "não estou conseguindo entrar".

**A resolver no research:** o protótipo tem um passo de passkey (biometria). Não existe backend para isso hoje — decidir entre implementar WebAuthn de verdade, adiar, ou remover do fluxo.
**Depende de:** F0. **Autonomia:** `tight` (auth é path crítico).

## F3 · Cadastro

**Entrega:** substitui o formulário único atual por 8 passos com barra de progresso — e-mail, código, seus dados, de quem você cuida, WhatsApp e casa, como a Zelita fala com ele (tom + prévia da mensagem + janela de não incomodar), quem mais participa (opcional) e como você quer começar (30 dias grátis ou assinar).

**Schema:** pequeno — registrar a escolha do passo 8 nos campos de plano/trial que já existem em `accounts`.
**Depende de:** F0, F2. **Autonomia:** `tight`.

## F4 · Painel da família

São 12 views, 6 modais e um tour de 8 paradas. Cada subfase é uma Spec.

### F4.1 · Shell
Sidebar verde-petróleo com as 4 seções (principal, Segurança, Saúde, Ajuda, Conta), seletor de pessoa cuidada com modal de troca, topbar com título e ações, barra de trial. Substitui o `family-shell.tsx` atual. **Autonomia:** `tight` (é `accounts`).

### F4.2 · Hoje + Primeiro acesso
Os 4 indicadores do topo, a linha do tempo do dia, "Sua central" com progresso, "Precisa de você", atividade recente da família — e o estado de conta nova, com o checklist de 4 tarefas e os empty states. **Autonomia:** `medium`.

### F4.3 · Remédios
Lista de remédios, detalhe da cartela atual com barra de consumo e avisos programados, últimos lembretes, o bloco "como escrevemos", e o modal de nova cartela com o cálculo de fim ao vivo. Substitui `/familia/remedios`. **Autonomia:** `medium`.

### F4.4 · Quem participa
Lista de membros, matriz do que cada papel pode fazer, modal de convite com os 4 papéis, reenvio de convite. **Schema:** convites com token, expiração de 7 dias e aceite. **Autonomia:** `tight` (é `accounts`).

### F4.5 · Consultas e tarefas
Grade da semana, próximas consultas, tarefas atribuídas a alguém da família. **Schema:** consultas e tarefas, novo módulo `agenda`. **Autonomia:** `medium`.

### F4.6 · Exames e receitas
Busca, filtros por categoria, tabela de documentos, detalhe com pré-visualização, upload com escolha de quem pode ver. **Schema:** documentos + bucket de Storage + permissão por item. **Risco alto:** é PHI — upload, antivírus/limite, URL assinada e RLS por item precisam estar no checklist de segurança. **Autonomia:** `tight`.

### F4.7 · Pedidos de ajuda (SOS)
Detalhe do último acionamento com quem foi notificado e desfecho, ordem de escalonamento, histórico. **Schema:** acionamentos, notificações e ordem de escalonamento. **Regra inviolável:** a Zelita avisa a família, não aciona SAMU nem Bombeiros — o aviso aparece na tela. **Autonomia:** `tight` (emergência).

### F4.8 · Onde ele está
Mapa com pino e zona, indicadores (atualizado, bateria, permissão, sinal), lugares de sempre, link temporário de compartilhamento, histórico e o bloco honesto "o que este mapa não garante". **Schema:** pings de localização, eventos de zona e links temporários. **A resolver no research:** qual mapa usar sem dependência nova. **Autonomia:** `tight`.

### F4.9 · Avisos
Histórico filtrável de tudo que a Zelita comunicou e a matriz "quem recebe o quê". **Depende de:** F4.3 a F4.8, porque agrega eventos de todos os módulos. **Schema:** alertas + preferências de notificação. **Autonomia:** `medium`.

### F4.10 · Ajustes
Canais de contato, tom e horários com prévia da mensagem, privacidade e autorizações, aparelhos com acesso, dados da pessoa cuidada. **Depende de:** F6 para a lista de aparelhos. **Autonomia:** `tight`.

### F4.11 · Meu plano
Plano atual, barra de trial, primeira cobrança, uso do mês. Sem gateway. **Autonomia:** `tight` (é `billing`).

### F4.12 · Como usar a Zelita + tour
A página de guia (o que é / para que serve / como usar, por função) e o tour guiado de 8 paradas com destaque sobre o elemento. **Depende de:** todas as views existirem. **Autonomia:** `loose`.

## F5 · App do idoso

**Entrega:** PWA com 4 telas — início (próximo remédio, botão de ajuda, ligar para a família, meus horários), horários do dia, lista da família com discagem e SAMU 192, e ajustes de acessibilidade (tamanho de letra, contraste, som/vibração). Mais os dois sheets do SOS: confirmação antes de enviar e confirmação depois, com o lembrete de ligar 192 se for grave.

**Regras de piso:** texto ≥17px, títulos 23–26px, alvos ≥56px, SOS >100px, uma decisão por tela, nenhum campo de digitação, nenhuma senha, cor nunca sozinha para dar recado.
**Depende de:** F0, F4.7 (domínio de SOS).
**Nota de ordem:** as telas ficam prontas aqui, mas o acesso real do idoso só abre na F6 — até lá, `/idoso` fica atrás de guarda.
**Autonomia:** `tight`.

## F6 · Instalar no celular dele

**Entrega:** o fluxo de vínculo de aparelho em 5 etapas — a família escolhe o caminho no painel, o link vai para o WhatsApp cadastrado, o idoso abre e confirma, o guia de "adicionar à tela de início", e a confirmação no painel com a lista de aparelhos e o botão de desvincular.

**Schema:** aparelhos vinculados e tokens de vínculo.
**Segurança (o coração desta fase):** link de 15 minutos, uso único, enviado só ao WhatsApp cadastrado, preso ao primeiro aparelho que o abrir, revogável, com aviso à família no momento do vínculo. O atalho dá acesso a ver horários, pedir ajuda e ligar para a família — e a nada mais.
**Depende de:** F5. **Autonomia:** `tight`.

---

## Fora do escopo deste plano

- Telas de demonstração "WhatsApp & voz" e "Cuidador" (decisão de 2026-08-12)
- Leitura automática de exames (OCR / IA clínica)
- Videochamada
- Resumo semanal automático e detecção de anomalia
- Gateway de pagamento real
- Playwright, Turborepo, worker próprio
