-- Trigger AFTER UPDATE OF status: aplica o efeito de verdade quando o endosso vira
-- effected — cancellation só marca a versão vigente como cancelled; os demais tipos
-- criam uma nova versão de policies (policy_number herdado, nunca regenerado),
-- copiam policy_vehicles com o ajuste do tipo e marcam a versão anterior como
-- superseded (ver .agents/specs/policy-endorsements/design.md).
--
-- O segundo UPDATE em policy_endorsements (setando new_policy_id/effected_at/
-- effected_by) não mexe na coluna status — não re-dispara este mesmo trigger
-- (AFTER UPDATE OF status), sem risco de recursão.

create or replace function apply_policy_endorsement_effect()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current record;
  v_new_id uuid;
begin
  if new.status <> 'effected' or old.status = 'effected' then
    return new;
  end if;

  select * into v_current from public.policies where id = new.policy_id;

  if new.endorsement_type = 'cancellation' then
    update public.policies set status = 'cancelled' where id = v_current.id;
    update public.policy_endorsements
      set effected_at = now(), effected_by = auth.uid()
      where id = new.id;
    return new;
  end if;

  insert into public.policies (
    brokerage_id, client_id, insurer_id, quotation_id, renewed_from_policy_id,
    previous_version_id, root_policy_id,
    policy_number, premium_amount, total_fleet_value, coverage_start, coverage_end, status
  ) values (
    v_current.brokerage_id, v_current.client_id, v_current.insurer_id,
    v_current.quotation_id, v_current.renewed_from_policy_id,
    v_current.id, coalesce(v_current.root_policy_id, v_current.id),
    coalesce(new.new_policy_number, v_current.policy_number),
    coalesce(new.new_premium_amount, v_current.premium_amount),
    v_current.total_fleet_value,
    coalesce(new.new_coverage_start, v_current.coverage_start),
    coalesce(new.new_coverage_end, v_current.coverage_end),
    'active'
  )
  returning id into v_new_id;

  insert into public.policy_vehicles (
    policy_id, vehicle_id, coverage_type, casco_percentage, casco_value, franchise_type,
    bonus, claims_count, rcf_dm, rcf_dc, rcf_dmo, app_death, app_disability, assistance,
    glass_coverage, reserve_car, bodywork_value, bodywork_type, equipment_value, equipment_type,
    armoring_value
  )
  select v_new_id, vehicle_id, coverage_type, casco_percentage, casco_value, franchise_type,
    bonus, claims_count, rcf_dm, rcf_dc, rcf_dmo, app_death, app_disability, assistance,
    glass_coverage, reserve_car, bodywork_value, bodywork_type, equipment_value, equipment_type,
    armoring_value
  from public.policy_vehicles
  where policy_id = v_current.id
    and (new.endorsement_type <> 'vehicle_exclusion' or vehicle_id <> new.vehicle_id);

  if new.endorsement_type = 'vehicle_inclusion' then
    insert into public.policy_vehicles (
      policy_id, vehicle_id, coverage_type, casco_percentage, casco_value, franchise_type,
      bonus, claims_count, rcf_dm, rcf_dc, rcf_dmo, app_death, app_disability, assistance,
      glass_coverage, reserve_car, bodywork_value, bodywork_type, equipment_value, equipment_type,
      armoring_value
    ) values (
      v_new_id, new.vehicle_id, new.coverage_type, new.casco_percentage, new.casco_value,
      new.franchise_type, new.bonus, new.claims_count, new.rcf_dm, new.rcf_dc, new.rcf_dmo,
      new.app_death, new.app_disability, new.assistance, new.glass_coverage, new.reserve_car,
      new.bodywork_value, new.bodywork_type, new.equipment_value, new.equipment_type, new.armoring_value
    );
  elsif new.endorsement_type = 'coverage_change' then
    update public.policy_vehicles set
      coverage_type = new.coverage_type, casco_percentage = new.casco_percentage,
      casco_value = new.casco_value, franchise_type = new.franchise_type, bonus = new.bonus,
      claims_count = new.claims_count, rcf_dm = new.rcf_dm, rcf_dc = new.rcf_dc, rcf_dmo = new.rcf_dmo,
      app_death = new.app_death, app_disability = new.app_disability, assistance = new.assistance,
      glass_coverage = new.glass_coverage, reserve_car = new.reserve_car,
      bodywork_value = new.bodywork_value, bodywork_type = new.bodywork_type,
      equipment_value = new.equipment_value, equipment_type = new.equipment_type,
      armoring_value = new.armoring_value
    where policy_id = v_new_id and vehicle_id = new.vehicle_id;
  end if;

  if new.endorsement_type in ('vehicle_inclusion', 'vehicle_exclusion', 'coverage_change') then
    update public.policies set total_fleet_value = (
      select sum(casco_value) from public.policy_vehicles where policy_id = v_new_id
    ) where id = v_new_id;
  elsif new.endorsement_type = 'administrative_correction' and new.new_total_fleet_value is not null then
    update public.policies set total_fleet_value = new.new_total_fleet_value where id = v_new_id;
  end if;

  update public.policies set status = 'superseded' where id = v_current.id;

  update public.policy_endorsements
    set new_policy_id = v_new_id, effected_at = now(), effected_by = auth.uid()
    where id = new.id;

  return new;
end;
$$;

create trigger trg_apply_policy_endorsement_effect
  after update of status on policy_endorsements
  for each row
  execute function apply_policy_endorsement_effect();
