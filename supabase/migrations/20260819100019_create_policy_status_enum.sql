-- Enum de status da apólice (spec policies). expiring_soon/expired NÃO
-- entram aqui — são calculados no frontend a partir de coverage_end, igual
-- ao modelo antigo (ver .agents/specs/policies/design.md). cancelled existe
-- no enum porque o schema precisa do estado final, mas nenhuma ação desta
-- spec o produz — fica pra spec futura policy-endorsements.

create type policy_status as enum ('active', 'cancelled', 'renewed');
