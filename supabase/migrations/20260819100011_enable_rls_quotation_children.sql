-- RLS de quotation_vehicles, quotation_qar e quotation_qar_attachments:
-- mesma condição de visibilidade da cotação pai, via get_quotation_brokerage_id
-- / is_my_quotation (ver .agents/specs/quotations/design.md). viewer só tem
-- SELECT — sem INSERT/UPDATE/DELETE em nenhuma dessas três.

alter table quotation_vehicles enable row level security;
alter table quotation_qar enable row level security;
alter table quotation_qar_attachments enable row level security;

-- quotation_vehicles

create policy quotation_vehicles_select
  on quotation_vehicles
  for select
  to authenticated
  using (
    get_quotation_brokerage_id(quotation_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
      or (get_my_role() = 'seller' and is_my_quotation(quotation_id))
    )
  );

create policy quotation_vehicles_insert
  on quotation_vehicles
  for insert
  to authenticated
  with check (
    get_quotation_brokerage_id(quotation_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
      or (get_my_role() = 'seller' and is_my_quotation(quotation_id))
    )
  );

create policy quotation_vehicles_update
  on quotation_vehicles
  for update
  to authenticated
  using (
    get_quotation_brokerage_id(quotation_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
      or (get_my_role() = 'seller' and is_my_quotation(quotation_id))
    )
  )
  with check (
    get_quotation_brokerage_id(quotation_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
      or (get_my_role() = 'seller' and is_my_quotation(quotation_id))
    )
  );

create policy quotation_vehicles_delete
  on quotation_vehicles
  for delete
  to authenticated
  using (
    get_quotation_brokerage_id(quotation_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
      or (get_my_role() = 'seller' and is_my_quotation(quotation_id))
    )
  );

-- quotation_qar

create policy quotation_qar_select
  on quotation_qar
  for select
  to authenticated
  using (
    get_quotation_brokerage_id(quotation_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
      or (get_my_role() = 'seller' and is_my_quotation(quotation_id))
    )
  );

create policy quotation_qar_insert
  on quotation_qar
  for insert
  to authenticated
  with check (
    get_quotation_brokerage_id(quotation_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
      or (get_my_role() = 'seller' and is_my_quotation(quotation_id))
    )
  );

create policy quotation_qar_update
  on quotation_qar
  for update
  to authenticated
  using (
    get_quotation_brokerage_id(quotation_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
      or (get_my_role() = 'seller' and is_my_quotation(quotation_id))
    )
  )
  with check (
    get_quotation_brokerage_id(quotation_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
      or (get_my_role() = 'seller' and is_my_quotation(quotation_id))
    )
  );

-- quotation_qar_attachments

create policy quotation_qar_attachments_select
  on quotation_qar_attachments
  for select
  to authenticated
  using (
    get_quotation_brokerage_id(quotation_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
      or (get_my_role() = 'seller' and is_my_quotation(quotation_id))
    )
  );

create policy quotation_qar_attachments_insert
  on quotation_qar_attachments
  for insert
  to authenticated
  with check (
    get_quotation_brokerage_id(quotation_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
      or (get_my_role() = 'seller' and is_my_quotation(quotation_id))
    )
  );

create policy quotation_qar_attachments_delete
  on quotation_qar_attachments
  for delete
  to authenticated
  using (
    get_quotation_brokerage_id(quotation_id) = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
      or (get_my_role() = 'seller' and is_my_quotation(quotation_id))
    )
  );
