-- platform_admin passa a poder editar os dados de empresa também (não só
-- name/plan_id/plan_expires_at/status) — simetria com a criação, que já
-- preenche esses campos. Só logo_url/primary_color continuam exclusivos do
-- brokerage_admin. Ver requirements.md, "platform_admin também edita dados
-- de empresa".
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
    then
      raise exception 'Alterar logo/cor é responsabilidade do administrador da própria corretora.';
    end if;
  end if;

  return new;
end;
$$;
