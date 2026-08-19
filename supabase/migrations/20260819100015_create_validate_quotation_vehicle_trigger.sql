-- Duas regras de quotation_vehicles (Requirement 3.2/3.3/3.4): o veículo
-- precisa ser do mesmo cliente da cotação (checagem de integridade — RLS
-- não pega isso, os dois estão na mesma corretora, só o cliente diverge);
-- e adicionar/remover só é permitido enquanto a cotação está em waiting ou
-- in_progress (a partir de in_negotiation a lista fica travada, mas UPDATE
-- dos campos de cobertura continua liberado — por isso o trigger só cobre
-- INSERT/DELETE, não UPDATE).

create or replace function validate_quotation_vehicle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_quotation_status public.quotation_status;
  v_quotation_client_id uuid;
  v_vehicle_client_id uuid;
begin
  select status, client_id into v_quotation_status, v_quotation_client_id
  from public.quotations
  where id = coalesce(new.quotation_id, old.quotation_id);

  if tg_op = 'INSERT' then
    if v_quotation_status not in ('waiting', 'in_progress') then
      raise exception 'Não é possível adicionar veículos a essa altura da cotação.';
    end if;

    select client_id into v_vehicle_client_id from public.vehicles where id = new.vehicle_id;
    if v_vehicle_client_id is distinct from v_quotation_client_id then
      raise exception 'O veículo precisa pertencer ao mesmo cliente da cotação.';
    end if;
  elsif tg_op = 'DELETE' then
    if v_quotation_status not in ('waiting', 'in_progress') then
      raise exception 'Não é possível remover veículos a essa altura da cotação.';
    end if;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger trg_validate_quotation_vehicle_insert
  before insert on quotation_vehicles
  for each row
  execute function validate_quotation_vehicle();

create trigger trg_validate_quotation_vehicle_delete
  before delete on quotation_vehicles
  for each row
  execute function validate_quotation_vehicle();
