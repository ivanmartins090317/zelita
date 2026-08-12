# Spec: Fatia 1 — Auth OTP + pessoa cuidada + cartela + lembrete

- Status: `draft`
- Data: 2026-08-12
- Autonomia: `medium`
- Projeto: Zelita (`apps/web`)
- Pedido original: Fatia 1 do PRD (F1-01…F1-06) — auth OTP, onboarding com pessoa cuidada e DND, cartela com preview de fim, lembrete com opt-in WhatsApp, painel Hoje/Remédios mínimo; billing só placeholder; Casa com coordenadas já nesta fatia; OTP por código e magic link; RLS pela matriz completa de papéis.

## 1. Objetivo

Permitir que a gestora da família entre sem senha, cadastre quem cuida e a pessoa cuidada, anote a primeira cartela de remédio com previsão de fim, e faça a Zelita enviar lembrete no horário certo (respeitando “não incomodar” e autorização do idoso no WhatsApp) — com um painel “Hoje” e “Remédios” mínimo alinhado ao protótipo.

## 2. Fora de escopo

- SOS, PWA do idoso e vínculo de aparelho
- Convites com UX completa (papéis existem na autorização; convidar gente fica para fatia posterior)
- Exames, voz de reforço, alerta de saída de zona, cobrança real (gateway/cartão)
- Passos finais de onboarding de plano/assinatura (além de placeholder de trial na conta)
- Portar a landing ou o HTML do protótipo inteiro
- Playwright, Turborepo, fila própria com worker sempre ligado, OCR/IA clínica

## 3. Atores e pré-condições

- Quem usa:
  - **Gestora / admin da conta** (ex.: Cintia) — autentica, onboarding, CRUD de remédios/cartelas, vê painel
  - **Pessoa cuidada** (ex.: Seu João) — não autentica; só recebe mensagens no WhatsApp após autorizar
  - **Sistema** — agenda e dispara lembretes; registra “lembrete enviado” (nunca afirma tomada)
  - **Outros papéis** (cuidador, visualizador, contato de emergência) — podem existir na conta; nesta fatia a UI foca no admin; a autorização já restringe conforme a matriz
- O que precisa existir antes:
  - Scaffold do monorepo Done
  - Projeto Supabase disponível para Auth e dados (chaves quando for validar Auth de verdade)
  - Conta/sandbox Meta (WhatsApp) quando for validar envio real; até lá, canal pode operar em modo seco documentado
  - Inngest configurável quando for validar job em cloud

## 4. Comportamento esperado (cenários)

Linguagem de domínio. Sem leakage de endpoint, tabela ou classe.

### Cenário 1: Entrar com código de e-mail (caminho feliz)

- Dado: uma pessoa com e-mail válido, sem sessão ativa
- Quando: solicita acesso, recebe código de 6 dígitos e informa o código dentro do prazo
- Então: entra na área da família autenticada; não há senha envolvida

### Cenário 2: Entrar com link mágico (caminho feliz)

- Dado: uma pessoa com e-mail válido
- Quando: escolhe entrar pelo link enviado ao e-mail e abre o link válido
- Então: a sessão é criada e ela chega à área da família

### Cenário 3: Código expirado ou reenvio

- Dado: um código já emitido
- Quando: passa o prazo de 10 minutos **ou** a pessoa pede reenvio após 45 segundos
- Então: o código anterior deixa de valer; só o mais recente (se houver) autentica; tentativa com o antigo falha com mensagem clara de correção

### Cenário 4: Onboarding — conta + pessoa cuidada + casa + DND (caminho feliz)

- Dado: gestora autenticada sem conta completa de cuidado
- Quando: informa nome e WhatsApp dela; dados da pessoa cuidada; WhatsApp do idoso; endereço de casa **com coordenadas**; janela “não incomodar”
- Então: a conta fica pronta para uso; a pessoa cuidada existe **sem login**; “Casa” fica registrada como lugar de sempre com coordenadas; o trial fica só como **placeholder** na conta (sem cobrança)

### Cenário 5: Pessoa cuidada nunca autentica

- Dado: pessoa cuidada cadastrada
- Quando: qualquer tentativa de tratar o idoso como usuário de login da Zelita
- Então: isso não acontece — lembretes e contato seguem pelo WhatsApp / vínculo futuro de aparelho (fora desta Spec)

### Cenário 6: Cadastrar cartela com preview de fim (caminho feliz)

