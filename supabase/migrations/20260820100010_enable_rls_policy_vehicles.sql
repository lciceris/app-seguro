-- RLS de policy_vehicles: leitura com a mesma visibilidade de policies (via
-- policy_id, reaproveitando get_policy_brokerage_id/is_my_policy_client, já
-- existentes na spec policies). Sem insert/update/delete pra usuário comum — toda
-- escrita acontece via trigger security definer. Ver
-- .agents/specs/policy-endorsements/design.md.

alter table policy_vehicles enable row level security;

create policy policy_vehicles_select
  on policy_vehicles
  for select
  to authenticated
  using (
    get_policy_brokerage_id(policy_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
      or (get_my_role() = 'seller' and is_my_policy_client(policy_id))
    )
  );
