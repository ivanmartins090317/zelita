# Roteiro local — Pedir posição do aparelho

**Spec:** `specs/2026-11-11-pedido-de-localizacao.md`  
**Pré-requisito:** migration `014_location_requests.sql` aplicada no Supabase remoto (11/11/2026, `db push`). Local: mesmo schema antes de testar.

## 1. Preparar conta

- Sessão de **administradora**, conta ativa, plano com localização avançada
- Pessoa cuidada com consentimento vigente e celular vinculado ativo
- GPS já concedido no navegador do aparelho (`/idoso`)

## 2. Caminho feliz

1. Abra `/idoso` no celular vinculado (aba visível).
2. Em `/familia/localizacao`, toque **Pedir posição agora**.
3. Card: “Pedindo a posição neste celular.” → posição no mapa com horário e precisão.
4. Histórico: linha “Posição pedida pela família”.

## 3. Bordas rápidas

| Caso | O que ver |
| --- | --- |
| Aplicativo fechado | “O aplicativo não está aberto neste celular.” até 5 min ou até abrir o app |
| Sem GPS concedido | “O celular não conseguiu enviar a posição.” (sem novo prompt) |
| Segundo pedido &lt; 2 min | “Espere 2 minutos para pedir de novo.” |
| Cuidadora | Mapa/histórico normais; sem card de pedido |

## 4. O que não validar aqui

- Deploy Vercel e relatório HTML de QA (rodada única posterior)
