# Plano — Carregamento de rota

- Status: `aprovado` (2026-11-07)
- Data: 2026-11-07
- Origem: research de 2026-11-07 + pedido de 2026-11-07 (loader de frases que alternam, referência kokonutui)
- Autonomia: `tight`
- Spec: [`specs/2026-11-07-carregamento-de-rota.md`](../../specs/2026-11-07-carregamento-de-rota.md) — `draft`, aguardando aprovação humana. Sem código até lá.
- Módulo dono: nenhum de domínio. Apresentação compartilhada em `apps/web/components/ui/` e as rotas `(family)` e `(elder)`
- Dependência nova: `motion` (import `motion/react`). Não está no `package.json`. Entra só com este plano aprovado, via `pnpm add motion` em `apps/web`. Sem outra biblioteca.

**Done deste plano:** ao trocar de área no painel da família ou no PWA do idoso, o miolo mostra frases em português que se revezam, com o brilho suave do exemplo (o “Thinking…” da referência). O menu (família) e a barra inferior (idoso) continuam visíveis. As frases somem quando a página nova chega.

`docs/state/ATUAL.md` segue no Gate 2.2 até esta tarefa ser a etapa em execução. Não atualizar o state neste plano.

---

## Decisões travadas

1. O aviso é uma frase de cada vez, trocando sozinha. A referência é o componente `AITextLoading` (kokonutui, MIT, 2025-06-26): fade, deslize curto e gradiente no texto. O arquivo no produto não se chama “AI” e não usa as frases em inglês (“Thinking…”, “Processing…”, “Analyzing…”). A Zelita não está “pensando”; está buscando os dados da conta.
2. O mecanismo continua sendo `loading.tsx` do App Router (Next 16). Um arquivo por grupo. O `loading.tsx` é Server Component e renderiza o loader, que é client por causa do `motion` e do intervalo.
3. As frases falam da espera de verdade. Não prometem passo que a tela não faz (“analisando o remédio”, “calculando o horário”).
4. Duas listas. A da família pode ser uma frase inteira. A do idoso é mais curta, porque a letra é grande e a linha não pode vazar para fora do celular.
5. Skeleton de card, `<Suspense>` por seção e barra no topo continuam fora. O brilho deste plano é só no texto, não um esqueleto de página.
6. Verde-petróleo (`brand-900` → `brand-400` → `brand-900`). Fundo claro, como o resto do app. Coral continua só em SOS. Sem dado de saúde na frase.
7. `prefers-reduced-motion`: uma frase só, parada, sem deslize e sem brilho em loop. Login, formulários que já dizem “Enviando…” / “Entrando…” e o SOS (“Lendo o lugar…”) ficam como estão.

---

## Frases

Intervalo da família: 2,8 s. Intervalo do idoso: 3,2 s. O 1,5 s da referência é pouco para ler a frase.

Família:

1. Estamos carregando suas informações.
2. Por favor, aguarde um pouco.
3. Estamos buscando o que você precisa.
4. Já vai aparecer aqui.

Idoso:

1. Estamos carregando.
2. Aguarde um pouco.
3. Já vai aparecer.

A primeira frase de cada lista é a que fica fixa quando o movimento está reduzido, e a que o leitor de tela anuncia.

---

## 1. Abordagem

1. **Loader.** `apps/web/components/ui/route-loading.tsx`, export nomeado `RouteLoading`, `"use client"`. Adapta o componente colado no pedido: `AnimatePresence`, `motion` e `cn`. O comentário de licença MIT do kokonutui permanece no arquivo. Sem `demo.tsx`. Sem imagem e sem ícone.
2. **O que muda em relação ao colado.**
   - Export nomeado. O projeto não usa `export default` em componente de UI.
   - `texts` vem de `apps/web/content/route-loading.ts`, não do default em inglês.
   - A frase quebra linha (`whitespace-normal`, `text-center`, `text-balance`). O `whitespace-nowrap` + `min-w-max` da referência estoura a largura com “Estamos carregando suas informações.”
   - Gradiente `from-brand-900 via-brand-400 to-brand-900`. Sem `dark:` e sem neutro. O app é light-first.
   - Altura mínima de duas linhas, para a troca de frase não empurrar o resto.
   - `useReducedMotion` de `motion/react`. Movimento reduzido: primeira frase, opacidade 1, sem `y` e sem `backgroundPosition` infinito.
   - No contraste forte do idoso, o gradiente sai e o texto fica sólido (a cor do shell). O meio do brilho (`brand-400`) some em cima do branco.
