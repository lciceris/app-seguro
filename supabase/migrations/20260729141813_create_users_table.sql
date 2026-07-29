-- Tabela users: extensão de auth.users com role + brokerage_id (ver .agents/specs/auth/design.md)

create table users (
  id uuid primary key references auth.users (id) on delete cascade,
  brokerage_id uuid not null references brokerages (id) on delete restrict,
  role user_role not null,
  status user_status not null default 'active',
  full_name text not null,
  email text not null unique,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_brokerage_id_idx on users (brokerage_id);

create trigger set_users_updated_at
  before update on users
  for each row
  execute function set_updated_at();
