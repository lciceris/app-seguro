-- Tabela policies: apólices emitidas a partir de cotações efetivadas (ver
-- .agents/specs/policies/design.md). Toda linha nasce do trigger
-- create_policy_from_effected_quotation — não existe insert manual pelo
-- frontend, por isso quotation_id é not null + unique (diferente do modelo
-- antigo, onde era nullable).

create table policies (
  id uuid primary key default gen_random_uuid(),
  brokerage_id uuid not null references brokerages (id) on delete cascade,
  client_id uuid not null references clients (id) on delete restrict,
  insurer_id uuid not null references insurers (id) on delete restrict,
  quotation_id uuid not null unique references quotations (id) on delete restrict,
  renewed_from_policy_id uuid references policies (id) on delete set null,
  policy_number text,
  premium_amount numeric,
  total_fleet_value numeric,
  coverage_start date,
  coverage_end date,
  status policy_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index policies_brokerage_id_idx on policies (brokerage_id);
create index policies_client_id_idx on policies (client_id);

create trigger set_policies_updated_at
  before update on policies
  for each row
  execute function set_updated_at();
