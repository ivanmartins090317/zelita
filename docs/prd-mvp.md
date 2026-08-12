# Zelita — PRD do MVP

> Documento técnico de produto a partir de [[definicao-produto]] + protótipo visual.
> Status: rascunho aprovável para implementação
> Data: 2026-08-12
> Hub: [[zelita]]
> Protótipo: `c:\projetos\SaaS-para-idoso\zelita-prototipo.html\zelita-prototipo.html`

---

## 0. Resumo executivo

**Zelita** é um SaaS de coordenação familiar para cuidado de idosos. O familiar (~40–60 anos) paga e gerencia; o idoso recebe lembretes e usa SOS sem login e sem obrigação de instalar app.

**Frase curta:** Cuide de quem você ama, mesmo à distância.

**MVP:** coordenação familiar + lembretes (não plataforma médica completa).

### Quatro pilares (prioridade)

1. Remédios na hora certa (lembrete + fim de cartela)
2. Botão de pedir ajuda (SOS para a família — não substitui SAMU 192 / Bombeiros 193)
3. Onde ele está (última localização + lugares de sempre)
4. Exames e receitas (foto/PDF)

### Fora do MVP

Telemedicina, videochamada, labs/farmácias, compra automática, detecção de quedas, sinais vitais, smartwatch, IA preditiva, prontuário completo, acionamento de emergência pública, app nativo, resumo médico com IA, diagnóstico.

---

## 1. Personas e casos de uso

### 1.1 Personas

| Persona | Perfil | Objetivo | Dor principal |
| --- | --- | --- | --- |
| **Cintia (gestora / pagadora)** | Filha, 40–60 anos, usa celular/WhatsApp, mora longe ou coordena à distância | Saber que o pai está ok, sem viver em ansiedade | Remédios, exames e emergências espalhados; irmãos sem alinhamento |
| **Seu João (pessoa cuidada)** | Idoso, baixa adesão digital, WhatsApp já conhecido | Receber lembretes claros e pedir ajuda fácil | Apps complexos, senha, confirmação diária |
| **Ana (cuidadora)** | Cuidadora profissional ou familiar que acompanha no dia a dia | Ver rotina, registrar observação, receber SOS | Não tem visão compartilhada com a família |
| **Marcelo (familiar participante)** | Irmão / outro filho | Acompanhar e ajudar sem virar administrador | Depende de mensagens soltas no grupo |

### 1.2 Casos de uso principais (MVP)

| ID | Ator | Caso de uso | Resultado esperado |
| --- | --- | --- | --- |
| UC-01 | Cintia | Criar conta (e-mail + código) e cadastrar o idoso | Conta + pessoa cuidada criadas; trial 30 dias |
| UC-02 | Cintia | Cadastrar cartela de remédio com horários | Lembretes agendados; data de fim calculada |
| UC-03 | Sistema | Enviar lembrete no horário (WhatsApp) | Mensagem enviada; status “lembrete enviado” |
| UC-04 | Cintia | Receber aviso de cartela acabando | Aviso 5 dias antes / véspera / último dia |
| UC-05 | Seu João | Acionar SOS (PWA ou atalho) | Família/contatos notificados com contexto |
| UC-06 | Cintia | Ver pedido de ajuda e marcar resolvido | Timeline de SOS atualizada |
| UC-07 | Seu João / device | Compartilhar localização (com consentimento) | Última posição + alerta de saída de zona |
| UC-08 | Cintia | Upload de exame (PDF/foto) | Arquivo armazenado e compartilhado com autorizados |
| UC-09 | Cintia | Convidar participante com papel | Convite 7 dias; permissões aplicadas via RLS |
| UC-10 | Ana | Ver rotina e registrar observação | Observação visível no painel da família |
| UC-11 | Ana / Admin | Confirmar tomada pontual (opcional) | Status “tomada confirmada por X” — nunca automático |
| UC-12 | Cintia | Vincular atalho no celular do idoso | PWA abre sem login |

---

## 2. Fluxos

### 2.1 Família — onboarding (8 passos)

