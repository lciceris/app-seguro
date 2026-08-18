-- Enums usados pela tabela vehicles (ver .agents/specs/vehicles/design.md).
-- Valores em inglês/snake_case, mesmo padrão de user_role/client_type/client_segment
-- — os labels em pt-BR ficam só no frontend (constants/labels.ts).

create type vehicle_type as enum (
  'tow_truck',
  'semi_trailer',
  'heavy_truck',
  'light_truck',
  'bus',
  'heavy_pickup',
  'light_pickup',
  'passenger_car',
  'motorcycle'
);

create type vehicle_usage as enum (
  'cargo_transport',
  'commercial',
  'private',
  'tow_service',
  'test_drive',
  'driving_school',
  'garbage_collector',
  'funeral_service',
  'walk_in_rental',
  'contract_rental',
  'taxi',
  'passenger_transport',
  'school_transport'
);
