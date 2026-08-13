-- F4.7: pedidos de ajuda (SOS) — alertas, ordem de escalonamento, tentativas de notificação.

do $$ begin
  create type public.sos_alert_status as enum (
    'open',
    'resolved',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.sos_notification_channel as enum (
    'whatsapp',
    'call',
    'email'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.sos_notification_status as enum (
    'pending',
    'sent',
    'delivered',
    'read',
    'answered',
    'failed'
  );
exception when duplicate_object then null;
end $$;

create or replace function public.can_manage_sos_escalation(p_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.account_role_for(p_account_id) = 'admin'::public.account_role;
$$;

create or replace function public.can_resolve_sos_alert(p_account_id uuid)
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

create table if not exists public.sos_alerts (
  id uuid primary key default gen_random_uuid(),
  care_recipient_id uuid not null references public.care_recipients (id) on delete cascade,
  status public.sos_alert_status not null default 'open',
  triggered_at timestamptz not null default now(),
  trigger_source text not null default 'elder_app',
  location_text text,
  location_accuracy_m integer,
  location_recorded_at timestamptz,
  safe_zone_name text,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id),
  resolution_note text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sos_alerts_recipient_triggered_idx
  on public.sos_alerts (care_recipient_id, triggered_at desc);

create index if not exists sos_alerts_recipient_status_idx
  on public.sos_alerts (care_recipient_id, status);

create table if not exists public.sos_escalation_config (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  care_recipient_id uuid not null references public.care_recipients (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (care_recipient_id)
);

create index if not exists sos_escalation_config_account_idx
  on public.sos_escalation_config (account_id);

create table if not exists public.sos_escalation_entries (
  id uuid primary key default gen_random_uuid(),
  config_id uuid not null references public.sos_escalation_config (id) on delete cascade,
  position integer not null check (position > 0),
  member_id uuid references public.account_members (id) on delete set null,
  profile_id uuid references public.profiles (id) on delete set null,
  role public.account_role not null,
  display_name text not null,
  relationship_label text,
  created_at timestamptz not null default now(),
  unique (config_id, position)
);

create index if not exists sos_escalation_entries_config_position_idx
  on public.sos_escalation_entries (config_id, position);

create table if not exists public.sos_notification_attempts (
  id uuid primary key default gen_random_uuid(),
  sos_alert_id uuid not null references public.sos_alerts (id) on delete cascade,
  profile_id uuid references public.profiles (id),
  display_name text not null,
  channel public.sos_notification_channel not null,
  status public.sos_notification_status not null default 'pending',
  attempted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists sos_notification_attempts_alert_idx
  on public.sos_notification_attempts (sos_alert_id, attempted_at);

-- Funções que dependem das tabelas SOS (criar após DDL)
create or replace function public.is_viewer_in_sos_escalation(p_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sos_escalation_entries e
    join public.sos_escalation_config c on c.id = e.config_id
    where c.account_id = p_account_id
      and e.profile_id = auth.uid()
  );
$$;

create or replace function public.can_view_sos_area(p_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case public.account_role_for(p_account_id)
    when 'admin'::public.account_role then true
    when 'caregiver'::public.account_role then true
    when 'emergency_contact'::public.account_role then true
    when 'viewer'::public.account_role then public.is_viewer_in_sos_escalation(p_account_id)
    else false
  end;
$$;

alter table public.sos_alerts enable row level security;
alter table public.sos_escalation_config enable row level security;
alter table public.sos_escalation_entries enable row level security;
alter table public.sos_notification_attempts enable row level security;

-- Alertas: leitura conforme matriz SOS
drop policy if exists sos_alerts_select on public.sos_alerts;
create policy sos_alerts_select on public.sos_alerts
  for select to authenticated
  using (
    public.can_view_sos_area(
      public.care_recipient_account_id(care_recipient_id)
    )
  );

-- Resolução: admin + cuidador
drop policy if exists sos_alerts_update_resolve on public.sos_alerts;
create policy sos_alerts_update_resolve on public.sos_alerts
  for update to authenticated
  using (
    public.can_resolve_sos_alert(
      public.care_recipient_account_id(care_recipient_id)
    )
  )
  with check (
    public.can_resolve_sos_alert(
      public.care_recipient_account_id(care_recipient_id)
    )
  );

-- Insert de alerta: somente service role (F5 / jobs) — sem policy para authenticated

-- Config de escalonamento
drop policy if exists sos_escalation_config_select on public.sos_escalation_config;
create policy sos_escalation_config_select on public.sos_escalation_config
  for select to authenticated
  using (public.can_view_sos_area(account_id));

drop policy if exists sos_escalation_config_insert on public.sos_escalation_config;
create policy sos_escalation_config_insert on public.sos_escalation_config
  for insert to authenticated
  with check (public.can_manage_sos_escalation(account_id));

drop policy if exists sos_escalation_config_update on public.sos_escalation_config;
create policy sos_escalation_config_update on public.sos_escalation_config
  for update to authenticated
  using (public.can_manage_sos_escalation(account_id))
  with check (public.can_manage_sos_escalation(account_id));

-- Entradas da ordem
drop policy if exists sos_escalation_entries_select on public.sos_escalation_entries;
create policy sos_escalation_entries_select on public.sos_escalation_entries
  for select to authenticated
  using (
    public.can_view_sos_area(
      (select c.account_id from public.sos_escalation_config c where c.id = config_id)
    )
  );

drop policy if exists sos_escalation_entries_insert on public.sos_escalation_entries;
create policy sos_escalation_entries_insert on public.sos_escalation_entries
  for insert to authenticated
  with check (
    public.can_manage_sos_escalation(
      (select c.account_id from public.sos_escalation_config c where c.id = config_id)
    )
  );

drop policy if exists sos_escalation_entries_update on public.sos_escalation_entries;
create policy sos_escalation_entries_update on public.sos_escalation_entries
  for update to authenticated
  using (
    public.can_manage_sos_escalation(
      (select c.account_id from public.sos_escalation_config c where c.id = config_id)
    )
  )
  with check (
    public.can_manage_sos_escalation(
      (select c.account_id from public.sos_escalation_config c where c.id = config_id)
    )
  );

drop policy if exists sos_escalation_entries_delete on public.sos_escalation_entries;
create policy sos_escalation_entries_delete on public.sos_escalation_entries
  for delete to authenticated
  using (
    public.can_manage_sos_escalation(
      (select c.account_id from public.sos_escalation_config c where c.id = config_id)
    )
  );

-- Tentativas de notificação (estrutura — envio real F5)
drop policy if exists sos_notification_attempts_select on public.sos_notification_attempts;
create policy sos_notification_attempts_select on public.sos_notification_attempts
  for select to authenticated
  using (
    public.can_view_sos_area(
      public.care_recipient_account_id(
        (select a.care_recipient_id from public.sos_alerts a where a.id = sos_alert_id)
      )
    )
  );
