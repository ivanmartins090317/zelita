# AGENTS.md

Constituição do projeto **Zelita** para agentes de IA. Este arquivo é contrato read-only: o agente **não altera** sem aprovação explícita.

Idioma de trabalho e respostas: **português (pt-BR)**.

**Zelita** é um SaaS de coordenação familiar para cuidado de idosos. Familiar gerencia; pessoa cuidada recebe lembretes/SOS sem login (PWA + vínculo de device).

Docs de referência (read-only para contexto): `docs/prd-mvp.md`, `docs/arquitetura-solucao.md`, `docs/architecture/` (quando existir). Marca/protótipo: `marca-zelita.html`, `zelita-prototipo.html/`.

---

## Stack

- **App:** Next.js (App Router) · React · TypeScript · Tailwind · shadcn/ui · Radix · monorepo (`apps/web`)
- **Backend:** Supabase (Auth OTP, Postgres, Storage, RLS) — dependência intencional; não abstrair “banco genérico”
- **Jobs:** Inngest (lembretes, fallback de voz, trial)
- **Observabilidade:** Sentry (`@sentry/nextjs`)
- **Hosting:** Vercel
- **Canais:** WhatsApp Business API (+ voz no Cuidado+); ports/adapters para provedores
- **Testes:** Vitest (domínio / casos de uso). Homologação UI/PWA via skill `manual-report`. **Sem Playwright no MVP**
- **Package manager:** pnpm (workspace monorepo)

---

## Arquitetura (monólito modular)

```text
UI (RSC/Client) → Server Action / Route Handler → application (caso de uso) → domain
                                                              ↓
                                                    infrastructure (repos Supabase, adapters)
```

1. **Server-first:** dados e mutações no servidor. UI é apresentação.
2. **SQL/Supabase só em `infrastructure/` (repos)** do módulo — nunca query em componente Client.
3. **Domínio puro:** regras (fim de cartela, DND, quem recebe SOS) sem React/Supabase/Inngest.
4. **Ports só onde a troca é real:** WhatsApp, voz, billing — não `IDatabase` universal.
5. **RLS obrigatório** por `account_id` / membership / papel. Service role só em Route Handlers / Inngest confiáveis — nunca no client.
6. **Pessoa cuidada** não é `auth.users`; PWA usa vínculo de device (`elder-access`).

### Módulos (ownership)

`accounts` · `care-recipients` · `medications` · `reminders` · `sos` · `location` · `exams` · `billing` · `elder-access`

- Importar só pela API pública do módulo (`index.ts`).
- `app/(marketing|auth|family|elder)/` não importa internals de outro módulo.
- `(elder)/` isolado do painel da família.

---

## Estrutura preferida

```text
apps/web/
  app/
    (marketing)/          # landing
    (auth)/               # login / onboarding
    (family)/             # painel autenticado
    (elder)/              # PWA idoso
    api/webhooks/         # whatsapp, billing, inngest
  modules/<modulo>/
    domain/               # regras puras
    application/          # casos de uso
    infrastructure/       # repos Supabase, adapters
    presentation/         # UI do módulo (quando couber)
    index.ts              # API pública
  lib/supabase/ | lib/inngest/
supabase/
  migrations/
  policies/
docs/                     # PRD, arquitetura
specs/                    # Specs de feature (aprovação humana)
```

- Features em **módulos verticais** (`apps/web/modules/<modulo>/`), não em layers horizontais soltas (`src/features/` genérico).
- Specs em: `specs/<modulo-ou-feature>.md`
- Preferir Deep Modules (interface estreita via `index.ts`, lógica junta por camada do módulo)
- Nomes grepáveis e específicos (evitar `dataProcessor`, `utils2`, `helper`)
- **Arquivo > ~300 linhas:** dividir por domínio. Não deixar crescer sem necessidade
- Sem mocks em dev/prod (só testes)

---

## Pode

- Criar e editar arquivos dentro do **módulo da feature atual** (`apps/web/modules/<modulo>/`) e rotas/UI relacionadas em `app/(…)/` da mesma fatia
- Criar testes Vitest de domínio/casos de uso relacionados à Spec aprovada
- Atualizar plano/relatório de homologação via skill `manual-report` quando a Spec exigir fluxos UI/PWA
- Rodar comandos de verificação locais (typecheck, lint, test)
- Ler o restante do codebase e `docs/` para contexto
- Propor mudanças fora do escopo (sem aplicar até aprovação humana)

