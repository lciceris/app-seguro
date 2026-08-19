-- quotation_qar.renewed_policy_id: deixado de fora de propósito na spec
-- quotations (ver quotations/design.md, seção quotation_qar) — só agora
-- policies existe. Vínculo manual opcional: quem preenche o QAR indica que
-- a cotação é renovação de uma apólice já emitida pela própria plataforma.

alter table quotation_qar
  add column renewed_policy_id uuid references policies (id) on delete set null;
