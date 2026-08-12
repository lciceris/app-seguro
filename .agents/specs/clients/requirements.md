# Requirements Document

## Introduction

Cadastro de clientes das corretoras — pessoas físicas (PF) ou jurídicas (PJ) com frota segurada. É a base sobre a qual as futuras specs de veículos e cotações vão se apoiar (`vehicles.client_id`, `quotations.client_id`), mas essa spec cobre só o cadastro do cliente e o vínculo com vendedores — nada de veículos ou cotações ainda.

Tabela operacional padrão (`brokerage_id` + RLS base — CLAUDE.md seção 6), com uma exceção importante: `seller` só enxerga e edita os clientes aos quais está vinculado via `client_sellers`, enquanto os demais perfis com acesso veem todos os clientes da corretora.

Vínculo cliente-vendedor é N:N (`client_sellers`) — um cliente pode ter mais de um vendedor responsável, com um marcado como principal (`is_primary`). Quando um `seller` cadastra um cliente, ele é automaticamente vinculado como vendedor principal.

Cliente nunca é excluído de verdade — só inativado (`segment = 'inactive'`), mesmo padrão já usado em `users`/`brokerages`/`insurers`.

## Requirements

### Requirement 1: Cadastrar cliente

**User Story:** Como `seller`, `supervisor`, `brokerage_admin` ou `platform_admin`, quero cadastrar um novo cliente, para começar a gerenciar a frota dele e futuramente gerar cotações.

#### Acceptance Criteria

1. WHEN um desses perfis submete os dados de um cliente (tipo PF ou PJ; razão social/nome completo obrigatório; demais campos opcionais — nome fantasia, CPF/CNPJ, data de nascimento (PF), CNAE e setor (PJ), inscrição estadual, endereço completo (CEP/logradouro/número/complemento/bairro/cidade/UF), contato comercial (nome/cargo/e-mail/telefone), contato financeiro (nome/e-mail), segmento, origem do lead, observações) THEN o sistema SHALL criar a linha em `clients` com `brokerage_id` do próprio usuário (nunca do formulário) e `segment` padrão `lead` quando não informado.
2. WHEN `seller` cadastra um cliente THEN o sistema SHALL vinculá-lo automaticamente em `client_sellers` como vendedor principal (`is_primary = true`), sem tela adicional de seleção de vendedor.
3. WHEN `supervisor`, `brokerage_admin` ou `platform_admin` cadastra um cliente THEN o sistema SHALL permitir escolher um ou mais vendedores responsáveis (com um marcado como principal) no mesmo formulário — sem essa escolha, o cliente fica sem vendedor vinculado.
4. WHEN um perfil diferente de `seller`, `supervisor`, `brokerage_admin` ou `platform_admin` tenta cadastrar um cliente THEN o sistema SHALL negar a ação.

### Requirement 2: Listar clientes

**User Story:** Como usuário com acesso a clientes, quero ver a lista de clientes da minha corretora, para localizar rapidamente quem eu preciso atender.

#### Acceptance Criteria

1. WHEN `supervisor`, `brokerage_admin`, `platform_admin` ou `viewer` acessa a listagem THEN o sistema SHALL exibir todos os clientes da própria corretora (nome/razão social, tipo, CPF/CNPJ, segmento, cidade/UF), com busca por nome/razão social ou CPF/CNPJ.
2. WHEN `seller` acessa a listagem THEN o sistema SHALL exibir só os clientes vinculados a ele via `client_sellers`, com a mesma busca.
3. WHEN um perfil sem nenhum acesso a clientes (`analyst`) tenta acessar essa listagem THEN o sistema SHALL negar o acesso.

### Requirement 3: Ver detalhe de um cliente

**User Story:** Como usuário com acesso a um cliente, quero ver o detalhe completo dele, para conferir todos os dados antes de atender ou editar.

#### Acceptance Criteria

1. WHEN um perfil com acesso ao cliente (conforme Requirement 2) abre o detalhe THEN o sistema SHALL exibir todos os campos cadastrados, incluindo os vendedores vinculados (com indicação de quem é o principal).
2. WHEN `seller` tenta abrir o detalhe de um cliente ao qual não está vinculado THEN o sistema SHALL negar o acesso.

### Requirement 4: Editar cliente

**User Story:** Como `seller` (dos meus clientes), `supervisor`, `brokerage_admin` ou `platform_admin`, quero editar os dados de um cliente, para manter o cadastro atualizado.

#### Acceptance Criteria

1. WHEN `supervisor`, `brokerage_admin` ou `platform_admin` edita qualquer campo cadastral de um cliente da própria corretora THEN o sistema SHALL atualizar a linha correspondente.
2. WHEN `seller` edita um cliente ao qual está vinculado THEN o sistema SHALL atualizar a linha correspondente; WHEN tenta editar um cliente ao qual não está vinculado THEN o sistema SHALL negar a ação.
3. WHEN `viewer` tenta editar qualquer cliente THEN o sistema SHALL negar a ação.

### Requirement 5: Gerenciar vendedores vinculados a um cliente

**User Story:** Como `supervisor`, `brokerage_admin` ou `platform_admin`, quero adicionar ou remover vendedores vinculados a um cliente, para redistribuir a carteira quando necessário.

#### Acceptance Criteria

1. WHEN `supervisor`, `brokerage_admin` ou `platform_admin` adiciona um vendedor a um cliente THEN o sistema SHALL criar a linha em `client_sellers`.
2. WHEN `supervisor`, `brokerage_admin` ou `platform_admin` remove um vendedor de um cliente THEN o sistema SHALL remover a linha correspondente em `client_sellers`; SE o vendedor removido era o principal E ainda restar pelo menos um vendedor vinculado, o sistema SHALL exigir que um novo principal seja marcado antes de confirmar a remoção.
3. WHEN `supervisor`, `brokerage_admin` ou `platform_admin` marca um vendedor diferente como principal THEN o sistema SHALL desmarcar o anterior (só um principal por cliente).
4. WHEN `seller` tenta adicionar, remover ou trocar o principal de qualquer vínculo THEN o sistema SHALL negar a ação — `seller` só visualiza os vendedores vinculados ao próprio cliente (Requirement 3).

### Requirement 6: Inativar e reativar cliente

**User Story:** Como `supervisor`, `brokerage_admin` ou `platform_admin`, quero inativar um cliente que não faz mais parte da carteira ativa, para deixar de vê-lo nas telas operacionais sem perder o histórico.

#### Acceptance Criteria

1. WHEN `supervisor`, `brokerage_admin` ou `platform_admin` inativa um cliente THEN o sistema SHALL alterar `segment` para `inactive`, preservando todos os demais dados e vínculos.
2. WHEN `supervisor`, `brokerage_admin` ou `platform_admin` reativa um cliente inativo THEN o sistema SHALL alterar `segment` para `active` (não há necessidade de lembrar o segmento anterior — o usuário reclassifica manualmente se `active` não for o valor correto).
3. WHEN `seller` ou `viewer` tenta inativar ou reativar um cliente THEN o sistema SHALL negar a ação.
4. Cliente inativo continua listado (Requirement 2), com indicação visual do status — não desaparece da listagem.
