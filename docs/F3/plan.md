# Plano — F3 · Cadastro (8 passos)

- Status: `aguardando aprovação`
- Data: 2026-08-12
- Origem: `docs/state/PLANO-ALTA-FIDELIDADE.md` (fase F3) + research desta conversa
- Autonomia proposta: **`medium`** (paths críticos — ver §5). O humano pediu `medium`; manter `tight` na Spec salvo decisão contrária explícita.
- Pré-requisitos: F0 ✅ · F1 ✅ · F2 ✅ (Done técnico; homologação manual F2 pendente)
- Referência visual: `zelita-prototipo.html` — aba **Cadastro** (`#s-onb`, `ONAMES[]`, linhas ~725–879)
- Próximo artefato após aprovação: `specs/2026-08-12-f3-cadastro.md`

---

## Decisões propostas neste plano

| Tema                | Decisão proposta                                                                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rota canônica       | **`/cadastro`** — wizard completo dos 8 passos; substitui o redirect atual                                                                                                                      |
| `/onboarding`       | **Redirect** para `/cadastro` (passo adequado) enquanto onboarding estiver incompleto; evita dois fluxos paralelos                                                                              |
| Passos 1–2 (OTP)    | **Reutilizar** `auth-actions` e peças F0 do F2 — copy própria em `content/signup.ts`, sem duplicar lógica Supabase                                                                              |
| Pós-OTP no cadastro | Avança para **passo 3** no mesmo wizard; **não** passa pelo seletor multi-conta do Entrar (usuário novo)                                                                                        |
| Estado entre passos | **Client-side** até o passo 8; persistência única no servidor ao concluir (evolução de `completeOnboarding`)                                                                                    |
| Passo 7 (convites)  | **UI fiel + “Fazer isso depois”**; convites ficam só na lista local da sessão, **sem INSERT** — envio real na F4.4                                                                              |
| Passo 8 (plano)     | Registra escolha em `accounts.plan` + `trial_ends_at` via RPC existente; **sem gateway**, sem formulário de cartão                                                                              |
| “Assinar agora”     | Grava intenção (`plan` escolhido, ex. `cuidado_plus`) + trial estendido conforme regra de negócio; botão vira copy de placeholder (“Ir para pagamento seguro” desabilitado ou mensagem honesta) |
| Prévia de mensagem  | Função pura nova em **`care-recipients/domain`** (tom + nomes); componente de apresentação compartilhável depois na F4.10                                                                       |
| Migration           | **Pequena, só se necessário** — preferir campos já existentes (`plan`, `trial_ends_at`); Spec detalha antes de aplicar                                                                          |
| Middleware          | Incluir `/cadastro` no matcher **apenas** a partir do passo 3 (guard client + checagem server-side na action final)                                                                             |

---

## 1. Abordagem (6 passos)

### Passo 1 — Spec, copy e roteamento

Redigir `specs/2026-08-12-f3-cadastro.md` com cenários por passo, regras de negócio e checklist de segurança. Externalizar toda copy em `content/signup.ts` (blocos tipados: títulos dos 8 passos, campos, hints, notas, CTAs, opções de canal/tom/parentesco/plano). Definir slugs canônicos de `channel_preference` e valores de `plan`. Atualizar `docs/state/ATUAL.md`.

### Passo 2 — Shell do wizard e passos 1–2 (e-mail + código)

Implementar `app/(auth)/cadastro/page.tsx` como shell RSC (logo, `StepBar`, contador “Passo N de 8”). Client `signup-form.tsx` com máquina de estados para os 8 passos. Passos 1–2 consomem `requestEmailOtp` / `verifyEmailOtp` — após OTP válido, avança ao passo 3 **sem** redirect para `/onboarding`. Reutilizar `CodeBox`, timer 45 s e padrão visual do `login-form.tsx`.

### Passo 3 — Passos 3–5 (gestor + pessoa cuidada + casa)

Passo 3: nome + WhatsApp do gestor (`formatPhoneBR`). Passo 4: grid 2×2 — nome completo, apelido, nascimento (máscara BR ou `type="date"` — fechar na Spec), parentesco via `<Select>` nativo estilizado. Passo 5: WhatsApp do idoso + endereço textual. Validação Zod incremental no client; dados acumulados no state do wizard.

### Passo 4 — Passo 6 (canal, tom, prévia, DND)

Três `OptRow` para canal (`whatsapp` / `whatsapp_voice` / `voice_only`), três `Chip` para tom (`carinhoso` / `direto` / `formal`), prévia reativa via função pura de domínio, campos de horário DND (07:00–22:00 como protótipo). Vitest ≥80% na função de prévia e validação de canal/tom.

