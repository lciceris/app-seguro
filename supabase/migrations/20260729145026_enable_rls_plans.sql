-- RLS de plans: leitura liberada a todo usuário autenticado (ver conventions/permissions.md)
-- INSERT/UPDATE/DELETE fica restrito a platform_admin quando essa feature existir.

alter table plans enable row level security;

create policy plans_select_all
  on plans
  for select
  to authenticated
  using (true);
