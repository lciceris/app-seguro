-- Tabela quotation_insurer_events: histórico de eventos e comentários por
-- seguradora dentro de uma cotação (ver .agents/specs/quotations/design.md).

create table quotation_insurer_events (
  id uuid primary key default gen_random_uuid(),
  quotation_insurer_id uuid not null references quotation_insurers (id) on delete cascade,
  brokerage_id uuid not null references brokerages (id) on delete cascade,
  event_type quotation_event_type not null,
  content text not null,
  field_changed text,
  old_value text,
  new_value text,
  author_id uuid references users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index quotation_insurer_events_quotation_insurer_id_idx
  on quotation_insurer_events (quotation_insurer_id);
create index quotation_insurer_events_brokerage_id_idx on quotation_insurer_events (brokerage_id);
