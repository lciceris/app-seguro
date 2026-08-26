# Requirements — brokerages-list-filters

## Introdução

A listagem de Corretoras (`brokerages-list-screen.tsx`) já tem busca por nome/CNPJ. O usuário pediu dois filtros adicionais na mesma tela: por status (Ativo/Inativo) e por plano.

## Escopo

**Dentro:** dois `Select` novos na toolbar da listagem de corretoras — status e plano — filtrando client-side, combinando com a busca já existente (AND entre todos os critérios ativos).

**Fora:** filtros em outras listagens (padrão pode ser replicado depois, mas não foi pedido agora). Nenhuma mudança de schema/query — `plan_id` e `status` já vêm na query atual de `list-brokerages.ts`.

## Requirements

### Requirement 1: Filtro por status

**User Story:** Como platform_admin, quero filtrar corretoras por status pra achar rápido só as ativas ou só as inativas.

#### Acceptance Criteria

1. A tela SHALL exibir um `Select` de status com opções "Todos os status" (padrão), "Ativo", "Inativo".
2. Ao selecionar um status, a tabela SHALL mostrar só corretoras com `status` igual ao selecionado.

### Requirement 2: Filtro por plano

**User Story:** Como platform_admin, quero filtrar corretoras por plano contratado.

#### Acceptance Criteria

1. A tela SHALL exibir um `Select` de plano com "Todos os planos" (padrão), "Sem plano", e um item por plano cadastrado (via `usePlans()`).
2. Ao selecionar "Sem plano", a tabela SHALL mostrar só corretoras com `plan_id` nulo.
3. Ao selecionar um plano específico, a tabela SHALL mostrar só corretoras com aquele `plan_id`.

### Requirement 3: Combinação com busca existente

**User Story:** Como usuário, quero poder usar busca e filtros ao mesmo tempo.

#### Acceptance Criteria

1. Busca por texto, filtro de status e filtro de plano SHALL se combinar com AND (todos os critérios ativos precisam bater).
2. Quando nenhum resultado bater com os filtros ativos, a tela SHALL exibir "Nenhuma corretora encontrada pra esse filtro." (distinto da mensagem de lista vazia sem nenhum filtro ativo).
