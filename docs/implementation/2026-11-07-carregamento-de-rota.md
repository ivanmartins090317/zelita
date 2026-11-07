# Carregamento de rota

**Data:** 2026-11-07  
**Spec:** `specs/2026-11-07-carregamento-de-rota.md`  
**Autonomia:** medium  
**Path crítico:** `apps/web/app/(elder)/idoso/loading.tsx` — pede review humano. Não altera regra de aparelho, de ajuda nem de Casa.

## Entregue

Ao trocar de área no painel, o miolo mostra uma frase da lista da família por vez, a cada 2,8 segundos, com fade, deslize curto e brilho só no texto. O menu, o topo e a faixa de trial ficam. Quando a área chega, as frases somem.

No aplicativo da pessoa cuidada, o miolo mostra uma frase da lista curta por vez, a cada 3,2 segundos. A faixa e a barra inferior ficam. O tamanho parte de `--elder-title`, já acima de 17px, e acompanha “Letras”.

A primeira frase de cada lista é a âncora: é a que fica parada com movimento reduzido e a única que o leitor de tela anuncia. O texto que se move fica oculto para o leitor. Com contraste forte, o gradiente sai e o texto fica sólido. A frase quebra linha e reserva a altura de duas linhas.

## Fora desta entrega

- Esqueleto de página, barra no topo e espera em cada atalho
- Entrar, formulários, “Preciso de ajuda” e “Lendo o lugar…”
- Troca da pessoa cuidada no seletor
- Deixar as áreas mais rápidas
- Relatório formal de homologação

## Comandos Done

Na raiz, em 2026-11-07:

| Comando | Resultado |
| --- | --- |
| `pnpm typecheck` | verde |
| `pnpm lint` | verde (0 erros; aviso antigo em `location-actions.ts`, fora desta entrega) |
| `pnpm test` | verde — 91 arquivos, 449 testes |

O teste da lista está em `apps/web/content/route-loading.test.ts`: quatro frases na família, três no idoso, nesta ordem, intervalos 2,8 s e 3,2 s, primeira frase de cada lista como âncora, nenhuma frase em inglês.

## Conferência no aplicativo local

`pnpm dev` em `http://localhost:3000`, sessão da família já aberta. A rede foi desacelerada para a espera durar o bastante para ler a troca.

| Passo | O que foi visto |
| --- | --- |
| 1 | Hoje → Ajustes, no painel: menu e faixa de trial ficaram. As quatro frases passaram nesta ordem e voltaram ao começo, com intervalos de cerca de 2,8 s depois da primeira leitura. O brilho era o gradiente verde-petróleo só no texto. As frases sumiram quando a área chegou |
| 2 | Início → Família, no aplicativo: faixa e barra ficaram. As três frases passaram, em 24px, o mesmo valor de `--elder-title`. Com “Letra maior”, a frase foi para 26px |
| 3 | Largura de 280px: a frase quebrou em duas linhas de 30px, sem rolagem horizontal |
| 4 | “Contraste forte”: fundo do texto `none`, cor `rgb(0, 0, 0)`, sem o miolo claro do gradiente. As frases continuaram se revezando |
| 5 | Movimento reduzido no painel e no aplicativo: só a primeira frase, `transform: none`, sem gradiente, por mais de um intervalo |
| 6 | Entrar não foi refeito: a sessão já estava aberta e esta entrega não mexe em `(auth)`. O botão continua com o rótulo “Entrando…” em `apps/web/content/login.ts` |
| 7 | “Preciso de ajuda” abriu a confirmação de hoje (“Sim, preciso de ajuda” / “Cancelar”) e foi cancelado. Nenhuma frase desta entrega tomou o lugar do diálogo. “Lendo o lugar…” segue em `apps/web/content/elder.ts` |

## Segurança (`docs/SECURITY.md`)

| Item | Status |
| --- | --- |
| RLS | N/A — nenhuma tabela |
| Autorização de membership | N/A — o aviso não escolhe família nem recebe identificador |
| Elder-access / vínculo | N/A — o arquivo do aplicativo só desenha a espera. Não lê cookie, aparelho nem pedido de ajuda |
| Zod | N/A — sem entrada |
| Segredo no navegador / `service_role` | N/A |
| Webhook | N/A |
| Upload | N/A |
| WhatsApp / opt-in | N/A |
| SOS | N/A — o fluxo de ajuda não foi alterado |
| Sentry sem PHI | OK — não há registro de erro novo. A frase não leva nome, remédio, telefone nem lugar |
| Headers | N/A |
| Dependência nova | `motion` 14.10.1, a única acrescentada, como o plano aprovou. `pnpm audit` não aponta aviso nesse pacote. Críticos já abertos em `next@16.3.0` e `@sentry/nextjs@10.70.0` são anteriores a esta entrega. Subir esses pacotes fica fora do escopo: a Spec só autoriza acrescentar `motion` |

## Reflexão

As duas listas e os dois intervalos ficam num único módulo de conteúdo, e o aviso é um componente só, com a variante `family` ou `elder`. Trocar uma frase ou o ritmo não exige abrir layout, página nem regra de cuidado. O `loading.tsx` de cada grupo continua sendo a fronteira do App Router: o contorno permanece e o miolo é o único lugar da espera.

O brilho e o movimento reduzido estão no componente, não espalhados pelas páginas. O contraste forte do idoso sai do atributo que o shell já publica, por CSS, então o aviso não precisa ler o cookie de “Letras”. O ponto de atenção é o arquivo `apps/web/app/(elder)/idoso/loading.tsx`: é path crítico só por estar na pasta do aparelho. O diff é a renderização do aviso. Quem revisar deve confirmar que ajuda, Casa e vínculo não entraram nesse arquivo.

## Arquivos principais

- `apps/web/content/route-loading.ts`
- `apps/web/content/route-loading.test.ts`
- `apps/web/components/ui/route-loading.tsx`
- `apps/web/app/(family)/familia/loading.tsx`
- `apps/web/app/(elder)/idoso/loading.tsx`
- `apps/web/package.json` e `pnpm-lock.yaml` — dependência `motion`
