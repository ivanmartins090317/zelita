-- Corrige recursão infinita entre policies de exams e exam_member_access (42P17).

create or replace function public.exam_account_id(p_exam_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select public.care_recipient_account_id(e.care_recipient_id)
  from public.exams e
  where e.id = p_exam_id;
$$;

drop policy if exists exam_member_access_select on public.exam_member_access;
create policy exam_member_access_select on public.exam_member_access
  for select to authenticated
  using (
    exam_member_access.profile_id = auth.uid()
    or public.can_manage_exams(public.exam_account_id(exam_member_access.exam_id))
  );

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
