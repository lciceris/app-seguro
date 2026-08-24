-- Cadastro completo de empresa em brokerages (gap identificado em teste manual
-- vs. o que já existe em clients e no sistema antigo fleet-auth-gate).
-- Ver .agents/specs/brokerages/design.md, seção "Extensão: cadastro completo de empresa".

alter table public.brokerages
  add column trade_name text,
  add column tax_id text unique,
  add column business_code text,
  add column state_registration text,
  add column email text,
  add column phone text,
  add column zip_code text,
  add column street text,
  add column street_number text,
  add column complement text,
  add column neighborhood text,
  add column city text,
  add column state text,
  add column representative_name text,
  add column representative_email text,
  add column financial_name text,
  add column financial_email text,
  add column plan_expires_at date;
