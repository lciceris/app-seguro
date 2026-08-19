-- RLS de quotation_insurers e quotation_insurer_events: leitura na mesma
-- visibilidade das outras tabelas filhas de quotations; escrita restrita a
-- platform_admin/brokerage_admin/supervisor/analyst — seller nunca convida
-- seguradora, edita retorno nem comenta (só visualiza — ver
-- .agents/specs/quotations/design.md).

alter table quotation_insurers enable row level security;
alter table quotation_insurer_events enable row level security;

-- quotation_insurers

create policy quotation_insurers_select
  on quotation_insurers
  for select
  to authenticated
  using (
    brokerage_id = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
      or (get_my_role() = 'seller' and is_my_quotation(quotation_id))
    )
  );

create policy quotation_insurers_insert
  on quotation_insurers
  for insert
  to authenticated
  with check (
    brokerage_id = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
  );

create policy quotation_insurers_update
  on quotation_insurers
  for update
  to authenticated
  using (
    brokerage_id = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
  )
  with check (
    brokerage_id = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
  );

-- quotation_insurer_events

create policy quotation_insurer_events_select
  on quotation_insurer_events
  for select
  to authenticated
  using (
    brokerage_id = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
      or (get_my_role() = 'seller' and is_my_quotation_insurer(quotation_insurer_id))
    )
  );

create policy quotation_insurer_events_insert
  on quotation_insurer_events
  for insert
  to authenticated
  with check (
    brokerage_id = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
  );
