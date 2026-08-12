# Plano — F0 · Fundação de design + F1 · Site

- Status: `aguardando aprovação`
- Data: 2026-08-12
- Origem: `docs/state/PLANO-ALTA-FIDELIDADE.md` (fases F0 e F1)
- Autonomia: F0 `medium` · F1 `loose` (com uma exceção em path crítico — ver §5)
- Estrutura: **duas Specs sequenciais**. F0 aprovada e verde antes de F1 começar, mantendo a decisão de 2026-08-12 ("uma Spec por fase"). F1 vira a primeira validação real dos tokens de F0.

---

## Decisões travadas nesta conversa

| Tema | Decisão |
| --- | --- |
| Recurso "Texto grande" | **Adiado** para a fase que precisar (F5, PWA do idoso). Sai do escopo de F0 |
| Copy em `content/` | TypeScript tipado (`content/landing.ts` com `interface`), sem dependência nova |
| Fidelidade da landing | **Tudo do protótipo, sem cortes de copy.** "Resumo semanal da família" fica; as 3 garantias pós-planos entram; rodapé como está |
| Responsividade | Único desvio autorizado: refazer **mobile-first de verdade**, em vez do breakpoint solitário de 1100px |
| CTA "Começar 30 dias grátis" | Leva para **o cadastro** (`/cadastro`) |
| CTA "Entrar" | Leva para `/entrar` |
| CTA "Ver como funciona por dentro" | Âncora para a seção "Como funciona" (no protótipo ele abre o painel autenticado — não pode em produção) |
| Headers de segurança, Privacidade, Termos, OG, sitemap, analytics | Fora destas fases |

### Nota sobre as portas de entrada

Hoje **não existem duas portas**. A `/entrar` faz login e cadastro ao mesmo tempo: `signInWithOtp` roda com `shouldCreateUser: true`, então quem nunca entrou vira usuário no mesmo fluxo do OTP. Depois de validar o código, a action redireciona para `/onboarding`, que manda para `/familia` se a conta já tiver pessoa cuidada. E `/onboarding` está atrás do middleware — visitante anônimo apontado para lá quica de volta em `/entrar`.

Como o CTA primário precisa levar ao cadastro, a **F1 cria `app/(auth)/cadastro/page.tsx` contendo apenas um `redirect("/entrar")`**. O visitante chega pela URL certa, a intenção fica registrada na navegação, e a **F3 só substitui o conteúdo desse arquivo** pelos 8 passos — sem caçar CTA espalhado na landing depois. O `matcher` do middleware não cobre `/cadastro`, então a rota nasce pública como precisa ser.

---

## 1. Abordagem

### F0 · Fundação de design

**Passo 1 — Tokens e tipografia.** Levar os 27 tokens do `:root` do protótipo para `globals.css` via `@theme inline` do Tailwind v4: escala `brand-50…900` completa (corrigindo `--brand-50` de `#E8F6F3` para `#EEF8F5`), `sand`/`sand-2`, `line`/`line-2`, `ink`/`muted`/`muted-2`, as três semânticas com tinta e fundo (`ok`, `amber`, `coral`), a escala de raios e a sombra única de cartão. Os nomes atuais `--surface` e `--border` ficam como **alias** de `--sand-2` e `--line`, para as cinco telas já existentes continuarem funcionando sem serem tocadas. Em `layout.tsx`, Inter no corpo e Plus Jakarta Sans em títulos e números de destaque, com pesos cortados ao mínimo que o protótipo usa de fato.

**Passo 2 — Primitivos.** Componentes próprios em `components/ui/`, cada um com `cva` sobre os tokens, **nenhum valor solto**: Button (3 variantes × 3 alturas, mais as duas do idoso), Card (header/body), Tag nas 5 variantes, Note nas 3, ListRow de 64px, Stat, Field/Input/Select/Textarea, Chips, CodeBox de OTP, StepBar, OptRow, Progress e EmptyState.

**Passo 3 — Formatadores e testes.** Funções puras em `lib/format/` — telefone BR, código OTP, moeda e data via `Intl` — cobertas por Vitest. É a única lógica testável da fase; a camada visual vai como N/A justificado no relatório de Done.

### F1 · Site

**Passo 4 — Copy separada.** `content/landing.ts` com a copy literal do protótipo em blocos tipados: `nav`, `hero`, `comparison`, `pillars`, `freebar`, `plans`, `planGuarantees`, `usability`, `pains`, `howItWorks`, `progressiveOnboarding`, `footer`. Nenhum texto dentro de componente.

**Passo 5 — Seções em RSC.** Um componente por bloco em `app/(marketing)/_components/`, consumindo os primitivos da F0. **Sem `use client` em lugar nenhum** — a landing do protótipo é 100% estática, sem accordion, toggle de preço ou tab. Os `onclick` do protótipo viram `<Link>`.

**Passo 6 — Mobile-first e homologação.** Cada grid nasce em uma coluna e cresce por `sm`/`lg`; a nav ganha CTA compacto no mobile. Fecha com plano e relatório de homologação pela skill `manual-report`, por ser fluxo de UI.

---

## 2. Arquivos

