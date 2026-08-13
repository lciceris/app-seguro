-- Só um vendedor principal por cliente. Em vez de depender do frontend fazer
-- duas requisições (desmarcar o antigo, marcar o novo — janela de
-- inconsistência), o trigger desmarca qualquer outro is_primary do mesmo
-- client_id sempre que uma linha é gravada com is_primary = true (ver
-- .agents/specs/clients/design.md, Requirement 5.3).

create or replace function enforce_single_primary_seller()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_primary then
    update public.client_sellers
      set is_primary = false
      where client_id = new.client_id
        and id <> new.id
        and is_primary = true;
  end if;

  return new;
end;
$$;

create trigger trg_enforce_single_primary_seller
  after insert or update of is_primary on client_sellers
  for each row
  when (new.is_primary)
  execute function enforce_single_primary_seller();