1. E-mail
2. Código de 6 dígitos (válido 10 min; reenvio após 45 s invalida o anterior)
3. Nome + celular WhatsApp do gestor
4. Dados da pessoa cuidada (nome, como chamar, nascimento, parentesco)
5. WhatsApp do idoso + endereço de casa (vira primeiro “lugar de sempre”)
6. Canal (só WA / WA+voz Cuidado+ / só ligação) + tom + janela “não incomodar”
7. Convidar participantes (opcional)
8. Plano: 30 dias grátis **sem cartão** **ou** assinar agora (cobrança só após trial; sem confirmação no fim → conta pausa, **não cobra automaticamente**)

**Regra:** a pessoa cuidada nunca faz login, não tem e-mail na auth e não vê cobrança.

### 2.2 Família — dia a dia

```
Login (OTP) → Painel "Hoje"
  → Remédios (CRUD cartela, pausar, nova compra)
  → Avisos (fim de cartela, SOS, zona)
  → Pedidos de ajuda
  → Onde ele está
  → Exames
  → Quem participa / Plano / Ajustes
```

**Primeiro acesso:** checklist (anotar remédio, configurar SOS, convidar alguém, ver como WhatsApp fala com ele).

### 2.3 Idoso — lembrete (sem confirmação diária)

```
Agendador → janela "não incomodar"? 
  → se sim, adia / agrupa conforme regra
  → WhatsApp: texto (+ áudio opcional da família)
  → (Cuidado+) se não houver leitura em ~20 min → ligação de voz
  → registra evento: reminder_sent (NÃO medication_taken)
```

Antes do primeiro lembrete: mensagem de apresentação + opt-in do idoso no WhatsApp.

### 2.4 Idoso — SOS

```
Tela inicial → "Preciso de ajuda"
  → confirmação anti-toque: "Você precisa de ajuda agora?" Sim / Cancelar
  → dispara notificações (WA/e-mail/push conforme papel)
  → payload: nome, horário, localização se disponível, tipo, contatos avisados, telefone retorno
  → feedback: "Sua família foi avisada. Aguarde contato."
  → disclaimer SAMU 192 / Bombeiros 193
```

### 2.5 Vínculo do celular (PWA)

Fluxo guiado no protótipo: familiar gera vínculo → QR / código no aparelho do idoso → “Adicionar à tela inicial” → abre direto sem login.

### 2.6 Cuidador

Login limitado → visão de rotina do dia → observações → alertas permitidos → exames conforme autorização → **não** edita cartela, zonas, convites nem pagamento.

---

## 3. Telas principais (mapeadas no protótipo)

### 3.1 Superfícies

| Superfície | Público | Função |
| --- | --- | --- |
| Site (landing) | Prospect | Conversão / trial |
| Entrar | Família / cuidador | OTP por e-mail |
| Cadastro (8 passos) | Novo gestor | Onboarding |
| Painel da família | Admin / participantes | Centro de gestão |
| App do idoso (PWA) | Pessoa cuidada | Início, horários, SOS, ligar família |
| Instalar no celular dele | Familiar | Vínculo do device |
| WhatsApp & voz | Sistema | Canal de lembretes/alertas |
| Visão do cuidador | Cuidador | Rotina + observações |

### 3.2 Painel da família — módulos

| Rota / view | Conteúdo mínimo MVP |
| --- | --- |
| Hoje / primeiro acesso | Resumo do dia + checklist onboarding |
| Remédios | Lista, detalhe de cartela, avisos de fim, + remédio |
| Consultas e tarefas | Lista leve de compromissos/tarefas (MVP enxuto) |
| Avisos | Feed + matriz “quem recebe o quê” |
| Pedidos de ajuda | Timeline SOS, status aberto/resolvido |
| Onde ele está | Última posição, lugares de sempre, histórico básico |
| Exames e receitas | Upload, metadados, compartilhar, download |
| Como usar a Zelita | Guia + tour |
| Quem participa | Lista, convites, matriz de papéis |
| Meu plano | Trial, plano, uso, trocar/cancelar |
| Ajustes | Canal, tom, DND, privacidade LGPD, dados do idoso |

