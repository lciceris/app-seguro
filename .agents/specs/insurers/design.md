# Design Document

## Overview

Cadastro de seguradoras — a única tabela verdadeiramente global do schema (sem `brokerage_id`). Dois perfis, duas responsabilidades que não se sobrepõem: `platform_admin` é dono dos dados cadastrais (cria, lista, vê detalhe, edita); `brokerage_admin` decide, só pra própria corretora, quais seguradoras do catálogo aparecem pra ele — sem nunca tocar nos dados cadastrais em si.

## Architecture

- **Frontend**: `features/insurers/` — feature própria (ver [ADR 002 frontend](../../../docs/architecture/frontend/adr/002-feature-first.md)).
- **Backend**: duas tabelas novas — `insurers` (catálogo global) e `brokerage_disabled_insurers` (preferência por corretora, modelada como lista de exceções — ver Data Models). Nenhuma Edge Function: tanto o CRUD do catálogo quanto o toggle de preferência são cobertos inteiramente por RLS, sem necessidade de service role.

## Components and Interfaces

```
insurers/
├── api/            list-insurers, get-insurer, create-insurer, update-insurer,
│                   list-insurer-catalog, disable-insurer, enable-insurer
├── screens/
│   ├── insurers-list-screen/     → /insurers (platform_admin — gestão do catálogo)
│   └── insurer-catalog-screen/   → /my-insurers (brokerage_admin — habilitar/desabilitar)
├── components/
│   ├── create-insurer-drawer/    → /insurers/add
│   ├── insurer-detail-drawer/    → /insurers/:insurerId
│   └── edit-insurer-drawer/      → /insurers/:insurerId/edit
├── hooks/          useInsurers, useInsurer, useCreateInsurer, useUpdateInsurer,
│                   useInsurerCatalog, useDisableInsurer, useEnableInsurer
├── validations/     create-insurer-schema.ts, edit-insurer-schema.ts
├── constants/       query-keys.ts
└── index.ts
```

```
pages/
├── insurers/
│   ├── insurers-page.tsx              → /insurers                (InsurersListScreen)
│   ├── add/
│   │   └── add-insurer-page.tsx       → /insurers/add            (CreateInsurerDrawer, rota filha)
│   └── [insurerId]/
│       ├── insurer-detail-page.tsx    → /insurers/:insurerId     (InsurerDetailDrawer, rota filha)
│       └── edit/
│           └── edit-insurer-page.tsx  → /insurers/:insurerId/edit (EditInsurerDrawer, rota filha)
└── my-insurers/
    └── my-insurers-page.tsx           → /my-insurers             (InsurerCatalogScreen)
```

### Screen vs. Drawer

Mesmo critério já estabelecido nas specs `users`/`brokerages`: `/insurers` é a única rota com screen cheia de gestão; criar/ver detalhe/editar são drawers em rota aninhada, sobrepostos à lista. `/my-insurers` é uma screen própria e independente (não um drawer — não há nada "por trás" pra continuar visível), mesmo padrão de `/my-brokerage`: uma lista simples com toggle inline, sem necessidade de navegação pra detalhe/edição (`brokerage_admin` não edita nada aqui, só liga/desliga).

## Data Models

### `insurers` (nova, catálogo global)

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid, pk | |
| `name` | text, not null | |
| `cnpj` | text, nullable | |
| `email` | text, nullable | |
| `phone` | text, nullable | "Telefone Comercial" |
| `website` | text, nullable | |
| `contact_name` | text, nullable | "Contato Comercial" — nome da pessoa de contato |
| `response_time_days` | integer, nullable | "Prazo de Resposta (dias)" |
| `display_order` | integer, nullable | ordena a listagem; nulls por último |
| `notes` | text, nullable | "Observações" |
| `created_at`, `updated_at` | timestamptz | |

Sem coluna de status — não existe desativação global (ver Requirements, decisão explícita).

### `brokerage_disabled_insurers` (nova, preferência por corretora)

