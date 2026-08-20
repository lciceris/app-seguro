-- A unicidade de quotation_id em policies (spec policies) partia do
-- pressuposto de que só existe uma versão por apólice. Com endossos
-- (policy-endorsements), toda nova versão herda o mesmo quotation_id da
-- versão anterior (ver apply_policy_endorsement_effect) — a segunda versão
-- em diante violaria a constraint. Troca por um índice simples (ainda útil
-- pra buscas por quotation_id, só não é mais único).

alter table policies drop constraint policies_quotation_id_key;

create index policies_quotation_id_idx on policies (quotation_id);
