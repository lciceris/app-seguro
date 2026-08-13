-- Enums usados pela tabela clients (ver .agents/specs/clients/design.md)

create type client_type as enum (
  'individual',
  'company'
);

create type client_segment as enum (
  'lead',
  'active',
  'vip',
  'inactive'
);
