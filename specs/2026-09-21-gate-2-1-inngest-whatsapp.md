# Spec: Gate 2.1 — Inngest + WhatsApp (lembrete de verdade)

- Status: `done`
- Data: 2026-09-21
- Autonomia: `tight`
- Projeto: Zelita (`apps/web`)
- Pedido original: Gate 2.1 — lembrete no WhatsApp no horário de Brasília, só após opt-in, com job recorrente, webhook assinado, aviso de cartela e pausa de trial D30.
- Plano: [`docs/plans/2026-09-21-gate-2-1-inngest-whatsapp.md`](../docs/plans/2026-09-21-gate-2-1-inngest-whatsapp.md)

## 1. Objetivo

A família cadastra a cartela uma vez; a pessoa cuidada recebe o lembrete no WhatsApp no horário de Brasília, todos os dias da cartela ativa, só depois de autorizar. A gestora recebe aviso quando a cartela está acabando. Sem ação no fim do trial, a conta pausa e os lembretes param — sem cobrança automática.

## 2. Fora de escopo

- PWA do idoso (F5), vínculo de aparelho (F6), SOS real
- Voz Cuidado+, gateway de pagamento, NF, trocar cartão
- E-mail automático de convite, editar horários da cartela, domínio `zelita.com.br`
- WhatsApp para a família (avisos de cartela e trial saem por painel + e-mail)
- Migration de schema, salvo se a idempotência exigir coluna — aí para e pede aprovação

## 3. Atores e pré-condições

- Quem usa:
  - **Gestora / admin** — cadastra cartela; recebe aviso de reposição e de fim de trial
  - **Pessoa cuidada** — não autentica; autoriza no WhatsApp e recebe lembretes
  - **Sistema** — agenda, dispara, registra “lembrete enviado” (nunca afirma tomada)
- O que precisa existir antes:
  - Fatia 1 Done (cartela, DND, opt-in no domínio, adapter dry-run)
  - Inngest com event key + signing key (evidência local em 2026-09-21)
  - WhatsApp Cloud API com token + phone number id (sandbox local em 2026-09-21)
  - Templates Meta Approved para envio real; até lá, dry-run observável

## 4. Comportamento esperado (cenários)

### Cenário 1: Pedido de opt-in ao salvar cartela

- Dado: pessoa cuidada com WhatsApp e sem autorização
- Quando: a gestora salva ou troca a cartela
- Então: a Zelita pede autorização no WhatsApp (template de apresentação); nenhum lembrete recorrente sai antes da resposta

### Cenário 2: Idoso autoriza com SIM

- Dado: pedido de opt-in pendente
- Quando: a pessoa cuidada responde SIM (também `sim`, `SIM.`, com pontuação)
- Então: a autorização fica registrada; os próximos horários passam a poder enviar

### Cenário 3: Lembrete no horário de Brasília (caminho feliz)

- Dado: cartela ativa, horários definidos, opt-in feito, conta ativa, horário fora do “não incomodar”
- Quando: chega o horário do remédio no fuso `America/Sao_Paulo`
- Então: a Zelita envia o template de lembrete; registra evento de **lembrete enviado** (não afirma tomada)

### Cenário 4: Série diária

- Dado: cartela ativa com horários
- Quando: vira o dia em Brasília
- Então: os horários **daquele dia** são preparados de novo; não depende de um único disparo “amanhã”

### Cenário 5: Restante de hoje ao salvar

- Dado: gestora salva a cartela no meio do dia
- Quando: ainda há horários futuros hoje
- Então: só esses horários de hoje entram na agenda imediata (além da série dos próximos dias)

### Cenário 6: Sem opt-in ou conta pausada

- Dado: sem autorização **ou** conta pausada/cancelada
- Quando: chega o horário
- Então: não envia; registra que foi ignorado e o motivo

### Cenário 7: Cartela pausada

- Dado: cartela pausada
- Quando: o sistema materializa o dia
- Então: essa cartela não gera lembrete

### Cenário 8: Não incomodar — adia no mesmo dia

- Dado: horário do remédio cai dentro da janela “não incomodar” e o fim da janela ainda é no mesmo dia, sem colidir com o próximo horário
- Quando: o disparo seria feito
- Então: o envio é adiado para o fim da janela; o fato fica rastreável

### Cenário 9: Não incomodar — pula

- Dado: o fim da janela “não incomodar” cai no dia seguinte **ou** colide com o próximo horário
- Quando: o disparo seria feito
- Então: não envia de madrugada; registra pulo com motivo

### Cenário 10: Retry não duplica

- Dado: um horário já tem evento de enviado ou pulado
- Quando: o job roda de novo para o mesmo horário
- Então: não manda segunda mensagem

### Cenário 11: Webhook sem assinatura válida

