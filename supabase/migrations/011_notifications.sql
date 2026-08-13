-- F4.9: preferências de notificação por membro e tipo de aviso.

do $$ begin
  create type public.notification_alert_type as enum (
    'sos',
    'pack_refill',
    'zone_exit',
    'reminder_unread'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_channel as enum (
    'panel',
    'email',
    'whatsapp',
    'call'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  member_id uuid not null references public.account_members (id) on delete cascade,
  alert_type public.notification_alert_type not null,
  channels public.notification_channel[] not null default '{}',
  updated_at timestamptz not null default now(),
  unique (account_id, member_id, alert_type)
);

create index if not exists notification_preferences_account_idx
  on public.notification_preferences (account_id);

create index if not exists notification_preferences_member_idx
  on public.notification_preferences (member_id);

alter table public.notification_preferences enable row level security;

drop policy if exists notification_preferences_select_member on public.notification_preferences;
create policy notification_preferences_select_member on public.notification_preferences
  for select to authenticated
  using (public.is_account_member(account_id));

drop policy if exists notification_preferences_insert_admin on public.notification_preferences;
create policy notification_preferences_insert_admin on public.notification_preferences
  for insert to authenticated
  with check (public.account_role_for(account_id) = 'admin'::public.account_role);

drop policy if exists notification_preferences_update_admin on public.notification_preferences;
create policy notification_preferences_update_admin on public.notification_preferences
  for update to authenticated
  using (public.account_role_for(account_id) = 'admin'::public.account_role)
  with check (public.account_role_for(account_id) = 'admin'::public.account_role);

drop policy if exists notification_preferences_delete_admin on public.notification_preferences;
create policy notification_preferences_delete_admin on public.notification_preferences
  for delete to authenticated
  using (public.account_role_for(account_id) = 'admin'::public.account_role);

-- Log de entrega opcional (schema only — jobs Inngest preenchem depois).
create table if not exists public.notification_delivery_log (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  member_id uuid references public.account_members (id) on delete set null,
  alert_type public.notification_alert_type not null,
  channel public.notification_channel not null,
  source_type text not null,
  source_id uuid,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists notification_delivery_log_account_idx
  on public.notification_delivery_log (account_id, created_at desc);

alter table public.notification_delivery_log enable row level security;

drop policy if exists notification_delivery_log_select_member on public.notification_delivery_log;
create policy notification_delivery_log_select_member on public.notification_delivery_log
  for select to authenticated
  using (public.is_account_member(account_id));

drop policy if exists notification_delivery_log_insert_service on public.notification_delivery_log;
create policy notification_delivery_log_insert_service on public.notification_delivery_log
  for insert to authenticated
  with check (false);
