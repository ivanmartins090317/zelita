-- F4.5: consultas (appointments) e tarefas da família (family_tasks).

do $$ begin
  create type public.appointment_type as enum (
    'medical',
    'physio',
    'exam',
    'other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.appointment_status as enum (
    'scheduled',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.family_task_type as enum (
    'shopping',
    'call',
    'transport',
    'other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.family_task_status as enum (
    'open',
    'completed'
  );
exception when duplicate_object then null;
end $$;

create or replace function public.can_manage_agenda(p_account_id uuid)
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

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  care_recipient_id uuid not null references public.care_recipients (id) on delete cascade,
  title text not null,
  specialty text,
  appointment_type public.appointment_type not null default 'medical',
  starts_at timestamptz not null,
  location text,
  companion_profile_id uuid references public.profiles (id),
  preparation_note text,
  status public.appointment_status not null default 'scheduled',
  created_by uuid references public.profiles (id),
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_care_recipient_starts_at_idx
  on public.appointments (care_recipient_id, starts_at);

create index if not exists appointments_status_starts_at_idx
  on public.appointments (status, starts_at);

create table if not exists public.family_tasks (
  id uuid primary key default gen_random_uuid(),
  care_recipient_id uuid not null references public.care_recipients (id) on delete cascade,
  title text not null,
  task_type public.family_task_type not null default 'other',
  due_date date,
  assignee_profile_id uuid references public.profiles (id),
  appointment_id uuid references public.appointments (id),
  status public.family_task_status not null default 'open',
  completed_at timestamptz,
  completed_by uuid references public.profiles (id),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists family_tasks_care_recipient_status_due_idx
  on public.family_tasks (care_recipient_id, status, due_date);

alter table public.appointments enable row level security;
alter table public.family_tasks enable row level security;

-- Appointments: leitura para quem vê rotina
drop policy if exists appointments_select on public.appointments;
create policy appointments_select on public.appointments
  for select to authenticated
  using (
    public.can_view_care_routine(
      public.care_recipient_account_id(care_recipient_id)
    )
  );

drop policy if exists appointments_insert on public.appointments;
create policy appointments_insert on public.appointments
  for insert to authenticated
  with check (
    public.can_manage_agenda(
      public.care_recipient_account_id(care_recipient_id)
    )
  );

drop policy if exists appointments_update on public.appointments;
create policy appointments_update on public.appointments
  for update to authenticated
  using (
    public.can_manage_agenda(
      public.care_recipient_account_id(care_recipient_id)
    )
  )
  with check (
    public.can_manage_agenda(
      public.care_recipient_account_id(care_recipient_id)
    )
  );

-- Tarefas: leitura para quem vê rotina
drop policy if exists family_tasks_select on public.family_tasks;
create policy family_tasks_select on public.family_tasks
  for select to authenticated
  using (
    public.can_view_care_routine(
      public.care_recipient_account_id(care_recipient_id)
    )
  );

drop policy if exists family_tasks_insert on public.family_tasks;
create policy family_tasks_insert on public.family_tasks
  for insert to authenticated
  with check (
    public.can_manage_agenda(
      public.care_recipient_account_id(care_recipient_id)
    )
  );

drop policy if exists family_tasks_update on public.family_tasks;
create policy family_tasks_update on public.family_tasks
  for update to authenticated
  using (
    public.can_manage_agenda(
      public.care_recipient_account_id(care_recipient_id)
    )
    or (
      assignee_profile_id = auth.uid()
      and status = 'open'
    )
  )
  with check (
    public.can_manage_agenda(
      public.care_recipient_account_id(care_recipient_id)
    )
    or (
      assignee_profile_id = auth.uid()
    )
  );
