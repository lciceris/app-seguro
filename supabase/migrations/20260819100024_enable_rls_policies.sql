-- RLS de policies: leitura ampla dentro da corretora (platform_admin,
-- brokerage_admin, supervisor, analyst, viewer), seller só dos clientes
-- vinculados a ele (reaproveita is_my_client, já existente na spec clients).
-- Update só pra quem efetiva cotações (supervisor/brokerage_admin/
-- platform_admin) — seller/analyst/viewer têm acesso só de leitura. Sem
-- policy de insert (só o trigger security definer cria, ignora RLS) nem de
-- delete (apólice nunca é excluída).

alter table policies enable row level security;

create policy policies_select
  on policies
  for select
  to authenticated
  using (
    brokerage_id = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
      or (get_my_role() = 'seller' and is_my_client(client_id))
    )
  );

create policy policies_update
  on policies
  for update
  to authenticated
  using (
    brokerage_id = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
  )
  with check (
    brokerage_id = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
  );
