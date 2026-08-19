-- Trigger central da spec policies: cria a apólice automaticamente quando a
-- cotação chega em effected, herdando dados da própria cotação e da
-- seguradora vencedora (ver .agents/specs/policies/design.md). Nenhuma ação
-- do frontend cria uma linha em policies diretamente.

create or replace function create_policy_from_effected_quotation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_winner record;
  v_fleet_value numeric;
  v_renewed_policy_id uuid;
begin
  if new.status <> 'effected' or old.status = 'effected' then
    return new;
  end if;

  select insurer_id, premium_amount into v_winner
  from public.quotation_insurers
  where quotation_id = new.id and is_winner
  limit 1;

  select sum(casco_value) into v_fleet_value
  from public.quotation_vehicles
  where quotation_id = new.id;

  select renewed_policy_id into v_renewed_policy_id
  from public.quotation_qar
  where quotation_id = new.id;

  insert into public.policies (
    brokerage_id, client_id, insurer_id, quotation_id, renewed_from_policy_id,
    premium_amount, total_fleet_value, coverage_start, coverage_end
  ) values (
    new.brokerage_id, new.client_id, v_winner.insurer_id, new.id, v_renewed_policy_id,
    v_winner.premium_amount, v_fleet_value, new.coverage_start, new.coverage_end
  );

  if v_renewed_policy_id is not null then
    update public.policies set status = 'renewed' where id = v_renewed_policy_id;
  end if;

  return new;
end;
$$;

create trigger trg_create_policy_from_effected_quotation
  after update of status on quotations
  for each row
  execute function create_policy_from_effected_quotation();