| Coluna | Tipo | Notas |
|---|---|---|
| `brokerage_id` | uuid, fk `brokerages(id)` on delete cascade, pk composta | |
| `insurer_id` | uuid, fk `insurers(id)` on delete cascade, pk composta | |
| `created_at` | timestamptz | |

Modelada como lista de **exceções**, não como um campo `enabled` em cada combinação corretora×seguradora: a ausência de uma linha significa "habilitada" (padrão); a presença de uma linha significa "esta corretora desabilitou esta seguradora". Isso evita ter que inserir uma linha por corretora toda vez que uma seguradora nova é cadastrada — só existe registro quando alguém efetivamente desliga algo. "Desabilitar" (Requirement 5.2) é um `INSERT`; "reabilitar" (Requirement 5.3) é um `DELETE` dessa linha.

### RLS

- **`insurers`**:
  - `insurers_select_managed`: SELECT liberado a `get_my_role() in ('platform_admin', 'brokerage_admin')` — os únicos dois perfis com alguma tela que precisa ler o catálogo (Requirement 5.6). Não é uma tabela de leitura ampla como `plans`.
  - `insurers_insert_platform_admin` / `insurers_update_platform_admin`: só `platform_admin` (Requirements 1.3, 4.2).
  - Sem policy de DELETE — cadastro nunca é removido.
- **`brokerage_disabled_insurers`**:
  - `brokerage_disabled_insurers_select_own`: SELECT restrito a `brokerage_id = get_my_brokerage_id()`.
  - `brokerage_disabled_insurers_manage_own`: INSERT/DELETE restritos a `brokerage_id = get_my_brokerage_id() AND get_my_role() = 'brokerage_admin'` — é uma ação de gestão da corretora, não qualquer perfil dela (Requirement 5.6 já também libera `platform_admin` só pra acessar a tela, mesmo padrão de `/my-brokerage` — na prática ele nunca usa isso de verdade, já que pertence à corretora especial da plataforma).

### Consulta do catálogo com a preferência da própria corretora

`list-insurer-catalog` (consumida por `/my-insurers`) faz um embed simples:

```ts
const { data } = await supabase
  .from("insurers")
  .select("*, brokerage_disabled_insurers(brokerage_id)")
  .order("display_order", { ascending: true, nullsFirst: false })
  .order("name", { ascending: true });
```

Não precisa filtrar o embed explicitamente por `brokerage_id` — a RLS de `brokerage_disabled_insurers_select_own` já garante que só a linha da própria corretora (se existir) é retornada. No frontend, `insurer.brokerage_disabled_insurers.length > 0` significa "desabilitada pra mim".

## Error Handling

- Erros de validação de formulário (criar/editar seguradora) — inline por campo, via React Hook Form.
- Ação sem permissão — bloqueada por RLS; botão/rota nem aparece pra quem não tem permissão.
- Toggle de habilitar/desabilitar em `/my-insurers` — ação rápida (`INSERT`/`DELETE` direto), toast de sucesso/erro. Sem `AlertDialog` de confirmação: diferente de desativar usuário/corretora, aqui não há efeito colateral maior que reverter a qualquer momento com um clique.

## Testing Strategy

Seguindo [`conventions/testing.md`](../../../docs/architecture/frontend/conventions/testing.md):

- **Componente** (RTL) — `create-insurer-drawer` (validação, submit), `edit-insurer-drawer`, `insurer-catalog-screen` (toggle habilitar/desabilitar).
- **Hooks** — `useCreateInsurer`, `useUpdateInsurer`, `useDisableInsurer` com `QueryClient` de teste e `api/` mockado.
- **E2E** (Playwright) — `platform_admin` cadastra uma seguradora → ela aparece no catálogo de `/my-insurers`; `brokerage_admin` desabilita uma seguradora → some das opções dele, mas uma segunda corretora de teste continua vendo ela normalmente (confirma isolamento por corretora); reabilita → volta a aparecer.
