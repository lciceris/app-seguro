# Requirements Document

## Introduction

Gestão das corretoras-cliente da plataforma. Depende da fundação de autenticação e multi-tenancy já implementada em `.agents/specs/auth/` (tabelas `brokerages`/`plans`/`users`, RLS base, `get_my_role()`/`get_my_brokerage_id()`) e da administração de usuários em `.agents/specs/users/` (o convite do primeiro admin de uma corretora nova reaproveita o mesmo mecanismo).

Diferente de todas as outras entidades operacionais do sistema, `brokerages` tem dois níveis de gestão bem distintos:
- **`platform_admin`** gerencia as corretoras-cliente como um todo (cria, lista, edita, desativa/reativa) — é a única exceção ao isolamento multi-tenant padrão, e só se aplica à entidade `brokerages` em si, nunca aos dados operacionais (clientes, cotações etc.) de dentro de cada corretora.
- **`brokerage_admin`** (e o próprio `platform_admin`, quando dono da corretora especial da plataforma) só edita os dados de identidade visual da própria corretora.

`platform_admin` não pertence a nenhuma corretora-cliente normal — existe uma corretora especial, reservada pra quem opera a plataforma, que nunca aparece na listagem que `platform_admin` gerencia.

## Requirements

### Requirement 1: Corretora especial da plataforma

**User Story:** Como operador da plataforma, quero que usuários `platform_admin` pertençam a uma corretora própria da plataforma, para que a gestão de corretoras-cliente nunca se confunda com "a corretora de quem está gerenciando".

#### Acceptance Criteria

1. Existe uma corretora reservada (seed/migration, id conhecido) destinada exclusivamente a usuários `platform_admin`.
2. WHEN a listagem de corretoras-cliente (Requirement 3) é exibida THEN o sistema SHALL excluir essa corretora especial do resultado.
3. A corretora especial segue as mesmas regras de RLS de qualquer outra — não tem tratamento privilegiado de acesso a dados, só é excluída da listagem de gestão.

### Requirement 2: Criar corretora (com o primeiro admin)

**User Story:** Como `platform_admin`, quero cadastrar uma nova corretora-cliente já com seu primeiro administrador, para dar onboarding completo sem depender de scripts manuais.

#### Acceptance Criteria

1. WHEN `platform_admin` submete os dados da nova corretora (nome) e do primeiro administrador (nome, email) THEN o sistema SHALL criar a linha em `brokerages` E convidar esse usuário como `brokerage_admin` dela, reaproveitando o mecanismo de convite da spec `users` (Edge Function, envio de email, fluxo de "definir senha").
2. IF a criação do usuário administrador falhar (ex: email inválido) THEN o sistema SHALL desfazer a criação da corretora — nunca deixar uma corretora órfã sem nenhum administrador.
3. WHEN um perfil diferente de `platform_admin` tenta criar uma corretora THEN o sistema SHALL negar a ação.
4. A corretora nasce sem plano vinculado (`plan_id` nulo) — vincular um plano é uma ação de edição separada (Requirement 4), não faz parte da criação.

### Requirement 3: Listar corretoras

**User Story:** Como `platform_admin`, quero ver a lista de todas as corretoras-cliente da plataforma, para ter visão geral de quem está usando o sistema.

#### Acceptance Criteria

1. WHEN `platform_admin` acessa a listagem THEN o sistema SHALL exibir todas as corretoras (nome, plano vinculado, status, data de criação), exceto a corretora especial da plataforma (Requirement 1).
2. WHEN um perfil diferente de `platform_admin` tenta acessar essa listagem THEN o sistema SHALL negar o acesso.

### Requirement 4: Ver detalhe e editar uma corretora (platform_admin)

**User Story:** Como `platform_admin`, quero ver o detalhe e editar os dados de qualquer corretora-cliente, para corrigir informações ou ajustar o plano vinculado.

#### Acceptance Criteria

1. WHEN `platform_admin` abre o detalhe de uma corretora THEN o sistema SHALL exibir nome, plano vinculado, status, logo e cor primária.
2. WHEN `platform_admin` edita nome ou plano vinculado de uma corretora THEN o sistema SHALL atualizar a linha correspondente.
3. A edição de logo/cor primária não faz parte da gestão do `platform_admin` — é responsabilidade exclusiva do `brokerage_admin` da própria corretora (Requirement 6), já que é identidade visual operacional, não um dado administrativo da plataforma.
4. WHEN um perfil diferente de `platform_admin` tenta ver o detalhe ou editar por essa via THEN o sistema SHALL negar a ação.

### Requirement 5: Desativar e reativar uma corretora

**User Story:** Como `platform_admin`, quero poder desativar uma corretora-cliente, para bloquear o acesso de todos os usuários dela (ex: inadimplência, encerramento de contrato) sem perder o histórico de dados.

#### Acceptance Criteria

1. WHEN `platform_admin` desativa uma corretora THEN o sistema SHALL atualizar seu `status` para inativo — a linha nunca é deletada, e todo dado historicamente vinculado a ela permanece intacto.
2. WHEN uma corretora está com `status` inativo THEN as funções `get_my_role()`/`get_my_brokerage_id()` SHALL considerar **todos** os usuários dela sem role/corretora válidos, independentemente do `status` individual de cada usuário — a RLS bloqueia toda leitura/escrita.
3. WHEN um usuário de uma corretora inativa autentica com sucesso (credenciais ainda válidas) THEN o frontend SHALL detectar isso logo após o login, encerrar a sessão e exibir uma mensagem de acesso bloqueado — mesmo mecanismo já usado para usuário individual desativado (`.agents/specs/users/requirements.md`, Requirement 3), adaptado para deixar claro que o bloqueio é da corretora, não da conta da pessoa.
4. WHEN `platform_admin` reativa uma corretora previamente desativada THEN o sistema SHALL atualizar seu `status` de volta para ativo, restaurando o acesso de todos os usuários que já estavam ativos individualmente — sem exigir novo convite.
5. WHEN um perfil diferente de `platform_admin` tenta desativar ou reativar uma corretora THEN o sistema SHALL negar a ação.

### Requirement 6: Editar a própria corretora (brokerage_admin)

**User Story:** Como `brokerage_admin`, quero editar os dados de identidade visual da minha corretora (nome, logo, cor primária), para personalizar a operação sem depender de suporte da plataforma.

#### Acceptance Criteria

1. WHEN `brokerage_admin` edita nome, logo ou cor primária da própria corretora THEN o sistema SHALL atualizar a linha correspondente.
2. `brokerage_admin` NÃO pode alterar o plano vinculado nem o `status` da própria corretora — essas ações são exclusivas de `platform_admin` (Requirements 4 e 5).
3. WHEN um perfil diferente de `brokerage_admin`/`platform_admin` tenta editar a corretora THEN o sistema SHALL negar a ação.
4. `platform_admin`, quando autenticado sob a corretora especial da plataforma (Requirement 1), também pode editar os próprios dados de identidade visual por esta mesma via.
