-- Funções SECURITY DEFINER pra RLS de policy_attachments — mesmo padrão de
-- get_quotation_brokerage_id/is_my_quotation (spec quotations). Nunca
-- subquery inline em policy RLS (ver .agents/specs/quotations/design.md).

create function get_policy_brokerage_id(p_policy_id uuid) returns uuid
language sql security definer set search_path = '' stable as $$
  select brokerage_id from public.policies where id = p_policy_id
$$;

create function is_my_policy_client(p_policy_id uuid) returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (
    select 1
    from public.policies p
    join public.client_sellers cs on cs.client_id = p.client_id
    where p.id = p_policy_id and cs.seller_id = auth.uid()
  )
$$;
