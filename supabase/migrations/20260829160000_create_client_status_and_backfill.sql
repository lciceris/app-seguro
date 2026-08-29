-- client_status: análogo a brokerage_status/user_status. `segment` estava sendo
-- usado como mecanismo de ativar/desativar cliente (ver .agents/specs/clients/design.md
-- Requirement 6) — esta migration introduz uma coluna própria pra isso, permitindo
-- remover `segment`/`lead_source` numa migration seguinte sem quebrar inativação.

create type client_status as enum ('active', 'inactive');

alter table clients
  add column status client_status not null default 'active';

update clients set status = 'inactive' where segment = 'inactive';
