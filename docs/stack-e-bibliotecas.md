# Stack e bibliotecas da Zelita — guia profundo

> Documento didático para o time. Complementa (não substitui) `arquitetura-solucao.md` e o PRD.  
> Data: 2026-08-12 · App: `apps/web` · Hosting: Vercel

---

## 1. Mapa mental da arquitetura

```text
┌─────────────────────────────────────────────────────────────┐
│  Usuários                                                    │
│  Familiar (painel)     Pessoa cuidada (WhatsApp / PWA depois)│
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             ▼
┌───────────────────────────┐    ┌────────────────────────────┐
│  Next.js na Vercel        │    │  Meta WhatsApp Cloud API   │
│  UI + Server Actions      │───▶│  envia/recebe mensagens    │
│  Route Handlers (webhooks)│◀───│  webhook → /api/webhooks/wa │
└───────────┬───────────────┘    └────────────────────────────┘
            │
   ┌────────┼────────┐
   ▼        ▼        ▼
Supabase  Inngest   Sentry
Auth+DB   jobs      erros
RLS       agenda
```

**Regra de ouro:** a UI não “espera acordada” pelo horário do remédio. Quem agenda e dispara depois é o **Inngest**. Dados e login ficam no **Supabase**. Erros vão para o **Sentry**.

---

## 2. Inngest — o que é e por que existe

### 2.1 Em uma frase

**Inngest** é a plataforma de **jobs em background** da Zelita: agenda, executa, retenta e observa funções que rodam *depois* da requisição HTTP (lembrete às 08:00, opt-in WA, no futuro voz em 20 min, trial acabando, etc.).

### 2.2 O problema que resolve

Na Vercel, cada request do Next.js é **efêmera** (sobe, responde, morre). Não dá para:

- deixar um `setInterval` rodando 24h;
- “dormir” 20 minutos dentro de uma Server Action;
- garantir retry se o WhatsApp cair no meio do envio.

Sem Inngest, o caminho clássico seria **BullMQ + Redis + worker Node sempre ligado** (outro servidor). Isso aumenta custo e operação — fora do MVP.

### 2.3 Como funciona (modelo mental)

1. Seu código **envia um evento** (`inngest.send({ name: "med/reminder.send", data: {...} })`).
2. A cloud Inngest **guarda** esse trabalho.
3. No horário / imediatamente, a Inngest **chama de volta** seu app em:
   `https://zelita-web.vercel.app/api/webhooks/inngest`
4. O handler (`serve` do SDK) executa a **function** registrada (`med-reminder-send`, `wa-opt-in-request`).
5. Se falhar, a Inngest **tenta de novo** (retry) e mostra o run no dashboard.

```text
Painel família                 Inngest Cloud              Vercel
     │                              │                        │
     │  salva cartela               │                        │
     │  inngest.send(evento) ──────▶│                        │
     │                              │  na hora certa         │
     │                              │  POST /api/webhooks/   │
     │                              │  inngest ─────────────▶│
     │                              │                        │ decide DND/opt-in
     │                              │                        │ chama WhatsApp
     │                              │                        │ grava reminder_sent
```

### 2.4 Casos de uso **neste** projeto (hoje e roadmap)

| Caso | Evento / function | Status |
| --- | --- | --- |
| Pedir autorização WhatsApp ao idoso | `wa/opt_in.request` → `wa-opt-in-request` | Fatia 1 |
| Enviar lembrete de remédio no horário | `med/reminder.send` → `med-reminder-send` | Fatia 1 |
| Respeitar DND / sem opt-in / conta pausada | lógica **dentro** da function (domínio) | Fatia 1 |
| Aviso cartela acabando (job diário) | `med/pack.refill_check` | Planejado (arquitetura) |
| Fallback de voz ~20 min (Cuidado+) | `step.sleep` + voz | Fatia futura |
| Trial acabando / pausar conta | `billing/*` | Fatia futura |
| Fan-out de SOS | `sos/notify` | Fatia 2 |

### 2.5 O que **não** é responsabilidade do Inngest

- Login / sessão → Supabase Auth  
- CRUD de remédio na hora do clique → Server Action + Postgres  
- Renderizar o painel → Next.js / React  
- Ser o canal WhatsApp → Meta Cloud API (adapter em `reminders`)

Inngest **orquestra o tempo**; não substitui banco nem UI.

