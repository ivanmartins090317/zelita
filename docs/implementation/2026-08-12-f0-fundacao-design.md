# F0 — Fundação de design

| Campo | Valor |
| --- | --- |
| Data | 2026-08-12 |
| Spec | `specs/2026-08-12-f0-fundacao-design.md` |
| Plano | `docs/f0-f1/plan.md` (fase F0) |
| Autonomia | `medium` |
| Status | Done |

## Objetivo

Levar o style guide do protótipo para o código como sistema de tokens + peças reutilizáveis, antes de qualquer tela nova. Nenhuma tela para o usuário final nesta fase.

## O que foi entregue

**Tokens (`apps/web/app/globals.css`)** — de 11 para 52 tokens, em três camadas: valores crus em `:root`, mapeamento para utilitários em `@theme inline`, estilos de base (corpo, títulos, foco).

- Paleta completa: 9 tons de marca, 7 neutros, 3 semânticas com tinta/fundo/borda, 6 tintas de contexto
- Tipografia: duas famílias, seis tamanhos nomeados (`--fs-label` a `--fs-body-elder`)
- Pisos de toque e leitura: `--tap` 48, `--tap-sm` 42, `--tap-xs` 38, `--tap-chip` 44, `--tap-elder` 56, `--tap-sos` 104, `--h-field` 50, `--h-row` 64, `--sq-icon` 38
- Raios: 12 degraus (9 · 10 · 11 · 12 · 14 · 16 · 18 · 20 · 22 · 26 · 38 · 99)
- Sombra única de cartão

**Tipografia (`apps/web/app/layout.tsx`)** — Inter no corpo e nos dados; Plus Jakarta Sans em títulos (`h1`–`h4` por regra de base) e em números de destaque via `font-head`.

**Peças (`apps/web/components/ui/`)** — 16 arquivos, todos RSC (nenhum `use client`), todos sobre token:

`button` (5 variantes × 7 alturas) · `card` (Card/Header/Title/Body) · `tag` (5 tons) · `note` (3 tons) · `list-row` · `stat` · `field` · `input` · `select` · `textarea` · `chips` (Chips/Chip) · `code-box` · `step-bar` · `opt-row` · `progress` · `empty-state`

**Formatadores (`apps/web/lib/format/`)** — funções puras: `formatPhoneBR`, `onlyDigits`, `formatAccessCode`, `toAccessCodeDigits`, `formatCurrencyBRL`, `formatDateBR`, com `index.ts` como API pública.

## Comandos Done

```bash
pnpm typecheck  # ok
pnpm lint       # ok
pnpm test       # 9 arquivos, 49 testes ok (27 novos, todos de formatador)
pnpm build      # ok
```

### Verificação extra: os utilitários de token existem de verdade

`typecheck` e `lint` não detectam classe Tailwind inexistente. Por isso o CSS gerado pelo build foi inspecionado diretamente. Todos os utilitários novos aparecem e todos apontam para o token, não para o valor:

```css
.min-h-tap{min-height:var(--tap)}      /* --tap:48px */
.min-h-row{min-height:var(--h-row)}    /* --h-row:64px */
.rounded-card{border-radius:var(--r-card)}  /* --r-card:20px */
.text-body{font-size:var(--fs-body)}   /* --fs-body:15.5px */
.shadow-card{--tw-shadow:var(--sh-card)}
--surface:var(--sand-2); --border:var(--line); --background:var(--sand);
```

É a evidência objetiva do Cenário 16: mudar o valor do token em `:root` muda toda peça e toda tela que depende dele, sem edição individual.

## Cenários da Spec

