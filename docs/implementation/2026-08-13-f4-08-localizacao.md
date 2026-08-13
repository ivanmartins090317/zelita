# F4.8 — Onde ele está (Localização)

**Data:** 2026-08-13  
**Spec:** `specs/2026-08-13-f4-08-localizacao.md`  
**Autonomia:** medium

## Entregue

- Área `/familia/localizacao` com faixa de consentimento, mapa estático, stats honestos, lugares de sempre (CRUD admin), compartilhamento temporário, histórico 7 dias e card de limitações.
- Migration `010_location.sql`: `location_points`, `geofence_events`, `location_shares`, extensões `safe_places` + `geo_consent_revoked_at` + RLS `can_view_location` / `can_manage_safe_zones`.
- Módulo `apps/web/modules/location/` (domain, application, infrastructure, presentation).
- Integração Hoje: stat geo, widget primeiro acesso (perde Pendente quando configurado).
- Integração SOS: zona no detalhe + deep link `Ver no mapa` com `?focus=alert`.
- Página pública `/l/{token}` despacha exame ou localização.
- Vitest em funções puras do domínio + smoke `content/family.ts`.

## Homologação pendente (manual-report FL-08 parcial)

- Seed ou F5 para posição real, bateria/sinal, consentimento vigente.
- CRUD lugares, link share, visualizadora negada, deep link desde Pedidos de ajuda.

## db push

```bash
pnpm db:push
```

Migration: `supabase/migrations/010_location.sql` — **aplicada no remoto** (2026-08-13).

## Segurança (`docs/SECURITY.md`)

| Item | Status |
| --- | --- |
| A01 authz geo (RLS + server) | OK — `can_view_location` / `can_manage_safe_zones` |
| A03 Zod lugares/share | OK |
| Consentimento revogável | OK — UI + banner |
| Link público escopo mínimo | OK — service role + página mínima |
| Logs sem lat/lng precisos | OK — eventos tipados sem coords |
| Jobs Inngest geo / PWA elder | N/A — F5 |
| Uploads / WA webhooks | N/A |

## N/A documentado

- Timeline Hoje com eventos de zona (cenário 37).
- Precisa de você — Casa pendente 48h (cenário 38).

## Reflexão

A feature isolou regras geo no módulo `location` com API estreita, permitindo que SOS e Hoje consumam helpers (`resolveLocationForSos`, `getHojeLocationSnapshot`) sem duplicar Haversine ou matriz de papéis. O mapa estático evita dependência npm e CSP de tiles, com escape para OSM externo. RLS separa leitura (admin/cuidadora) de mutação de lugares (admin) e bloqueia insert de pontos pelo painel família — preparando F5/device como única fonte de ping real.

Risco principal: homologação depende de seed ou F5 para fluxo com posição; policy de `safe_places_select` restringiu visualizadora conforme matriz PRD.