### 2.6 Peças no repo

| Path | Papel |
| --- | --- |
| `lib/inngest/client.ts` | Cliente `new Inngest({ id: "zelita" })` |
| `lib/inngest/functions.ts` | Functions (`createFunction` + triggers) |
| `app/api/webhooks/inngest/route.ts` | `serve({ client, functions })` — porta que a Inngest bate |
| `modules/reminders/application/schedule-reminders.ts` | Dispara eventos após salvar cartela |
| Env `INNGEST_EVENT_KEY` | App → Inngest (enviar eventos) |
| Env `INNGEST_SIGNING_KEY` | Inngest → App (assinatura das chamadas) |

### 2.7 Por que sincronizar com a Vercel

A URL pública (`…/api/webhooks/inngest`) precisa estar registrada na Inngest para ela saber **onde** executar as functions. Sync manual ou integração Vercel = “este deploy hospeda o app `zelita`”.

---

## 3. Catálogo de bibliotecas (`apps/web`)

### 3.1 Runtime / app

#### Next.js (`next`)

- **O que é:** framework React full-stack (App Router).
- **No projeto:** landing, auth, painel família, PWA idoso (depois), API routes/webhooks.
- **Por quê:** um deploy só; Server Components + Server Actions; edge serverless na Vercel.
- **Onde olhar:** `apps/web/app/**`

#### React + React DOM (`react`, `react-dom`)

- **O que é:** biblioteca de UI.
- **No projeto:** formulários client (`LoginForm`, onboarding, cartela), shells.
- **Regra Zelita:** `use client` mínimo; preferir RSC.

#### TypeScript (`typescript`)

- **O que é:** tipagem estática.
- **No projeto:** domínio puro tipado; contratos de forms; menos bug em saúde/cuidado.
- **Convenção:** preferir `interface`; sem `enum` (usar const objects).

---

### 3.2 Backend de dados e auth

#### `@supabase/supabase-js` + `@supabase/ssr`

- **O que é:** cliente oficial Supabase + helpers para cookies/sessão no Next App Router.
- **No projeto:**
  - Auth OTP / magic link (familiar)
  - Postgres via client (RLS)
  - Service role **só** em webhooks/Inngest
- **Por quê:** Auth + DB + Storage num produto; RLS por `account_id`/papel.
- **Onde olhar:** `lib/supabase/**`, `modules/accounts/**`
- **Env:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**Não confundir:** pessoa cuidada **não** é `auth.users` (elder-access / device na fatia 2).

---

### 3.3 Jobs

#### `inngest`

- Ver seção 2 completa acima.
- SDK Tipado: `createFunction`, `send`, `serve` para Next.

---

### 3.4 Canal WhatsApp (sem SDK npm dedicado hoje)

- **O que usamos:** `fetch` para Graph API (`graph.facebook.com`) no adapter.
- **Onde:** `modules/reminders/infrastructure/whatsapp-port.ts`
- **Env:** `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`
- **Webhook:** `app/api/webhooks/whatsapp/route.ts` (opt-in “SIM”)
- **Por quê sem lib pesada:** caminho mais fácil no MVP; port permite trocar BSP depois.

---

### 3.5 Observabilidade

#### `@sentry/nextjs`

- **O que é:** captura de erros e performance no Next.
- **No projeto:** scaffold desde o dia 1; DSN opcional em dev.
- **Regra LGPD:** não logar PHI; preferir IDs + tipo de evento.
- **Env:** `NEXT_PUBLIC_SENTRY_DSN` (e tokens de build se houver)

---

### 3.6 Validação

#### `zod`

- **O que é:** schemas e parse de dados em runtime.
- **No projeto:** e-mail OTP, onboarding, criar cartela — falha com mensagem de correção.
- **Por quê:** SECURITY.md exige validar body/forms/webhooks; não confiar no client.

---

### 3.7 UI

#### Tailwind CSS (`tailwindcss` + `@tailwindcss/postcss`)

- **O que é:** utilitários CSS.
- **No projeto:** light-first, tokens de marca (verde-petróleo) em `globals.css`.

#### shadcn / Radix (`@radix-ui/react-slot`) + `class-variance-authority` + `clsx` + `tailwind-merge`

- **O que é:** primitivos acessíveis + variantes de componente + merge de classes.
- **No projeto:** `components/ui/button` (base shadcn); cresce conforme Specs de UI.
- **Por quê:** acessibilidade Radix sem reinventar focus trap / slots.