---

## Não pode

- Alterar este `AGENTS.md` sem pedido explícito
- Alterar Spec aprovada em `specs/` sem pedido explícito
- Alterar PRD / arquitetura em `docs/` sem pedido explícito
- Mexer em **paths críticos** sem pedido explícito (lista abaixo)
- Criar migration / mudar schema / RLS / Storage sem aprovação
- Adicionar dependência nova sem aprovação
- Introduzir Playwright, BullMQ+worker, Nest separado, microserviços, IA clínica/OCR (fora do MVP)
- `git push`, merge em `main`/`master`, deploy
- Sobrescrever `.env*` sem confirmação explícita
- Commitar sem o humano pedir

---

## Paths críticos (autonomia tight)

Só alterar com pedido explícito + Spec aprovada + review humano:

- `apps/web/modules/**/domain/**` (regras de cuidado / saúde)
- `apps/web/modules/accounts/**` e auth (`app/(auth)/`, `lib/supabase/**`)
- `apps/web/modules/billing/**`
- `apps/web/modules/elder-access/**` e `app/(elder)/**`
- `apps/web/modules/sos/**` (emergência)
- `supabase/migrations/**`, `supabase/policies/**`
- `.env*`, secrets e configs de produção (Vercel)
- CI/CD (`.github/**`, configs de deploy)
- Este `AGENTS.md` e Specs já aprovadas em `specs/`

---

## Autonomia por tarefa

No início de cada feature, declarar um nível:

- `tight`: reviso plano, Spec e diff
- `medium`: reviso Spec e resultado dos testes
- `loose`: reviso só Done (Spec + comandos verdes)

**Default: `medium`.** Paths críticos sempre `tight`.

---

## Fluxo obrigatório por feature

1. **Research** (sem código) — ler PRD/arquitetura/protótipo e módulo vizinho
2. **Plano curto** (sem código) — escopo, módulo dono, riscos, autonomia
3. **Spec** em `specs/` → **esperar aprovação humana**
4. **Implementar** só o que a Spec pede (conventional commits; branch `feature/...` quando houver git flow)
5. **Verificar Done**
6. **Parar** e reportar evidências (não expandir escopo)

### Regras de código (invioláveis no MVP)

- `use client` mínimo; preferir RSC + Suspense
- Preferir `interface` sobre `type`; **sem `enum`** (mapas / const objects)
- Sem classes; componentes funcionais; `function` para funções puras; exports nomeados; pastas `kebab-case`
- Erros com causa e correção; nunca `catch` vazio
- Design: verde-petróleo de marca; **coral só para SOS/emergência**; light-first; mobile-first
- PWA idoso: texto ≥17px, alvos ≥56px, SOS >100px
- LGPD: não logar PHI desnecessário no Sentry (IDs + tipo de evento)
- Opt-in WhatsApp antes de lembretes recorrentes
- **Lembrete ≠ tomada:** `reminder_sent` nunca implica medicamento tomado

---

## Done (definição objetiva)

Só declarar Done quando **TODOS** passarem (na raiz do monorepo ou em `apps/web`, conforme scripts do `package.json`):

```bash
pnpm typecheck
pnpm lint
pnpm test
```

E também:

- Cenários da Spec da feature em verde (Vitest; UI/PWA via `manual-report` quando a Spec exigir)
- Cobertura de regras de domínio com Vitest (≥ 80% quando aplicável)
- Nenhuma mudança fora do escopo sem aprovação
- Reflexão curta (1–2 parágrafos) sobre escalabilidade/manutenibilidade
- Resumo do que mudou + arquivos tocados

> Se os scripts ainda não existirem no scaffold, declarar Done só após criar/usar os equivalentes reais do projeto e listá-los no relatório.

---

## Como reportar ao final

```md
## Resultado
- Autonomia usada:
- Spec:
- Comandos Done:
- Arquivos alterados:
- Riscos / dúvidas:
- Diff crítico para review humano: sim/não
```
