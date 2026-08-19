-- Tabela quotation_vehicles: veículos incluídos numa cotação, com os campos
-- de cobertura individuais por veículo (ver .agents/specs/quotations/design.md).

create table quotation_vehicles (
  vehicle_id uuid not null references vehicles (id) on delete cascade,
  quotation_id uuid not null references quotations (id) on delete cascade,
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
  primary key (vehicle_id, quotation_id)
);

create index quotation_vehicles_quotation_id_idx on quotation_vehicles (quotation_id);
