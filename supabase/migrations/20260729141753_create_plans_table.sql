-- Tabela plans: planos da plataforma, usada por can_add_user() (ver .agents/specs/users/design.md)

create table plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  max_users integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_plans_updated_at
  before update on plans
  for each row
  execute function set_updated_at();
