# Design Document

## Overview

Gestão das corretoras-cliente da plataforma, com dois níveis de acesso bem separados: `platform_admin` administra a entidade `brokerages` como um todo (criar, listar, editar, desativar/reativar — única exceção ao isolamento multi-tenant, e só pra essa entidade); `brokerage_admin` só edita a identidade visual da própria corretora. Depende da fundação já definida em [`.agents/specs/auth/design.md`](../auth/design.md) (tabela `brokerages`, RLS base, `get_my_role()`/`get_my_brokerage_id()`) e reaproveita o mecanismo de convite da [`.agents/specs/users/design.md`](../users/design.md) pra criar o primeiro admin de uma corretora nova.

## Architecture

- **Frontend**: `features/brokerages/` — feature separada de `features/users/` (ver [ADR 002 frontend](../../../docs/architecture/frontend/adr/002-feature-first.md)) — "gerenciar corretoras" é um concern distinto de "gerenciar usuários dentro da minha corretora".
- **Backend**: estende `brokerages` com uma coluna `status` (novo enum `brokerage_status`); estende `get_my_role()`/`get_my_brokerage_id()` (definidas na spec `auth`) pra também considerar o status da corretora vinculada, não só do usuário; adiciona RLS e um trigger de restrição de coluna por role (mesma técnica do trigger `prevent_self_privilege_escalation` da spec `users`, Task 7.4); nova Edge Function `create-brokerage`.

## Components and Interfaces

```
brokerages/
├── api/           list-brokerages, get-brokerage, create-brokerage, update-brokerage,
│                  deactivate-brokerage, reactivate-brokerage, get-own-brokerage, update-own-brokerage
├── screens/
│   ├── brokerages-list-screen/        → /brokerages (só platform_admin)
│   └── own-brokerage-screen/          → /my-brokerage (brokerage_admin edita a própria)
├── components/
│   ├── create-brokerage-drawer/       → /brokerages/add
│   ├── brokerage-detail-drawer/       → /brokerages/:brokerageId
│   ├── edit-brokerage-drawer/         → /brokerages/:brokerageId/edit
│   └── deactivate-brokerage-confirm-dialog/  ação local, sem rota
├── hooks/         useBrokerages, useBrokerage, useCreateBrokerage, useUpdateBrokerage,
│                  useDeactivateBrokerage, useReactivateBrokerage, useOwnBrokerage, useUpdateOwnBrokerage
├── validations/    create-brokerage-schema.ts, edit-brokerage-schema.ts, edit-own-brokerage-schema.ts
├── constants/      query-keys.ts
└── index.ts
```

```
pages/
├── brokerages/
│   ├── brokerages-page.tsx            → /brokerages           (BrokeragesListScreen)
│   ├── add/
│   │   └── add-brokerage-page.tsx     → /brokerages/add       (CreateBrokerageDrawer, rota filha)
│   └── [brokerageId]/
│       ├── brokerage-detail-page.tsx  → /brokerages/:brokerageId       (BrokerageDetailDrawer, rota filha)
│       └── edit/
│           └── edit-brokerage-page.tsx → /brokerages/:brokerageId/edit (EditBrokerageDrawer, rota filha)
└── my-brokerage/
    └── my-brokerage-page.tsx          → /my-brokerage         (OwnBrokerageScreen)
```

### Screen vs. Drawer vs. Dialog local

Segue o mesmo critério já estabelecido na spec `users`: `/brokerages` é a única rota que renderiza uma **screen** cheia de listagem; criar/ver detalhe/editar são **drawers** em rota aninhada, sobrepostos à lista (`<Outlet/>`); desativar é **dialog local** (`AlertDialog`), sem rota, mesmo padrão de `deactivate-confirm-dialog` da spec `users`; reativar é ação direta, sem confirmação.

`/my-brokerage` é uma exceção deliberada: não é um drawer sobre nenhuma lista (o `brokerage_admin` não lista corretoras, só edita a própria) — é uma **screen** própria e independente, conteúdo raiz da rota, com um formulário direto (sem necessidade de drawer, já que não há nada "por trás" pra continuar visível).

### Edge Function `create-brokerage`

Segue o inventário de [`conventions/edge-functions.md`](../../../docs/architecture/backend/conventions/edge-functions.md):

| Função | Ação | Payload |
|---|---|---|
| `create-brokerage` | Verifica que quem chama é `platform_admin`; cria a linha em `brokerages`; convida o primeiro usuário como `brokerage_admin` dela (mesma lógica de `invite-user` da spec `users` — `inviteUserByEmail` + insert em `users`); rollback da corretora se o convite falhar | `{ brokerage_name, admin_full_name, admin_email }` |

Diferente de `invite-user`/`update-user-password` (que verificam que o `brokerage_id` do payload é o mesmo de quem chama, via `_shared/verify-admin.ts`), esta operação é **inerentemente cross-tenant** — não faz sentido comparar contra o `brokerage_id` de quem chama. Usa um helper novo, `_shared/verify-platform-admin.ts`, que só confirma `get_my_role() === 'platform_admin'`, sem checagem de corretora.

