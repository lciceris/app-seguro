-- Fix (encontrado ao verificar a Task 1 manualmente, ver .agents/specs/brokerages/tasks.md):
-- a função enforce_brokerage_update_columns() (migration anterior) chamava
-- get_my_role()/get_my_brokerage_id() sem qualificar o schema — com search_path = ''
-- (SECURITY DEFINER), isso falha com "function get_my_role() does not exist" e
-- quebra QUALQUER UPDATE em brokerages, inclusive via service role (o que mascarou
-- a verificação da cascata de bloqueio: a desativação de teste nem chegava a
-- acontecer de verdade).

create or replace function enforce_brokerage_update_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
  v_is_own boolean;
begin
  v_role := public.get_my_role();
  v_is_own := (new.id = public.get_my_brokerage_id());

  if v_is_own then
    if new.plan_id is distinct from old.plan_id or new.status is distinct from old.status then
      raise exception 'Não é permitido alterar plano ou status da própria corretora.';
    end if;
  elsif v_role = 'platform_admin' then
    if new.logo_url is distinct from old.logo_url or new.primary_color is distinct from old.primary_color then
      raise exception 'Alterar logo/cor é responsabilidade do administrador da própria corretora.';
    end if;
  end if;

  return new;
end;
$$;