### 3.3 App do idoso

- Início: saudação + próximo lembrete + botão SOS grande
- Horários do dia
- Família: ligar / contatos autorizados
- Regras UX: texto ≥17 px, botões ≥56 px, SOS >100 px, uma ação por tela, sem digitação/senha

### 3.4 Modais críticos

- Nova cartela (cálculo de término antes de salvar)
- Novo exame
- Convidar pessoa
- Trocar pessoa cuidada (plano Família)

---

## 4. Entidades do banco (modelo lógico)

> Implementação alvo: **Supabase + Postgres + RLS**. Nomes em inglês no schema; labels em PT-BR na UI.

### 4.1 Núcleo

| Entidade | Campos-chave | Notas |
| --- | --- | --- |
| `profiles` | id (auth.users), name, phone_whatsapp, locale | Usuário autenticado (família/cuidador) |
| `families` / `accounts` | id, plan, trial_ends_at, status (active\|paused\|canceled), billing_customer_id | Conta pagadora |
| `account_members` | account_id, profile_id, role, status, invited_at, accepted_at | Papel na conta |
| `care_recipients` | account_id, full_name, display_name, birth_date, relationship, whatsapp, address, tone, channel_preference, dnd_start, dnd_end, wa_opt_in_at, geo_consent_at | Pessoa cuidada (**sem** auth user) |
| `invites` | account_id, care_recipient_id?, email_or_phone, role, token, expires_at (7d), status | Convites |

### 4.2 Medicamentos

| Entidade | Campos-chave |
| --- | --- |
| `medications` | care_recipient_id, name, dosage_label, active, created_by |
| `medication_schedules` | medication_id, times[] (time), dose_units, doses_per_day, instructions |
| `medication_packs` (cartelas) | medication_id, quantity_total, quantity_remaining, start_date, end_date_estimated, refill_alert_days (default 5), status (active\|finished\|paused) |
| `medication_events` | pack_id, type (reminder_sent\|voice_fallback\|pack_refill_warning\|pack_last_day\|manual_confirmation\|paused), channel, payload, actor_profile_id?, created_at |

### 4.3 SOS e localização

| Entidade | Campos-chave |
| --- | --- |
| `sos_alerts` | care_recipient_id, triggered_at, location_lat/lng?, status (open\|resolved), resolved_by, resolved_at, notified_member_ids[] |
| `safe_places` | care_recipient_id, name, lat, lng, radius_m, is_home |
| `location_points` | care_recipient_id, lat, lng, accuracy_m, recorded_at, source (sos\|periodic\|share) |
| `geofence_events` | care_recipient_id, safe_place_id, type (exit\|enter), at |

### 4.4 Exames, agenda, observações

| Entidade | Campos-chave |
| --- | --- |
| `documents` | care_recipient_id, title, exam_date, clinic, category, notes, storage_path, uploaded_by, size_bytes |
| `document_shares` | document_id, profile_id \| role scope |
| `tasks` / `appointments` | care_recipient_id, title, due_at, assignee_profile_id?, status |
| `care_notes` | care_recipient_id, author_id, body, at | Observações do cuidador |

### 4.5 Notificações, devices, billing

| Entidade | Campos-chave |
| --- | --- |
| `notification_preferences` | member_id, event_type, channels (email\|whatsapp\|push\|panel) |
| `notification_log` | event_type, target, channel, status, provider_id, created_at |
| `care_recipient_devices` | care_recipient_id, device_token / link_token, linked_at, last_seen_at, revoked_at |
| `subscriptions` | account_id, plan (essential\|cuidado_plus\|familia), provider, status |
| `audit_log` | actor_id, action, entity, entity_id, ip, at | Acessos a dados de saúde |

### 4.6 Relacionamentos (visão)

```
Account 1──* CareRecipient
Account 1──* AccountMember ──1 Profile
CareRecipient 1──* Medication 1──* Pack / Schedule
CareRecipient 1──* SosAlert / SafePlace / Document / CareNote
```

---

