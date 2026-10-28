# Pendências

Lista viva do que falta entregar ou homologar. Itens concluídos saem daqui (e entram em `docs/implementation/` quando forem entregas).

**Contexto (2026-09-11):** o app já está em [zelita-web.vercel.app](https://zelita-web.vercel.app/). OTP + Resend (`zelita@mail.modernxlab.com.br`) funcionam. O buraco não é “subir o app” — é fechar o ciclo de valor e deixar o cadastro público seguro.

**Plano completo (research + ordem + checklist):** [`docs/plans/2026-09-11-producao-real.md`](../plans/2026-09-11-producao-real.md)

---

## Produção real — três gates

### Gate 0 — Já no ar (não é pendência)

- Deploy Vercel + landing
- Auth OTP + Resend com remetente próprio
- Painel da família F4.1–F4.11 (Done técnico)
- Cadastro 8 passos + trial sem cartão (stubs de pagamento)
- Código de lembrete/opt-in Inngest + adapter WA (dry-run sem token)

### Gate 1 — Abrir cadastro com segurança (antes de gente de fora)

Sem isto, a URL pública captura dados de saúde sem o mínimo de higiene.

- [x] **Headers A05** no `next.config.ts` (`CSP`, `nosniff`, `Referrer-Policy`, `HSTS`, `X-Frame-Options: DENY`) — `docs/SECURITY.md` (2026-09-20)
- [x] **Confirmar `db:push` remoto** das migrations `007_exams_storage` e `009_sos` — tabelas `exams` e `sos_alerts` no remoto (2026-09-20)
- [x] **Homologar no Vercel** FL-01…FL-03: Entrar OTP → cadastro 8 passos → Remédios/Hoje (2026-09-20; OTP chega, mas só no spam)
- [x] **Smoke aceite de convite (FL-07 parcial):** Copiar link → colar em outra aba funciona (2026-09-20)
- [x] **Privacidade / Termos** no rodapé — `/privacidade` e `/termos` (2026-09-20; no ar após deploy)
- [x] **Sentry DSN de produção** preenchido na Vercel + `.env` (2026-09-20) — redeploy necessário para `NEXT_PUBLIC_*`

Convite fechado (2–3 contas conhecidas) pode começar **em paralelo** ao Gate 1, sem anunciar a landing.

### Gate 2 — Ciclo de valor do MVP (lembrete + idoso) — bloqueia “produção real”

Sem isto a família usa um painel; o idoso não recebe nem pede ajuda.

#### 2.1 Canal e jobs (ops + código)

- [x] **Agenda recorrente + fuso** — cron 00:10 `America/Sao_Paulo` + restante de hoje ao salvar (código 2026-09-21)
- [x] **Adapter WhatsApp em template** — `zelita_opt_in` / `zelita_med_reminder` (código 2026-09-21)
- [x] **Webhook WA assinado** — HMAC `X-Hub-Signature-256`; fail closed sem `WHATSAPP_APP_SECRET` (código 2026-09-21)
- [x] **Job de cartela** — 5 dias / véspera / último dia + e-mail (código 2026-09-21)
- [x] **Pausa de trial D30** — aviso D-5 + `paused` sem cobrança (código 2026-09-21)
- [x] **Inngest em produção:** sync 22/09 em `https://zelita-web.vercel.app/api/webhooks/inngest` (6 functions)
- [x] **WhatsApp na Vercel:** número BR (`+55 13 97401-0646`, Phone Number ID `1343091472226387`, conta Zelita `2569543983548855`) + token permanente em Production, redeploy confirmado em 26/10
- [x] **Templates Meta Approved na conta Zelita** — `zelita_opt_in` e `zelita_med_reminder`, Utilidade, Português (BR), Ativo em 26/10 na conta `2569543983548855`
- [x] **Opt-in + lembrete ponta a ponta** — homologado no Vercel de 26/10 a 28/10 (conta comercial Celular Zelita; recorrência 27/10 e 28/10, horários 08:00 / 12:00 / 12:19). Evidência: `docs/evidencias/tc-fl04-03-lembretes-whatsapp.png`. TC-FL04-01, 02, 03 e 06 aprovados
- [x] **TC-FL04-05** — POST sem assinatura devolve 403 (ops 22/09; não reexecutado nesta rodada)
- [ ] **TC-FL04-04, 07 e 08** — caso sem opt-in, aviso de cartela e pausa D30. Não bloqueiam a F5

#### 2.2 Lado do idoso (produto)

- [x] **F5 — PWA do idoso (código)** — prévia `/idoso` entregue em 28/10: [`docs/implementation/2026-10-28-f5-pwa-idoso.md`](../implementation/2026-10-28-f5-pwa-idoso.md). SOS desta fase não grava alerta
- [ ] **FL-05 no Vercel** — adiado para o fim das tarefas de implementação. Print de 28/10 do início está em `docs/evidencias/`; não fecha o caso
- [ ] **F6 — Vínculo de aparelho:** token curto, uso único, só no WA cadastrado, preso ao 1º device, revogável em Ajustes
- [ ] **SOS real:** insert pelo device → notifica papéis da ordem (ignora DND) → painel Pedidos de ajuda
- [ ] **Confirmar Casa (GPS)** — alerta de zona só com coords; posição real só vem do PWA

### Gate 3 — Pode esperar no piloto (não bloqueia produção real)

- [ ] **Envio automático de e-mail de convite** — hoje só **Copiar link** (aceite colando o link em outra aba ok, 2026-09-20). Passo 7 do cadastro ainda não persiste convite. Spec nova, path `accounts` (`tight`)
- F4.12 — Como usar + tour (`/familia/guia` é empty state)
- Gateway de pagamento / NF / trocar cartão (stubs ok; trial sem cartão)
- Voz Cuidado+ (P2)
- Domínio custom (`zelita.com.br`)
- [x] Editar horários da cartela (26/10) — botão ativo; doses por dia e duração da caixa permanecem
- Passkey / biometria
- Texto grande no app do idoso — entregue na F5 (28/10). O painel da família segue no piso de 15,5px
- Canal de suporte WA (placeholder na ajuda)
- LCP das fontes / conferência visual extra
- Copy “Resumo semanal” no plano Família (fora do MVP)

---

## Homologação manual restante (skill `manual-report`)

Fazer **no ambiente Vercel**, numa rodada só, **depois** de fechar as tarefas de implementação do Gate 2.2. Não intercalar caso a caso no meio do código.

- [x] F1 · Landing — TC-F1-01…TC-F1-06
- [x] FL-01 Auth OTP *(2026-09-20 no Vercel — código chega; só no spam)*
- [x] FL-02 Onboarding + pessoa cuidada *(2026-09-20 — 8 passos ok; convite do passo 7 não persiste)*
- [x] FL-03 Remédios e cartela *(2026-09-20)*
- [x] FL-04 Lembretes (job + WA) *(envio Meta 100% em 26–28/10; ficam abertos TC-FL04-04, 07 e 08)*
- [ ] FL-05 PWA idoso *(código em 28/10; homologar na rodada final)*
- [ ] FL-06 SOS *(Gate 2 — F5/F6)*
- [x] FL-07 Segurança / RLS smoke *(Gate 1 — aceite via **Copiar link** ok, 2026-09-20; e-mail automático ficou no Gate 3)*
- [x] FL-08 Exames smoke *(2026-09-20 upload ok; posição real Gate 2)*
- [ ] FL-09 Avisos
- [ ] FL-10 Ajustes
- [ ] FL-11 Meu plano

---

## Ordem sugerida

```text
1. Gate 1 — feito
2. Gate 2.1 — envio Meta feito (26–28/10). Restam TC-FL04-04, 07 e 08, sem bloquear a F5
3. Implementação: F5 (código feito) → F6 (vínculo) → SOS real e GPS  [paths críticos, autonomia tight]
4. Homologação manual restante no Vercel (FL-05, FL-06 e casos abertos)
5. Piloto família + idoso (1 conta controlada)
6. Gate 3 só depois (tour, billing real, domínio, voz)
```
