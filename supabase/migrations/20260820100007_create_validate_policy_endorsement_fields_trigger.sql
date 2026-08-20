-- Trigger BEFORE INSERT: valida campos obrigatórios por tipo de endosso, veículo
-- do mesmo cliente da apólice, veículo já coberto pela versão vigente e que a
-- apólice-alvo esteja vigente (ver .agents/specs/policy-endorsements/design.md).

create or replace function validate_policy_endorsement_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.endorsement_type in ('vehicle_inclusion', 'vehicle_exclusion', 'coverage_change')
     and new.vehicle_id is null then
    raise exception 'Selecione o veículo.';
  end if;

  if new.endorsement_type = 'extension' and new.new_coverage_end is null then
    raise exception 'Informe a nova data de fim de vigência.';
  end if;

  if new.endorsement_type in ('administrative_correction', 'cancellation')
     and (new.description is null or btrim(new.description) = '') then
    raise exception 'Informe o motivo.';
  end if;

  if new.endorsement_type = 'vehicle_inclusion'
     and not exists (
       select 1 from public.vehicles v join public.policies p on p.client_id = v.client_id
       where v.id = new.vehicle_id and p.id = new.policy_id
     ) then
    raise exception 'O veículo precisa ser do mesmo cliente da apólice.';
  end if;

  if new.endorsement_type in ('vehicle_exclusion', 'coverage_change')
     and not exists (
       select 1 from public.policy_vehicles where policy_id = new.policy_id and vehicle_id = new.vehicle_id
     ) then
    raise exception 'Veículo não está coberto pela versão vigente da apólice.';
  end if;

  if not exists (select 1 from public.policies where id = new.policy_id and status = 'active') then
    raise exception 'Só é possível abrir endosso na versão vigente da apólice.';
  end if;

  return new;
end;
$$;

create trigger trg_validate_policy_endorsement_fields
  before insert on policy_endorsements
  for each row
  execute function validate_policy_endorsement_fields();
