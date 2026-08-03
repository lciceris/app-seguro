-- GRANT column-level (ver migration anterior) libera name/logo_url/primary_color/
-- plan_id/status pra `authenticated` como um todo — não diferencia "brokerage_admin
-- editando a própria" de "platform_admin editando outra". Esse trigger reforça a
-- distinção real (ver .agents/specs/brokerages/requirements.md, Requirements 4.3/6.2):
--
-- - Editando a PRÓPRIA corretora (brokerage_admin comum, ou platform_admin da
--   corretora especial da plataforma — Requirement 6.4) → só identidade visual,
--   nunca plano/status.
-- - platform_admin editando OUTRA corretora (cross-tenant) → só dados
--   administrativos, nunca logo/cor (isso é responsabilidade do dono da corretora).
--
-- Mesma técnica de prevent_self_privilege_escalation (spec users, Task 7.4).

create or replace function enforce_brokerage_update_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
  v_is_own boolean;
begin
  v_role := get_my_role();
  v_is_own := (new.id = get_my_brokerage_id());

  if v_is_own then
    if new.plan_id is distinct from old.plan_id or new.status is distinct from old.status then
      raise exception 'Não é permitido alterar plano ou status da própria corretora.';
    end if;
  elsif v_role = 'platform_admin' then
    if new.logo_url is distinct from old.logo_url or new.primary_color is distinct from old.primary_color then
      raise exception 'Alterar logo/cor é responsabilidade do administrador da própria corretora.';
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_enforce_brokerage_update_columns
  before update on public.brokerages
  for each row
  execute function enforce_brokerage_update_columns();
