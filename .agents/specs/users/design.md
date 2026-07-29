# Design Document

## Overview

Administração de outros usuários da corretora: listar, convidar, resetar senha e desativar/reativar. Depende da fundação já definida em [`.agents/specs/auth/design.md`](../auth/design.md) (tabelas `brokerages`/`plans`/`users`, RLS base, `get_my_role()`/`get_my_brokerage_id()`) — este documento só estende aquela base, não redefine o que já existe lá.

## Architecture

- **Frontend**: `features/users/` — feature separada de `features/auth/` (ver [ADR 002 frontend](../../../docs/architecture/frontend/adr/002-feature-first.md)) — "administrar outras contas" é um concern distinto de "quem sou eu".
- **Backend**: estende a RLS de `users` (definida em `auth/design.md`) com policies de gerenciamento por admin; adiciona a função `can_add_user()` (`SECURITY DEFINER`, mesmo padrão da [ADR 002 backend](../../../docs/architecture/backend/adr/002-security-definer-rls.md)); usa as Edge Functions `invite-user` e `update-user-password` (ver [`conventions/edge-functions.md`](../../../docs/architecture/backend/conventions/edge-functions.md)) — **não** usa `delete-user` (desativação é um UPDATE comum, ver Requirement 3).

## Components and Interfaces

```
users/
├── api/                    list-users, get-user, invite-user, update-user, update-user-password, deactivate-user, reactivate-user
├── screens/
│   └── users-list-screen/
├── components/
│   ├── invite-user-drawer/       → /users/add
│   ├── edit-user-drawer/         → /users/:userId/edit
│   ├── user-detail-drawer/       → /users/:userId
│   ├── reset-password-dialog/    ação local, sem rota
│   └── deactivate-confirm-dialog/ ação local, sem rota
├── hooks/                  useUsers, useUser, useInviteUser, useUpdateUser, useUpdateUserPassword, useDeactivateUser, useReactivateUser
├── validations/            invite-user-schema.ts, edit-user-schema.ts, reset-password-schema.ts
├── constants/               query-keys.ts (userKeys)
└── index.ts
```

- `deactivate-confirm-dialog` usa `AlertDialog` (ação impactante, mas não precisa de input — ver [`ui-patterns.md`](../../../docs/architecture/frontend/conventions/ui-patterns.md)).
- `reset-password-dialog` é um formulário pequeno (precisa da nova senha como input), não um `AlertDialog` simples.

### Screen vs. Drawer vs. Dialog local — critério de decisão

`/users` é a única rota da feature que renderiza uma **screen** cheia (`users-list-screen`). Adicionar, editar e ver detalhe de um usuário são rotas que existem (pra ter URL compartilhável, deep-link, botão voltar), mas renderizam **drawers** sobrepostos à lista — a lista continua montada por trás, via rota aninhada + `<Outlet/>` (mesmo padrão `RouteDrawer` do projeto original). Resetar senha e desativar **não** viram rota — são ações pontuais, sem valor de "voltar depois" ou compartilhar link, ficam como estado local (`useState` abrir/fechar) no componente que dispara a ação.

```
pages/users/
├── users-page.tsx               → /users              (renderiza UsersListScreen)
├── add/
│   └── add-user-page.tsx        → /users/add          (renderiza InviteUserDrawer, rota filha de /users)
└── [userId]/
    ├── user-detail-page.tsx     → /users/:userId       (renderiza UserDetailDrawer, rota filha)
    └── edit/
        └── edit-user-page.tsx   → /users/:userId/edit  (renderiza EditUserDrawer, rota filha)
```

Regra geral pra próximas features: **screen** = conteúdo raiz de uma rota; **drawer** = criar/editar/ver detalhe, rota aninhada, sobreposto a uma screen; **dialog local** = confirmação ou ação rápida, nunca uma rota própria.

## Data Models

Nenhuma tabela nova — esta feature estende o que já existe em `users`/`plans` (definidos em `auth/design.md`).

### RLS — policies adicionadas por esta spec

- **`users`**: adiciona policy de SELECT/INSERT/UPDATE para `brokerage_admin`/`platform_admin` sobre linhas onde `brokerage_id = get_my_brokerage_id()` — soma-se (OR) à policy de auto-acesso já existente, sem substituí-la.
- **`can_add_user(brokerage_id)`**: função `SECURITY DEFINER` que compara a contagem atual de usuários ativos da corretora contra `plans.max_users`. Chamada pela Edge Function `invite-user` antes de criar o usuário — a checagem é sempre server-side, uma validação só no frontend não seria suficiente (poderia ser contornada).

## Error Handling

- **Limite de plano atingido no convite** — toast (erro de mutation não atribuível a um campo específico, ver [`ui-patterns.md`](../../../docs/architecture/frontend/conventions/ui-patterns.md)).
- **Erros de validação de formulário** (convite, editar, reset de senha) — inline por campo, via React Hook Form (ver [`forms.md`](../../../docs/architecture/frontend/conventions/forms.md)).
- **Ação sem permissão** (convidar/desativar/resetar sem ser admin) — bloqueada pela RLS no banco; no frontend, o botão/ação nem aparece pra quem não tem permissão (ver a fronteira RLS-garante vs. frontend-garante em [`conventions/rls.md`](../../../docs/architecture/backend/conventions/rls.md)).

## Testing Strategy

Seguindo [`conventions/testing.md`](../../../docs/architecture/frontend/conventions/testing.md):

- **Componente** (RTL) — `invite-user-drawer` (validação de campo, submit), `deactivate-confirm-dialog`.
- **Hooks** — `useInviteUser`, `useDeactivateUser`, `useUpdateUserPassword` com `QueryClient` de teste e `api/` mockado.
- **E2E** (Playwright) — fluxo de convite → definir senha → primeiro login (ponta a ponta com a spec `auth`); fluxo de desativação → tentativa de login → tela de conta desativada.
