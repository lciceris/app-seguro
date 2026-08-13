-- RLS de clients: platform_admin/brokerage_admin/supervisor/viewer veem e
-- (exceto viewer) editam todos os clientes da própria corretora; seller só
-- os que estão vinculados a ele via client_sellers (is_my_client). Sem policy
-- de DELETE — cliente nunca é excluído, só inativado (segment = 'inactive'),
-- o que é um UPDATE comum (ver .agents/specs/clients/design.md).

alter table clients enable row level security;

create policy clients_select
  on clients
  for select
  to authenticated
  using (
    brokerage_id = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'viewer')
      or (get_my_role() = 'seller' and is_my_client(id))
    )
  );

create policy clients_insert
  on clients
  for insert
  to authenticated
  with check (
    brokerage_id = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'seller')
  );

create policy clients_update
  on clients
  for update
  to authenticated
  using (
    brokerage_id = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
      or (get_my_role() = 'seller' and is_my_client(id))
    )
  )
  with check (
    brokerage_id = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
      or (get_my_role() = 'seller' and is_my_client(id))
    )
  );