- Dado: admin com pessoa cuidada cadastrada
- Quando: anota remédio (nome, dosagem, quantidade na cartela, quanto por dose, quantas vezes ao dia, data de início, horários)
- Então: **antes de salvar** vê a data prevista de fim; ao salvar, a cartela fica ativa e os horários passam a poder gerar lembretes

### Cenário 7: Regra de cálculo de fim

- Dado: quantidade na cartela e consumo diário (comprimidos por dose × doses por dia)
- Quando: o sistema calcula a duração
- Então: duração em dias = parte inteira de (quantidade ÷ consumo diário); fim estimado = início + duração − 1 dia; dias restantes = fim − hoje

### Cenário 8: Linguagem — lembrete ≠ tomada

- Dado: qualquer tela ou mensagem desta fatia
- Quando: o sistema fala do envio do horário do remédio
- Então: usa “lembrete enviado” / “verifique com o idoso ou cuidador”; **nunca** “o idoso tomou o medicamento” só porque o lembrete saiu

### Cenário 9: Opt-in WhatsApp antes de lembretes recorrentes

- Dado: pessoa cuidada com WhatsApp, ainda sem autorização
- Quando: o sistema prepara o primeiro contato
- Então: envia apresentação pedindo autorização; **nenhum** lembrete recorrente sai antes do opt-in registrado

### Cenário 10: Lembrete no horário com DND e opt-in (caminho feliz)

- Dado: cartela ativa, horários definidos, opt-in feito, conta não pausada, horário fora da janela “não incomodar”
- Quando: chega o horário do remédio
- Então: a Zelita envia a mensagem no WhatsApp (sandbox / modo acordado); registra evento de **lembrete enviado** auditável

### Cenário 11: Lembrete dentro do “não incomodar”

- Dado: horário do remédio cai dentro da janela “não incomodar” do idoso
- Quando: o disparo seria feito
- Então: o envio é adiado ou agrupado conforme a regra acordada na implementação da Spec; não incomoda na janela; o fato fica rastreável (enviado depois ou pulado com motivo)

### Cenário 12: Sem opt-in ou conta pausada

- Dado: sem autorização WhatsApp **ou** conta em pausa (placeholder)
- Quando: chega o horário
- Então: não envia lembrete ao idoso; registra que foi ignorado e o motivo

### Cenário 13: Aviso de cartela acabando (faltam ~5 dias)

- Dado: cartela ativa cuja data de fim está a N dias (padrão 5) ou menos
- Quando: a gestora olha Remédios / Hoje (e/ou o aviso do sistema do dia)
- Então: aparece indicação clara de reposição / cartela acabando, sem afirmar que o remédio “acabou porque tomou”

### Cenário 14: Painel Hoje e Remédios (mínimo alinhado ao protótipo)

- Dado: gestora autenticada com ou sem remédios
- Quando: abre Hoje e Remédios
- Então: vê resumo do dia / lista de remédios; empty state orientando anotar o primeiro; ações de anotar/pausar alinhadas ao protótipo em fidelidade **mínima** (marca, hierarquia, copy) — sem portar o HTML inteiro

### Cenário 15: Autorização por papel (matriz)

- Dado: membro com papel cuidador, visualizador ou contato de emergência
- Quando: tenta CRUD de medicamentos/cartelas ou ações reservadas ao admin
- Então: a operação é negada; admin consegue CRUD; demais papéis seguem a matriz do produto (ver rotina conforme papel; contato de emergência sem painel completo de remédios)

### Cenário 16: Falha de canal ou configuração incompleta

- Dado: WhatsApp ou agendador sem credenciais / sandbox indisponível
- Quando: um lembrete deveria sair
- Então: o app não quebra o painel da família; falha fica observável (registro + mensagem de correção para quem opera); modo seco é aceitável até as chaves existirem, desde que documentado no Done

## 5. Regras de negócio

