-- Trigger BEFORE UPDATE OF status: máquina de estados de policy_endorsements, mesmo
-- padrão de enforce_quotation_status_transition mas mais enxuto (sem "convidar
-- seguradoras" nem "vencedora" — a seguradora já é a da apólice). Ver
-- .agents/specs/policy-endorsements/design.md.

create or replace function enforce_policy_endorsement_status_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
begin
  if new.status = old.status then return new; end if;
  v_role := public.get_my_role();

  case old.status
    when 'waiting' then
      if new.status = 'presented' then
        if v_role not in ('analyst', 'supervisor', 'brokerage_admin', 'platform_admin') then
          raise exception 'Transição de status inválida.';
        end if;
        new.responded_at := now();
        new.responded_by := auth.uid();
      elsif new.status = 'not_closed' then
        if v_role not in ('analyst', 'supervisor', 'brokerage_admin', 'platform_admin') then
          raise exception 'Transição de status inválida.';
        end if;
        if new.not_closed_reason is null then
          raise exception 'Informe o motivo de não fechamento.';
        end if;
      else
        raise exception 'Transição de status inválida.';
      end if;

    when 'presented' then
      if v_role = 'seller' then
        if not public.is_my_policy_client(new.policy_id) then
          raise exception 'Só o vendedor responsável pode avançar esse endosso.';
        end if;
      elsif v_role not in ('supervisor', 'brokerage_admin', 'platform_admin') then
        raise exception 'Transição de status inválida.';
      end if;
      if new.status = 'client_accepted' then
        new.client_responded_at := now();
        new.client_responded_by := auth.uid();
      elsif new.status = 'not_closed' then
        if new.not_closed_reason is null then
          raise exception 'Informe o motivo de não fechamento.';
        end if;
      else
        raise exception 'Transição de status inválida.';
      end if;

    when 'client_accepted' then
      if v_role not in ('supervisor', 'brokerage_admin', 'platform_admin') then
        raise exception 'Transição de status inválida.';
      end if;
      if new.status = 'not_closed' and new.not_closed_reason is null then
        raise exception 'Informe o motivo de não fechamento.';
      elsif new.status not in ('effected', 'not_closed') then
        raise exception 'Transição de status inválida.';
      end if;

    else
      raise exception 'Endosso em status terminal não pode mudar de status.';
  end case;

  return new;
end;
$$;

create trigger trg_enforce_policy_endorsement_status_transition
  before update of status on policy_endorsements
  for each row
  execute function enforce_policy_endorsement_status_transition();
