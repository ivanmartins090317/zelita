-- Fatia 1: núcleo accounts, care recipients, location (Casa), medications, events.
-- RLS pela matriz de papéis. Pessoa cuidada NÃO é auth.users.

create extension if not exists "pgcrypto";

-- Papéis da conta
do $$ begin
  create type public.account_role as enum (
    'admin',
    'caregiver',
    'viewer',
    'emergency_contact'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.account_status as enum (
    'active',
    'paused',
    'canceled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.member_status as enum (
    'active',
    'invited',
    'revoked'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pack_status as enum (
    'active',
    'finished',
    'paused'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.medication_event_type as enum (
    'reminder_sent',
    'reminder_skipped',
    'voice_fallback',
    'pack_refill_warning',
    'pack_last_day',
    'manual_confirmation',
    'paused',
    'wa_opt_in_requested',
    'wa_opt_in_accepted'
  );
exception when duplicate_object then null;
end $$;

-- Profiles (1:1 com auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone_whatsapp text,
  locale text not null default 'pt-BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  plan text not null default 'essential',
  status public.account_status not null default 'active',
  trial_ends_at timestamptz,
  billing_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_members (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.account_role not null,
  status public.member_status not null default 'active',
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (account_id, profile_id)
);

create table if not exists public.care_recipients (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  full_name text not null,
  display_name text not null,
  birth_date date,
  relationship text,
  whatsapp text,
  address_text text,
  tone text not null default 'carinhoso',
  channel_preference text not null default 'whatsapp',
  dnd_start time,
  dnd_end time,
  wa_opt_in_at timestamptz,
  geo_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.safe_places (
  id uuid primary key default gen_random_uuid(),
  care_recipient_id uuid not null references public.care_recipients (id) on delete cascade,
  name text not null,
  address_text text,
  lat double precision not null,
  lng double precision not null,
  radius_m integer not null default 150,
  is_home boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  care_recipient_id uuid not null references public.care_recipients (id) on delete cascade,
  name text not null,
  dosage_label text not null,
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medication_schedules (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications (id) on delete cascade,
  times time[] not null,
  dose_units numeric not null check (dose_units > 0),
  doses_per_day integer not null check (doses_per_day > 0),
  instructions text,
  created_at timestamptz not null default now()
);

create table if not exists public.medication_packs (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications (id) on delete cascade,
  quantity_total numeric not null check (quantity_total > 0),
  quantity_remaining numeric not null check (quantity_remaining >= 0),
  start_date date not null,
  end_date_estimated date not null,
  refill_alert_days integer not null default 5,
  status public.pack_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medication_events (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid references public.medication_packs (id) on delete set null,
  care_recipient_id uuid not null references public.care_recipients (id) on delete cascade,
  type public.medication_event_type not null,
  channel text,
  payload jsonb not null default '{}'::jsonb,
  actor_profile_id uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists idx_account_members_profile on public.account_members (profile_id);
create index if not exists idx_care_recipients_account on public.care_recipients (account_id);
create index if not exists idx_medications_recipient on public.medications (care_recipient_id);
create index if not exists idx_packs_medication on public.medication_packs (medication_id);
create index if not exists idx_events_recipient on public.medication_events (care_recipient_id);

-- Profile automático no signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
