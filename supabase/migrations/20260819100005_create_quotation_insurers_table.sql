-- Tabela quotation_insurers: seguradoras convidadas pra uma cotação, com o
-- retorno de cada uma. is_winner substitui quotations.winning_insurer_id do
-- modelo antigo — evita a FK circular (ver .agents/specs/quotations/design.md).

create table quotation_insurers (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references quotations (id) on delete cascade,
  insurer_id uuid not null references insurers (id) on delete restrict,
  brokerage_id uuid not null references brokerages (id) on delete cascade,
  response_status insurer_response_status not null default 'pending',
  premium_amount numeric,
  deductible_amount numeric,
  commission_rate numeric,
  installments_count integer,
  insurer_quotation_number text,
  approved_coverages text,
  analyst_notes text,
  is_winner boolean not null default false,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (quotation_id, insurer_id),
  check (not is_winner or response_status = 'accepted')
);

create index quotation_insurers_quotation_id_idx on quotation_insurers (quotation_id);
create index quotation_insurers_brokerage_id_idx on quotation_insurers (brokerage_id);
