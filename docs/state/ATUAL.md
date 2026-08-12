# Em execução

| Campo | Valor |
| --- | --- |
| Etapa | — |
| Spec | Fatia 1 (ajuste Casa) + BG-01 |
| Autonomia | `tight` |
| Status | Idle — RLS accounts + Casa sem coords no onboarding feitos; aguarda deploy + homologação FL-02 |

## Feito nesta sessão

- [x] BG-01: RPC `bootstrap_family_account` (migration 003) — subagente
- [x] PRD §2.1 / §5.3 / F1-02 / F2-05 / F4-01–02: coords reais no PWA
- [x] Migration 004 aplicada (lat/lng nullable + `coords_confirmed_at`)
- [x] Onboarding sem campos lat/lng; Casa com endereço pendente
- [x] `pnpm typecheck|lint|test` verdes (25 testes)

## Próximo

Deploy Vercel → retestar onboarding → Spec fatia 2 (vínculo PWA + confirmar Casa F2-05).
