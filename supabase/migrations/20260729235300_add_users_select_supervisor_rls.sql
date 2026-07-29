-- Fix de lacuna da Task 1: a policy users_select_managed só cobria
-- brokerage_admin/platform_admin, mas supervisor também tem leitura sobre
-- usuários (ver docs/architecture/backend/conventions/permissions.md e
-- Requirement 5 da spec users — ver detalhe). Só SELECT, supervisor não
-- gerencia (convida/edita/desativa) outros usuários.

create policy users_select_supervisor
  on users
  for select
  to authenticated
  using (
    get_my_role() = 'supervisor'
    and brokerage_id = get_my_brokerage_id()
  );
