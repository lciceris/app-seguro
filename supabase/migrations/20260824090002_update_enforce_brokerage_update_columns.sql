-- Amplia enforce_brokerage_update_columns() pra refletir a divisão de
-- responsabilidade decidida em .agents/specs/brokerages/requirements.md
-- (Requirements 4 e 6, após o cadastro completo de empresa):
--   - brokerage_admin (dono da própria corretora): nome + todos os dados de
--     empresa (nome fantasia, CNPJ, CNAE, inscrição estadual, e-mail, telefone,
--     endereço, representante, financeiro) + logo/cor. NÃO pode mexer em
--     plano/status/data de expiração do plano.
--   - platform_admin: nome, plano, status e agora também data de expiração do
--     plano. NÃO pode mexer em dados de empresa nem logo/cor (responsabilidade
--     exclusiva do brokerage_admin a partir da criação).
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
  v_role := public.get_my_role();
  v_is_own := (new.id = public.get_my_brokerage_id());

  if v_is_own then
    if new.plan_id is distinct from old.plan_id
      or new.status is distinct from old.status
      or new.plan_expires_at is distinct from old.plan_expires_at
    then
      raise exception 'Não é permitido alterar plano, status ou data de expiração do plano da própria corretora.';
    end if;
  elsif v_role = 'platform_admin' then
    if new.logo_url is distinct from old.logo_url
      or new.primary_color is distinct from old.primary_color
      or new.trade_name is distinct from old.trade_name
      or new.tax_id is distinct from old.tax_id
      or new.business_code is distinct from old.business_code
      or new.state_registration is distinct from old.state_registration
      or new.email is distinct from old.email
      or new.phone is distinct from old.phone
      or new.zip_code is distinct from old.zip_code
      or new.street is distinct from old.street
      or new.street_number is distinct from old.street_number
      or new.complement is distinct from old.complement
      or new.neighborhood is distinct from old.neighborhood
      or new.city is distinct from old.city
      or new.state is distinct from old.state
      or new.representative_name is distinct from old.representative_name
      or new.representative_email is distinct from old.representative_email
      or new.financial_name is distinct from old.financial_name
      or new.financial_email is distinct from old.financial_email
    then
      raise exception 'Alterar dados de empresa/logo/cor é responsabilidade do administrador da própria corretora.';
    end if;
  end if;

  return new;
end;
$$;
