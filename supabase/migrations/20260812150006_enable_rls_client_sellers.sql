-- RLS de client_sellers: leitura liberada pra quem já enxerga o cliente (mesmo
-- grupo amplo, mais o próprio seller vinculado via is_my_client). Gerenciar
-- (insert/update/delete) é ação exclusiva de platform_admin/brokerage_admin/
-- supervisor — seller nunca gerencia vínculo diretamente, nem o próprio; o
-- vínculo automático de criação passa por um trigger SECURITY DEFINER (próxima
-- migration), não por essa policy (ver .agents/specs/clients/design.md).

alter table client_sellers enable row level security;

create policy client_sellers_select
  on client_sellers
  for select
  to authenticated
  using (
    get_client_brokerage_id(client_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'viewer')
      or is_my_client(client_id)
    )
  );

create policy client_sellers_insert
  on client_sellers
  for insert
  to authenticated
  with check (
    get_client_brokerage_id(client_id) = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
  );

create policy client_sellers_update
  on client_sellers
  for update
  to authenticated
  using (
    get_client_brokerage_id(client_id) = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
  )
  with check (
    get_client_brokerage_id(client_id) = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
  );

create policy client_sellers_delete
  on client_sellers
  for delete
  to authenticated
  using (
    get_client_brokerage_id(client_id) = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
  );
