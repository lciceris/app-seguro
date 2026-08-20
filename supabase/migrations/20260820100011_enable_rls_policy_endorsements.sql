-- RLS de policy_endorsements: leitura com a mesma visibilidade de policies. Insert
-- só por quem pode abrir endosso (seller dono do cliente, ou gestão). Update pro
-- grupo amplo que participa de alguma transição — o trigger de transição
-- (enforce_policy_endorsement_status_transition) valida qual transição cada role
-- pode fazer de verdade. Sem delete — endosso é histórico permanente. Ver
-- .agents/specs/policy-endorsements/design.md.

alter table policy_endorsements enable row level security;

create policy policy_endorsements_select
  on policy_endorsements
  for select
  to authenticated
  using (
    get_policy_brokerage_id(policy_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
      or (get_my_role() = 'seller' and is_my_policy_client(policy_id))
    )
  );

create policy policy_endorsements_insert
  on policy_endorsements
  for insert
  to authenticated
  with check (
    get_policy_brokerage_id(policy_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('supervisor', 'brokerage_admin', 'platform_admin')
      or (get_my_role() = 'seller' and is_my_policy_client(policy_id))
    )
  );

create policy policy_endorsements_update
  on policy_endorsements
  for update
  to authenticated
  using (
    get_policy_brokerage_id(policy_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('analyst', 'supervisor', 'brokerage_admin', 'platform_admin')
      or (get_my_role() = 'seller' and is_my_policy_client(policy_id))
    )
  )
  with check (
    get_policy_brokerage_id(policy_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('analyst', 'supervisor', 'brokerage_admin', 'platform_admin')
      or (get_my_role() = 'seller' and is_my_policy_client(policy_id))
    )
  );
