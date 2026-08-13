-- Tabela client_sellers: vínculo N:N entre clients e users (role seller) — ver
-- .agents/specs/clients/design.md. Sem brokerage_id próprio: deriva do client_id
-- pai (ver função get_client_brokerage_id na próxima migration).

create table client_sellers (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  seller_id uuid not null references users (id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (client_id, seller_id)
);

create index client_sellers_client_id_idx on client_sellers (client_id);
create index client_sellers_seller_id_idx on client_sellers (seller_id);