## Data Models

### `brokerages` — coluna nova

| Coluna | Tipo | Notas |
|---|---|---|
| `status` | enum `brokerage_status` (`active`, `inactive`), not null, default `active` | novo — analógo a `user_status`, mas na corretora |

### Corretora especial da plataforma

Criada via migration/seed com um `id` fixo e conhecido (`00000000-0000-0000-0000-000000000001` — mesmo valor já usado como referência no `CLAUDE.md` do projeto anterior). Só usuários `platform_admin` pertencem a ela. Não tem tratamento especial de RLS — é excluída da listagem (Requirement 3) por um filtro explícito na query do frontend/api (`api/list-brokerages`), não por uma policy — RLS não tem como saber "estou montando a tela de gestão" vs. qualquer outro contexto de leitura.

### RLS e função — mudanças nesta spec

- **`get_my_role()`/`get_my_brokerage_id()`** (definidas na spec `auth`): passam a fazer `join` com `brokerages` e also exigir `brokerages.status = 'active'`, além de `users.status = 'active'` já existente. Efeito: uma corretora inativa bloqueia RLS pra **todos** os usuários dela, sem precisar desativar um por um (Requirement 5.2) — mesmo mecanismo que já fazia `user.status = 'inactive'` bloquear RLS, agora estendido à corretora.
- **`brokerages_select_own`** (já existe, spec `auth`): sem mudança — continua usando `get_my_brokerage_id()`, então já herda automaticamente o novo comportamento acima.
- **`brokerages_select_own_unconditional`** (nova): `using (id = (select brokerage_id from public.users where id = auth.uid()))` — **não** usa `get_my_brokerage_id()`, então continua funcionando mesmo com a corretora inativa. Necessária pro frontend distinguir, na tela de conta bloqueada pós-login, se a causa foi o usuário desativado ou a corretora desativada (Requirement 5.3) — sem essa policy, a leitura de `brokerages` falharia (RLS nega) nos dois casos igualmente, tornando os dois indistinguíveis.
- **`brokerages_select_all_platform_admin`** (nova): `using (get_my_role() = 'platform_admin')`, sem filtro de `brokerage_id` — a exceção documentada ao isolamento multi-tenant (Requirement 3).
- **`brokerages_update_own`** (nova): `brokerage_admin` (e `platform_admin` da corretora especial) atualiza a própria linha.
- **`brokerages_update_platform_admin`** (nova): `platform_admin` atualiza qualquer linha.
- **Trigger `enforce_brokerage_update_columns`** (nova, `BEFORE UPDATE`): GRANT column-level não diferencia por policy/linha (é por role do Postgres), então a restrição "`brokerage_admin` só muda `name`/`logo_url`/`primary_color`; `platform_admin` só muda `name`/`plan_id`/`status`" só pode ser garantida com um trigger comparando `OLD` vs. `NEW` conforme `get_my_role()` de quem está executando — mesma técnica já usada em `prevent_self_privilege_escalation` (spec `users`, Task 7.4).
- **INSERT**: nenhuma policy de INSERT pra `authenticated` — a criação de corretora acontece só dentro da Edge Function `create-brokerage`, via cliente service role (mesmo padrão de `invite-user`).

## Error Handling

- **Convite do primeiro admin falha ao criar corretora** — a Edge Function desfaz a corretora criada (rollback), retorna erro; frontend mostra toast (erro de mutation não atribuível a campo específico).
- **Erros de validação de formulário** (criar corretora, editar) — inline por campo, via React Hook Form.
- **Ação sem permissão** (criar/listar/editar-qualquer/desativar sem ser `platform_admin`; editar a própria sem ser `brokerage_admin`) — bloqueada pela RLS e pelo trigger de coluna; no frontend, a ação/rota nem aparece pra quem não tem permissão.
- **Corretora desativada detectada pós-login** — mesmo padrão da spec `users` (Requirement 3.3): não é toast, redireciona pra uma tela dedicada. Reaproveita `account-deactivated-screen` da spec `auth`, mas com uma mensagem diferente quando a causa é a corretora (não a conta individual) — diferenciado consultando `brokerages_select_own_unconditional` (ver acima).

## Testing Strategy

Seguindo [`conventions/testing.md`](../../../docs/architecture/frontend/conventions/testing.md):

- **Componente** (RTL) — `create-brokerage-drawer` (validação, submit), `edit-brokerage-drawer`, `own-brokerage-screen`, `deactivate-brokerage-confirm-dialog`.
- **Hooks** — `useCreateBrokerage`, `useUpdateBrokerage`, `useDeactivateBrokerage` com `QueryClient` de teste e `api/` mockado.
- **E2E** (Playwright) — `platform_admin` cria corretora → primeiro admin define senha → loga; `platform_admin` desativa uma corretora → login de um usuário dela cai na tela de bloqueado (mensagem de corretora, não de conta) → reativação restaura o acesso; `brokerage_admin` tentando acessar `/brokerages` é bloqueado.
