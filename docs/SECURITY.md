# Padrões de Segurança — Zelita

> **Versão:** 1.0 · **Base:** OWASP Top 10 (2021) · **Stack:** Next.js (App Router) · Supabase (Auth OTP, Postgres, Storage, RLS) · Inngest · WhatsApp Business API · Sentry · Vercel.
>
> Fonte única de verdade de segurança do produto. Toda feature deve passar pelo [checklist final](#checklist-de-seguranca-definition-of-done) antes do merge.
>
> Relacionados: [PRD](./prd-mvp.md) · [Arquitetura](./arquitetura-solucao.md) · `AGENTS.md` · playbook reutilizável no segundo-cérebro (`30 Estudos/Wiki/2026-08-12-padrao-seguranca-next-supabase.md`).

---

## Princípios

1. **Zero trust no cliente.** Nenhuma decisão de segurança (autorização, validação, limites) confia em dados vindos do browser ou do PWA. Tudo é revalidado no servidor.
2. **Defense in depth.** RLS no Postgres **e** checagem na Server Action / Route Handler / caso de uso — nunca só uma camada.
3. **Menor privilégio.** Cada chave, role, membership e query recebe o mínimo necessário (`account_id` + papel).
4. **Fail secure.** Em dúvida/erro, negue o acesso e não vaze detalhes internos.
5. **Segredos fora do código.** Sempre em `.env` / Vercel / secret manager; nunca versionados nem no bundle client.
6. **Dados de cuidado são sensíveis.** Não logar PHI desnecessário no Sentry (IDs + tipo de evento). Opt-in WhatsApp antes de lembretes recorrentes.

---

## Superfícies e fronteiras

| Superfície | Auth | Regra dura |
| --- | --- | --- |
| `(family)` / painel | Supabase Auth (OTP / magic link) | Membership + papel na conta |
| `(auth)` / onboarding | OTP | Rate limit; sem senha no MVP |
| `(elder)` / PWA idoso | **Sem** `auth.users` | Só vínculo de device (`elder-access`); isolado do painel |
| `api/webhooks/*` | Assinatura do provedor | Service role só aqui / Inngest; validar signature |
| Jobs Inngest | Signing key Inngest | Idempotência; sem vazar PHI em logs externos |

Importar módulos só pela API pública (`modules/<modulo>/index.ts`). Paths críticos (`accounts`, `billing`, `elder-access`, `sos`, migrations/RLS) exigem autonomia `tight` + Spec aprovada.

---

## OWASP Top 10 (Web) aplicado à Zelita

### A01 — Broken Access Control

- **RLS obrigatório** em toda tabela de negócio; policies por `account_id` / membership / `role` (matriz do PRD). Sem RLS = tabela proibida.
- Pessoa cuidada **não** é `auth.users`. Acesso do idoso só via vínculo de device (`care_recipient_devices` / `elder-access`); revoke no Ajustes invalida o token.
- Autorização revalidada em **toda** Server Action / Route Handler (`getUser()` server-side + membership), nunca inferida do client.
- IDs de recurso sempre filtrados pela conta/membro; nunca confie em `userId` / `accountId` / `careRecipientId` vindos do body/params (IDOR).
- Papéis: `admin` · `caregiver` · `viewer` · `emergency_contact` — UI **e** API/RLS respeitam a mesma matriz.
- **Nunca** usar a `service_role` key em código acessível ao cliente; ela ignora RLS. Uso permitido só em Route Handlers / Inngest confiáveis.

### A02 — Cryptographic Failures

- HTTPS em tudo. Cookies de sessão `HttpOnly`, `Secure`, `SameSite=Lax` (padrão `@supabase/ssr`).
- Auth OTP/magic link é responsabilidade do Supabase Auth — sem hashing próprio / sem senha no MVP.
- Nada de PII/PHI/segredo em `localStorage` desprotegido ou em logs. Tokens de vínculo de device tratados como segredo (curta vida / revogáveis).
- Buckets de exames **privados**; acesso via URLs assinadas de curta duração.
- Cartão nunca armazenado na Zelita (provedor de pagamento + webhook).

### A03 — Injection

- Acesso a dados **apenas** via client Supabase / queries parametrizadas — sem SQL concatenado. SQL/Supabase só em `infrastructure/` (repos) do módulo.
- Validar e tipar toda entrada no servidor (Zod) antes de usar: body, params, searchParams, form data, payloads de webhook.
- Sanitizar qualquer HTML renderizado; evitar `dangerouslySetInnerHTML`.
- Templates WhatsApp: variáveis tipadas; não interpolar texto livre do usuário em campos que o provedor interpreta como comando.

### A04 — Insecure Design

- Modelar limites desde o design: tamanho de upload de exame, reenvio de OTP, disparos SOS, rate de webhooks.
- SOS: fluxo em 2 etapas (cancelável); ignora DND do familiar; disclaimer SAMU/Bombeiros; registrar notificados.
- Lembrete ≠ tomada: evento `reminder_sent` **nunca** implica medicamento tomado.
- Conta pausada / sem opt-in: jobs **não** enviam lembretes recorrentes.
- Localização: consentimento explícito e revogável; falha de GPS tratada sem vazar histórico indevido.

### A05 — Security Misconfiguration

- Segredos só em variáveis de ambiente **validadas no startup** (Zod). `NEXT_PUBLIC_*` só para o que é realmente público (URL Supabase + anon key).
- Headers de segurança em `next.config`: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`.
- Sem stack trace/detalhe de erro para o usuário. CORS restrito às origens necessárias.
- Preview/production: secrets distintos; nunca reutilizar `service_role` de prod em local público.

### A06 — Vulnerable & Outdated Components

- Dependências fixadas no lockfile (`pnpm`); rodar `pnpm audit` na CI e atualizar libs críticas com regularidade.
- Não introduzir dependência sem aprovação (reduz superfície de ataque). Fora do MVP: Playwright, BullMQ+worker, Nest separado, IA clínica/OCR.

### A07 — Identification & Authentication Failures

- Familiar: Auth via Supabase OTP / magic link; rotas protegidas por **middleware** + checagem server-side na action.
- Código OTP: validade curta (ex.: 10 min); reenvio invalida o anterior; rate limit em login/reenvio.
- Sessão renovada no servidor; logout invalida sessão.
- Idoso: **sem login**. Vínculo de device (token/QR) abre `(elder)/`; não reutilizar cookies da família no PWA do idoso.
- Contato de emergência pode existir só com telefone (sem painel completo) — não elevar privilégio por engano.

### A08 — Software & Data Integrity Failures

- Validar tipo/tamanho de arquivos de exame no servidor (MIME real, não só extensão): PDF/imagem conforme Spec.
- Nome de arquivo gerado pelo servidor (UUID) — nunca o nome do cliente (path traversal).
- Webhooks (WhatsApp, billing, Inngest): validar assinatura/signing secret **antes** de mutar estado.
- Lockfile versionado; builds reprodutíveis. Nunca `eval` / execução dinâmica de conteúdo remoto.

### A09 — Security Logging & Monitoring Failures

- Sentry desde o scaffold: erros de app + falhas críticas (SOS, lembrete, webhook).
- Logar eventos de auth, falhas de autorização, falhas de envio — **sem** PHI, corpo de exame, tokens ou segredos.
- Preferir: `account_id`, `care_recipient_id`, tipo de evento, status do provedor.
- Mensagem genérica para o usuário; detalhe técnico só no log do servidor / Sentry com scrubbing.
- `notification_log` / `audit_log` para auditoria de canal e acessos a dados de saúde (conforme schema).

### A10 — Server-Side Request Forgery (SSRF)

- Não há módulo de “fetch de URL de usuário” no MVP (exames sobem via Storage). Se no futuro houver URL fornecida pelo usuário: allowlist de domínios, só `https`, bloquear IPs privados/link-local/metadata.
- Webhooks outbound (callbacks) e integrações: URLs de provedor fixas em config, nunca montadas a partir de input não confiável.

---

## Elder-access e PWA do idoso

- Device link é **credencial**: gerar no servidor, armazenar hash/segredo adequado, TTL + `revoked_at`.
- Escopo mínimo: só a pessoa cuidada vinculada; sem lateral movement para outras contas.
- SOS e lembretes no PWA não usam sessão da família; mutações passam por casos de uso do módulo com checagem do vínculo.
- Isolar `(elder)/` do painel: sem imports de internals de módulos de família além da API pública necessária.

---

## WhatsApp, voz e jobs (Inngest)

- **Opt-in obrigatório** antes de lembretes recorrentes; sem opt-in = skip auditável.
- Respeitar DND do **idoso** nos lembretes; SOS **ignora** DND do familiar.
- Templates aprovados; não enviar texto livre sensível além do necessário ao cuidado.
- Inngest: validar signing key; retries idempotentes; não reenviar lembrete duplicado sem regra explícita.
- Service role nos jobs: queries mínimas; nunca retornar dataset ampliado ao client.

---

## Upload de exames (Supabase Storage)

- Buckets **privados**; URLs assinadas de curta duração.
- Validar no servidor: MIME real, extensão allowlist, tamanho máximo.
- Path: `account_id` / `care_recipient_id` / UUID — policies alinhadas à RLS das tabelas de metadados.
- Sem OCR/IA clínica no MVP: arquivo é blob + metadados; não processar conteúdo como instrução.

---

## Billing e webhooks de pagamento

- Nunca armazenar PAN/CVV. Estado de plano só via webhook verificado + tabela `subscriptions` (ou equivalente).
- Trial/pausa: jobs não cobram sozinhos; falha de assinatura = fail closed (não liberar Cuidado+ indevido).
- Idoso nunca vê cobrança / dados de pagamento.

---

## Segredos e ambiente

| Variável | Onde | Nota |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Públicas por design |
| `SUPABASE_SERVICE_ROLE_KEY` | Só server | Webhooks / Inngest |
| `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` | Só server | Jobs |
| Credenciais WhatsApp / voz / pagamento | Só server | Nunca `NEXT_PUBLIC_*` |
| `SENTRY_DSN` / tokens de build | Server / CI | Sem PHI no payload |

- Variáveis validadas com Zod no startup (fail-fast).
- `.env` **nunca** versionado; manter `.env.example` sem valores reais.
- **Nunca** sobrescrever `.env` sem confirmação explícita do humano.

---

## Fora do MVP (não aplicar como requisito agora)

- Camada de IA / LLM (OCR clínico, agentes): **proibida** no MVP. Se entrar depois, adotar OWASP LLM Top 10 (prompt injection, output handling, agency, key leakage) em Spec própria.
- Playwright E2E, BullMQ+worker, microserviços: fora do escopo de segurança operacional atual.

---

## Checklist de segurança (Definition of Done)

- [ ] RLS ativa e alinhada à matriz de papéis na(s) tabela(s) tocada(s)
- [ ] Autorização revalidada server-side (membership/papel); sem confiar no client
- [ ] Se tocar `elder-access` / PWA: vínculo validado, revogável, sem `auth.users` do idoso
- [ ] Entradas validadas com Zod (body, params, form, searchParams, webhooks)
- [ ] Sem segredo no client/bundle; `service_role` só em Route Handler / Inngest
- [ ] Webhooks: assinatura verificada antes de mutar
- [ ] Uploads de exame: MIME/tamanho; bucket privado; nome gerado pelo servidor
- [ ] WhatsApp: opt-in antes de recorrência; DND do idoso respeitado (exceto regras de SOS)
- [ ] SOS (se aplicável): 2 etapas, papéis corretos, ignora DND do familiar, auditável
- [ ] Sentry/logs sem PHI/tokens; erros genéricos ao usuário
- [ ] Headers de segurança configurados (quando a Spec tocar config)
- [ ] Nenhuma dependência nova sem aprovação; `pnpm audit` sem crítico aberto sem mitigação
