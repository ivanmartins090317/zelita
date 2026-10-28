-- F6: policies do vínculo. As tabelas e a visão nascem em
-- supabase/migrations/013_elder_devices.sql, que também aplica estas policies.
-- Anon não tem policy. Membro não recebe grant da coluna de hash.

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
