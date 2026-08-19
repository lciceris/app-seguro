-- RLS de quotations: platform_admin/brokerage_admin/supervisor/analyst veem
-- e (exceto analyst quando não é dono, ver trigger de transição) editam
-- todas as cotações da própria corretora; viewer só lê; seller só vê/edita
-- as próprias (seller_id = auth.uid(), comparação direta na própria linha —
-- não é subquery cross-table, então é seguro inline aqui, diferente do que
-- fazemos pra tabelas filhas). Sem policy de DELETE — cotação nunca é
-- excluída (ver .agents/specs/quotations/design.md).

alter table quotations enable row level security;

create policy quotations_select
  on quotations
  for select
  to authenticated
  using (
    brokerage_id = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
      or (get_my_role() = 'seller' and seller_id = auth.uid())
    )
  );

create policy quotations_insert
  on quotations
  for insert
  to authenticated
  with check (
    brokerage_id = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'seller')
  );

create policy quotations_update
  on quotations
  for update
  to authenticated
  using (
    brokerage_id = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
      or (get_my_role() = 'seller' and seller_id = auth.uid())
    )
  )
  with check (
    brokerage_id = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
      or (get_my_role() = 'seller' and seller_id = auth.uid())
    )
  );
