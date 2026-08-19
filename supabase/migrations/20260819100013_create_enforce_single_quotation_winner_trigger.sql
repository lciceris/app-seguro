-- Só uma seguradora vencedora por cotação. Mesmo padrão de
-- enforce_single_primary_seller (spec clients) — desmarca qualquer outra
-- is_winner do mesmo quotation_id sempre que uma linha é gravada com
-- is_winner = true (ver .agents/specs/quotations/design.md, Requirement 7.1).

create or replace function enforce_single_quotation_winner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_winner then
    update public.quotation_insurers
      set is_winner = false
      where quotation_id = new.quotation_id
        and id <> new.id
        and is_winner = true;
  end if;

  return new;
end;
$$;

create trigger trg_enforce_single_quotation_winner
  after insert or update of is_winner on quotation_insurers
  for each row
  when (new.is_winner)
  execute function enforce_single_quotation_winner();
