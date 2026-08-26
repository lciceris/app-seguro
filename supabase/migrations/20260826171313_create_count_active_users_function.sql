-- count_active_users(): devolve só a contagem de usuários ativos de uma
-- corretora, sem expor nome/e-mail/perfil (ver .agents/specs/
-- brokerage-users-count/requirements.md — decisão deliberada de não
-- ampliar RLS de `users` pra platform_admin, só expor um número via
-- função SECURITY DEFINER, mesmo padrão de can_add_user()).
--
-- Diferente de can_add_user() (chamada só server-side pela Edge Function
-- invite-user), esta função é chamada direto do frontend — por isso tem
-- checagem de autorização própria: platform_admin vê qualquer corretora,
-- qualquer outro role só a própria (mesmo dado que ele já enxergaria
-- contando as linhas de `users` que a RLS já libera pra ele).

create or replace function count_active_users(p_brokerage_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if get_my_role() <> 'platform_admin' and p_brokerage_id <> get_my_brokerage_id() then
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
