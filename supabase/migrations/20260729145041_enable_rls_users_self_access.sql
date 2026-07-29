-- RLS de users: auto-acesso (ver conventions/rls.md).
-- Gerenciar outros usuários (convidar, desativar, editar) é escopo de .agents/specs/users,
-- que adiciona uma policy própria por cima desta.

alter table users enable row level security;

create policy users_select_own
  on users
  for select
  to authenticated
  using (id = auth.uid());

create policy users_update_own
  on users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- A policy acima libera UPDATE na própria linha, mas sem restrição de coluna a RLS
-- deixaria o usuário alterar o próprio role/status/brokerage_id (auto-promoção ou
-- auto-reativação). Trava isso em nível de GRANT, não só de RLS:
revoke update on public.users from authenticated;
grant update (full_name, phone, avatar_url) on public.users to authenticated;