| Arquivo | Ação | Fase |
| --- | --- | --- |
| `apps/web/app/globals.css` | alterar (reescrita dos tokens) | F0 |
| `apps/web/app/layout.tsx` | alterar (segunda família tipográfica) | F0 |
| `apps/web/components/ui/button.tsx` | alterar (variantes do style guide) | F0 |
| `apps/web/components/ui/{card,tag,note,list-row,stat,field,input,select,textarea,chips,code-box,step-bar,opt-row,progress,empty-state}.tsx` | criar | F0 |
| `apps/web/lib/format/{phone,otp,currency,date}.ts` + testes Vitest | criar | F0 |
| `apps/web/content/landing.ts` | criar | F1 |
| `apps/web/app/(marketing)/page.tsx` | alterar (substitui o placeholder) | F1 |
| `apps/web/app/(marketing)/_components/*.tsx` | criar (uma seção por arquivo) | F1 |
| `apps/web/app/(auth)/cadastro/page.tsx` | criar (só `redirect("/entrar")`) | F1 |
| `docs/state/ATUAL.md`, `docs/state/PENDENCIAS.md` | alterar | ambas |
| `docs/implementation/2026-08-12-f0-*.md` e `-f1-*.md` | criar no Done | ambas |

Nenhuma migration, nenhuma mudança de schema ou RLS, **nenhuma dependência nova**, nenhum arquivo em `modules/`.

---

## 3. Fora de escopo

- **Modal, Sheet, Timeline e o tour guiado** — ficam para a fase que os consome (F3 a F4.12). Construí-los agora seria desenhar a API sem caso de uso real.
- **Recurso "Texto grande"** — adiado para F5 por decisão do humano.
- **Migração das telas existentes** (login, onboarding, shell da família, remédios, PWA do idoso) para os primitivos novos. Cada uma é reescrita na sua própria fase: F2, F3, F4.1, F4.3 e F5. É isso que mantém a F0 fora do path crítico.
- **Headers de segurança** no `next.config.ts` (`SECURITY.md` A05).
- **Páginas de Privacidade e Termos**, OG image, sitemap, robots.
- **Analytics** de qualquer tipo (exigiria dependência nova).
- **Conteúdo real de `/cadastro`** — os 8 passos são F3.

### Pendências que estas fases abrem

Entram em `docs/state/PENDENCIAS.md` no Done:

- [ ] Headers de segurança do `SECURITY.md` A05 no `next.config.ts` — a landing é a primeira página pública de verdade
- [ ] Landing publica "Resumo semanal da família" no plano Família enquanto a feature está fora do MVP (decisão de manter a copy do protótipo)
- [ ] Rodapé sem link de Privacidade nem Termos — exposição de LGPD, já que a landing capta cadastro que envolve dados de saúde de terceiro
- [ ] `/cadastro` fica público e sem conteúdo próprio até a F3 — quando ganhar conteúdo real, revisar o `matcher` do middleware e o checklist de segurança

---

## 4. Riscos técnicos

**Rename de tokens quebrar as telas existentes.** É o maior. Mitigado mantendo `--surface` e `--border` como alias — o que também é o que evita a F0 encostar em path crítico.

**Escala de raios maior que o previsto.** O plano original listava 9/12/14/20/99; o protótipo usa onze valores distintos (9, 10, 11, 12, 14, 16, 18, 20, 22, 26, 38). Vou tokenizar a escala real e documentar, porque normalizar para cinco degradaria input, chip e sheet.

**Cores hardcoded fora do `:root`.** Logo negativo (`#7FD8C6`), textos claros sobre fundo escuro (`#9FC4BE`, `#DCEFEA`, `#CBE9E2`) e tintas sobre coral (`#8A2C10`, `#A0472A`) viram tokens nomeados, não exceções soltas.

**Regressão de LCP** com duas famílias tipográficas (Inter 4 pesos + Plus Jakarta 5 pesos). Contido cortando para o mínimo em uso.

**Cobertura de testes estruturalmente baixa.** O critério de ≥80% se aplica só aos formatadores puros; o resto vai como N/A justificado, com a verificação real vindo do `manual-report` na F1.

**Tokens de tipografia e alvo de toque hoje só existem na documentação.** `--fs-body: 15.5px`, `--fs-body-elder: 17px`, `--tap: 48px`, `--tap-elder: 56px` aparecem no bloco de código do style guide, mas o CSS real tem os valores soltos. A F0 é o momento de conectá-los de verdade.

---

## 5. Path crítico

**F0: não.** Nenhum arquivo cai na lista do `AGENTS.md` — não toca `modules/**/domain/**`, `modules/accounts/**`, `billing`, `elder-access`, `app/(elder)/**`, `sos`, `supabase/**`, `.env*` nem CI/CD.

**F1: sim, em um único arquivo.** `app/(auth)/cadastro/page.tsx` — `app/(auth)/` é path crítico. O arquivo tem três linhas e contém só um `redirect("/entrar")`, sem lógica de autenticação, mas **exige aprovação explícita no texto da Spec**. Proposta: a F1 segue `loose` com esse arquivo listado como exceção aprovada; se preferir, a fase inteira sobe para `tight` e você revisa o diff completo.

O que **viraria** path crítico e por isso está fora: migrar `modules/accounts/presentation/family-shell.tsx` e `login-form.tsx` para os primitivos novos, e editar `app/(auth)/entrar/page.tsx` para diferenciar a intenção de chegada (um `/entrar?novo=1` que trocasse o título). Ambos pertencem a F2 e F4.1, que já nascem `tight`.

---

## 6. Aprovação humana

- [ ] Plano aprovado por: ______________ · Data: __________
- [ ] Confirmar a exceção de path crítico da §5 (`/cadastro` como redirect na F1)
- [ ] Confirmar a autonomia da F1 (`loose` com exceção, ou `tight` inteira)

Na aprovação: atualizar `docs/state/ATUAL.md` e escrever `specs/2026-08-12-f0-fundacao-design.md`.
