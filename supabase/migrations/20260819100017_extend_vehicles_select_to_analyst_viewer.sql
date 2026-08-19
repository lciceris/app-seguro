-- A RLS original de vehicles (20260814120003) deixou analyst e viewer sem
-- nenhum acesso de leitura, o que fazia sentido antes da spec quotations
-- existir. Agora a aba Veículos da cotação faz embed de vehicles(plate,
-- brand, model) e o analyst (calculista) é justamente quem trabalha nela —
-- sem select, o embed volta null e a UI mostra "—" no lugar da placa.
-- Estende a leitura (só select, nunca insert/update) pra analyst e viewer,
-- na mesma linha de leitura ampla que viewer já tem em clients.

drop policy vehicles_select on vehicles;

create policy vehicles_select
  on vehicles
  for select
  to authenticated
  using (
    brokerage_id = get_my_brokerage_id()
    and (
      get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
      or (get_my_role() = 'seller' and is_my_client(client_id))
    )
  );
