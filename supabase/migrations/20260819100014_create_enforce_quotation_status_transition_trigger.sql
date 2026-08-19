-- Valida toda a máquina de estados da cotação (Requirement 6) — sequência
-- de transições, quem pode fazer cada uma, e as regras que dependem do
-- valor do status (exigir vencedora antes de presented, exigir lost_reason
-- antes de not_closed, setar analyst_id automaticamente). RLS sozinha não
-- expressa isso porque depende do OLD.status, não só de quem é o usuário
-- (ver .agents/specs/quotations/design.md).

create or replace function enforce_quotation_status_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
begin
  if new.status = old.status then
    return new;
  end if;

  v_role := public.get_my_role();

  case old.status
    when 'waiting' then
      if new.status <> 'in_progress'
        or v_role not in ('analyst', 'supervisor', 'brokerage_admin', 'platform_admin')
      then
        raise exception 'Transição de status inválida.';
      end if;
      if v_role = 'analyst' then
        new.analyst_id := auth.uid();
      end if;

    when 'in_progress' then
      if new.status <> 'in_negotiation'
        or v_role not in ('analyst', 'supervisor', 'brokerage_admin', 'platform_admin')
      then
        raise exception 'Transição de status inválida.';
      end if;

    when 'in_negotiation' then
      if new.status <> 'presented'
        or v_role not in ('analyst', 'supervisor', 'brokerage_admin', 'platform_admin')
      then
        raise exception 'Transição de status inválida.';
      end if;
      if not exists (
        select 1 from public.quotation_insurers
        where quotation_id = new.id and is_winner
      ) then
        raise exception 'Selecione a seguradora vencedora antes de apresentar.';
      end if;

    when 'presented' then
      if new.status <> 'waiting_effect' then
        raise exception 'Transição de status inválida.';
      end if;
      if v_role = 'seller' then
        if new.seller_id <> auth.uid() then
          raise exception 'Só o vendedor responsável pode avançar essa cotação.';
        end if;
      elsif v_role not in ('supervisor', 'brokerage_admin', 'platform_admin') then
        raise exception 'Transição de status inválida.';
      end if;

    when 'waiting_effect' then
      if new.status not in ('client_accepted', 'not_closed') then
        raise exception 'Transição de status inválida.';
      end if;
      if v_role = 'seller' then
        if new.seller_id <> auth.uid() then
          raise exception 'Só o vendedor responsável pode avançar essa cotação.';
        end if;
      elsif v_role not in ('supervisor', 'brokerage_admin', 'platform_admin') then
        raise exception 'Transição de status inválida.';
      end if;
      if new.status = 'not_closed' and new.lost_reason is null then
        raise exception 'Informe o motivo de não fechamento.';
      end if;

    when 'client_accepted' then
      if new.status not in ('effected', 'not_closed')
        or v_role not in ('supervisor', 'brokerage_admin', 'platform_admin')
      then
        raise exception 'Transição de status inválida.';
      end if;
      if new.status = 'not_closed' and new.lost_reason is null then
        raise exception 'Informe o motivo de não fechamento.';
      end if;

    else
      raise exception 'Cotação em status terminal não pode mudar de status.';
  end case;

  return new;
end;
$$;

create trigger trg_enforce_quotation_status_transition
  before update of status on quotations
  for each row
  execute function enforce_quotation_status_transition();
