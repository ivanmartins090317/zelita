-- Espelho da migration 003: bootstrap atômico + remoção do INSERT amplo em accounts.
-- Ver supabase/migrations/003_bootstrap_family_account.sql

create or replace function public.bootstrap_family_account(
  p_plan text default 'essential',
  p_trial_ends_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_account_id uuid;
  v_existing uuid;
begin
  if v_uid is null then
    raise exception 'bootstrap_family_account: usuário não autenticado'
      using errcode = '42501';
  end if;

  select m.account_id
  into v_existing
  from public.account_members m
  where m.profile_id = v_uid
    and m.status = 'active'
  limit 1;

  if v_existing is not null then
    return v_existing;
  end if;

  insert into public.profiles (id)
  values (v_uid)
  on conflict (id) do nothing;

  insert into public.accounts (plan, status, trial_ends_at)
  values (
    coalesce(nullif(trim(p_plan), ''), 'essential'),
    'active',
    p_trial_ends_at
  )
  returning id into v_account_id;

  insert into public.account_members (
    account_id,
    profile_id,
    role,
    status,
    accepted_at
  )
  values (
    v_account_id,
    v_uid,
    'admin'::public.account_role,
    'active'::public.member_status,
    now()
  );

  return v_account_id;
end;
$$;

revoke all on function public.bootstrap_family_account(text, timestamptz) from public;
grant execute on function public.bootstrap_family_account(text, timestamptz) to authenticated;
grant execute on function public.bootstrap_family_account(text, timestamptz) to service_role;

drop policy if exists accounts_insert_authenticated on public.accounts;
