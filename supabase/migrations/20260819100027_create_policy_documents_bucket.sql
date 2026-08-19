-- Bucket policy-documents (privado), path {brokerage_id}/{policy_id}/{filename}
-- — mesmo padrão de qar-attachments. Sem policy de UPDATE — substituir um
-- anexo é apagar e subir de novo.

insert into storage.buckets (id, name, public)
values ('policy-documents', 'policy-documents', false)
on conflict (id) do nothing;

create policy policy_documents_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'policy-documents'
    and (storage.foldername(name))[1]::uuid = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
      or (get_my_role() = 'seller' and is_my_policy_client(((storage.foldername(name))[2])::uuid))
    )
  );

create policy policy_documents_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'policy-documents'
    and (storage.foldername(name))[1]::uuid = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
  );

create policy policy_documents_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'policy-documents'
    and (storage.foldername(name))[1]::uuid = get_my_brokerage_id()
    and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
  );