- Dado: alguém chama o webhook de WhatsApp sem assinatura correta
- Quando: tenta registrar opt-in
- Então: a Zelita recusa; a autorização **não** muda

### Cenário 12: Canal incompleto

- Dado: token, template ou agendador ausente
- Quando: um lembrete deveria sair
- Então: o painel da família não quebra; o modo seco fica registrado com mensagem de correção

### Cenário 13: Aviso de cartela

- Dado: cartela ativa faltando 5 dias, na véspera ou no último dia
- Quando: o job diário de reposição roda
- Então: registra o aviso correspondente e avisa a gestora por e-mail (o painel já mostra); não afirma que o remédio “acabou porque tomou”

### Cenário 14: Trial acabando

- Dado: trial com 5 dias restantes, conta ainda ativa
- Quando: o job diário de billing roda
- Então: a gestora recebe e-mail de aviso; não há cobrança

### Cenário 15: Pausa no fim do trial

- Dado: trial vencido, sem plano pago
- Quando: o job de pausa roda
- Então: a conta fica pausada; dados permanecem; lembretes param; **não** cobra

### Cenário 16: Linguagem — lembrete ≠ tomada

- Dado: qualquer mensagem ou registro desta fatia
- Quando: o sistema fala do horário do remédio
- Então: usa “lembrete enviado” / “verifique com o idoso ou cuidador”; nunca “o idoso tomou”

## 5. Regras de negócio

- Fuso de cuidado: `America/Sao_Paulo`.
- Opt-in obrigatório antes de lembrete recorrente.
- Lembrete enviado nunca implica tomada.
- DND vale para lembretes ao idoso; não envia de madrugada.
- Templates WhatsApp: `zelita_opt_in` (nome) e `zelita_med_reminder` (nome + medicamento). Categoria UTILITY. Variáveis tipadas.
- Match de telefone: dígitos nacionais 10–11 (não 8).
- Resposta de opt-in: SIM normalizado (`sim`, `SIM.`, acentos/pontuação).
- Idempotência por cartela + horário previsto + tipo sent/skipped.
- Aviso de cartela: 5 dias (ou `refill_alert_days`), véspera, último dia — um envio de cada tipo por cartela por dia.
- Trial −5 dias: um aviso. Fim do trial sem plano pago: pausa, sem cobrança.
- Service role só em webhook e jobs Inngest.
- Sem PHI no Sentry: IDs + tipo de evento.

## 6. Critérios de Done desta feature

- [x] Cenários de domínio cobertos via Vitest (FL-04 no Vercel adiado no state — TCs no relatório)
- [x] Cobertura das regras de domínio ≥ 80%
- [x] `pnpm typecheck` passa
- [x] `pnpm lint` passa
- [x] `pnpm test` passa (382)
- [x] Checklist aplicável de `docs/SECURITY.md` (N/A justificados no implementation)
- [x] Nenhuma mudança fora do escopo sem aprovação
- [x] State + `docs/implementation/2026-09-21-gate-2-1-inngest-whatsapp.md`

## 7. Escopo de arquivos permitido

- Pode editar:
  - `apps/web/modules/reminders/**`
  - `apps/web/lib/inngest/**`
  - `apps/web/app/api/webhooks/whatsapp/**`
  - `apps/web/app/api/webhooks/inngest/**`
  - `docs/state/**`, `docs/implementation/**`, `docs/plans/2026-09-21-gate-2-1-inngest-whatsapp.md`
  - `.env.example` (somente **nomes** de chave)
- Com esta Spec (review tight):
  - `apps/web/modules/reminders/domain/**`
  - `apps/web/modules/billing/**` (aviso e pausa de trial — sem gateway)
  - `apps/web/modules/accounts/**` (somente atualizar `status` para `paused` no job)
- Não pode:
  - `AGENTS.md`, PRD, `docs/SECURITY.md`, `docs/arquitetura-solucao.md`
  - `elder-access`, `sos`, `(elder)/`
  - `supabase/migrations/**` sem pedido extra
  - `.env` real / valores de segredo
  - `git push`, merge em `main`

## 8. Riscos e dúvidas abertas

- Segurança: webhook deve falhar fechado sem `WHATSAPP_APP_SECRET`; HMAC antes de mutar; match 10–11 dígitos reduz colisão do match por 8.
- Templates Meta: envio real bloqueado até Approved; código fica pronto em dry-run.
- Token local é de sandbox (comentário no `.env`); produção na Vercel ainda precisa de conferência humana.
- Pausa de trial: fail closed, sem cobrança, só `paused`.

## 9. Aprovação humana

- Aprovado por: plano Gate 2.1 confirmado para implementação (2026-09-21)
- Data: 2026-09-21
- Observações: evidência local de `INNGEST_*` e `WHATSAPP_*` (token, phone id, verify). Falta `WHATSAPP_APP_SECRET` e conferência de templates na Meta.
