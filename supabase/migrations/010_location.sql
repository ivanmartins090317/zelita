-- F4.8: Localização — pontos, eventos de zona, links temporários, extensões em safe_places.

alter table public.care_recipients
  add column if not exists geo_consent_revoked_at timestamptz;

alter table public.safe_places
  add column if not exists alert_on_exit boolean not null default false,
  add column if not exists icon text,
  add column if not exists updated_at timestamptz not null default now();

do $$ begin
  create type public.location_point_source as enum (
    'sos',
    'periodic',
    'home_confirm',
    'share'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.geofence_event_type as enum (
    'zone_enter',
    'zone_exit',
    'zone_return'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.location_points (
  id uuid primary key default gen_random_uuid(),
  care_recipient_id uuid not null references public.care_recipients (id) on delete cascade,
  lat double precision,
  lng double precision,
  location_text text,
  accuracy_m integer,
  recorded_at timestamptz not null default now(),
  source public.location_point_source not null default 'periodic',
  battery_pct integer check (battery_pct is null or (battery_pct >= 0 and battery_pct <= 100)),
  signal_quality text,
  permission_active boolean,
  created_at timestamptz not null default now()
);

create index if not exists location_points_recipient_recorded_idx
  on public.location_points (care_recipient_id, recorded_at desc);

create table if not exists public.geofence_events (
  id uuid primary key default gen_random_uuid(),
  care_recipient_id uuid not null references public.care_recipients (id) on delete cascade,
  safe_place_id uuid references public.safe_places (id) on delete set null,
  event_type public.geofence_event_type not null,
  place_name text not null,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists geofence_events_recipient_recorded_idx
  on public.geofence_events (care_recipient_id, recorded_at desc);

create table if not exists public.location_shares (
  id uuid primary key default gen_random_uuid(),
  care_recipient_id uuid not null references public.care_recipients (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists location_shares_token_idx
  on public.location_shares (token);

create index if not exists location_shares_account_idx
  on public.location_shares (account_id);

create or replace function public.can_view_location(p_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.account_role_for(p_account_id) in (
    'admin'::public.account_role,
    'caregiver'::public.account_role
  );
$$;

create or replace function public.can_manage_safe_zones(p_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.account_role_for(p_account_id) = 'admin'::public.account_role;
$$;

alter table public.location_points enable row level security;
alter table public.geofence_events enable row level security;
alter table public.location_shares enable row level security;

drop policy if exists location_points_select on public.location_points;
create policy location_points_select on public.location_points
  for select to authenticated
  using (
    public.can_view_location(
      public.care_recipient_account_id(care_recipient_id)
    )
  );

drop policy if exists location_points_insert_service on public.location_points;
create policy location_points_insert_service on public.location_points
  for insert to authenticated
  with check (false);

drop policy if exists geofence_events_select on public.geofence_events;
create policy geofence_events_select on public.geofence_events
  for select to authenticated
  using (
    public.can_view_location(
      public.care_recipient_account_id(care_recipient_id)
    )
  );

drop policy if exists geofence_events_insert_service on public.geofence_events;
create policy geofence_events_insert_service on public.geofence_events
  for insert to authenticated
  with check (false);

drop policy if exists location_shares_select on public.location_shares;
create policy location_shares_select on public.location_shares
  for select to authenticated
  using (
    public.can_view_location(account_id)
  );

drop policy if exists location_shares_insert_admin on public.location_shares;
create policy location_shares_insert_admin on public.location_shares
  for insert to authenticated
  with check (
    public.can_manage_safe_zones(account_id)
    and created_by = auth.uid()
  );

drop policy if exists location_shares_update_admin on public.location_shares;
create policy location_shares_update_admin on public.location_shares
  for update to authenticated
  using (public.can_manage_safe_zones(account_id))
  with check (public.can_manage_safe_zones(account_id));

drop policy if exists safe_places_delete_admin on public.safe_places;
create policy safe_places_delete_admin on public.safe_places
  for delete to authenticated
  using (
    public.can_manage_safe_zones(
      public.care_recipient_account_id(care_recipient_id)
    )
    and is_home = false
  );

drop policy if exists safe_places_select on public.safe_places;
create policy safe_places_select on public.safe_places
  for select to authenticated
  using (
    public.can_view_location(
      public.care_recipient_account_id(care_recipient_id)
    )
  );
