-- Quando um seller cria um cliente, ele precisa ficar vinculado automaticamente
-- como principal (Requirement 1.2) — mas client_sellers_insert (migration
-- anterior) só libera platform_admin/brokerage_admin/supervisor, de propósito
-- (Requirement 5.4: seller nunca gerencia vínculo diretamente). Resolvido com
-- um trigger SECURITY DEFINER que insere em nome do sistema, sem abrir uma
-- brecha de INSERT direto pra seller em client_sellers (ver
-- .agents/specs/clients/design.md).

create or replace function auto_link_seller_as_primary()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.get_my_role() = 'seller' then
    insert into public.client_sellers (client_id, seller_id, is_primary)
    values (new.id, auth.uid(), true);
  end if;

  return new;
end;
$$;

create trigger trg_auto_link_seller_as_primary
  after insert on clients
  for each row
  execute function auto_link_seller_as_primary();
