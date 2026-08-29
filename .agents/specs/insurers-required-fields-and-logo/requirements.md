# Requirements — insurers-required-fields-and-logo

## Introdução

A spec original de `insurers` (`.agents/specs/insurers/`) definiu só `name` como obrigatório, com CNPJ opcional, e nunca previu logo. O usuário pediu pra tornar nome e CNPJ obrigatórios e adicionar upload de logotipo — mudando a regra de negócio documentada originalmente.

## Escopo

**Dentro:**
- `name` (já obrigatório) e `cnpj` (hoje opcional) obrigatórios em criar/editar seguradora — validação no formulário (Zod) e no banco (`NOT NULL`).
- Campo de upload de logotipo, reaproveitando o mecanismo já usado em corretoras (`upload-brokerage-logo`, bucket dedicado): funciona tanto na criação quanto na edição.
- Exibição do logo no drawer de detalhe (senão o upload nunca aparece de volta pra ninguém ver).

**Fora:**
- Máscara de CNPJ no campo (hoje é texto livre nas seguradoras, diferente de corretoras que usam `formatCnpj`) — não foi pedido, fica pra quando/se pedirem.
- Coluna de logo na listagem (`insurers-list-screen`) — não existe precedente disso em nenhuma outra listagem do app; fica de fora até ser pedido.
- Qualquer mudança em `insurer-catalog-screen` (visão do brokerage_admin pra habilitar/desabilitar seguradora) — fora do pedido.

## Decisão que exige limpeza de dados

Hoje existem 2 seguradoras cadastradas (dados de teste de specs anteriores, sem CNPJ) — `alter column cnpj set not null` exige que elas deixem de violar a constraint. Como são registros de teste (`Seguradora DebugPolicy`, `Verify Task7 Insurer`), a migration remove as linhas com `cnpj is null` antes de aplicar o `NOT NULL`. Se alguma seguradora real sem CNPJ existisse, essa decisão teria que ser revista — não é o caso aqui.

## Requirements

### Requirement 1: Nome e CNPJ obrigatórios

**User Story:** Como platform_admin, quero ser impedido de cadastrar uma seguradora sem nome ou CNPJ.

#### Acceptance Criteria

1. Os formulários de criar e editar seguradora SHALL exigir `name` e `cnpj` (mensagem de erro inline, mesmo padrão já usado pra `name`).
2. A coluna `cnpj` da tabela `insurers` SHALL ser `NOT NULL` no banco.
3. Registros de teste existentes sem CNPJ SHALL ser removidos como parte da migration que aplica a constraint (não há seguradora real sem CNPJ hoje).

### Requirement 2: Upload de logotipo

**User Story:** Como platform_admin, quero enviar o logotipo de uma seguradora ao cadastrar ou editar.

#### Acceptance Criteria

1. A tabela `insurers` SHALL ganhar uma coluna `logo_url` (nullable, mesmo formato de `brokerages.logo_url`).
2. O formulário de criar seguradora SHALL permitir selecionar uma imagem (PNG/JPG/SVG, até 2MB) antes de salvar; como o caminho no Storage depende do id, o upload real acontece depois do insert, com um update pontual de `logo_url` em seguida (mesmo padrão de `create-brokerage-drawer`).
3. O formulário de editar seguradora SHALL permitir trocar ou remover o logotipo existente.
4. O drawer de detalhe da seguradora SHALL exibir o logotipo quando existir.
5. O upload SHALL usar um bucket de Storage próprio (`insurer-assets`, público), com escrita restrita a `platform_admin` — não reaproveita `brokerage-assets` (convenção de path por `brokerage_id` não se aplica a seguradoras, que são um catálogo global sem dono).
