-- Bucket insurer-assets (público), path {insurer_id}/logo — logo da
-- seguradora. Espelha brokerage-assets, mas sem checagem de pasta por
-- tenant: seguradoras são um catálogo global sem dono, toda escrita é
-- platform_admin (insurers_insert_platform_admin/insurers_update_platform_admin
-- já seguem essa regra na própria tabela).

insert into storage.buckets (id, name, public)
values ('insurer-assets', 'insurer-assets', true)
on conflict (id) do nothing;

create policy insurer_assets_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'insurer-assets'
    and get_my_role() = 'platform_admin'
  );

create policy insurer_assets_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'insurer-assets'
    and get_my_role() = 'platform_admin'
  );

create policy insurer_assets_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'insurer-assets'
    and get_my_role() = 'platform_admin'
  );

-- Sem essa policy, upload(..., { upsert: true }) falha com "new row violates
-- row-level security policy" mesmo no primeiro upload (sem conflito real) —
-- mesmo bug documentado/corrigido em brokerage-assets
-- (20260825100001_add_brokerage_assets_select_policy.sql): bucket público
-- dispensa RLS pra servir bytes via URL, mas o storage-api ainda roda uma
-- query normal (sujeita a RLS) pra checar conflito no upsert.
create policy insurer_assets_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'insurer-assets'
    and get_my_role() = 'platform_admin'
  );