### Passo 5 — Passos 7–8 e persistência

Passo 7: linha do admin (você) + formulário de convite **sem backend**; “Fazer isso depois” e “Continuar” seguem ao passo 8. Passo 8: duas `OptRow` de plano (trial grátis vs assinar); CTA dinâmico conforme seleção. Refatorar `completeOnboarding` → action de conclusão do cadastro que recebe payload agregado: profile, `bootstrap_family_account(plan, trial_ends_at)`, `care_recipients`, `safe_places` (Casa). Redirect para `/familia` (estado “primeiro acesso” virá na F4.2).

### Passo 6 — Integração, testes e Done

Redirect `/onboarding` → `/cadastro` para quem autenticou pelo Entrar mas não concluiu. Ajustar `login-routing` se necessário (cadastro incompleto → `/cadastro`, não `/onboarding`). Testes Vitest (domínio prévia, roteamento, copy). Homologação manual via skill `manual-report` (FL-02). `pnpm typecheck` · `pnpm lint` · `pnpm test`. Registrar em `docs/implementation/`.

---

## 2. Arquivos a criar ou alterar

### Criar

| Arquivo                                                                    | Papel                                                           |
| -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `specs/2026-08-12-f3-cadastro.md`                                          | Spec aprovável                                                  |
| `apps/web/content/signup.ts`                                               | Copy tipada dos 8 passos                                        |
| `apps/web/content/signup.test.ts`                                          | Smoke da copy / rotas                                           |
| `apps/web/modules/care-recipients/presentation/signup-form.tsx`            | Wizard client (ou pasta `signup/` com subcomponentes por passo) |
| `apps/web/modules/care-recipients/presentation/signup-mark.tsx`            | Logo/header (pode reexportar `LoginMark`)                       |
| `apps/web/modules/care-recipients/presentation/signup-message-preview.tsx` | Prévia WA (passo 6)                                             |
| `apps/web/modules/care-recipients/domain/message-preview.ts`               | Regras puras de copy por tom                                    |
| `apps/web/modules/care-recipients/domain/message-preview.test.ts`          | Vitest                                                          |
| `apps/web/modules/care-recipients/domain/signup-options.ts`                | Constantes: parentesco, canal, tom, planos                      |
| `apps/web/modules/care-recipients/application/complete-signup.ts`          | Server action de conclusão (evolução de `complete-onboarding`)  |
| `apps/web/modules/care-recipients/application/signup-routing.ts`           | Funções puras: passo inicial, destino pós-auth incompleto       |
| `apps/web/modules/care-recipients/application/signup-routing.test.ts`      | Vitest                                                          |
| `docs/implementation/2026-08-12-f3-cadastro.md`                            | Entrega Done                                                    |

### Alterar

