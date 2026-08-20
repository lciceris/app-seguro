-- Colunas de versionamento pra endosso (ver .agents/specs/policy-endorsements/design.md).
-- previous_version_id é conceito diferente de renewed_from_policy_id: renovação é
-- nova vigência/nova cotação; endosso é mesma vigência, ajuste de conteúdo dentro
-- do mesmo contrato (policy_number não muda).
--
-- root_policy_id fica null na primeira versão de cada apólice — toda consulta que
-- precisa achar a raiz da cadeia usa coalesce(root_policy_id, id).

alter table policies
  add column previous_version_id uuid references policies (id) on delete set null,
  add column root_policy_id uuid references policies (id) on delete set null;
