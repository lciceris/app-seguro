-- Tabela policy_vehicles: mesma estrutura de quotation_vehicles (~19 campos de
-- cobertura), uma linha por veículo por versão de apólice (ver
-- .agents/specs/policy-endorsements/design.md). on delete restrict em vehicle_id
-- (diferente de quotation_vehicles, que usa cascade) — um veículo referenciado por
-- uma versão histórica de apólice não deve poder ser removido silenciosamente.
--
-- Sem policy de insert/update/delete pra usuário comum — toda escrita acontece via
-- trigger (security definer), nunca diretamente pelo frontend.

create table policy_vehicles (
  policy_id uuid not null references policies (id) on delete cascade,
  vehicle_id uuid not null references vehicles (id) on delete restrict,
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
  primary key (policy_id, vehicle_id)
);

create index policy_vehicles_policy_id_idx on policy_vehicles (policy_id);
