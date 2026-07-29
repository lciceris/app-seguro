# Requirements Document

## Introduction

Fundação de autenticação e multi-tenancy do App Seguro: login, sessão, proteção de rota por perfil, definição de senha no primeiro acesso, e a modelagem núcleo (`brokerages`, `plans`, `users`, RLS) que todo o resto do sistema depende. É a primeira spec a ser implementada — nada mais funciona sem um usuário autenticado e escopado a uma corretora. A administração de outros usuários (convidar, resetar senha, desativar) é uma feature separada, ver `.agents/specs/users/`.

## Requirements

### Requirement 1: Login com email e senha

**User Story:** Como um usuário da corretora, quero fazer login com email e senha, para acessar a plataforma de acordo com meu perfil.

#### Acceptance Criteria

1. WHEN o usuário submete email e senha válidos THEN o sistema SHALL autenticar via Supabase Auth e criar uma sessão.
2. WHEN as credenciais são inválidas THEN o sistema SHALL exibir uma mensagem de erro genérica, sem indicar se o email existe ou não na base.
3. WHEN o login é bem-sucedido THEN o sistema SHALL redirecionar o usuário para a rota inicial do seu perfil (ver Requirement 4).
4. WHEN o usuário já está autenticado e acessa `/login` THEN o sistema SHALL redirecioná-lo direto para a rota inicial do seu perfil, sem exibir o formulário novamente.

### Requirement 2: Sessão e refresh

**User Story:** Como usuário autenticado, quero que minha sessão persista entre recarregamentos de página e se renove automaticamente, para não precisar logar de novo com frequência.

#### Acceptance Criteria

1. WHEN a página é recarregada e existe uma sessão válida THEN o sistema SHALL restaurar a sessão sem exigir novo login.
2. WHEN o access token está perto de expirar THEN o sistema SHALL renová-lo automaticamente usando o refresh token, sem interromper o usuário.
3. IF o refresh token também expirou ou é inválido THEN o sistema SHALL encerrar a sessão e redirecionar para `/login`.

### Requirement 3: Logout

**User Story:** Como usuário autenticado, quero poder sair da minha sessão, para proteger minha conta em dispositivos compartilhados.

#### Acceptance Criteria

1. WHEN o usuário aciona logout THEN o sistema SHALL invalidar a sessão no Supabase e limpar o estado local de autenticação.
2. WHEN o logout é concluído THEN o sistema SHALL redirecionar o usuário para `/login`.

### Requirement 4: Redirecionamento e proteção de rota por perfil

**User Story:** Como plataforma, quero garantir que cada perfil só acesse as rotas permitidas, para que usuários não vejam telas fora do seu escopo de permissão.

#### Acceptance Criteria

1. WHEN um usuário não autenticado tenta acessar qualquer rota protegida THEN o sistema SHALL redirecioná-lo para `/login`.
2. WHEN um usuário autenticado tenta acessar uma rota não permitida para o seu perfil THEN o sistema SHALL bloquear o acesso.
3. WHEN o login é bem-sucedido THEN o sistema SHALL redirecionar cada perfil para sua rota inicial: `platform_admin` → `/admin/insurers`, `brokerage_admin` → `/quotations`, `supervisor` → `/quotations`, `seller` → `/`, `analyst` → `/`, `viewer` → `/clients`.
4. WHEN um usuário autenticado tem `status = inactive` THEN o sistema SHALL tratá-lo como sem sessão válida para fins de proteção de rota (ver `.agents/specs/users/requirements.md`, Requirement de desativação).

### Requirement 5: Modelagem de usuário e corretora (fundação de multi-tenancy)

**User Story:** Como plataforma, quero que todo usuário esteja vinculado a uma corretora e a um perfil, para que o isolamento de dados por corretora funcione desde o login.

#### Acceptance Criteria

1. WHEN um usuário é criado THEN o sistema SHALL vinculá-lo a exatamente uma corretora (`brokerage_id`) e a exatamente um perfil (`role`).
2. WHEN uma policy de RLS precisa saber o perfil ou a corretora do usuário logado THEN o sistema SHALL usar as funções `get_my_role()`/`get_my_brokerage_id()` — nunca uma subquery direta em `users`.
3. WHEN qualquer tabela operacional é consultada THEN o sistema SHALL retornar apenas linhas cujo `brokerage_id` corresponda ao da corretora do usuário logado — exceto tabelas globais (`insurers`, `plans`), que não têm esse filtro.

### Requirement 6: Definir senha após convite

**User Story:** Como usuário recém-convidado, quero definir minha própria senha no primeiro acesso, para não depender de uma senha temporária compartilhada por email.

#### Acceptance Criteria

1. WHEN um usuário convidado acessa o link do email de convite THEN o sistema SHALL apresentar uma tela para definir a senha.
2. WHEN a senha é definida com sucesso THEN o sistema SHALL autenticar o usuário e redirecioná-lo para a rota inicial do seu perfil.
