-- RLS de brokerage_disabled_insurers: cada corretora só vê/gerencia a própria
-- preferência. Gerenciar (insert/delete) é ação de brokerage_admin, não de
-- qualquer perfil da corretora (ver .agents/specs/insurers/design.md).

alter table brokerage_disabled_insurers enable row level security;

create policy brokerage_disabled_insurers_select_own
  on brokerage_disabled_insurers
  for select
  to authenticated
  using (brokerage_id = get_my_brokerage_id());

create policy brokerage_disabled_insurers_insert_own
  on brokerage_disabled_insurers
  for insert
  to authenticated
  with check (
    brokerage_id = get_my_brokerage_id()
    and get_my_role() = 'brokerage_admin'
  );

create policy brokerage_disabled_insurers_delete_own
  on brokerage_disabled_insurers
  for delete
  to authenticated
  using (
    brokerage_id = get_my_brokerage_id()
    and get_my_role() = 'brokerage_admin'
  );
