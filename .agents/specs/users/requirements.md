# Requirements Document

## Introduction

Administração de outros usuários da corretora: listar, convidar, editar, ver detalhe, reset de senha e desativação/reativação. Depende da fundação de autenticação e multi-tenancy já implementada em `.agents/specs/auth/` (tabelas `brokerages`/`plans`/`users`, RLS base, `get_my_role()`/`get_my_brokerage_id()`) — esta spec só estende aquela base com as capacidades de gerenciar contas de terceiros.

## Requirements

### Requirement 1: Convite de novo usuário

**User Story:** Como admin de corretora (ou `platform_admin`), quero convidar um novo usuário, para dar acesso a novos membros da equipe sem que eles se auto-cadastrem.

#### Acceptance Criteria

1. WHEN um `brokerage_admin` ou `platform_admin` submete um convite (nome, email, telefone, perfil) THEN o sistema SHALL criar o usuário no Supabase Auth, inserir a linha correspondente em `users` com o `brokerage_id` de quem convida, e enviar um email de convite.
2. IF a corretora já atingiu o limite de usuários do seu plano THEN o sistema SHALL bloquear o convite e informar o motivo.
3. WHEN um perfil sem permissão (`seller`, `analyst`, `viewer`, `supervisor`) tenta convidar um usuário THEN o sistema SHALL negar a ação.
4. WHEN o convite é concluído THEN a pessoa convidada segue o fluxo de "definir senha" já coberto em `.agents/specs/auth/requirements.md` (Requirement 6).

### Requirement 2: Reset de senha por um admin

**User Story:** Como admin de corretora, quero poder resetar a senha de outro usuário da minha corretora, para ajudá-lo caso ele perca acesso à própria conta.

#### Acceptance Criteria

1. WHEN um `brokerage_admin` ou `platform_admin` reseta a senha de um usuário THEN o sistema SHALL atualizar a senha via Edge Function `update-user-password` — nunca diretamente do client, que não tem privilégio para isso.
2. WHEN um perfil sem permissão tenta resetar a senha de outro usuário THEN o sistema SHALL negar a ação.

### Requirement 3: Desativar usuário

**User Story:** Como admin de corretora, quero poder desativar um usuário, para revogar o acesso de alguém que saiu da equipe sem perder o histórico de dados vinculado a ele (cotações criadas, clientes associados, etc.).

#### Acceptance Criteria

1. WHEN um `brokerage_admin` ou `platform_admin` desativa um usuário THEN o sistema SHALL atualizar `status` para `inactive` em `users` — a linha nunca é deletada, e todo dado historicamente vinculado a esse usuário permanece intacto.
2. WHEN um usuário com `status = inactive` faz qualquer requisição (mesmo com uma sessão ainda tecnicamente válida) THEN as funções `get_my_role()`/`get_my_brokerage_id()` SHALL considerá-lo sem role/corretora válidos, e a RLS SHALL bloquear toda leitura/escrita.
3. WHEN um usuário desativado autentica com sucesso (credenciais ainda válidas no Supabase Auth) THEN o frontend SHALL detectar `status = inactive` logo após o login, encerrar a sessão e exibir uma mensagem de conta desativada — nunca deixar a pessoa numa tela quebrada por falta de dado.
4. WHEN um perfil sem permissão tenta desativar um usuário THEN o sistema SHALL negar a ação.
5. WHEN um `brokerage_admin` ou `platform_admin` reativa um usuário previamente desativado THEN o sistema SHALL atualizar `status` de volta para `active`, restaurando o acesso sem exigir um novo convite.

### Requirement 4: Editar usuário

**User Story:** Como admin de corretora, quero editar os dados de um usuário (nome, telefone, perfil), para corrigir informações ou ajustar o nível de acesso de alguém sem precisar desativar e reconvidar.

#### Acceptance Criteria

1. WHEN um `brokerage_admin` ou `platform_admin` edita nome, telefone ou perfil de um usuário da própria corretora THEN o sistema SHALL atualizar a linha correspondente em `users`.
2. WHEN um perfil sem permissão tenta editar outro usuário THEN o sistema SHALL negar a ação.
3. O e-mail do usuário não é editável nesta spec — mudar o e-mail de login exige um fluxo de verificação do Supabase Auth fora do escopo atual.

### Requirement 5: Ver detalhe de um usuário

**User Story:** Como admin de corretora ou supervisor, quero ver o detalhe completo de um usuário, para confirmar informações antes de editar ou tomar uma ação sobre a conta dele.

#### Acceptance Criteria

1. WHEN um `brokerage_admin`, `platform_admin` ou `supervisor` abre o detalhe de um usuário da própria corretora THEN o sistema SHALL exibir seus dados (nome, email, telefone, perfil, status).
2. WHEN um perfil sem acesso geral a `users` (`seller`, `analyst`, `viewer`) tenta abrir o detalhe de outro usuário THEN o sistema SHALL negar o acesso.
