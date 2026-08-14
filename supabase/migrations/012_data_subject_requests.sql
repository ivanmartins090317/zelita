-- F4.10: solicitações LGPD (exportação/exclusão de dados).

do $$ begin
  create type public.data_subject_request_type as enum ('export', 'delete');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.data_subject_request_status as enum (
    'pending',
    'in_progress',
    'completed',
    'rejected'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.data_subject_requests (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  requester_profile_id uuid not null references public.profiles (id) on delete cascade,
  request_type public.data_subject_request_type not null,
  status public.data_subject_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists data_subject_requests_account_idx
  on public.data_subject_requests (account_id, created_at desc);

alter table public.data_subject_requests enable row level security;

drop policy if exists data_subject_requests_select_admin on public.data_subject_requests;
create policy data_subject_requests_select_admin on public.data_subject_requests
  for select to authenticated
  using (public.account_role_for(account_id) = 'admin'::public.account_role);

drop policy if exists data_subject_requests_insert_admin on public.data_subject_requests;
create policy data_subject_requests_insert_admin on public.data_subject_requests
  for insert to authenticated
  with check (
    public.account_role_for(account_id) = 'admin'::public.account_role
    and requester_profile_id = auth.uid()
  );
