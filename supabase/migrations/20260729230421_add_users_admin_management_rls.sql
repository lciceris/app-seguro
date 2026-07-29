-- Estende a RLS de users (auto-acesso, ver spec auth) com policies de
-- gerenciamento por brokerage_admin/platform_admin. Somam-se (OR) à policy
-- de auto-acesso já existente, não a substituem. Sem DELETE de propósito —
-- desativação é UPDATE de status, nunca delete (ver Requirement 3 da spec users).

create policy users_select_managed
  on users
  for select
  to authenticated
  using (
    get_my_role() in ('brokerage_admin', 'platform_admin')
    and brokerage_id = get_my_brokerage_id()
  );

create policy users_insert_managed
  on users
  for insert
  to authenticated
  with check (
    get_my_role() in ('brokerage_admin', 'platform_admin')
    and brokerage_id = get_my_brokerage_id()
  );

create policy users_update_managed
  on users
  for update
  to authenticated
  using (
    get_my_role() in ('brokerage_admin', 'platform_admin')
    and brokerage_id = get_my_brokerage_id()
  )
  with check (
    get_my_role() in ('brokerage_admin', 'platform_admin')
    and brokerage_id = get_my_brokerage_id()
  );
