-- Tabela brokerages: âncora de multi-tenancy (ver docs/architecture/backend/adr/001-multitenancy.md)

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table brokerages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  primary_color text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_brokerages_updated_at
  before update on brokerages
  for each row
  execute function set_updated_at();