| # | Cenário | Como foi verificado |
| --- | --- | --- |
| 1 | Paleta completa | Inspeção: 25 tons nomeados como no style guide, incluindo os que faltavam (`brand-100`, `brand-400`, `brand-500`, `sand`, `line-2`, `muted-2`, `ok`, `amber`, `coral`) |
| 2 | Telas existentes de pé | `--surface`, `--border`, `--background`, `--foreground` viraram apelido; nenhum arquivo das 5 telas foi tocado; `/`, `/entrar` e `/idoso` abertas no navegador |
| 3 | Correção do tom da marca | `--brand-50` de `#E8F6F3` para `#EEF8F5`; divergência registrada abaixo |
| 4 | Duas famílias com papel claro | Corpo em Inter por `body`; `h1`–`h4` em Plus Jakarta por regra de base — tela nenhuma declara família |
| 5 | Peso enxuto | Inter 400/500/600/700 e Jakarta 700/800 (protótipo carregava 4 + 5) |
| 6 | Peças recorrentes | 16 peças entregues, cobrindo a lista da Spec |
| 7 | Nenhum valor solto | Inspeção arquivo a arquivo: cor, raio, sombra, tamanho de texto e altura sempre por token. Únicos valores calculados: largura da barra de progresso (`style.width`, dado, não estilo) e o ponto do `opt-row` |
| 8 | Coral só em emergência | Coral aparece em: `button` (`emergency`, `sos`), `tag` (`critical`), `note` (`critical`), `code-box` (`invalid`), `field` (`error`). Nenhuma variação comum, de marca ou de destaque |
| 9 | Pisos de toque | Nove tokens de altura; toda peça deriva deles (`min-h-tap`, `min-h-row`, `min-h-field`, `min-h-tap-elder`, `min-h-tap-sos`) |
| 10 | Escala de raios fiel | 12 degraus preservados, nomeados por papel |
| 11 | Cores fora da paleta | `--brand-on-dark`, `--on-dark`, `--on-dark-soft`, `--on-dark-muted`, `--on-coral`, `--on-coral-muted`, `--amber-line`, `--coral-line` |
| 12–15 | Formatadores | 27 testes Vitest |
| 16 | Token muda sem tocar em tela | CSS gerado acima |

## Segurança (`docs/SECURITY.md`)

Fase sem dado, sem autenticação, sem rede e sem PHI. Item a item:

| Item do checklist | Situação |
| --- | --- |
| RLS na tabela tocada | **N/A** — nenhuma tabela tocada, nenhuma migration |
| Autorização server-side | **N/A** — nenhuma rota, action ou leitura de dado |
| `elder-access` / PWA | **N/A** — `modules/elder-access/**` e `app/(elder)/**` não foram tocados |
| Validação com Zod | **N/A** — nenhuma entrada de usuário. Os formatadores são defensivos por contrato (nulo, vazio e não-dígito devolvem valor neutro, nunca lançam) |
| Segredo no client / `service_role` | **N/A** — nenhum segredo, nenhuma env lida |
| Assinatura de webhook | **N/A** — nenhum webhook |
| Upload de exame | **N/A** |
| Opt-in de WhatsApp / DND | **N/A** |
| SOS em duas etapas | **N/A** — a variação `emergency` do botão é aparência; a regra de duas etapas é da fase do SOS |
| Sentry/logs sem PHI | **N/A** — nenhum log novo |
| Headers de segurança | **N/A nesta Spec**, e é exposição real: entra em `PENDENCIAS.md` para antes da F1, que publica a primeira página pública de verdade |
| Nenhuma dependência nova | **OK** — `package.json` e o lockfile não foram tocados. As fontes vêm por `next/font/google`, que baixa em build e serve do próprio domínio: nenhuma requisição a terceiro em runtime |

## Divergências entre protótipo e style guide

1. **`--brand-50`** — a base tinha `#E8F6F3`; o style guide manda `#EEF8F5`. Prevaleceu o style guide.
2. **Raios** — o style guide ilustra 5 degraus (9 · 12 · 14 · 20 · 99), mas o CSS do protótipo usa 12. Todos preservados: normalizar degradaria campo, etiqueta, botão do idoso e painel deslizante.
3. **Cores fora do `:root` do protótipo** — 8 tons viviam soltos dentro de regra de componente. Viraram token nomeado pelo papel.
4. **Bordas de 1,5 px** — o protótipo usa 1,5 px em aviso, campo e linha de opção. As peças usam 1 px (`border`), porque 1,5 px não é degrau de nenhuma escala e criaria um token por exceção. Diferença imperceptível; revisitar se aparecer na homologação da F1.
5. **Tamanhos de texto de controle** — botão de 16/14,5/13,5 px não estava na tabela tipográfica. Entrou como escala nomeada (`--fs-control`, `--fs-compact`) em vez de valor cru.
6. **Marca d'água da landing atual** — `app/(marketing)/page.tsx` desenha "Zelita" num `<span>`, que agora herda Inter em vez de Plus Jakarta. É consequência direta do Cenário 4 (corpo em Inter por padrão) num arquivo que a Spec proíbe editar. A F1 reescreve essa seção usando `font-head`; a pendência está registrada.

## Cobertura

