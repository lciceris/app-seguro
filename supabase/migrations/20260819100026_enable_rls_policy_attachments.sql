-- RLS de policy_attachments: mesma visibilidade de leitura da apólice pai;
-- insert/delete restrito a quem edita apólice (supervisor/brokerage_admin/
-- platform_admin). Sem policy de update — anexo é substituído (delete +
-- upload novo), nunca editado no lugar.

alter table policy_attachments enable row level security;

create policy policy_attachments_select
  on policy_attachments
  for select
  to authenticated
  using (
    get_policy_brokerage_id(policy_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
      or (get_my_role() = 'seller' and is_my_policy_client(policy_id))
    )
  );

create policy policy_attachments_insert
  on policy_attachments
  for insert
  to authenticated
  with check (
    get_policy_brokerage_id(policy_id) = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
  );

create policy policy_attachments_delete
  on policy_attachments
  for delete
  to authenticated
  using (
    get_policy_brokerage_id(policy_id) = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
  );
