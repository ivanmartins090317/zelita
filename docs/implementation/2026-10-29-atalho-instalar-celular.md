# Atalho para instalar no celular

**Data:** 2026-10-29  
**Spec:** pedido direto na homologação do FL-05, sem spec nova  
**Autonomia:** tight (tela da família e apresentação do vínculo)

## Entregue

O Hoje passa a mostrar o cartão **Celular dele** para quem já pode ver aparelhos (administradora e cuidador). Sem celular ligado, a administradora vê o botão **Instalar no celular dele**, que abre `/familia/instalar`. Com celular ligado, o mesmo cartão mostra o rótulo e a data e o botão vira **Ver aparelho**. O cuidador vê o estado e não vê o botão.

Em Ajustes, a linha **Aparelhos com acesso** deixa de dizer “Gerenciar”. Sem aparelho, a administradora vê **Instalar no celular**. Com aparelho, ou para o cuidador, o rótulo é **Ver aparelho**.

O checklist do primeiro acesso e o da central ganham a quinta tarefa, **Colocar a Zelita no celular dele**, só para quem vê aparelhos. O progresso passa a dizer “X de Y”. Visualizador e contato de emergência continuam nas quatro tarefas de sempre e não veem o cartão.

No celular dele, **Sim, quero usar** e **Ir para o início** usam uma classe própria. O alvo comum é branco; juntar verde e texto branco por cima perdia na folha de estilo e o botão saía em branco. A classe nova fica verde-petróleo com o texto branco.

## Fora desta entrega

- Item novo no menu lateral
- Deploy no Vercel
- Homologação FL-05

## Comandos Done

Na raiz, em 2026-10-29:

| Comando | Resultado |
| --- | --- |
| `pnpm typecheck` | verde |
| `pnpm lint` | verde (0 erros; aviso antigo em `location-actions.ts`, fora desta entrega) |
| `pnpm test` | verde — 88 arquivos, 431 testes |

## Segurança (`docs/SECURITY.md`)

- Autorização: o cartão e a quinta tarefa usam a mesma leitura de `getInstallDevicePage`. Quem não vê aparelhos não recebe estado nem botão.
- O botão do Hoje só aparece para quem administra. Enviar link e desvincular continuam na página que já recusa o cuidador.
- RLS, cookie, token, Zod, webhooks, uploads, WhatsApp, SOS, Sentry, headers e dependências: N/A. Nenhuma tabela, policy ou segredo mudou.

## Escalabilidade

O estado do aparelho continua num único caso de uso. O Hoje e Ajustes só leem o resultado. A quinta tarefa entra por uma flag, então o progresso de quem não vê aparelhos permanece nas quatro tarefas sem um segundo cálculo.
