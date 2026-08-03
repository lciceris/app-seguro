-- brokerage_status: análogo a user_status, mas na corretora (ver .agents/specs/brokerages/design.md).
-- Desativar uma corretora bloqueia RLS pra todos os usuários dela (ver 004713_extend_...).

create type brokerage_status as enum ('active', 'inactive');

alter table brokerages
  add column status brokerage_status not null default 'active';
