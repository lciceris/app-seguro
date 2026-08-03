-- Exceção documentada ao isolamento multi-tenant: platform_admin gerencia a entidade
-- brokerages como um todo (ver .agents/specs/brokerages/requirements.md, Requirement 3).
-- Vale só pra essa tabela — nunca se estende a dados operacionais de dentro de cada
-- corretora (clients, quotations etc.).

create policy brokerages_select_all_platform_admin
  on brokerages
  for select
  to authenticated
  using (get_my_role() = 'platform_admin');
