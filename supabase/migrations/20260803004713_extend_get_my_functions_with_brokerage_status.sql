-- Estende get_my_role()/get_my_brokerage_id() (spec auth) pra também exigir
-- brokerages.status = 'active', além de users.status = 'active' já existente.
-- Efeito: uma corretora inativa bloqueia RLS pra TODOS os usuários dela de uma vez,
-- sem precisar desativar um por um (ver .agents/specs/brokerages/requirements.md,
-- Requirement 5.2).

create or replace function get_my_role()
returns public.user_role
language sql
security definer
set search_path = ''
stable
as $$
  select u.role
  from public.users u
  join public.brokerages b on b.id = u.brokerage_id
  where u.id = auth.uid()
    and u.status = 'active'
    and b.status = 'active'
$$;

create or replace function get_my_brokerage_id()
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select u.brokerage_id
  from public.users u
  join public.brokerages b on b.id = u.brokerage_id
  where u.id = auth.uid()
    and u.status = 'active'
    and b.status = 'active'
$$;