## 5. Regras de negócio

### 5.1 Medicamentos e cartela

**Cálculo**

- consumo_diario = comprimidos_por_dose × doses_por_dia
- duracao_dias = floor(quantidade_na_cartela / consumo_diario)
- fim_estimado = data_inicio + duracao_dias − 1
- dias_restantes = fim_estimado − hoje

**Avisos padrão:** faltam N dias (default 5), termina amanhã, último comprimido, pedir cadastro de nova compra.

**Responsabilidades**

| Quem | Pode |
| --- | --- |
| Idoso | Só recebe lembrete — **não** confirma diariamente |
| Admin | CRUD meds/cartelas, pausar, nova compra |
| Cuidador | Ver + confirmação **pontual** + observações |
| Sistema | Nunca afirma “tomou” sem confirmação humana |

**Linguagem obrigatória (UI e mensagens)**

- Usar: “Lembrete enviado”, “Tomada não confirmada”, “Cartela prevista para terminar…”, “Verifique com o idoso ou cuidador”
- Proibir: “O idoso tomou o medicamento”

**Exemplo de mensagem ao idoso**

> Olá, seu João. Está na hora de tomar a Losartana 50 mg. Qualquer coisa é só chamar a Cintia. — Zelita

Tom: carinhoso / direto / formal — nunca vigilância ou ameaça.

### 5.2 SOS

- Confirmação em 2 etapas obrigatória
- Notifica conforme papéis + preferências (SOS **ignora** horário de silêncio do familiar)
- Não aciona SAMU/Bombeiros; disclaimer sempre visível pós-acionamento e no painel
- Registro auditável; status aberto → resolvido

### 5.3 Geolocalização

MVP enxuto (não rastreador invasivo):

- Última localização conhecida
- Localização no SOS
- Compartilhamento temporário
- Histórico básico
- Lugares de sempre + alerta de saída

**Obrigatório:** consentimento do idoso, revogável; privacidade; falhas de GPS/rede tratadas com “localização indisponível”.

Planos: localização avançada tipicamente no **Cuidado+** (conforme protótipo).

### 5.4 Exames

- Upload PDF/imagem; metadados manuais no MVP
- Limites de storage por plano (Essencial 2 GB / Cuidado+ 20 GB)
- Sem OCR/IA no MVP; **nunca** diagnosticar

### 5.5 Conta e billing

| Plano | Preço | Recorte |
| --- | --- | --- |
| Essencial | R$ 39/mês | 1 pessoa cuidada, WA, remédios, SOS, até 3 familiares, exames 2 GB |
| Cuidado+ | R$ 69/mês | + voz, localização, participantes ilimitados, exames 20 GB |
| Família | R$ 119/mês | Até 3 pessoas cuidadas, resumo semanal*, atendimento prioritário |

\* Resumo semanal pode ser fatia pós-MVP se extrapolar escopo da fatia 1–2.

- Trial 30 dias, sem cartão no cadastro
- Aviso 5 dias antes do fim do trial
- Sem resposta → **pausa** (dados preservados; lembretes param) — sem cobrança automática
- Idoso nunca recebe mensagem de cobrança

### 5.6 WhatsApp

- Opt-in do idoso antes de lembretes recorrentes
- Templates aprovados no provedor oficial
- Janela “não incomodar” respeitada para lembretes (não para SOS à família)

---

## 6. Modelo de permissões

Papéis por pessoa cuidada / conta (matriz do protótipo):

| Permissão | Admin | Cuidador | Visualizador | Contato emergência |
| --- | --- | --- | --- | --- |
| Ver rotina e horários | ● | ● | ● | — |
| CRUD medicamentos/cartelas | ● | — | — | — |
| Registrar observações | ● | ● | — | — |
| Confirmar tomada pontual | ● | ● | — | — |
| Ver exames | ● | ◐ | ◐ | — |
| Enviar/excluir exames | ● | — | — | — |
| Receber SOS | ● | ● | ◐ opcional | ● |
| Ver localização | ● | ● | — | ◐ só durante SOS |
| Definir zonas seguras | ● | — | — | — |
| Convidar / mudar papéis | ● | — | — | — |
| Assinatura e pagamento | ● | — | — | — |

