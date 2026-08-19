-- Tabela quotation_qar_attachments: arquivos anexados ao QAR de uma cotação
-- (ver .agents/specs/quotations/design.md). Bucket qar-attachments (privado),
-- path {brokerage_id}/{quotation_id}/{filename}.

create table quotation_qar_attachments (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references quotations (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size bigint not null,
  created_at timestamptz not null default now()
);

create index quotation_qar_attachments_quotation_id_idx on quotation_qar_attachments (quotation_id);
