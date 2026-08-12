-- Mirror documental da migration 004 (coords opcionais em safe_places).
-- A fonte aplicada no remoto é supabase/migrations/004_safe_places_coords_optional.sql.

alter table public.safe_places
  alter column lat drop not null;

alter table public.safe_places
  alter column lng drop not null;

alter table public.safe_places
  add column if not exists coords_confirmed_at timestamptz;
