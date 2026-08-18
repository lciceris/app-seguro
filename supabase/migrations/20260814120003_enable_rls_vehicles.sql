-- RLS de vehicles: platform_admin/brokerage_admin/supervisor veem e editam
-- todos os veículos da própria corretora; seller só os de clientes vinculados
-- a ele (reaproveita is_my_client(client_id), já criada na spec clients —
-- ver .agents/specs/vehicles/design.md). analyst e viewer não aparecem em
-- nenhuma policy — ficam sem nenhum acesso, nem leitura (diferente de
-- clients, onde viewer tem leitura ampla). Sem policy de DELETE — veículo
-- nunca é excluído, só inativado (is_active = false via UPDATE comum).

alter table vehicles enable row level security;

create policy vehicles_select
  on vehicles
  for select
  to authenticated
  using (
    brokerage_id = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
      or (get_my_role() = 'seller' and is_my_client(client_id))
    )
  );

create policy vehicles_insert
  on vehicles
  for insert
  to authenticated
  with check (
    brokerage_id = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
      or (get_my_role() = 'seller' and is_my_client(client_id))
    )
  );

create policy vehicles_update
  on vehicles
  for update
  to authenticated
  using (
    brokerage_id = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
      or (get_my_role() = 'seller' and is_my_client(client_id))
    )
  )
  with check (
    brokerage_id = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
      or (get_my_role() = 'seller' and is_my_client(client_id))
    )
  );
