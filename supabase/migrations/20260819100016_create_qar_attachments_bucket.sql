-- Bucket qar-attachments (privado), path {brokerage_id}/{quotation_id}/{filename}
-- — CLAUDE.md seção 12. Primeira spec a precisar dele de verdade (ver
-- .agents/specs/quotations/design.md). Sem policy de UPDATE — substituir um
-- anexo é apagar e subir de novo.

insert into storage.buckets (id, name, public)
values ('qar-attachments', 'qar-attachments', false)
on conflict (id) do nothing;

create policy qar_attachments_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'qar-attachments'
    and (storage.foldername(name))[1]::uuid = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
      or (get_my_role() = 'seller' and is_my_quotation(((storage.foldername(name))[2])::uuid))
    )
  );

create policy qar_attachments_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'qar-attachments'
    and (storage.foldername(name))[1]::uuid = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
      or (get_my_role() = 'seller' and is_my_quotation(((storage.foldername(name))[2])::uuid))
    )
  );

create policy qar_attachments_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'qar-attachments'
    and (storage.foldername(name))[1]::uuid = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
      or (get_my_role() = 'seller' and is_my_quotation(((storage.foldername(name))[2])::uuid))
    )
  );