3. **Leitor de tela.** A frase animada fica `aria-hidden`. Um texto só, visualmente escondido, com `role="status"` e `aria-live="polite"`, repete a primeira frase da lista. Assim a troca visual não é lida de novo a cada intervalo.
4. **Família.** `app/(family)/familia/loading.tsx` usa a variante `family`. O shell (menu, topo, faixa de trial) está em `(family)/layout.tsx` e permanece. O fallback entra no `<main>`: Hoje, Remédios, Exames, Consultas, Avisos, Localização, Participantes, Plano, Ajustes, Guia, Instalar e Pedidos de ajuda.
5. **Idoso.** `app/(elder)/idoso/loading.tsx` usa a variante `elder`. O `ElderShell` (banner e barra inferior) permanece. O tamanho parte de `--elder-title` (já nasce acima de 17px e acompanha “Letras”). Cobre Casa, Família, Horários, Ajustes e Instalado.
6. **Pasta de UI.** `apps/web/components/ui/` já existe, com `cn` em `@/lib/utils` e Tailwind no app. Não há passo de CLI do shadcn.

---

## 2. Arquivos

### Criar

- `apps/web/content/route-loading.ts` — as duas listas e os intervalos
- `apps/web/components/ui/route-loading.tsx` — loader de frases
- `apps/web/app/(family)/familia/loading.tsx` — variante `family`
- `apps/web/app/(elder)/idoso/loading.tsx` — variante `elder`

### Alterar

- `apps/web/package.json` e o lockfile — dependência `motion`

Nenhum arquivo de domínio, action ou layout existente.

Spec escrita, ainda em `draft`: `specs/2026-11-07-carregamento-de-rota.md`.

---

## 3. Fora de escopo

- Skeleton de card, tabela ou feed, e reserva de altura por bloco
- `<Suspense>` quebrando o fetch de Hoje ou de qualquer outra página
- Barra no topo e pacote de progresso (`nprogress`, `nextjs-toploader` ou equivalente)
- Estado pendente em cada `<Link>` da landing, do menu ou da home do idoso
- `app/(auth)/loading.tsx` — o botão de entrar já diz “Entrando…”
- `demo.tsx` e as frases em inglês da referência
- Troca de pessoa cuidada (`router.refresh` no seletor)
- Deixar as queries mais rápidas
- SOS, Casa, login, convite e demais ações que já têm frase de espera
- Migration, RLS, env, Inngest

---

## 4. Riscos técnicos

- **Primeira entrada no painel.** O `loading.tsx` é filho do layout. Em `/entrar` → `/familia`, `getShellContext` ainda segura a tela de login até o shell existir. O botão permanece em “Entrando…”. Se nesse salto o aviso ainda parecer pouco, o complemento é outra tarefa.
- **Layout do idoso.** `(elder)/idoso/layout.tsx` é `force-dynamic`. Na primeira abertura de `/idoso` a espera continua até o layout resolver. As trocas seguintes usam o loader.
- **Contraste forte.** Gradiente no texto falha quando o meio do brilho é claro. Nessa variante o texto fica sólido.
- **Largura.** Frase longa com `nowrap` gera scroll horizontal no celular. A adaptação quebra a linha.
- **Leitor de tela.** `aria-live` no nó que troca a cada 2,8 s relê a lista inteira. O anúncio é uma frase só, fora da animação.
- **PHI.** O componente não recebe nome, remédio, telefone nem coordenada. Nada vai para o Sentry.
- **Pacote.** `motion` é a única dependência nova. Sem ela o componente da referência não roda.

---

## 5. Path crítico

**Sim**, só pela pasta do aparelho.

- `apps/web/app/(elder)/idoso/loading.tsx` — PWA sem login

Não mexe em `apps/web/modules/elder-access/**`, `sos`, `accounts`, `billing`, `supabase/migrations/**` nem `.env`. A regra de negócio do SOS e da Casa não muda.

---

## 6. Verificação

Vitest não cobre o Suspense do roteador. A lista de frases pode ter um teste curto se a Spec pedir: quatro frases na família, três no idoso, nenhuma em inglês.

Homologação manual, com `pnpm dev` já no ar:

1. No painel, clicar Hoje → Remédios → Exames. O menu fica. O miolo reveza as quatro frases antes do conteúdo, com o brilho no texto.
2. No PWA, clicar Casa, Família e Horários. A barra inferior fica. As três frases cabem na largura e acompanham o tamanho de letra.
3. Celular estreito: a frase quebra em linha. Não aparece scroll horizontal.
4. Contraste forte no idoso: o texto fica sólido e legível.
5. `prefers-reduced-motion`: uma frase parada, sem deslize e sem brilho em loop.
6. Login: o botão segue “Entrando…” e o painel abre como hoje.
7. SOS: “Preciso de ajuda” não passa a exibir este loader no lugar do fluxo atual.

Done de código, quando a Spec existir: `pnpm typecheck`, `pnpm lint`, `pnpm test`.

---

## Ordem depois da aprovação

1. Spec em `specs/` e parar de novo até aprovação humana
2. `pnpm add motion` em `apps/web`
3. Implementar os quatro arquivos da seção 2
4. `pnpm typecheck`, `pnpm lint`, `pnpm test`
5. Conferir os sete passos da seção 6 no navegador
6. Registrar em `docs/implementation/` e atualizar `docs/state/`
