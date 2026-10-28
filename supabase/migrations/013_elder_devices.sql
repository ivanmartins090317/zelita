-- F6: vínculo do aparelho. O token e o segredo do cookie ficam só como hash.
-- Anon não lê. A família lê a visão sem segredo. service_role confirma e lê a rotina.

create table if not exists public.care_recipient_device_links (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  care_recipient_id uuid not null references public.care_recipients (id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by uuid not null references public.profiles (id),
  channel text not null check (channel in ('whatsapp', 'in_person')),
  created_at timestamptz not null default now()
);

create unique index if not exists care_recipient_device_links_token_hash_idx
  on public.care_recipient_device_links (token_hash);

create index if not exists care_recipient_device_links_recipient_created_idx
  on public.care_recipient_device_links (care_recipient_id, created_at desc);

create table if not exists public.care_recipient_devices (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  care_recipient_id uuid not null references public.care_recipients (id) on delete cascade,
  secret_hash text not null,
  label text not null check (label in ('iphone', 'android', 'computer')),
  linked_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by uuid references public.profiles (id)
);

create unique index if not exists care_recipient_devices_secret_hash_idx
  on public.care_recipient_devices (secret_hash);

create unique index if not exists care_recipient_devices_one_active_idx
  on public.care_recipient_devices (care_recipient_id)
  where revoked_at is null;

create or replace view public.care_recipient_device_summaries
with (security_invoker = true) as
select
  id,
  account_id,
  care_recipient_id,
  label,
  linked_at,
  last_seen_at,
  revoked_at
from public.care_recipient_devices;

create or replace function public.guard_elder_device_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') in ('service_role', 'supabase_admin')
     or current_user in ('postgres', 'supabase_admin', 'service_role') then
    return new;
  end if;

  if new.secret_hash is distinct from old.secret_hash
     or new.account_id is distinct from old.account_id
     or new.care_recipient_id is distinct from old.care_recipient_id
     or new.label is distinct from old.label
     or new.linked_at is distinct from old.linked_at
     or new.last_seen_at is distinct from old.last_seen_at then
    raise exception 'só a revogação pode mudar o aparelho';
  end if;

  if old.revoked_at is not null and new.revoked_at is distinct from old.revoked_at then
    raise exception 'aparelho revogado não volta';
  end if;

  if new.revoked_at is not null and old.revoked_at is null and new.revoked_by is distinct from auth.uid() then
    raise exception 'a revogação precisa do autor da conta';
  end if;

  return new;
end;
$$;

drop trigger if exists care_recipient_devices_guard_update on public.care_recipient_devices;
create trigger care_recipient_devices_guard_update
  before update on public.care_recipient_devices
  for each row
  execute function public.guard_elder_device_update();

alter table public.care_recipient_device_links enable row level security;
alter table public.care_recipient_device_links force row level security;
alter table public.care_recipient_devices enable row level security;
alter table public.care_recipient_devices force row level security;

revoke all on table public.care_recipient_device_links from public, anon, authenticated;
revoke all on table public.care_recipient_devices from public, anon, authenticated;
revoke all on table public.care_recipient_device_summaries from public, anon, authenticated;

grant select (
  id,
  account_id,
  care_recipient_id,
  expires_at,
  used_at,
  created_by,
  channel,
  created_at
) on table public.care_recipient_device_links to authenticated;

grant insert (
  account_id,
  care_recipient_id,
  token_hash,
  expires_at,
  created_by,
  channel
) on table public.care_recipient_device_links to authenticated;

grant update (used_at) on table public.care_recipient_device_links to authenticated;

grant select (
  id,
  account_id,
  care_recipient_id,
  label,
  linked_at,
  last_seen_at,
  revoked_at
) on table public.care_recipient_devices to authenticated;

grant update (revoked_at, revoked_by) on table public.care_recipient_devices to authenticated;

grant select on table public.care_recipient_device_summaries to authenticated;

drop policy if exists device_links_select_admin on public.care_recipient_device_links;
create policy device_links_select_admin
  on public.care_recipient_device_links
  for select
  to authenticated
  using (public.account_role_for(account_id) = 'admin'::public.account_role);

drop policy if exists device_links_insert_admin on public.care_recipient_device_links;
create policy device_links_insert_admin
  on public.care_recipient_device_links
  for insert
  to authenticated
  with check (
    public.account_role_for(account_id) = 'admin'::public.account_role
    and created_by = auth.uid()
  );

drop policy if exists device_links_update_admin on public.care_recipient_device_links;
create policy device_links_update_admin
  on public.care_recipient_device_links
  for update
  to authenticated
  using (public.account_role_for(account_id) = 'admin'::public.account_role)
  with check (public.account_role_for(account_id) = 'admin'::public.account_role);

drop policy if exists devices_select_care_roles on public.care_recipient_devices;
create policy devices_select_care_roles
  on public.care_recipient_devices
  for select
  to authenticated
  using (
    public.account_role_for(account_id) in (
      'admin'::public.account_role,
      'caregiver'::public.account_role
    )
  );

drop policy if exists devices_update_admin on public.care_recipient_devices;
create policy devices_update_admin
  on public.care_recipient_devices
  for update
  to authenticated
  using (public.account_role_for(account_id) = 'admin'::public.account_role)
  with check (public.account_role_for(account_id) = 'admin'::public.account_role);
