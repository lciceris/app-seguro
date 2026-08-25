-- Logo/cor entram no cadastro (Requirement 2) — mas o upload do logo só é
-- possível depois que a corretora já existe (o path do Storage usa o id).
-- Fluxo: Edge Function cria a corretora (INSERT, sem trigger de UPDATE) →
-- frontend sobe o arquivo → frontend faz um UPDATE pontual de logo_url
-- (e primary_color, se ainda não setados na criação). Esse UPDATE, feito
-- pelo platform_admin logo após criar, precisa passar pela trigger.
--
-- Regra: platform_admin pode DEFINIR logo_url/primary_color só enquanto
-- ainda estiverem nulos (o passo de finalização do onboarding) — depois de
-- setados uma vez, voltam a ser exclusivos do brokerage_admin (Requirement 6).
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
    if new.logo_url is distinct from old.logo_url and old.logo_url is not null then
      raise exception 'Alterar o logo é responsabilidade do administrador da própria corretora.';
    end if;
    if new.primary_color is distinct from old.primary_color and old.primary_color is not null then
      raise exception 'Alterar a cor primária é responsabilidade do administrador da própria corretora.';
    end if;
  end if;

  return new;
end;
$$;
