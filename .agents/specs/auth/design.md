# Design Document

## Overview

Fundação de autenticação e multi-tenancy: a feature `features/auth/` (login, sessão, proteção de rota, definição de senha) e a modelagem núcleo do banco (`brokerages`, `plans`, `users`) com RLS base. Este documento assume as decisões já registradas em `docs/architecture/frontend/` e `docs/architecture/backend/` — não repete o porquê, só a aplicação concreta pra esta feature. A administração de outros usuários (convidar, resetar senha, desativar) é uma feature separada — ver `.agents/specs/users/design.md`, que estende o schema/RLS definidos aqui.

## Architecture

- **Frontend**: `features/auth/` — login, sessão, proteção de rota, auth store — seguindo feature-first (ver [ADR 002 frontend](../../../docs/architecture/frontend/adr/002-feature-first.md)).
- **Backend**: Supabase Auth para credenciais/sessão/JWT; tabelas `brokerages`, `plans`, `users` com RLS (ver [ADR 001](../../../docs/architecture/backend/adr/001-multitenancy.md)); funções `SECURITY DEFINER` `get_my_role()`, `get_my_brokerage_id()` (ver [ADR 002 backend](../../../docs/architecture/backend/adr/002-security-definer-rls.md)).

## Components and Interfaces

```
auth/
├── api/                    login, logout, get-session
├── screens/
│   ├── login-screen/
│   ├── set-password-screen/
│   └── account-deactivated-screen/
├── components/
│   └── protected-route/    guarda de rota (sessão + permissão por perfil)
├── hooks/                  useLogin, useLogout (useMutation), useSession
├── store/                  auth-store.ts (Zustand) — usuario: { id, role, brokerage_id, status, full_name, avatar_url, brokerage_name, primary_color, logo_url }
├── validations/            login-schema.ts, set-password-schema.ts
└── index.ts
```

- `useLogin` é uma mutation (React Query) — no `onSuccess`, escreve o resultado no `auth-store` (Zustand). Sessão em si é estado genuinamente global lido por toda a árvore de rotas (ver [ADR 004](../../../docs/architecture/frontend/adr/004-state-management.md)), por isso Zustand e não Context.
- `protected-route` verifica, nesta ordem: (1) existe sessão? senão → `/login`; (2) `usuario.status === "active"`? senão → `account-deactivated-screen` + logout; (3) perfil tem permissão pra rota atual? senão → bloqueia.
- `set-password-screen` atende tanto o primeiro acesso após convite quanto (futuramente) um fluxo de "esqueci minha senha" — nesta spec, só o caso de convite está no escopo.

## Data Models

### `brokerages`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid, pk | é o próprio `brokerage_id` referenciado em todo o resto do schema |
| `name` | text | |
| `primary_color` | text, nullable | cor dinâmica (ver `ui-guidelines` do frontend) |
| `logo_url` | text, nullable | |
| `created_at`, `updated_at` | timestamptz | |

### `plans`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid, pk | |
| `name` | text | |
| `max_users` | integer | usado por `can_add_user()`, implementada na spec `users` (só quem convida precisa dessa checagem) |
| `created_at`, `updated_at` | timestamptz | |

### `users`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid, pk, references `auth.users(id)` | |
| `brokerage_id` | uuid, fk `brokerages(id)`, not null | |
| `role` | enum `user_role` | `platform_admin`, `brokerage_admin`, `supervisor`, `seller`, `analyst`, `viewer` |
| `status` | enum `user_status` | `active`, `inactive` |
| `full_name`, `email`, `phone` | text | |
| `avatar_url` | text, nullable | |
| `created_at`, `updated_at` | timestamptz | |

### RLS — base desta spec

Seguindo o padrão base de [`conventions/rls.md`](../../../docs/architecture/backend/conventions/rls.md). Estas são as policies **mínimas** pra login/sessão funcionarem — a spec `users` adiciona policies extras por cima (RLS é aditiva: múltiplas policies permissivas se somam via OR).

- **`brokerages`**: SELECT apenas da própria (`id = get_my_brokerage_id()`). Sem UPDATE nesta spec.
- **`plans`**: SELECT liberado a todo usuário autenticado (ver [`conventions/permissions.md`](../../../docs/architecture/backend/conventions/permissions.md)); INSERT/UPDATE/DELETE só `platform_admin`.
- **`users`**: SELECT/UPDATE da própria linha apenas (`id = auth.uid()`) — suficiente pro auth store popular `usuario` em qualquer perfil. Gerenciar linhas de **outros** usuários é escopo da spec `users`.
- **`get_my_role()`/`get_my_brokerage_id()`**: retornam `NULL` (ou lançam) quando `status != 'active'` — é isso que faz uma conta desativada perder acesso a todo o resto do sistema via RLS, não só a `users`.

## Error Handling

- **Login inválido** — toast genérico ("Email ou senha inválidos"), nunca indica se o email existe.
- **Conta desativada detectada pós-login** — não é um toast (o usuário está prestes a ser deslogado, uma mensagem transitória seria perdida): redireciona pra `account-deactivated-screen`, uma tela dedicada.
- **Refresh token expirado/inválido** — encerra a sessão silenciosamente e redireciona para `/login` (sem mensagem de erro, é esperado após um período de inatividade longo).
- **Erros de validação de formulário** (login, definir senha) — inline por campo, via React Hook Form (ver [`forms.md`](../../../docs/architecture/frontend/conventions/forms.md)).
- **Acesso a rota não permitida** — bloqueado pelo `protected-route`; a ação de tentar acessar diretamente uma URL não permitida não gera erro visível, só impede a navegação (ver a fronteira RLS-garante vs. frontend-garante em [`conventions/rls.md`](../../../docs/architecture/backend/conventions/rls.md) — o RLS é quem realmente impede leitura de dado, o `protected-route` é só UX).

## Testing Strategy

Seguindo [`conventions/testing.md`](../../../docs/architecture/frontend/conventions/testing.md):

- **Componente** (RTL) — `login-screen` (submit válido/inválido), `set-password-screen`.
- **Hooks** — `useLogin`, `useSession` com `QueryClient`/sessão de teste.
- **E2E** (Playwright) — fluxo completo de login → redirect por perfil; sessão restaurada após reload; logout; tentativa de acessar rota não permitida.
