-- Fatia 1: helpers de membership + RLS pela matriz de papéis.

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.is_account_member(p_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.account_members m
    where m.account_id = p_account_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.account_role_for(p_account_id uuid)
returns public.account_role
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.account_members m
  where m.account_id = p_account_id
    and m.profile_id = auth.uid()
    and m.status = 'active'
  limit 1;
$$;

create or replace function public.can_view_care_routine(p_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.account_role_for(p_account_id) in (
    'admin'::public.account_role,
    'caregiver'::public.account_role,
    'viewer'::public.account_role
  );
$$;

create or replace function public.can_manage_medications(p_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.account_role_for(p_account_id) = 'admin'::public.account_role;
$$;

create or replace function public.care_recipient_account_id(p_care_recipient_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select cr.account_id
  from public.care_recipients cr
  where cr.id = p_care_recipient_id;
$$;

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.account_members enable row level security;
alter table public.care_recipients enable row level security;
alter table public.safe_places enable row level security;
alter table public.medications enable row level security;
alter table public.medication_schedules enable row level security;
alter table public.medication_packs enable row level security;
alter table public.medication_events enable row level security;

-- Profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

-- Accounts
drop policy if exists accounts_select_member on public.accounts;
create policy accounts_select_member on public.accounts
  for select to authenticated
  using (public.is_account_member(id));

drop policy if exists accounts_update_admin on public.accounts;
create policy accounts_update_admin on public.accounts
  for update to authenticated
  using (public.account_role_for(id) = 'admin')
  with check (public.account_role_for(id) = 'admin');

drop policy if exists accounts_insert_authenticated on public.accounts;
create policy accounts_insert_authenticated on public.accounts
  for insert to authenticated
  with check (true);

-- Account members
drop policy if exists members_select_same_account on public.account_members;
create policy members_select_same_account on public.account_members
  for select to authenticated
  using (public.is_account_member(account_id));

drop policy if exists members_insert_admin_or_bootstrap on public.account_members;
create policy members_insert_admin_or_bootstrap on public.account_members
  for insert to authenticated
  with check (
    profile_id = auth.uid()
    or public.account_role_for(account_id) = 'admin'
  );

drop policy if exists members_update_admin on public.account_members;
create policy members_update_admin on public.account_members
  for update to authenticated
  using (public.account_role_for(account_id) = 'admin')
  with check (public.account_role_for(account_id) = 'admin');

-- Care recipients
drop policy if exists care_recipients_select on public.care_recipients;
create policy care_recipients_select on public.care_recipients
  for select to authenticated
  using (public.can_view_care_routine(account_id));

drop policy if exists care_recipients_insert_admin on public.care_recipients;
create policy care_recipients_insert_admin on public.care_recipients
  for insert to authenticated
  with check (public.can_manage_medications(account_id) or public.account_role_for(account_id) = 'admin');

drop policy if exists care_recipients_update_admin on public.care_recipients;
create policy care_recipients_update_admin on public.care_recipients
  for update to authenticated
  using (public.account_role_for(account_id) = 'admin')
  with check (public.account_role_for(account_id) = 'admin');

-- Safe places (Casa): ver rotina; definir zonas = admin
drop policy if exists safe_places_select on public.safe_places;
create policy safe_places_select on public.safe_places
  for select to authenticated
  using (
    public.can_view_care_routine(public.care_recipient_account_id(care_recipient_id))
  );

drop policy if exists safe_places_insert_admin on public.safe_places;
create policy safe_places_insert_admin on public.safe_places
  for insert to authenticated
  with check (
    public.account_role_for(public.care_recipient_account_id(care_recipient_id)) = 'admin'
  );

drop policy if exists safe_places_update_admin on public.safe_places;
create policy safe_places_update_admin on public.safe_places
  for update to authenticated
  using (
    public.account_role_for(public.care_recipient_account_id(care_recipient_id)) = 'admin'
  )
  with check (
    public.account_role_for(public.care_recipient_account_id(care_recipient_id)) = 'admin'
  );

-- Medications: ver rotina; CRUD admin
drop policy if exists medications_select on public.medications;
create policy medications_select on public.medications
  for select to authenticated
  using (
    public.can_view_care_routine(public.care_recipient_account_id(care_recipient_id))
  );

drop policy if exists medications_insert_admin on public.medications;
create policy medications_insert_admin on public.medications
  for insert to authenticated
  with check (
    public.can_manage_medications(public.care_recipient_account_id(care_recipient_id))
  );

drop policy if exists medications_update_admin on public.medications;
create policy medications_update_admin on public.medications
  for update to authenticated
  using (
    public.can_manage_medications(public.care_recipient_account_id(care_recipient_id))
  )
  with check (
    public.can_manage_medications(public.care_recipient_account_id(care_recipient_id))
  );

drop policy if exists medications_delete_admin on public.medications;
create policy medications_delete_admin on public.medications
  for delete to authenticated
  using (
    public.can_manage_medications(public.care_recipient_account_id(care_recipient_id))
  );

-- Schedules
drop policy if exists schedules_select on public.medication_schedules;
create policy schedules_select on public.medication_schedules
  for select to authenticated
  using (
    exists (
      select 1 from public.medications m
      where m.id = medication_id
        and public.can_view_care_routine(public.care_recipient_account_id(m.care_recipient_id))
    )
  );

drop policy if exists schedules_write_admin on public.medication_schedules;
create policy schedules_write_admin on public.medication_schedules
  for all to authenticated
  using (
    exists (
      select 1 from public.medications m
      where m.id = medication_id
        and public.can_manage_medications(public.care_recipient_account_id(m.care_recipient_id))
    )
  )
  with check (
    exists (
      select 1 from public.medications m
      where m.id = medication_id
        and public.can_manage_medications(public.care_recipient_account_id(m.care_recipient_id))
    )
  );

-- Packs
drop policy if exists packs_select on public.medication_packs;
create policy packs_select on public.medication_packs
  for select to authenticated
  using (
    exists (
      select 1 from public.medications m
      where m.id = medication_id
        and public.can_view_care_routine(public.care_recipient_account_id(m.care_recipient_id))
    )
  );

drop policy if exists packs_write_admin on public.medication_packs;
create policy packs_write_admin on public.medication_packs
  for all to authenticated
  using (
    exists (
      select 1 from public.medications m
      where m.id = medication_id
        and public.can_manage_medications(public.care_recipient_account_id(m.care_recipient_id))
    )
  )
  with check (
    exists (
      select 1 from public.medications m
      where m.id = medication_id
        and public.can_manage_medications(public.care_recipient_account_id(m.care_recipient_id))
    )
  );

-- Events: ver rotina; insert admin ou service (jobs usam service role)
drop policy if exists events_select on public.medication_events;
create policy events_select on public.medication_events
  for select to authenticated
  using (
    public.can_view_care_routine(public.care_recipient_account_id(care_recipient_id))
  );

drop policy if exists events_insert_member on public.medication_events;
create policy events_insert_member on public.medication_events
  for insert to authenticated
  with check (
    public.can_view_care_routine(public.care_recipient_account_id(care_recipient_id))
  );