---

### 3.8 Qualidade (devDependencies)

| Lib | Papel |
| --- | --- |
| `vitest` | Testes de domínio (cartela, DND, papéis, copy segura) |
| `@vitejs/plugin-react` | Transform JSX nos testes |
| `jsdom` | Ambiente DOM se precisar (hoje pouco usado) |
| `eslint` + `eslint-config-next` | Lint alinhado ao Next |
| `@types/*` | Tipos TS para Node/React |

**Fora do MVP:** Playwright (homologação UI é manual via skill `manual-report`).

---

### 3.9 Tooling do monorepo (não são “libs de produto”)

| Ferramenta | Papel |
| --- | --- |
| **pnpm** workspace | Monorepo `apps/web` |
| **Vercel** | Hosting Next + HTTPS público (webhooks) |
| **Supabase CLI** (`db push`) | Aplicar `supabase/migrations` |
| **Meta Developers** | App WhatsApp / tokens / webhook |
| **Inngest Cloud** | Dashboard de events/runs + sync do serve endpoint |

---

## 4. Onde cada lib “entra” no fluxo da fatia 1

```text
1. Familiar abre /entrar
   → Next + React + Zod + Supabase Auth (OTP/magic link)

2. Onboarding
   → Server Action + Zod + Supabase (accounts, care_recipients, safe_places)
   → RLS no Postgres

3. Anota remédio
   → Domínio puro (cálculo fim) + Vitest
   → Supabase (medications/packs/schedules)
   → Inngest.send (opt-in + reminder)

4. Na hora do lembrete
   → Inngest chama /api/webhooks/inngest
   → Domínio (DND / opt-in / pausa)
   → WhatsApp adapter (fetch Meta)
   → Supabase grava medication_events (reminder_sent ≠ tomada)

5. Idoso responde SIM
   → Meta → /api/webhooks/whatsapp
   → Supabase atualiza wa_opt_in_at

6. Se algo quebra
   → Sentry (sem PHI)
```

---

## 5. Fronteiras (para não misturar responsabilidades)

| Camada | Pode | Não deve |
| --- | --- | --- |
| `domain/` | Regras puras (fim de cartela, DND) | Importar Next/Supabase/Inngest |
| `application/` | Casos de uso, orquestrar | Query solta em Client Component |
| `infrastructure/` | Repos, adapters WA | Regra de negócio “escondida” |
| `app/(…)/` | UI + wiring | SQL direto “só porque é rápido” |
| Inngest functions | Tempo, retry, side effects | Substituir RLS / authz do painel |

---

## 6. Variáveis de ambiente (visão por lib)

| Lib / serviço | Variáveis |
| --- | --- |
| App | `NEXT_PUBLIC_APP_URL` |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, (`SUPABASE_DB_PASSWORD` só para migrations) |
| Inngest | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` |
| WhatsApp | `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_TEMPLATE_OPT_IN`, `WHATSAPP_TEMPLATE_REMINDER` |
| Resend (avisos família) | `RESEND_API_KEY`, `RESEND_FROM` |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN` |

Secrets **nunca** no `.env.example` versionado com valores reais.

---

## 7. Leitura recomendada (ordem)

1. Este doc (mapa + Inngest + libs)  
2. `docs/arquitetura-solucao.md` (decisões e diagramas oficiais)  
3. `docs/prd-mvp.md` §5 e §8 Fatia 1 (regras de negócio)  
4. `docs/SECURITY.md` (RLS, webhooks, PHI)  
5. Spec: `specs/2026-08-12-fatia-1-auth-care-recipient-cartela-lembrete.md`

---

## 8. Glossário rápido

| Termo | Significado |
| --- | --- |
| Evento Inngest | Mensagem “faça X” com payload |
| Function Inngest | Código que processa um ou mais eventos |
| Serve endpoint | URL HTTP do app que registra/executa functions |
| Dry-run WA | Envio simulado quando falta token |
| `reminder_sent` | Lembrete foi disparado — **não** prova que tomou o remédio |
| RLS | Row Level Security no Postgres (quem vê qual linha) |

---

*Mantenedor: time Zelita. Atualizar este doc quando entrar lib nova (billing gateway, voz, etc.) ou mudar o papel do Inngest.*
