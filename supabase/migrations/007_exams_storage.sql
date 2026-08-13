-- F4.6: exames e receitas — metadados, compartilhamento por membro, links temporários, Storage.

do $$ begin
  create type public.exam_category as enum (
    'blood',
    'image',
    'cardiology',
    'prescriptions',
    'other'
  );
exception when duplicate_object then null;
end $$;

create or replace function public.can_manage_exams(p_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.account_role_for(p_account_id) = 'admin'::public.account_role;
$$;

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  care_recipient_id uuid not null references public.care_recipients (id) on delete cascade,
  title text not null,
  exam_date date not null,
  provider_name text,
  category public.exam_category,
  notes text,
  storage_path text not null,
  original_file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exams_care_recipient_exam_date_idx
  on public.exams (care_recipient_id, exam_date desc, created_at desc);

create table if not exists public.exam_member_access (
  exam_id uuid not null references public.exams (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (exam_id, profile_id)
);

create index if not exists exam_member_access_profile_idx
  on public.exam_member_access (profile_id);

create table if not exists public.exam_share_links (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists exam_share_links_token_idx
  on public.exam_share_links (token);

create or replace function public.total_exam_count_for_recipient(p_care_recipient_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.exams e
  where e.care_recipient_id = p_care_recipient_id
    and public.can_view_care_routine(
      public.care_recipient_account_id(p_care_recipient_id)
    );
$$;

alter table public.exams enable row level security;
alter table public.exam_member_access enable row level security;
alter table public.exam_share_links enable row level security;

-- Exams: admin vê todos; demais só com registro em exam_member_access
drop policy if exists exams_select on public.exams;
create policy exams_select on public.exams
  for select to authenticated
  using (
    public.can_manage_exams(
      public.care_recipient_account_id(care_recipient_id)
    )
    or exists (
      select 1
      from public.exam_member_access ema
      where ema.exam_id = exams.id
        and ema.profile_id = auth.uid()
    )
  );

drop policy if exists exams_insert on public.exams;
create policy exams_insert on public.exams
  for insert to authenticated
  with check (
    public.can_manage_exams(
      public.care_recipient_account_id(care_recipient_id)
    )
  );

drop policy if exists exams_update on public.exams;
create policy exams_update on public.exams
  for update to authenticated
  using (
    public.can_manage_exams(
      public.care_recipient_account_id(care_recipient_id)
    )
  )
  with check (
    public.can_manage_exams(
      public.care_recipient_account_id(care_recipient_id)
    )
  );

drop policy if exists exams_delete on public.exams;
create policy exams_delete on public.exams
  for delete to authenticated
  using (
    public.can_manage_exams(
      public.care_recipient_account_id(care_recipient_id)
    )
  );

-- Acesso por membro: só admin gerencia
drop policy if exists exam_member_access_select on public.exam_member_access;
create policy exam_member_access_select on public.exam_member_access
  for select to authenticated
  using (
    exists (
      select 1
      from public.exams e
      where e.id = exam_member_access.exam_id
        and (
          public.can_manage_exams(
            public.care_recipient_account_id(e.care_recipient_id)
          )
          or exam_member_access.profile_id = auth.uid()
        )
    )
  );

drop policy if exists exam_member_access_insert on public.exam_member_access;
create policy exam_member_access_insert on public.exam_member_access
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.exams e
      where e.id = exam_member_access.exam_id
        and public.can_manage_exams(
          public.care_recipient_account_id(e.care_recipient_id)
        )
    )
  );

drop policy if exists exam_member_access_delete on public.exam_member_access;
create policy exam_member_access_delete on public.exam_member_access
  for delete to authenticated
  using (
    exists (
      select 1
      from public.exams e
      where e.id = exam_member_access.exam_id
        and public.can_manage_exams(
          public.care_recipient_account_id(e.care_recipient_id)
        )
    )
  );

-- Links temporários: admin cria; leitura pública via service role na rota pública
drop policy if exists exam_share_links_select on public.exam_share_links;
create policy exam_share_links_select on public.exam_share_links
  for select to authenticated
  using (
    exists (
      select 1
      from public.exams e
      where e.id = exam_share_links.exam_id
        and public.can_manage_exams(
          public.care_recipient_account_id(e.care_recipient_id)
        )
    )
  );

drop policy if exists exam_share_links_insert on public.exam_share_links;
create policy exam_share_links_insert on public.exam_share_links
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.exams e
      where e.id = exam_share_links.exam_id
        and public.can_manage_exams(
          public.care_recipient_account_id(e.care_recipient_id)
        )
    )
  );

-- Storage bucket privado para exames
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exams',
  'exams',
  false,
  26214400,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies: path = account_id/care_recipient_id/uuid
drop policy if exists exams_storage_select on storage.objects;
create policy exams_storage_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'exams'
    and (
      public.can_manage_exams((storage.foldername(name))[1]::uuid)
      or exists (
        select 1
        from public.exams e
        join public.exam_member_access ema on ema.exam_id = e.id
        where e.storage_path = name
          and ema.profile_id = auth.uid()
      )
    )
  );

drop policy if exists exams_storage_insert on storage.objects;
create policy exams_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'exams'
    and public.can_manage_exams((storage.foldername(name))[1]::uuid)
  );

drop policy if exists exams_storage_delete on storage.objects;
create policy exams_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'exams'
    and public.can_manage_exams((storage.foldername(name))[1]::uuid)
  );
