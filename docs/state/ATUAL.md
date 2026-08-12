# Em execução

| Campo | Valor |
| --- | --- |
| Etapa | Implementação |
| Spec | `specs/2026-08-12-fatia-1-auth-care-recipient-cartela-lembrete.md` (ajuste Casa sem coords) + PRD §5.3 |
| Autonomia | `tight` (accounts/RLS via subagente; location schema) |
| Status | WIP — BG-01 RLS accounts resolvido; Casa pendente no onboarding |

## Checklist

- [x] Fix RLS onboarding (`003_bootstrap_family_account` + RPC)
- [x] PRD: Casa sem coords no onboarding; confirmação no PWA (F2-05)
- [x] Migration `004_safe_places_coords_optional`
- [x] UI/onboarding sem lat/lng
- [ ] `db:push` da 004
- [ ] `pnpm typecheck|lint|test`
- [ ] Homologação FL-02 onboarding

## Próximo

Aplicar migration 004 → retestar onboarding em produção/local → Spec fatia 2 (PWA + confirmar Casa).
