-- Funções SECURITY DEFINER usadas pela RLS de quotations e suas tabelas
-- filhas. Mesmo padrão de get_client_brokerage_id/is_my_client (spec
-- clients) — nunca subquery inline em policy RLS (ver
-- .agents/specs/quotations/design.md).

create or replace function get_quotation_brokerage_id(p_quotation_id uuid)
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select brokerage_id
  from public.quotations
  where id = p_quotation_id
$$;

create or replace function is_my_quotation(p_quotation_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.quotations
    where id = p_quotation_id
      and seller_id = auth.uid()
  )
$$;

create or replace function is_my_quotation_insurer(p_quotation_insurer_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.quotation_insurers qi
    join public.quotations q on q.id = qi.quotation_id
    where qi.id = p_quotation_insurer_id
      and q.seller_id = auth.uid()
  )
$$;
