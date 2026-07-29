-- can_add_user(): compara usuários ativos da corretora vs. o limite do plano
-- vinculado. SECURITY DEFINER, mesmo padrão de get_my_role()/get_my_brokerage_id()
-- (ver docs/architecture/backend/adr/002-security-definer-rls.md).
-- Chamada pela Edge Function invite-user, sempre server-side — uma checagem só
-- no frontend poderia ser contornada.

create or replace function can_add_user(p_brokerage_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_max_users integer;
  v_active_count integer;
begin
  select p.max_users into v_max_users
  from public.brokerages b
  join public.plans p on p.id = b.plan_id
  where b.id = p_brokerage_id;

  -- Sem plano vinculado: sem limite, até existir uma feature de billing/planos.
  if v_max_users is null then
    return true;
  end if;

  select count(*) into v_active_count
  from public.users
  where brokerage_id = p_brokerage_id
    and status = 'active';

  return v_active_count < v_max_users;
end;
$$;
