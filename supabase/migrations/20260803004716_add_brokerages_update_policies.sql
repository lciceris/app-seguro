-- Duas policies de UPDATE: brokerage_admin edita a própria corretora (identidade
-- visual); platform_admin edita qualquer corretora (dados administrativos). Qual
-- coluna cada um pode de fato tocar é reforçado pelo trigger da próxima migration,
-- não por aqui — GRANT column-level é por role do Postgres, não por policy/linha.

create policy brokerages_update_own
  on brokerages
  for update
  to authenticated
  using (id = get_my_brokerage_id())
  with check (id = get_my_brokerage_id());

create policy brokerages_update_platform_admin
  on brokerages
  for update
  to authenticated
  using (get_my_role() = 'platform_admin')
  with check (get_my_role() = 'platform_admin');

revoke update on public.brokerages from authenticated;
grant update (name, logo_url, primary_color, plan_id, status) on public.brokerages to authenticated;