Os 4 formatadores têm todos os caminhos exercitados: caminho feliz, entrada pontuada, entrada parcial, entrada longa demais, letras, vazio, nulo e indefinido. Cobertura medida por instrumentação **não foi rodada**: exigiria `@vitest/coverage-v8`, e a Spec proíbe dependência nova. A verificação foi por inspeção de ramo — cada `if` e cada ternário dos quatro arquivos aparece em pelo menos um teste.

## Conferência visual das telas existentes

Nenhum dos 5 arquivos de tela foi editado. Servidor local, sem sessão:

| Tela | Resultado |
| --- | --- |
| `/` landing | Abre. Marca, título, texto e os dois botões no lugar. Botão secundário passou a seguir o style guide (fundo branco, borda `line`) |
| `/entrar` | Abre. Campos, divisor, caixa de código e três botões no lugar |
| `/idoso` | Abre. Título e texto no lugar |
| `/familia`, `/familia/remedios` | Redirecionam para `/entrar` sem sessão — comportamento do middleware, inalterado |
| `/onboarding` | Idem: atrás do middleware |

O painel da família, a tela de remédios e o onboarding **não puderam ser vistos renderizados** por exigirem sessão Supabase. Ficam na fila de homologação manual (`PENDENCIAS.md`), junto com a homologação já pendente da fatia 1.

Mudanças visuais esperadas nas telas existentes, todas pedidas pela Spec: corpo em Inter, títulos em Plus Jakarta, botões nas alturas e variantes do style guide, contorno de foco global de 3 px.

## Arquivos alterados

**Alterados (3):** `apps/web/app/globals.css` · `apps/web/app/layout.tsx` · `apps/web/components/ui/button.tsx`

**Criados (15 peças):** `apps/web/components/ui/{card,tag,note,list-row,stat,field,input,select,textarea,chips,code-box,step-bar,opt-row,progress,empty-state}.tsx`

**Criados (formatadores):** `apps/web/lib/format/{empty-value,phone,otp,currency,date,index}.ts` + `{phone,otp,currency,date}.test.ts`

**Docs:** `docs/state/ATUAL.md` · `docs/state/PENDENCIAS.md` · este arquivo · campo de status da Spec

Nenhum arquivo em `modules/**`, `app/(auth|family|elder|marketing)/**`, `app/api/**`, `lib/supabase/**`, `supabase/**`, `.env*` ou CI/CD. Nenhum path crítico do `AGENTS.md`.

## Reflexão

A fundação foi montada em três camadas — valor cru em `:root`, mapeamento para utilitário em `@theme inline`, peça consumindo utilitário — e é isso que faz a promessa do Cenário 16 se sustentar de verdade: o CSS gerado referencia `var(--r-card)` em vez de `20px`, então ajustar um tom ou um raio depois é uma linha, não uma varredura. A decisão mais valiosa para manutenção foi manter `--surface` e `--border` como apelido em vez de renomear: custou quatro linhas e tirou as 5 telas existentes do caminho da F0, que era o maior risco da fase. O mesmo raciocínio guiou os apelidos `default`/`outline`/`lg` no botão.

O que ainda pode doer: 52 tokens e 16 peças nasceram sem consumidor real, e só a F1 vai provar se a granularidade acertou — em especial os 12 degraus de raio e os seis tamanhos de texto, que podem se revelar mais finos do que qualquer tela precisa. A verificação automatizada também é assimétrica: os formatadores estão bem cobertos, mas a camada visual depende de olho humano, porque não há Playwright no MVP. O antídoto barato é a F1 consumir as peças de cabo a rabo e a homologação da skill `manual-report` virar o teste de regressão visual da fundação. Se alguma peça sobrar sem uso ao fim da F1, o certo é apagá-la, não achar um uso para ela.

## Riscos / dúvidas

- **Duas famílias tipográficas e o LCP.** Seis arquivos de fonte (Inter 4 + Jakarta 2), servidos do próprio domínio. A medição real só existe quando a landing da F1 estiver de pé.
- **Painel, remédios e onboarding sem conferência visual** — exigem sessão. Estão em `PENDENCIAS.md`.
- **Dúvida da Spec, ainda aberta:** confirmar que "Texto grande" continua adiado para a F5. Nada nesta fase impede o recurso — a escala é ancorada em `--fs-body`/`--fs-body-elder`, e ampliar em 20% é mexer nesses dois tokens.
