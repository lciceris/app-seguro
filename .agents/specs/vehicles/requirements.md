# Requirements Document

## Introduction

Cadastro de veículos das frotas seguradas — cada veículo pertence a exatamente um cliente (`client_id`). É a base sobre a qual a futura spec de cotações vai se apoiar (`quotation_vehicles`), mas essa spec cobre só o cadastro do veículo em si — nada de cotação ainda.

Tabela operacional padrão (`brokerage_id` + RLS base — CLAUDE.md seção 6), com a mesma exceção já estabelecida em `clients`: `seller` só enxerga e edita os veículos dos clientes aos quais está vinculado (reaproveita a função `is_my_client(client_id)` criada na spec `clients` — um veículo é "meu" quando `is_my_client(vehicles.client_id)` é verdadeiro). `analyst` e `viewer` não têm nenhum acesso a veículos (diferente de `clients`, onde `viewer` tem leitura).

Veículo nunca é excluído de verdade — só inativado (`is_active = false`), mesmo padrão já usado em `users`/`brokerages`/`insurers`/`clients`.

Listagem é uma tela própria (`/vehicles`), não uma seção embutida no `client-detail-drawer` — decisão deliberada de escopo: com o volume de campos de um veículo e a necessidade de uma visão geral da frota (não só por cliente), uma screen dedicada, no mesmo padrão de `/clients`, é mais direta. Uma seção "Veículos deste cliente" dentro do detalhe do cliente fica para quando a spec de cotações precisar dessa navegação.

## Requirements

### Requirement 1: Cadastrar veículo

**User Story:** Como `platform_admin`, `brokerage_admin`, `supervisor` ou `seller`, quero cadastrar um veículo vinculado a um cliente, para começar a gerenciá-lo e futuramente incluí-lo em cotações.

#### Acceptance Criteria

1. WHEN um desses perfis submete os dados de um veículo pra um cliente específico (placa obrigatória; demais campos opcionais — chassi, código de identificação, RENAVAM, marca, modelo, ano de fabricação, ano do modelo, tipo, uso, combustível, código FIPE, valor FIPE, valor declarado, CEP de pernoite, UF principal, possui rastreador + modelo do rastreador, acessórios, condutor principal, possui histórico de sinistro, observações) THEN o sistema SHALL criar a linha em `vehicles` com `brokerage_id` do próprio usuário (nunca do formulário).
2. WHEN `seller` cadastra um veículo THEN o sistema SHALL permitir escolher só entre os próprios clientes (vinculados a ele via `client_sellers`); os demais perfis podem escolher qualquer cliente da corretora.
3. WHEN um perfil diferente de `platform_admin`, `brokerage_admin`, `supervisor` ou `seller` tenta cadastrar um veículo THEN o sistema SHALL negar a ação.

### Requirement 2: Listar veículos

**User Story:** Como usuário com acesso a veículos, quero ver a lista de veículos da minha corretora, para localizar rapidamente a frota que preciso gerenciar.

#### Acceptance Criteria

1. WHEN `platform_admin`, `brokerage_admin` ou `supervisor` acessa a listagem THEN o sistema SHALL exibir todos os veículos da própria corretora (placa, cliente, marca/modelo, tipo, status), com busca por placa, chassi ou nome do cliente.
2. WHEN `seller` acessa a listagem THEN o sistema SHALL exibir só os veículos dos clientes vinculados a ele, com a mesma busca.
3. WHEN `analyst` ou `viewer` tenta acessar essa listagem THEN o sistema SHALL negar o acesso.

### Requirement 3: Ver detalhe de um veículo

**User Story:** Como usuário com acesso a um veículo, quero ver o detalhe completo dele, para conferir todos os dados antes de atender ou editar.

#### Acceptance Criteria

1. WHEN um perfil com acesso ao veículo (conforme Requirement 2) abre o detalhe THEN o sistema SHALL exibir todos os campos cadastrados, incluindo o cliente ao qual pertence.
2. WHEN `seller` tenta abrir o detalhe de um veículo de um cliente ao qual não está vinculado THEN o sistema SHALL negar o acesso.

### Requirement 4: Editar veículo

**User Story:** Como `platform_admin`, `brokerage_admin`, `supervisor` ou `seller` (dos meus clientes), quero editar os dados de um veículo, para manter o cadastro atualizado.

#### Acceptance Criteria

1. WHEN `platform_admin`, `brokerage_admin` ou `supervisor` edita qualquer campo cadastral de um veículo da própria corretora THEN o sistema SHALL atualizar a linha correspondente.
2. WHEN `seller` edita um veículo de um cliente ao qual está vinculado THEN o sistema SHALL atualizar a linha correspondente; WHEN tenta editar um veículo de um cliente ao qual não está vinculado THEN o sistema SHALL negar a ação.
3. A troca do cliente vinculado ao veículo (`client_id`) segue a mesma regra de escolha do Requirement 1.2.

### Requirement 5: Inativar e reativar veículo

**User Story:** Como `platform_admin`, `brokerage_admin`, `supervisor` ou `seller`, quero inativar um veículo que saiu da frota (vendido, sinistrado, baixado), para deixar de vê-lo nas telas operacionais sem perder o histórico.

#### Acceptance Criteria

1. WHEN `platform_admin`, `brokerage_admin`, `supervisor` ou `seller` (do próprio cliente) inativa um veículo THEN o sistema SHALL alterar `is_active` para `false`, preservando todos os demais dados.
2. WHEN esse mesmo grupo reativa um veículo inativo THEN o sistema SHALL alterar `is_active` para `true`.
3. Veículo inativo continua listado (Requirement 2), com indicação visual do status — não desaparece da listagem.
4. WHEN `analyst` ou `viewer` tenta inativar ou reativar um veículo THEN o sistema SHALL negar a ação (nem sequer têm acesso de leitura, Requirement 2.3).