● permitido · ◐ autorização por item · — sem acesso

**Implementação:** RLS no Supabase por `account_id` + `care_recipient_id` + `role`. Contato de emergência pode existir só com telefone (sem painel completo).

---

## 7. Eventos e notificações

### 7.1 Catálogo de eventos

| Evento | Disparo | Destinatários típicos | Canais |
| --- | --- | --- | --- |
| `auth.otp_requested` | Login/cadastro | Solicitante | E-mail |
| `wa.opt_in_requested` | Pós-cadastro idoso | Idoso | WhatsApp |
| `med.reminder_due` | Horário da dose | Idoso | WA (+ voz se plano/regra) |
| `med.voice_fallback` | Sem leitura ~20 min | Idoso | Voz |
| `med.pack_refill_warning` | dias_restantes ≤ N | Admin (+ e-mail) | E-mail + painel (+ WA família) |
| `med.pack_last_day` | Dia do fim estimado | Admin | E-mail + painel |
| `sos.triggered` | Confirmação SOS | Admin, cuidador, contatos, visualizador se opt-in | WA + e-mail + painel (ignora DND do familiar) |
| `sos.resolved` | Marcação manual | Quem estava no thread | Painel (+ opcional WA) |
| `geo.safe_zone_exit` | Saída de zona | Admin, cuidador | E-mail + painel |
| `invite.sent` / `invite.expiring` | Convite | Convidado | E-mail / WA |
| `billing.trial_ending` | Trial −5 dias | Admin | E-mail + painel |
| `billing.account_paused` | Fim trial sem ação | Admin | E-mail + painel |

### 7.2 Matriz resumida (protótipo)

| Tipo | Admin | Cuidador | Visualizador | Idoso |
| --- | --- | --- | --- | --- |
| Cartela acabando | E-mail + painel | E-mail | Painel | — |
| SOS | WA + e-mail + painel | WA + painel | Opcional | Confirmação na tela |
| Zona segura | E-mail + painel | Painel | — | — |
| Lembrete de remédio | Painel (log) | Painel | — | WhatsApp / voz |

---

## 8. Backlog priorizado + critérios de aceite

### Fatia 1 — Auth + idoso + cartela (próximo passo de engenharia)

| ID | Item | Prioridade | Critérios de aceite |
| --- | --- | --- | --- |
| F1-01 | Auth e-mail OTP (magic link / código 6 dígitos) | P0 | Código 10 min; reenvio 45 s invalida anterior; sem senha |
| F1-02 | Onboarding passos 1–5 (conta + care recipient) | P0 | Pessoa cuidada criada sem user auth; endereço vira safe_place “Casa” |
| F1-03 | CRUD medicamento + cartela + preview de fim | P0 | Cálculo de fim igual à regra §5.1; UI não usa “tomou” |
| F1-04 | Agendamento de lembretes (job) + log `reminder_sent` | P0 | Respeita DND; evento auditável |
| F1-05 | Integração WhatsApp sandbox (template lembrete + opt-in) | P0 | Nada recorrente sem opt-in |
| F1-06 | Painel Hoje + Remédios + aviso faltam 5 dias | P0 | Badge e copy alinhados ao protótipo |

### Fatia 2 — SOS + vínculo PWA

| ID | Item | Prioridade | Critérios de aceite |
| --- | --- | --- | --- |
| F2-01 | PWA idoso: início + SOS 2 etapas + disclaimer | P0 | Toque acidental cancelável; pós-envio com mensagem clara |
| F2-02 | Notificação SOS para papéis corretos | P0 | Ignora DND do familiar; registra notificados |
| F2-03 | Painel Pedidos de ajuda (abrir/resolver) | P0 | Timeline com horário e resolução |
| F2-04 | Fluxo de vínculo de device (token/QR) | P1 | Abre sem login; revoke no Ajustes |

### Fatia 3 — Pessoas, permissões, exames

