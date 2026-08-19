-- Tabela policy_attachments: documentos anexados a uma apólice (documento
-- oficial, condições gerais, boleto etc — mesmo padrão de
-- quotation_qar_attachments). Bucket policy-documents (privado), path
-- {brokerage_id}/{policy_id}/{filename}.

create table policy_attachments (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references policies (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size bigint not null,
  created_at timestamptz not null default now()
);

create index policy_attachments_policy_id_idx on policy_attachments (policy_id);
