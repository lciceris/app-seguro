-- ALTER TYPE ... ADD VALUE não pode rodar dentro do mesmo bloco de transação
-- de outras alterações (restrição do Postgres) — por isso é uma migration só
-- com isso. 'superseded' é a versão de apólice substituída por um endosso
-- que muda conteúdo (diferente de 'renewed', substituída por renovação, e de
-- 'cancelled', terminal sem substituta). Ver .agents/specs/policy-endorsements/design.md.

alter type policy_status add value 'superseded';
