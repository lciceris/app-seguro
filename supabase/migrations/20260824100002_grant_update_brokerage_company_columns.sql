-- Bug real encontrado em verificação manual: a migration original
-- (20260803004716) fazia GRANT UPDATE só em name/logo_url/primary_color/
-- plan_id/status. As colunas de empresa (Task 11) e plan_expires_at
-- (Task 15) nunca ganharam GRANT — RLS passava, mas o Postgres barrava
-- antes disso com "permission denied for table brokerages" (GRANT
-- column-level é checado antes das policies). Toda edição dessas colunas
-- pelo authenticated (own-brokerage-screen, edit-brokerage-drawer) estava
-- silenciosamente quebrada.
grant update (
  trade_name, tax_id, business_code, state_registration, email, phone,
  zip_code, street, street_number, complement, neighborhood, city, state,
  representative_name, representative_email, financial_name, financial_email,
  plan_expires_at
) on public.brokerages to authenticated;
