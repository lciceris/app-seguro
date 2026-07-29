-- get_my_brokerage_id(): mesmo padrão de get_my_role() (ver adr/002-security-definer-rls.md)

create or replace function get_my_brokerage_id()
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select brokerage_id
  from public.users
  where id = auth.uid()
    and status = 'active'
$$;
