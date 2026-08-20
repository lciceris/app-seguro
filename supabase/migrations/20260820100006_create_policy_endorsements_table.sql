-- Tabela policy_endorsements: pedidos de alteração numa apólice vigente (ver
-- .agents/specs/policy-endorsements/design.md). policy_id é a versão em que o
-- endosso foi aberto — nunca muda depois, mesmo que a apólice vire superseded
-- ao ser efetivado. Campos de negociação/resposta do cliente/efetivação
-- ficam todos aqui, nunca em policies.

create table policy_endorsements (
  id uuid primary key default gen_random_uuid(),
  brokerage_id uuid not null references brokerages (id) on delete cascade,
  policy_id uuid not null references policies (id) on delete restrict,
  endorsement_type policy_endorsement_type not null,
  status policy_endorsement_status not null default 'waiting',
  seller_id uuid references users (id) on delete set null,
  description text,
  vehicle_id uuid references vehicles (id) on delete restrict,
  coverage_type coverage_type,
  casco_percentage numeric,
  casco_value numeric,
  franchise_type franchise_type,
  bonus numeric,
  claims_count integer,
  rcf_dm numeric,
  rcf_dc numeric,
  rcf_dmo numeric,
  app_death numeric,
  app_disability numeric,
  assistance text,
  glass_coverage glass_coverage_level,
  reserve_car text,
  bodywork_value numeric,
  bodywork_type text,
  equipment_value numeric,
  equipment_type text,
  armoring_value numeric,
  new_policy_number text,
  new_premium_amount numeric,
  new_total_fleet_value numeric,
  new_coverage_start date,
  new_coverage_end date,
  premium_adjustment numeric,
  insurer_response_notes text,
  responded_at timestamptz,
  responded_by uuid references users (id) on delete set null,
  client_response_notes text,
  client_responded_at timestamptz,
  client_responded_by uuid references users (id) on delete set null,
  not_closed_reason text,
  new_policy_id uuid references policies (id) on delete set null,
  effected_at timestamptz,
  effected_by uuid references users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index policy_endorsements_brokerage_id_idx on policy_endorsements (brokerage_id);
create index policy_endorsements_policy_id_idx on policy_endorsements (policy_id);

create trigger set_policy_endorsements_updated_at
  before update on policy_endorsements
  for each row
  execute function set_updated_at();
