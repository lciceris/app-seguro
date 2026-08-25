-- Bug real encontrado em verificação manual: upload("...", { upsert: true })
-- falhava com "new row violates row-level security policy" mesmo no
-- primeiro upload (sem conflito real). O bucket público dispensa RLS pra
-- servir bytes via URL pública, mas o storage-api ainda roda uma query SQL
-- normal (sujeita a RLS) pra checar conflito no upsert — sem uma policy de
-- SELECT em storage.objects, essa checagem falha e o upsert é negado.
create policy brokerage_assets_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'brokerage-assets'
    and (
      get_my_role() = 'platform_admin'
      or (storage.foldername(name))[1]::uuid = get_my_brokerage_id()
    )
  );
