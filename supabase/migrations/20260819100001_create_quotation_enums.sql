-- Enums usados pelas tabelas de quotations (ver .agents/specs/quotations/design.md).
-- Valores em inglês/snake_case, mesmo padrão de user_role/client_type/vehicle_type
-- — os labels em pt-BR ficam só no frontend (constants/labels.ts).

create type quotation_status as enum (
  'waiting',
  'in_progress',
  'in_negotiation',
  'presented',
  'waiting_effect',
  'client_accepted',
  'effected',
  'not_closed'
);

create type quotation_type as enum (
  'new',
  'renewal'
);

create type insurer_response_status as enum (
  'pending',
  'accepted',
  'declined',
  'waiting_info'
);

create type quotation_event_type as enum (
  'comment',
  'system'
);

-- Cobertura por veículo (ver quotation_vehicles)
create type coverage_type as enum (
  'rcf',
  'total',
  'vd'
);

create type franchise_type as enum (
  'normal',
  'reduced'
);

create type glass_coverage_level as enum (
  'basic',
  'complete',
  'armored'
);
