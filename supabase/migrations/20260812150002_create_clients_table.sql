-- Tabela clients: cadastro de clientes das corretoras, PF ou PJ (ver .agents/specs/clients/design.md)

create table clients (
  id uuid primary key default gen_random_uuid(),
  brokerage_id uuid not null references brokerages (id) on delete cascade,
  client_type client_type not null default 'company',
  legal_name text not null,
  trade_name text,
  tax_id text,
  birth_date date,
  business_code text,
  industry text,
  state_registration text,
  zip_code text,
  street text,
  street_number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  contact_name text,
  contact_role text,
  contact_email text,
  contact_phone text,
  financial_name text,
  financial_email text,
  segment client_segment not null default 'lead',
  lead_source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_brokerage_id_idx on clients (brokerage_id);
create index clients_tax_id_idx on clients (tax_id);

create trigger set_clients_updated_at
  before update on clients
  for each row
  execute function set_updated_at();
