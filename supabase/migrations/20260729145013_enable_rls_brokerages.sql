-- RLS de brokerages: só a própria corretora (ver conventions/rls.md)

alter table brokerages enable row level security;

create policy brokerages_select_own
  on brokerages
  for select
  to authenticated
  using (id = get_my_brokerage_id());
