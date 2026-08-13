-- F4.4: convites com validade de 7 dias + contatos externos (emergência só telefone).

do $$ begin
  create type public.invite_status as enum (
    'pending',
    'accepted',
    'expired',
    'revoked'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.invite_contact_type as enum ('email', 'phone');
exception when duplicate_object then null;
end $$;

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  care_recipient_id uuid references public.care_recipients (id) on delete set null,
  display_name text not null,
  relationship_label text,
  contact_type public.invite_contact_type not null,
  contact_value text not null,
  role public.account_role not null,
  token text not null unique,
  expires_at timestamptz not null,
  status public.invite_status not null default 'pending',
  invited_by uuid references public.profiles (id) on delete set null,
  accepted_at timestamptz,
  accepted_by uuid references public.profiles (id) on delete set null,
  member_id uuid references public.account_members (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invites_account_id_idx on public.invites (account_id);
create index if not exists invites_token_idx on public.invites (token);
create index if not exists invites_status_idx on public.invites (account_id, status);

create unique index if not exists invites_account_contact_pending_unique
  on public.invites (account_id, contact_value)
  where status = 'pending';

-- Membros externos (contato de emergência só telefone — sem auth.users).
alter table public.account_members
  alter column profile_id drop not null;

alter table public.account_members
  add column if not exists display_name text;

alter table public.account_members
  add column if not exists contact_email text;

alter table public.account_members
  add column if not exists contact_phone text;

alter table public.account_members
  add column if not exists relationship_label text;

alter table public.account_members
  drop constraint if exists account_members_identity_check;

alter table public.account_members
  add constraint account_members_identity_check check (
    profile_id is not null
    or (
      contact_phone is not null
      and role = 'emergency_contact'::public.account_role
    )
  );

alter table public.account_members
  drop constraint if exists account_members_account_id_profile_id_key;

create unique index if not exists account_members_account_profile_unique
  on public.account_members (account_id, profile_id)
  where profile_id is not null;

create unique index if not exists account_members_account_email_unique
  on public.account_members (account_id, lower(contact_email))
  where contact_email is not null and status <> 'revoked';

create unique index if not exists account_members_account_phone_unique
  on public.account_members (account_id, contact_phone)
  where contact_phone is not null and status <> 'revoked';

alter table public.invites enable row level security;

drop policy if exists invites_select_member on public.invites;
create policy invites_select_member on public.invites
  for select to authenticated
  using (public.is_account_member(account_id));

drop policy if exists invites_insert_admin on public.invites;
create policy invites_insert_admin on public.invites
  for insert to authenticated
  with check (public.account_role_for(account_id) = 'admin'::public.account_role);

drop policy if exists invites_update_admin on public.invites;
create policy invites_update_admin on public.invites
  for update to authenticated
  using (public.account_role_for(account_id) = 'admin'::public.account_role)
  with check (public.account_role_for(account_id) = 'admin'::public.account_role);
