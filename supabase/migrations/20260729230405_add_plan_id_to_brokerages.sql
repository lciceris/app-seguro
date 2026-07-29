-- Lacuna do schema da spec `auth`: brokerages não tinha vínculo com plans,
-- necessário pra can_add_user() (ver .agents/specs/users/design.md) saber o
-- limite de usuários de uma corretora. Nullable: sem plano vinculado = sem
-- limite (até existir uma feature de billing/planos que force a atribuição).

alter table brokerages
  add column plan_id uuid references plans (id);
