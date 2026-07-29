-- Enums usados pela tabela users (ver .agents/specs/auth/design.md)

create type user_role as enum (
  'platform_admin',
  'brokerage_admin',
  'supervisor',
  'seller',
  'analyst',
  'viewer'
);

create type user_status as enum (
  'active',
  'inactive'
);
