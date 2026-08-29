-- Código já migrado pra usar client_status (ver 20260829160000). segment/
-- lead_source não são mais referenciados em lugar nenhum — remove ambos e
-- o enum client_segment, encerrando o Requirement 6 de
-- .agents/specs/client-form-redesign/design.md.

alter table clients drop column segment;
alter table clients drop column lead_source;

drop type client_segment;
