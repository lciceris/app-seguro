-- Bucket brokerage-assets (público), path {brokerage_id}/logo — logo da
-- corretora. Público porque é exibido na UI sem autenticação (sidebar,
-- cor dinâmica). platform_admin pode escrever em qualquer pasta (define o
-- logo no onboarding, Requirement 2); brokerage_admin só na própria
-- (Requirement 6). Sem policy de SELECT — bucket público dispensa RLS
-- pra leitura.

insert into storage.buckets (id, name, public)
values ('brokerage-assets', 'brokerage-assets', true)
on conflict (id) do nothing;

create policy brokerage_assets_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'brokerage-assets'
    and (
      get_my_role() = 'platform_admin'
      or (storage.foldername(name))[1]::uuid = get_my_brokerage_id()
    )
  );

create policy brokerage_assets_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'brokerage-assets'
    and (
      get_my_role() = 'platform_admin'
      or (storage.foldername(name))[1]::uuid = get_my_brokerage_id()
    )
  );

create policy brokerage_assets_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'brokerage-assets'
    and (
      get_my_role() = 'platform_admin'
      or (storage.foldername(name))[1]::uuid = get_my_brokerage_id()
    )
  );
