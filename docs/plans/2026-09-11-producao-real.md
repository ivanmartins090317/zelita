# Plano — Produção real (ciclo de valor do MVP)

- Status: `research` — aguardando aprovação para executar o Gate 1
- Data: 2026-09-11
- Origem: research de prontidão de produção + `docs/state/PENDENCIAS.md`
- Autonomia: Gate 1 `medium` · Gate 2.1 `medium` (WA/Inngest) · F5/F6 `tight` (paths críticos)
- App no ar: [https://zelita-web.vercel.app/](https://zelita-web.vercel.app/)
- Auth: OTP + Resend (`zelita@mail.modernxlab.com.br`)

---

## 1. Veredito

O app **já está hospedado**. O buraco não é “subir o app”. Produção real = cadastro público seguro **e** ciclo de valor (lembrete no WhatsApp + SOS do idoso).

| Pergunta | Resposta |
| --- | --- |
| Dá para piloto fechado da família agora? | Sim — 2–3 contas conhecidas, sem anunciar a landing |
| Dá para produção real do MVP? | Não — Gate 2 (WA + Inngest + F5/F6) ainda bloqueia |
| Dá para usuários pagantes? | Não — gateway de pagamento é Gate 3 (stubs ok no trial) |

---

## 2. Ordem de prioridade

Executar nesta ordem. Não pular gate.

```text
P0  Gate 1     Segurança + homologação família no Vercel
P1  Gate 2.1   Inngest + WhatsApp (templates + webhook + recorrência/fuso)
P2  Gate 2.2   Spec F5 (PWA) → Spec F6 (vínculo) → SOS real + Casa GPS
P3  Piloto     1 família + idoso controlados
P4  Gate 3     Tour, billing real, domínio, voz — só depois
```

| Prioridade | Gate | Objetivo | Bloqueia produção real? |
| --- | --- | --- | --- |
| **P0** | Gate 1 | Abrir cadastro com higiene mínima | Bloqueia cadastro **público** |
| **P1** | Gate 2.1 | Lembrete chega de verdade | Bloqueia pilar 1 (remédios) |
| **P2** | Gate 2.2 | Idoso usa PWA / SOS / vínculo | Bloqueia pilares 2 e 3 |
| **P3** | Piloto | Validar ciclo completo | Bloqueia anúncio |
| **P4** | Gate 3 | Polimento e cobrança | Não |

Convite fechado (2–3 contas) pode rodar **em paralelo** ao P0, sem anunciar a landing.

---

## 3. Gate 0 — Já no ar (não implementar)

Checklist de contexto. Tudo abaixo já existe.

- [x] Deploy Vercel + landing
- [x] Auth OTP + Resend com remetente próprio
- [x] Painel da família F4.1–F4.11 (Done técnico)
- [x] Cadastro 8 passos + trial sem cartão (stubs de pagamento)
- [x] Código de lembrete/opt-in Inngest + adapter WA (dry-run sem token)
- [x] Homologação F1 · Landing (TC-F1-01…TC-F1-06)

---

## 4. Checklist P0 — Gate 1 (abrir cadastro com segurança)

Sem isto, a URL pública captura dados de saúde sem higiene mínima.

### 4.1 Código e infra

- [x] Headers A05 no `apps/web/next.config.ts` (`docs/SECURITY.md`):
  - [x] `Content-Security-Policy`
  - [x] `X-Content-Type-Options: nosniff`
  - [x] `Referrer-Policy`
  - [x] `Strict-Transport-Security`
  - [x] `X-Frame-Options: DENY`
- [x] Confirmar `pnpm db:push` remoto das migrations pendentes:
  - [x] `007_exams_storage.sql` — tabela `exams` no remoto (2026-09-20)
  - [x] `009_sos.sql` — tabela `sos_alerts` no remoto (2026-09-20)
  - [x] Demais (`001`–`006`, `008`, `010`–`012`) já constam aplicadas
- [x] Sentry DSN de produção preenchido (Vercel + `.env`, 2026-09-20; sem PHI nos eventos)
- [x] Privacidade / Termos no rodapé da landing (`/privacidade` e `/termos`, 2026-09-20)

### 4.2 Homologação no Vercel (não só local)

Skill `manual-report`. Ambiente: [zelita-web.vercel.app](https://zelita-web.vercel.app/).

- [x] FL-01 Auth OTP
- [x] FL-02 Onboarding + pessoa cuidada
- [x] FL-03 Remédios e cartela
- [x] FL-07 Smoke RLS / papéis — aceite via Copiar link ok (2026-09-20); e-mail automático ficou no Gate 3
- [x] FL-08 smoke Exames (upload básico; posição real fica no P2)

**Done do Gate 1:** headers no ar + `007`/`009` no remoto + FL-01…03 e FL-07 verdes + legal mínimo + Sentry.

---

## 5. Checklist P1 — Gate 2.1 (canal e jobs)

O código atual **não basta**. Preencher env sem template Meta e sem recorrência/fuso não fecha o pilar de remédios.

### 5.1 Inngest

- [ ] `INNGEST_EVENT_KEY` e `INNGEST_SIGNING_KEY` na Vercel
- [ ] Sync do app em `https://zelita-web.vercel.app/api/webhooks/inngest`
- [ ] Smoke: evento `wa/opt_in.request` e `med/reminder.send` aparecem no dashboard Inngest

### 5.2 Agenda (gap de código)

Hoje `scheduleMedicationReminders` dispara só o **dia seguinte** e ancora hora em **UTC**.

- [ ] Série diária / cron (não um único disparo)
- [ ] Fuso `America/Sao_Paulo` (UTC-3 — senão o lembrete atrasa ~3 h)
- [ ] Job de aviso de cartela à família (5 dias / véspera / último dia) — cálculo existe no painel; envio não
- [ ] Job de pausa de trial D30 — UI mostra trial; conta não pausa sozinha (PRD: sem cobrança automática)

### 5.3 WhatsApp

- [ ] `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN` na Vercel
- [ ] Templates Meta **aprovados** (opt-in + lembrete) — o adapter manda `type: text` livre; a Cloud API rejeita mensagem iniciada pelo negócio fora da janela de 24 h
- [ ] Adapter passa a usar template (não só texto livre)
- [ ] Webhook em `https://zelita-web.vercel.app/api/webhooks/whatsapp`
- [ ] Validar assinatura do POST (`SECURITY.md` — hoje não checa)
- [ ] Opt-in ponta a ponta: pedido → idoso responde SIM → `wa_opt_in_at` → lembretes só depois
- [ ] Homologação FL-04 (job + WA sandbox/produção)

**Done do Gate 2.1:** lembrete chega no WhatsApp no horário de Brasília, só após opt-in, com job recorrente e webhook assinado.

---

## 6. Checklist P2 — Gate 2.2 (lado do idoso)

Paths críticos (`elder-access`, `sos`, `(elder)/`). **Uma Spec por fase, aprovação humana, autonomia `tight`.**

### 6.1 F5 — PWA do idoso

`/idoso` ainda é placeholder. Sem Spec aprovada, não implementar.

- [ ] Spec `specs/…-f5-pwa-idoso.md` aprovada
- [ ] Início (próximo remédio, botão de ajuda, ligar para a família, horários)
- [ ] Horários do dia
- [ ] Lista da família + SAMU 192
- [ ] SOS 2 etapas + disclaimer + pós-envio
- [ ] Pisos: texto ≥17px, títulos 23–26px, alvos ≥56px, SOS >100px
- [ ] Sem senha, sem campo de digitação, uma decisão por tela
- [ ] Homologação FL-05

### 6.2 F6 — Vínculo de aparelho

- [ ] Spec `specs/…-f6-vinculo-aparelho.md` aprovada
- [ ] Token curto (15 min), uso único, só no WA cadastrado
- [ ] Preso ao primeiro aparelho que abrir
- [ ] Revogável em Ajustes
- [ ] Guia “adicionar à tela de início”
- [ ] Schema `care_recipient_devices` + RLS

### 6.3 Fechamento do ciclo

- [ ] SOS real: insert pelo device → notifica papéis da ordem (ignora DND) → painel Pedidos de ajuda
- [ ] Confirmar Casa (GPS) — alerta de zona só com coords
- [ ] Homologação FL-06 (SOS)

**Done do Gate 2.2:** idoso abre PWA sem login, recebe horários, dispara SOS; família vê e resolve.

---

## 7. Checklist P3 — Piloto família + idoso

- [ ] 1 conta controlada (não anúncio público)
- [ ] Cadastro → cartela → opt-in WA → lembrete no horário
- [ ] Vínculo do aparelho → SOS teste → resolução no painel
- [ ] Casa confirmada (se Cuidado+ / zona)
- [ ] Checklist aplicável de `docs/SECURITY.md` no relatório do piloto

---

## 8. Checklist P4 — Gate 3 (pode esperar)

Não bloqueia produção real. Só depois do piloto.

- [ ] Envio automático de e-mail de convite (hoje Copiar link)
- [ ] F4.12 — Como usar + tour (`/familia/guia` é empty state)
- [ ] Gateway de pagamento / NF / trocar cartão
- [ ] Voz Cuidado+ (P2)
- [ ] Domínio custom (`zelita.com.br`)
- [ ] Editar horários da cartela (hoje “Em breve”)
- [ ] Passkey / biometria
- [ ] Texto grande (adiado à F5)
- [ ] Canal de suporte WA (placeholder na ajuda)
- [ ] LCP das fontes / conferência visual extra
- [ ] Copy “Resumo semanal” no plano Família (fora do MVP)
- [ ] Homologação FL-09 Avisos · FL-10 Ajustes · FL-11 Meu plano

---

## 9. Homologação manual (mapa)

Fazer **no Vercel**. Skill `manual-report`.

| Fluxo | Gate | Status |
| --- | --- | --- |
| F1 Landing | Gate 0 | [x] |
| FL-01 Auth OTP | P0 | [x] chega; só spam |
| FL-02 Onboarding | P0 | [x] |
| FL-03 Remédios | P0 | [x] |
| FL-07 RLS smoke | P0 | [x] aceite via Copiar link |
| FL-08 Exames smoke | P0 | [x] |
| FL-04 Lembretes + WA | P1 | [ ] |
| FL-05 PWA idoso | P2 | [ ] |
| FL-06 SOS | P2 | [ ] |
| FL-08 Localização real | P2 | [ ] |
| FL-09 Avisos | P4 | [ ] |
| FL-10 Ajustes | P4 | [ ] |
| FL-11 Meu plano | P4 | [ ] |

---

## 10. Riscos deste research

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Adapter WA em texto livre | Lembrete nunca sai em produção Meta | Templates aprovados + mudar o port **antes** de ligar token |
| Agenda em UTC, um único dia | Lembrete atrasado e sem repetição | Cron diário + `America/Sao_Paulo` no Gate 2.1 |
| Webhook WA sem signature | Qualquer POST marca opt-in | Validar assinatura no Gate 2.1 |
| `/idoso` placeholder | SOS/geo/vínculo inexistentes | F5 → F6 com Spec + review `tight` |
| Landing sem headers/legal | Cadastro público inseguro | Gate 1 antes de anunciar |
| Trial sem job de pausa | Conta “grátis para sempre” | Job D30 no Gate 2.1 |

---

## 11. Próximo artefato após aprovação

1. Executar **Gate 1** (headers + `db:push` 007/009 + legal mínimo) — sem Spec nova.
2. Spec de **Gate 2.1** (recorrência/fuso + templates WA + webhook assinado + jobs cartela/trial).
3. Spec **F5** e depois **F6** (aprovação humana, autonomia `tight`).

---

## 12. Relação com outros docs

- Pendências vivas: `docs/state/PENDENCIAS.md`
- Segurança: `docs/SECURITY.md` (A05, webhooks, elder-access)
- Roadmap de telas: `docs/state/PLANO-ALTA-FIDELIDADE.md` (F5, F6)
- PRD: `docs/prd-mvp.md` (pilares 1–4, fatias 2–4)
