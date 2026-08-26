-- Fix: count_active_users() chamava get_my_role()/get_my_brokerage_id() sem
-- qualificar o schema — com search_path = '' (obrigatório numa função
-- SECURITY DEFINER, ver ADR 002), uma chamada não qualificada a outra
-- função falha com "function get_my_role() does not exist". Encontrado via
-- verificação real (Playwright) na spec brokerage-users-count.

create or replace function count_active_users(p_brokerage_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if public.get_my_role() <> 'platform_admin' and p_brokerage_id <> public.get_my_brokerage_id() then
    raise exception 'Não autorizado.';
  end if;

  return (
    select count(*)::integer
    from public.users
    where brokerage_id = p_brokerage_id
      and status = 'active'
  );
end;
$$;
