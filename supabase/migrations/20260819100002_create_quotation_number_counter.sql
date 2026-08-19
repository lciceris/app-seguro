-- Numeração sequencial de cotações (QT-<ano>-<sequencial com 4 dígitos>),
-- por corretora/ano. UPSERT ... RETURNING é atômico — duas inserções
-- concorrentes pra mesma corretora/ano serializam no lock da linha do
-- contador, sem race condition (ver .agents/specs/quotations/design.md).

create table quotation_number_counters (
  brokerage_id uuid not null references brokerages (id) on delete cascade,
  year integer not null,
  last_number integer not null default 0,
  primary key (brokerage_id, year)
);

create or replace function generate_quotation_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_year integer := extract(year from now());
  v_next integer;
begin
  insert into public.quotation_number_counters (brokerage_id, year, last_number)
    values (new.brokerage_id, v_year, 1)
    on conflict (brokerage_id, year)
    do update set last_number = public.quotation_number_counters.last_number + 1
    returning last_number into v_next;

  new.number := 'QT-' || v_year || '-' || lpad(v_next::text, 4, '0');
  return new;
end;
$$;
