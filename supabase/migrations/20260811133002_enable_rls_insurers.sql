-- RLS de insurers: leitura restrita a platform_admin/brokerage_admin (os únicos
-- perfis com alguma tela que precisa do catálogo — não é leitura ampla como
-- plans). Escrita exclusiva de platform_admin. Sem policy de DELETE — cadastro
-- nunca é removido (ver .agents/specs/insurers/design.md).

alter table insurers enable row level security;

create policy insurers_select_managed
  on insurers
  for select
  to authenticated
  using (get_my_role() in ('platform_admin', 'brokerage_admin'));

create policy insurers_insert_platform_admin
  on insurers
  for insert
  to authenticated
  with check (get_my_role() = 'platform_admin');

create policy insurers_update_platform_admin
  on insurers
  for update
  to authenticated
  using (get_my_role() = 'platform_admin')
  with check (get_my_role() = 'platform_admin');
