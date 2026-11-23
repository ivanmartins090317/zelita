# Em execução

| Campo | Valor |
| --- | --- |
| Etapa | Código entregue — falta colar o template no Supabase e homologar no celular |
| Spec | [`specs/2026-11-15-codigo-no-celular.md`](../../specs/2026-11-15-codigo-no-celular.md) |
| Autonomia | `tight` (auth) |
| Entrega | [`docs/implementation/2026-11-15-codigo-no-celular.md`](../implementation/2026-11-15-codigo-no-celular.md) |

## Pendências desta fatia

- Colar o template novo no Supabase Dashboard (sem isso o botão antigo continua abrindo a home)
- Homologar no celular de verdade: Gmail/Mail, colar e botão

## Em espera

Pedido de posição: código Done; homologação no Vercel ainda aberta. Gate 2.2 (SOS) segue na rodada única.

## Ajuste paralelo — dois PWAs

Manifesto único removido. `/familia` instala a Zelita família; `/idoso` instala o app da pessoa cuidada. O relato para quem administra está em Ajustes, no cartão de privacidade (“Atalho deste painel”). Entrega: [`docs/implementation/2026-11-16-pwa-dois-manifestos.md`](../implementation/2026-11-16-pwa-dois-manifestos.md).

## Ajuste paralelo — clareza de UI (cadastro, OTP, entrada, instalar)

Quatro ajustes de homologação no celular: endereço em campos separados no cadastro, OTP com 6 casas numa linha, tela de entrada separando entrar de criar conta (30 dias grátis), e a tela de instalar com status compacto e escolha única de envio. Toca `accounts` e `elder-access` (paths críticos): **aguardando review do Ivan**. Entrega: [`docs/implementation/2026-11-23-clareza-ui-cadastro-login-instalar.md`](../implementation/2026-11-23-clareza-ui-cadastro-login-instalar.md).
