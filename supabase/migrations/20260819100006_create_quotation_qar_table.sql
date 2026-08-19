-- Tabela quotation_qar: Questionário de Análise de Risco, 1:1 com quotations
-- (ver .agents/specs/quotations/design.md). Sem renewed_policy_id ainda —
-- essa coluna e sua FK pra policies são adicionadas via ALTER TABLE na spec
-- policies, quando a tabela referenciada existir (mantém a dependência numa
-- via só: policies depende de quotations, nunca o inverso).

create table quotation_qar (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references quotations (id) on delete cascade,
  brokerage_id uuid not null references brokerages (id) on delete cascade,
  insurance_type quotation_type,
  current_policy_expiry date,
  renewal_insurer_id uuid references insurers (id) on delete set null,
  renewal_insurer_name text,
  sinistralidade text,
  previous_premium numeric,
  desired_premium numeric,
  has_risk_management boolean,
  has_preventive_maintenance boolean,
  has_logo_or_special_paint boolean,
  has_defensive_driving boolean,
  has_tracker boolean,
  has_cargo boolean,
  cargo_category text,
  cargo_type text,
  circulation_regions text[],
  unique (quotation_id)
);

create index quotation_qar_brokerage_id_idx on quotation_qar (brokerage_id);
