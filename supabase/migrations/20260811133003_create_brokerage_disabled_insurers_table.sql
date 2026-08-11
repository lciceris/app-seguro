-- brokerage_disabled_insurers: lista de EXCEÇÕES, não um registro enabled por
-- combinação corretora×seguradora (ver .agents/specs/insurers/design.md).
-- Ausência de linha = seguradora habilitada pra aquela corretora (padrão).
-- Presença de linha = a corretora desabilitou aquela seguradora pra si.
-- "Desabilitar" é um INSERT; "reabilitar" é um DELETE dessa linha.

create table brokerage_disabled_insurers (
  brokerage_id uuid not null references brokerages (id) on delete cascade,
  insurer_id uuid not null references insurers (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (brokerage_id, insurer_id)
);
