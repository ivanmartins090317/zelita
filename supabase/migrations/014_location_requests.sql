-- Pedido de posição do aparelho (localização avançada). Aplicar no remoto sob pedido explícito.

alter type public.location_point_source add value if not exists 'on_demand';

create table if not exists public.location_requests (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  care_recipient_id uuid not null references public.care_recipients (id) on delete cascade,
  requested_by uuid not null references public.profiles (id),
  status text not null check (status in ('open', 'fulfilled', 'closed')),
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null,
  completed_at timestamptz,
  close_reason text check (
    close_reason is null
    or close_reason in (
      'app_not_open',
      'gps_failed',
      'app_closed_or_offline',
      'consent_revoked',
      'account_paused'
    )
  ),
  had_fresh_presence boolean not null default false,
  read_attempted boolean not null default false,
  location_point_id uuid references public.location_points (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists location_requests_recipient_requested_idx
  on public.location_requests (care_recipient_id, requested_at desc);

create unique index if not exists location_requests_one_open_per_recipient
  on public.location_requests (care_recipient_id)
  where status = 'open';

alter table public.location_requests enable row level security;

drop policy if exists location_requests_select_admin on public.location_requests;
create policy location_requests_select_admin on public.location_requests
  for select to authenticated
  using (public.can_manage_safe_zones (account_id));

drop policy if exists location_requests_insert_admin on public.location_requests;
create policy location_requests_insert_admin on public.location_requests
  for insert to authenticated
  with check (
    public.can_manage_safe_zones (account_id)
    and requested_by = auth.uid()
  );

drop policy if exists location_requests_update_deny on public.location_requests;
create policy location_requests_update_deny on public.location_requests
  for update to authenticated
  using (false)
  with check (false);

drop policy if exists location_requests_delete_deny on public.location_requests;
create policy location_requests_delete_deny on public.location_requests
  for delete to authenticated
  using (false);
