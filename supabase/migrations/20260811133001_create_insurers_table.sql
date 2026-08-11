-- insurers: catálogo global de seguradoras (sem brokerage_id — ver
-- .agents/specs/insurers/design.md). Sem coluna de status: não existe
-- desativação global, só a preferência por corretora (brokerage_disabled_insurers).

create table insurers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text,
  email text,
  phone text,
  website text,
  contact_name text,
  response_time_days integer,
  display_order integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_insurers_updated_at
  before update on insurers
  for each row
  execute function set_updated_at();
