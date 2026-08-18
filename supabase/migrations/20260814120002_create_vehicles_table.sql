-- Tabela vehicles: veículos das frotas seguradas, um por cliente (ver
-- .agents/specs/vehicles/design.md). client_id é FK simples — sem N:N como
-- client_sellers.

create table vehicles (
  id uuid primary key default gen_random_uuid(),
  brokerage_id uuid not null references brokerages (id) on delete cascade,
  client_id uuid not null references clients (id) on delete cascade,
  plate text not null,
  chassis text,
  identification_code text,
  renavam text,
  brand text,
  model text,
  manufacture_year integer,
  model_year integer,
  vehicle_type vehicle_type,
  vehicle_usage vehicle_usage,
  fuel_type text,
  fipe_code text,
  fipe_value numeric,
  declared_value numeric,
  overnight_zip_code text,
  main_state text,
  has_tracker boolean not null default false,
  tracker_model text,
  accessories text,
  main_driver text,
  has_claim_history boolean not null default false,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vehicles_brokerage_id_idx on vehicles (brokerage_id);
create index vehicles_client_id_idx on vehicles (client_id);
create index vehicles_plate_idx on vehicles (plate);

create trigger set_vehicles_updated_at
  before update on vehicles
  for each row
  execute function set_updated_at();