| ID | Item | Prioridade | Critérios de aceite |
| --- | --- | --- | --- |
| F3-01 | Convites + 4 papéis + RLS | P0 | Matriz §6 respeitada em API e UI |
| F3-02 | Visão cuidador (rotina + observação + confirmação pontual) | P1 | Sem CRUD de cartela/pagamento |
| F3-03 | Upload exames + limites por plano | P1 | PDF/imagem; share/download; sem IA |
| F3-04 | Guia / empty states / texto grande | P1 | Regras de usabilidade do protótipo |

### Fatia 4 — Localização + billing

| ID | Item | Prioridade | Critérios de aceite |
| --- | --- | --- | --- |
| F4-01 | Consentimento geo + última localização + SOS location | P1 | Revogável; falha degradada |
| F4-02 | Lugares de sempre + alerta de saída | P1 | Casa criada no onboarding |
| F4-03 | Planos + trial 30 dias sem cartão + pausa sem cobrança auto | P0 | Idoso nunca vê billing |
| F4-04 | Voz fallback (Cuidado+) | P2 | Só após regra de não leitura |

### Fatia 5 — Polimento

| ID | Item | Prioridade | Critérios de aceite |
| --- | --- | --- | --- |
| F5-01 | Consultas e tarefas (MVP leve) | P2 | CRUD simples; não bloqueia pilares 1–4 |
| F5-02 | Landing real + domínio | P2 | Fora do app core |
| F5-03 | Exportar/excluir dados (LGPD) | P1 | Solicitação registrada; prazo comunicado |

---

## 9. Stack (MVP técnico)

| Camada | Escolha |
| --- | --- |
| Web família | Next.js (App Router) |
| Backend / DB | Supabase + Postgres + RLS |
| Auth | E-mail + OTP / magic link |
| App idoso | PWA |
| Mensageria | WhatsApp Business API (provedor oficial) |
| Filas / jobs | Agendamento de lembretes + retentativas |
| Arquivos | Supabase Storage (URLs assinadas) |
| Geo | APIs do device / navegador |
| Pagamentos | Provedor externo (cartão nunca armazenado na Zelita) |

---

## 10. Não-objetivos e riscos

### Não-objetivos

Ver §0 “Fora do MVP” e protótipo seção Escopo.

### Riscos

| Risco | Mitigação |
| --- | --- |
| Falsa sensação de adesão medicamentosa | Linguagem §5.1; sem check-in diário do idoso |
| SOS confundido com emergência pública | Disclaimer fixo; copy “avisa a família” |
| WhatsApp: templates / opt-in | Fluxo de autorização antes de lembretes |
| Geo e bateria / permissões | MVP enxuto; consentimento explícito |
| Escopo creep médico | Gate de PR: nada de diagnóstico/IA clínica no MVP |

---

## 11. Métricas de sucesso (MVP)

- Ativação: % contas que cadastram ≥1 cartela em 24 h
- Retenção: % contas com ≥1 lembrete enviado / semana (D7, D30)
- Confiança: % SOS resolvidos em &lt;15 min (quando houver resposta familiar)
- Reposição: % cartelas com nova compra cadastrada após aviso de 5 dias
- Trial → pago ou pausa consciente (sem chargeback por cobrança surpresa)

---

## 12. Referências

- [[definicao-produto]] — decisões de produto
- [[zelita]] — hub
- Protótipo HTML navegável (telas e style guide)
- Mercado: CareZone, Lotsa Helping Hands (EUA)

---

## 13. Decisões em aberto (confirmar antes de codar)

1. Provedor WhatsApp (Meta Cloud API vs BSP) e provedor de voz
2. Provedor de pagamento (Stripe, Asaas, Pagar.me…)
3. “Consultas e tarefas” e “resumo semanal (Família)” entram na fatia 3/4 ou ficam explícitos como pós-MVP?
4. Multi-idoso (plano Família) na v1 ou só schema preparado?
5. Nível de precisão / frequência do ping de localização no Cuidado+

---

*PRD gerado em 2026-08-12 a partir do item 15 de [[definicao-produto]].*
