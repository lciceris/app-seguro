-- Tabela quotations: cotação de seguro de frota — entidade central (ver
-- .agents/specs/quotations/design.md). Sem winning_insurer_id (ver
-- quotation_insurers.is_winner) — evita a FK circular que existia no modelo
-- antigo do fleet-auth-gate.

create table quotations (
  id uuid primary key default gen_random_uuid(),
  brokerage_id uuid not null references brokerages (id) on delete cascade,
  client_id uuid not null references clients (id) on delete restrict,
  seller_id uuid references users (id) on delete set null,
  analyst_id uuid references users (id) on delete set null,
  number text not null,
  status quotation_status not null default 'waiting',
  quotation_type quotation_type,
  coverage_start date,
  coverage_end date,
  coverages text[],
  deductible_pref text,
  due_date date,
  seller_notes text,
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quotations_brokerage_id_idx on quotations (brokerage_id);
create index quotations_client_id_idx on quotations (client_id);
create index quotations_seller_id_idx on quotations (seller_id);

create trigger trg_generate_quotation_number
  before insert on quotations
  for each row
  execute function generate_quotation_number();

create trigger set_quotations_updated_at
  before update on quotations
  for each row
  execute function set_updated_at();
