-- brokerage_insurer_order: ordem de exibição das seguradoras, por corretora
-- (spec insurer-catalog-and-ordering, addendum). Diferente de
-- insurers.display_order (global, editado só por platform_admin) — aqui cada
-- corretora tem a própria ordem, sem afetar as outras nem o catálogo global.
-- Ausência de linha = usa o fallback (display_order do catálogo, depois nome).

create table brokerage_insurer_order (
  brokerage_id uuid not null references brokerages (id) on delete cascade,
  insurer_id uuid not null references insurers (id) on delete cascade,
  display_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (brokerage_id, insurer_id)
);

create index brokerage_insurer_order_brokerage_id_idx
  on brokerage_insurer_order (brokerage_id);

create trigger set_brokerage_insurer_order_updated_at
  before update on brokerage_insurer_order
  for each row
  execute function set_updated_at();

-- RLS: mesmo padrão de brokerage_disabled_insurers — cada corretora só vê/
-- gerencia a própria ordem; gerenciar é ação de brokerage_admin.
alter table brokerage_insurer_order enable row level security;

create policy brokerage_insurer_order_select_own
  on brokerage_insurer_order
  for select
  to authenticated
  using (brokerage_id = get_my_brokerage_id());

create policy brokerage_insurer_order_insert_own
  on brokerage_insurer_order
  for insert
  to authenticated
  with check (
    brokerage_id = get_my_brokerage_id()
    and get_my_role() = 'brokerage_admin'
  );

create policy brokerage_insurer_order_update_own
  on brokerage_insurer_order
  for update
  to authenticated
  using (
    brokerage_id = get_my_brokerage_id()
    and get_my_role() = 'brokerage_admin'
  )
  with check (
    brokerage_id = get_my_brokerage_id()
    and get_my_role() = 'brokerage_admin'
  );
