-- Funções SECURITY DEFINER usadas pela RLS de clients/client_sellers. Nunca
-- usar subquery inline nas policies pra isso — lição da spec brokerages (Task 9):
-- subquery inline em policy RLS se mostrou inconsistente em tráfego real da
-- aplicação, mesmo passando em teste isolado (ver .agents/specs/brokerages/tasks.md).

create or replace function get_client_brokerage_id(p_client_id uuid)
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select brokerage_id
  from public.clients
  where id = p_client_id
$$;

create or replace function is_my_client(p_client_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.client_sellers
    where client_id = p_client_id
      and seller_id = auth.uid()
  )
$$;