| Arquivo                                                               | Papel                                            |
| --------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/web/app/(auth)/cadastro/page.tsx`                               | Shell RSC do wizard (substitui redirect)         |
| `apps/web/app/(auth)/onboarding/page.tsx`                             | Redirect para `/cadastro`                        |
| `apps/web/modules/care-recipients/index.ts`                           | Exportar API pública                             |
| `apps/web/modules/care-recipients/application/complete-onboarding.ts` | Deprecar ou delegar para `complete-signup`       |
| `apps/web/modules/care-recipients/presentation/onboarding-form.tsx`   | Remover ou tornar wrapper fino (decidir na Spec) |
| `apps/web/modules/accounts/application/login-routing.ts`              | Destino “onboarding incompleto” → `/cadastro`    |
| `apps/web/modules/accounts/application/login-routing.test.ts`         | Atualizar expectativas                           |
| `apps/web/middleware.ts`                                              | Matcher `/cadastro` (se aprovado na Spec)        |
| `docs/state/ATUAL.md`                                                 | WIP F3                                           |
| `docs/state/PENDENCIAS.md`                                            | Fechar item “/cadastro vazio até F3”             |

### Alterar com cautela (path crítico — diff revisado)

| Arquivo                                                                | Papel                                                                    |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `apps/web/modules/accounts/application/auth-actions.ts`                | Só se precisar variante “cadastro” pós-OTP sem seletor multi-conta       |
| `apps/web/modules/accounts/infrastructure/bootstrap-family-account.ts` | Só se assinatura RPC precisar de parâmetro novo                          |
| `supabase/migrations/00X_f3_*.sql`                                     | **Somente** se Spec aprovar campo extra além de `plan` / `trial_ends_at` |

### Não tocar (salvo necessidade documentada na Spec)

- `apps/web/components/ui/**` (F0 — consumir, não refatorar)
- `apps/web/app/(family)/**`, `app/(elder)/**`, `app/(marketing)/**`
- `modules/billing/**` (gateway), `modules/sos/**`, `modules/elder-access/**`
- `docs/prd-mvp.md`, `docs/SECURITY.md`, `AGENTS.md`

---

## 3. Fora de escopo

- **Gateway de pagamento real** — passo 8 é registro de intenção + copy; sem Stripe/Pagar.me, sem cartão
- **Envio real de convites** — tabela `invites`, token, e-mail/WA, RLS (F4.4)
- **Opt-in WhatsApp** ao idoso — evento `wa.opt_in_requested` pós-cadastro (job/canal real fora desta fase)
- **Jobs Inngest** (trial ending, billing pause)
- **Reescrever `/entrar`** — F2 entregue; só alinhar roteamento pós-login incompleto
- **Painel “Primeiro acesso”**, tour, shell sidebar (F4.1 / F4.2 / F4.12)
- **PWA do idoso**, vínculo de device (F5 / F6)
- **Passkey / biometria**
- **Link mágico** na UI
- **Nova dependência** npm
- **Headers de segurança** A05 (pendência herdada F1)
- **Homologação FL-01 completa** — pode ser parcial; não bloqueia Done técnico se Supabase indisponível (documentar)

---

## 4. Riscos técnicos

| Risco                                         | Mitigação proposta                                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Duplicação OTP** Entrar vs Cadastro         | Uma implementação Supabase (`auth-actions`); copy e shell separados                 |
| **Wizard monolítico** (>300 linhas)           | Subcomponentes por passo (`signup-email-step`, etc.) desde o início                 |
| **Abandono mid-flow** (user auth sem conta)   | Aceito no MVP; passo 8 único ponto de persistência; copy honesta no passo 1         |
| **Passo 7 promete convite** sem backend       | UI clara de “será enviado depois” ou lista local não persistida; Spec proíbe INSERT |
| **Passo 8 “Assinar agora”** parecer cobrança  | Sem `#payform`; CTA placeholder + nota de segurança; botão não abre checkout        |
| **Valores inválidos** de canal/DND            | Zod server-side + slugs fixos em `signup-options.ts`; testes de domínio             |
| **Overlap `/cadastro` vs `/onboarding`**      | Uma rota canônica; redirect explícito; testes de roteamento                         |
| **Migration não necessária virar necessária** | Spec lista campos antes de codar; migration só com aprovação humana                 |
| **F2 não homologada**                         | FL-02 acumula cadastro; documentar dependência                                      |
| **PHI em logs**                               | Server actions com mensagens genéricas; Sentry só IDs + tipo de evento              |

---

## 5. Path crítico

**Sim.** Esta feature toca paths críticos listados no `AGENTS.md`:

| Path                                                                                | Por quê                                           |
| ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| `apps/web/app/(auth)/cadastro/**`                                                   | Rota de auth/onboarding                           |
| `apps/web/app/(auth)/onboarding/**`                                                 | Redirect do fluxo legado                          |
| `apps/web/modules/accounts/application/auth-actions.ts`                             | OTP e sessão (se variante cadastro)               |
| `apps/web/modules/accounts/infrastructure/bootstrap-family-account.ts`              | Criação atômica de conta                          |
| `apps/web/modules/accounts/application/login-routing.ts`                            | Destino pós-login incompleto                      |
| `apps/web/modules/care-recipients/application/complete-onboarding.ts` (ou sucessor) | Persistência de pessoa cuidada + Casa             |
| `apps/web/modules/care-recipients/domain/**`                                        | Prévia de mensagem, opções de canal/tom           |
| `apps/web/middleware.ts`                                                            | Proteção de rotas auth                            |
| `supabase/migrations/**`                                                            | **Condicional** — só se Spec aprovar schema extra |

**Autonomia recomendada: `tight`** — review humano do diff de auth, bootstrap, persistência e (se houver) migration.

---

## 6. Aprovação humana

- [ ] Plano aprovado por: ******\_\_****** · Data: ****\_\_****
- [ ] Confirmar autonomia: `tight` · `medium` · outra: ****\_\_****
- [ ] Confirmar decisões da tabela inicial (especialmente passo 7 sem backend e passo 8 sem gateway)
- [ ] Confirmar rota canônica `/cadastro` + redirect de `/onboarding`
- [ ] Aprovar migration pequena se passo 8 exigir campo além de `plan` / `trial_ends_at`: sim · não · decidir na Spec

**Após aprovação:** atualizar `docs/state/ATUAL.md` e redigir `specs/2026-08-12-f3-cadastro.md` para segunda rodada de aprovação antes de implementar.
