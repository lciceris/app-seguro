-- Gap encontrado ao implementar a Task 7 (editar usuário): a policy
-- `users_update_managed` (admin editando outro usuário) e o fluxo de
-- desativar/reativar (Task 9, update de `status`) precisam escrever em
-- `role`/`status`, mas o GRANT column-level da spec `auth` só libera
-- `full_name, phone, avatar_url` — qualquer UPDATE tocando `role` ou
-- `status` falha com "permission denied for table users" antes mesmo da
-- RLS ser avaliada (GRANT é checado antes de RLS).
--
-- GRANT é por role do Postgres (`authenticated`), não por policy — não dá
-- pra liberar a coluna só pra `users_update_managed` e não pra
-- `users_update_own`. Widening o GRANT sozinho reabriria a auto-promoção
-- que a spec `auth` bloqueava exatamente restringindo essas colunas.
-- Substitui aquela proteção por um trigger, que consegue distinguir
-- "o próprio dono está mudando a própria linha" (bloqueado) de
-- "um admin está mudando a linha de outro usuário" (permitido pela RLS).

revoke update on public.users from authenticated;
grant update (full_name, phone, avatar_url, role, status) on public.users to authenticated;

create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id = auth.uid() and (
    new.role is distinct from old.role
    or new.status is distinct from old.status
    or new.brokerage_id is distinct from old.brokerage_id
  ) then
    raise exception 'Não é permitido alterar o próprio perfil, status ou corretora.';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_self_privilege_escalation
  before update on public.users
  for each row
  execute function public.prevent_self_privilege_escalation();
