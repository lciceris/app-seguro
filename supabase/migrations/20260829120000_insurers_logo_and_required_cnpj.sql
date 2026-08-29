-- insurers ganha logo_url (mesmo formato de brokerages.logo_url) e cnpj
-- vira obrigatório (spec insurers-required-fields-and-logo).

alter table insurers add column logo_url text;

-- Únicos 2 registros hoje são dados de teste de specs anteriores, sem CNPJ
-- real. Tentativa de DELETE falhou (referenciadas por quotation_insurers/
-- policies de teste via "on delete restrict") — em vez de arrastar a
-- limpeza pra outras tabelas, só preenche um CNPJ placeholder óbvio pra
-- não violar a constraint (não existe seguradora de verdade sem CNPJ hoje).
update insurers set cnpj = '00000000000000' where cnpj is null;

alter table insurers alter column cnpj set not null;
