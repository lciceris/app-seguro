# Requirements — app-shell

## Introdução

Hoje o app-seguro não tem nenhum chrome de layout compartilhado — cada página é renderizada sozinha, sem sidebar, sem header, sem navegação nenhuma. A única forma de ir de uma tela pra outra é digitando a URL direto. Essa spec cria a estrutura de navegação e o header do usuário logado.

**Escopo deliberadamente limitado a estrutura** — combinado com o usuário: essa spec cobre só a "casca" (sidebar com os itens de menu, header com avatar/nome, dropdown com as opções). Edição de perfil de verdade (trocar foto, editar dados, trocar senha) fica pra uma spec futura à parte; aqui o item "Meu perfil" no dropdown pode não ter tela de destino ainda, ou linkar pra um placeholder.

Não é uma feature de negócio nova — é fundação de UI usada por todas as páginas já existentes (`/`, `/quotations`, `/policies`, `/clients`, `/vehicles`, `/users`, `/admin/insurers`, `/my-insurers`, `/brokerages`, `/my-brokerage`), sem mudar o comportamento interno de nenhuma delas.

### Já disponível, reaproveitado por essa spec

- `useAuthStore().usuario` já expõe `full_name`, `avatar_url`, `role`, `brokerage_name`, `logo_url`, `primary_color` — sem necessidade de nova query.
- `useLogout` (feature `auth`) já implementa o logout.
- O mapeamento de quais perfis acessam qual rota já existe em `ProtectedRoute`/`app-router.tsx` (`allowedRoles` por rota) — a sidebar reflete esse mesmo mapeamento, não cria um novo.

## Requirements

### Requirement 1: Estrutura de layout compartilhada

**User Story:** Como usuário logado, quero ver a mesma sidebar e o mesmo header em qualquer página do sistema, para navegar sem precisar digitar URLs.

#### Acceptance Criteria

1. Toda rota autenticada (todas as listadas na Introdução) SHALL renderizar dentro de um layout compartilhado com sidebar à esquerda, header no topo, e a página atual na área de conteúdo.
2. Rotas não-autenticadas (`/login`, `/set-password`, `/account-deactivated`) SHALL continuar sem esse layout (tela cheia, como já é hoje).
3. O layout compartilhado SHALL ser puramente estrutural — não SHALL alterar nenhum comportamento, dado ou lógica já existente dentro de cada página.

### Requirement 2: Itens de navegação por perfil

**User Story:** Como usuário logado, quero ver na sidebar só os itens de menu que eu realmente posso acessar, para não esbarrar em telas bloqueadas.

#### Acceptance Criteria

1. A sidebar SHALL listar um item de navegação por rota de topo já existente, cada um com ícone e rótulo em português.
2. Cada item SHALL aparecer somente para os perfis (`allowedRoles`) que já podem acessar aquela rota — mesmo mapeamento usado em `app-router.tsx`, sem duplicar essa lógica numa segunda fonte de verdade.
3. WHEN o usuário está numa rota (ou sub-rota) THEN o item de menu correspondente SHALL indicar visualmente que está ativo.
4. Itens que levam a áreas relacionadas mas distintas (ex.: `platform_admin` vê tanto gestão global de seguradoras/corretoras quanto a própria corretora/seguradoras contratadas) SHALL ficar organizados de um jeito que não confunda as duas coisas.

### Requirement 3: Header com usuário logado

**User Story:** Como usuário logado, quero ver meu nome e foto no header, para confirmar com qual conta estou logado.

#### Acceptance Criteria

1. O header SHALL mostrar o nome completo e o avatar do usuário logado (`usuario.avatar_url`); SHALL mostrar um placeholder (iniciais ou ícone) quando não houver avatar.
2. O header SHALL mostrar o nome/logo da corretora do usuário (`usuario.brokerage_name`/`logo_url`), coerente com o padrão de cor dinâmica (`primary_color`) já usado no restante do app.

### Requirement 4: Dropdown do usuário

**User Story:** Como usuário logado, quero abrir um menu a partir do meu nome/foto no header, para ver informações do meu perfil e sair do sistema.

#### Acceptance Criteria

1. WHEN o usuário clica no nome/avatar no header THEN o sistema SHALL abrir um dropdown com nome completo, e-mail e perfil (role, em português).
2. O dropdown SHALL ter um item "Sair" que aciona o `useLogout` já existente e redireciona pro login.
3. O dropdown SHALL ter um item "Meu perfil" — sem exigir que exista uma tela de edição funcional ainda (Requirement fora de escopo desta spec); pode ser um link desabilitado ou pra uma tela placeholder.

### Requirement 5: Responsividade

**User Story:** Como usuário acessando de uma tela pequena, quero conseguir navegar sem a sidebar tomar o espaço todo, para usar o sistema em qualquer dispositivo.

#### Acceptance Criteria

1. Em telas largas, a sidebar SHALL ficar sempre visível.
2. Em telas estreitas, a sidebar SHALL poder ser escondida/mostrada sob demanda (colapsar/expandir), sem perder nenhum item de navegação.
