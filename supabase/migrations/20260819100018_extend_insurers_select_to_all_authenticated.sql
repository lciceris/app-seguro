-- A RLS original de insurers (20260811133002) restringia leitura a
-- platform_admin/brokerage_admin porque, na época, só a tela de catálogo
-- (platform_admin) e /my-insurers (brokerage_admin) precisavam dela. A aba
-- Seguradoras da cotação (spec quotations) quebra essa premissa: qualquer
-- perfil com acesso à cotação (seller, analyst, supervisor, viewer) precisa
-- ver o nome da seguradora no embed de quotation_insurers, e quem convida
-- (analyst e acima) precisa do catálogo pra montar o seletor. `insurers` não
-- tem brokerage_id (catálogo global, sem dado sensível de outra corretora) —
-- não há razão pra restringir leitura por role, só escrita continua exclusiva
-- de platform_admin.

drop policy insurers_select_managed on insurers;

create policy insurers_select_all_authenticated
  on insurers
  for select
  to authenticated
  using (true);