- Sem senha no MVP para a família: só e-mail + código (10 min; reenvio após 45 s invalida o anterior) e/ou link mágico.
- Pessoa cuidada **não** é usuário de autenticação e **não** vê cobrança.
- Consumo diário = unidades por dose × doses por dia; fim da cartela pela fórmula do cenário 7; aviso padrão faltando 5 dias (além de véspera/último dia quando couber na UI mínima).
- Lembrete enviado **nunca** implica medicamento tomado.
- Opt-in WhatsApp obrigatório antes de lembretes recorrentes.
- Janela “não incomodar” vale para lembretes ao idoso (SOS à família, fora desta Spec, ignoraria silêncio do familiar).
- Casa do onboarding já nasce como lugar de sempre **com coordenadas** (geo fino de saída de zona continua fora).
- Trial/billing nesta fatia: apenas placeholder na conta; sem gateway e sem cobrança automática.
- Papéis: admin, cuidador, visualizador, contato de emergência — autorização pela matriz completa mesmo que a UI de convite não esteja nesta Spec.
- Canal WhatsApp: caminho mais fácil agora (sandbox Meta); troca de provedor depois sem mudar as regras de domínio.

## 6. Critérios de Done desta feature

- [ ] Todos os cenários acima passam (domínio via Vitest; UI/PWA via homologação manual quando aplicável)
- [ ] Testes unitários das regras de cartela (cálculo de fim) e de elegibilidade de lembrete (DND / opt-in / pausa) passam — cobertura ≥ 80% nessas regras
- [ ] `pnpm typecheck` passa
- [ ] `pnpm lint` passa
- [ ] `pnpm test` passa
- [ ] Checklist aplicável de `docs/SECURITY.md` (itens N/A justificados no relatório Done; RLS/authz cobertos pelos cenários 5 e 15)
- [ ] Homologação manual mínima alinhada a `PENDENCIAS` (FL-01…FL-04) via skill `manual-report` **ou** itens adiados explicitamente no state
- [ ] State + `docs/implementation/YYYY-MM-DD-fatia-1-….md` atualizados
- [ ] Nenhuma mudança fora do escopo sem aprovação
- [ ] Chaves: documentar no Done o que foi preenchido vs modo seco (Supabase / Inngest / WhatsApp)

## 7. Escopo de arquivos permitido

- Pode editar (com esta Spec aprovada):
  - `apps/web/modules/accounts/**`
  - `apps/web/modules/care-recipients/**`
  - `apps/web/modules/medications/**`
  - `apps/web/modules/reminders/**`
  - `apps/web/modules/location/**` (somente Casa / lugar de sempre do onboarding)
  - `apps/web/modules/billing/**` (somente placeholder de trial/status — sem gateway)
  - `apps/web/app/(auth)/**`, `apps/web/app/(family)/**`
  - `apps/web/app/api/webhooks/whatsapp/**`, `apps/web/app/api/webhooks/inngest/**`
  - `apps/web/lib/supabase/**`, `apps/web/lib/inngest/**`
  - `apps/web/components/**` (shadcn/UI necessária à fatia)
  - `supabase/migrations/**`, `supabase/policies/**`
  - `apps/web/.env.example` (e espelho na raiz se já existir padrão)
  - `apps/web/package.json` / lockfile do workspace (deps aprovadas: cliente Supabase SSR, Inngest, WhatsApp)
  - `docs/state/**`, `docs/implementation/**`
  - `specs/2026-08-12-fatia-1-auth-care-recipient-cartela-lembrete.md` (status da própria Spec)

- Não pode editar sem pedido explícito extra:
  - `AGENTS.md`
  - `docs/prd-mvp.md`, `docs/arquitetura-solucao.md`
  - `apps/web/modules/elder-access/**`, `apps/web/modules/sos/**`, `apps/web/app/(elder)/**` (além do estritamente necessário se algum import público mínimo for exigido — preferir zero toque)
  - `.env` real / secrets (o humano cola as chaves; o agente só orienta)
  - CI/CD de produção, `git push`, merge em `main`

## 8. Riscos e dúvidas abertas

- Segurança (RLS, authz, webhook, elder-access, PHI): matriz completa no início aumenta superfície de policies; service role só em jobs/webhooks confiáveis; não logar PHI desnecessário; webhook WhatsApp precisa validar origem.
- WhatsApp: sandbox Meta como caminho fácil; se credencial atrasar, modo seco + registro — confirmar no Done o que foi homologado de fato.
- Spec larga: risco de atraso; Done não declara verde com cenários P0 abertos.
- Coordenadas no onboarding: UX de mapa/pin mínimo vs lat/lng manual — detalhe de UI na implementação, desde que Casa fique com coordenadas.
- Checklist de `docs/SECURITY.md` é obrigatório no Done; marcar N/A só com justificativa (ex.: SOS/elder fora desta Spec).

## 9. Aprovação humana

- Aprovado por:
- Data:
- Observações:
