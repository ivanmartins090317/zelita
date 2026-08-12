-- Casa no onboarding: endereço sem lat/lng obrigatórios.
-- Coordenadas reais vêm do PWA do idoso (consentimento + confirmação).

alter table public.safe_places
  alter column lat drop not null;

alter table public.safe_places
  alter column lng drop not null;

alter table public.safe_places
  add column if not exists coords_confirmed_at timestamptz;

comment on column public.safe_places.lat is
  'Nullable até confirmação no device do idoso (ou geocode futuro).';
comment on column public.safe_places.lng is
  'Nullable até confirmação no device do idoso (ou geocode futuro).';
comment on column public.safe_places.coords_confirmed_at is
  'Preenchido quando lat/lng foram confirmados no PWA (ou fonte confiável).';
