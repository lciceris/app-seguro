-- Fix (encontrado ao testar a Task 9 manualmente, ver .agents/specs/brokerages/tasks.md):
-- brokerages_select_own_unconditional (migration 004714) usava uma subquery inline
-- na policy — funcionava de forma isolada/consistente em testes diretos, mas se
-- mostrou inconsistente no fluxo real do app (retornando 0 linhas em alguns
-- casos, sem padrão claro). Substituída por uma função SECURITY DEFINER, mesmo
-- padrão já comprovado de get_my_role()/get_my_brokerage_id() — evita qualquer
-- nuance de RLS avaliada dentro de outra RLS.

create or replace function get_my_brokerage_id_unconditional()
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select brokerage_id
  from public.users
  where id = auth.uid()
$$;

drop policy if exists brokerages_select_own_unconditional on brokerages;

create policy brokerages_select_own_unconditional
  on brokerages
  for select
  to authenticated
  using (id = get_my_brokerage_id_unconditional());
