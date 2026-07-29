-- get_my_role(): SECURITY DEFINER pra evitar recursão de RLS ao ler o role do usuário logado
-- (ver docs/architecture/backend/adr/002-security-definer-rls.md)
-- Usuário com status != 'active' não tem role válido — é isso que faz a desativação
-- bloquear o resto do sistema via RLS (ver .agents/specs/users/requirements.md, Requirement 3).

create or replace function get_my_role()
returns public.user_role
language sql
security definer
set search_path = ''
stable
as $$
  select role
  from public.users
  where id = auth.uid()
    and status = 'active'
$$;
