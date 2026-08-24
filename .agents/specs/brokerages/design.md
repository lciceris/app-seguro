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
- **Busca de CNPJ/CEP falha** (CNPJ/CEP inválido, não encontrado, ou API fora do ar) — toast de erro, sem limpar nem bloquear os campos já preenchidos manualmente (Requirement 7.3).

## Extensão: cadastro completo de empresa (Requirements 2, 4, 6, 7)

Adicionado depois de teste manual — o cadastro original só pedia nome+admin; faltavam os dados de empresa que `clients` (spec já fechada) já tem. Ver nota em `requirements.md`.

### `brokerages` — colunas novas

| Coluna | Tipo | Quem edita depois da criação |
|---|---|---|
| `trade_name` | text | `brokerage_admin` |
| `tax_id` | text, `unique` (CNPJ único na plataforma) | `brokerage_admin` |
| `business_code` | text (CNAE) | `brokerage_admin` |
| `state_registration` | text | `brokerage_admin` |
| `email` | text (e-mail comercial) | `brokerage_admin` |
| `phone` | text | `brokerage_admin` |
| `zip_code`, `street`, `street_number`, `complement`, `neighborhood`, `city`, `state` | text | `brokerage_admin` |
| `representative_name`, `representative_email` | text | `brokerage_admin` |
| `financial_name`, `financial_email` | text | `brokerage_admin` |
| `plan_expires_at` | date | `platform_admin` (mesmo grupo de `plan_id`) |

Mesma convenção de nomes já usada em `clients` (`zip_code`/`street`/`street_number`/`complement`/`neighborhood`/`city`/`state`, `financial_name`/`financial_email`) — só `representative_name`/`representative_email` são novos (equivalente ao `contact_name`/`contact_email` de `clients`, mas sem `contact_role`/`contact_phone`, que não fazem parte do print de referência).

`tax_id` ganha `unique` (diferente de `clients.tax_id`, que não é único — uma corretora é uma entidade única na plataforma, um cliente pode legitimamente existir em cadastros de corretoras diferentes).

### `enforce_brokerage_update_columns` — trigger atualizado

O trigger da Task 1.7 (já existente) precisa reconhecer as colunas novas nos dois grupos:

```
brokerage_admin permitido mudar:
  name, trade_name, tax_id, business_code, state_registration, email, phone,
  zip_code, street, street_number, complement, neighborhood, city, state,
  representative_name, representative_email, financial_name, financial_email,
  logo_url, primary_color

platform_admin permitido mudar:
  name, plan_id, plan_expires_at, status
```

### Edge Function `create-brokerage` — payload estendido

O `req.json()` passa a desestruturar todos os campos de empresa (opcionais, exceto `brokerage_name`/`admin_full_name`/`admin_email`) e incluí-los no `insert` inicial em `brokerages`. Sem mudança na lógica de rollback (Requirement 2.3) — só mais colunas no mesmo insert.

### Busca de CNPJ/CEP (Requirement 7)

Dois módulos novos em `src/shared/lib/` (infraestrutura cross-feature, não fica dentro de `features/brokerages/` porque a ideia é reaproveitar em `clients` numa spec futura):

```ts
// src/shared/lib/brasil-api.ts
export interface BrasilApiCnpjData {
  name: string; // razao_social
  trade_name: string | null; // nome_fantasia
  business_code: string | null; // "{cnae_fiscal} - {cnae_fiscal_descricao}"
  email: string | null;
  phone: string | null;
  zip_code: string | null;
  street: string | null;
  street_number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
}

export async function fetchCnpjData(cnpj: string): Promise<BrasilApiCnpjData> {
  const digits = cnpj.replace(/\D/g, "");
  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
  if (!response.ok) throw new Error("CNPJ não encontrado");
  const data = await response.json();
  return {
    name: data.razao_social,
    trade_name: data.nome_fantasia || null,
    business_code:
      data.cnae_fiscal && data.cnae_fiscal_descricao
        ? `${data.cnae_fiscal} - ${data.cnae_fiscal_descricao}`
        : null,
    email: data.email || null,
    phone: data.ddd_telefone_1 || null,
    zip_code: data.cep || null,
    street: data.logradouro || null,
    street_number: data.numero || null,
    complement: data.complemento || null,
    neighborhood: data.bairro || null,
    city: data.municipio || null,
    state: data.uf || null,
  };
}
```

```ts
// src/shared/lib/via-cep.ts
export interface ViaCepData {
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
}

export async function fetchCepData(cep: string): Promise<ViaCepData> {
  const digits = cep.replace(/\D/g, "");
  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!response.ok) throw new Error("CEP não encontrado");
  const data = await response.json();
  if (data.erro) throw new Error("CEP não encontrado");
  return {
    street: data.logradouro || null,
    neighborhood: data.bairro || null,
    city: data.localidade || null,
    state: data.uf || null,
  };
}
```

Ambas as APIs são públicas, sem chave, com CORS liberado pra chamada direta do navegador — sem Edge Function no meio. Cada formulário (criação, edição pelo `brokerage_admin`) chama essas funções no `onClick` de um botão "Buscar" ao lado dos campos CNPJ/CEP, preenchendo os campos correspondentes via `setValue` do React Hook Form; erro vira toast, sem bloquear o preenchimento manual (Requirement 7.3).

### Frontend — componentes afetados

- **`create-brokerage-drawer`**: ganha as mesmas seções de `create-client-drawer` (Identificação, Endereço, Representante, Financeiro), com "Buscar" ao lado de CNPJ e CEP. `create-brokerage-schema.ts` estendido com os campos novos (todos opcionais, mesmo padrão `z.string().optional()`/e-mail com `z.union([z.literal(""), z.string().email(...)]).optional()` já usado em `create-client-schema.ts`).
- **`own-brokerage-screen`** (`brokerage_admin`): ganha as mesmas seções + busca. `edit-own-brokerage-schema.ts` estendido.
- **`edit-brokerage-drawer`** (`platform_admin`): ganha `plan_expires_at` (`DatePicker`) ao lado de `plan_id`. `edit-brokerage-schema.ts` estendido.
- **`brokerage-detail-drawer`**: exibe todos os campos novos, somente leitura, incluindo `plan_expires_at`.
- **`types/brokerage.ts`**: sem mudança manual — `Brokerage`/`BrokerageWithPlan` continuam derivando de `Database["public"]["Tables"]["brokerages"]["Row"]`; basta regenerar os tipos depois da migration.

## Testing Strategy

Seguindo [`conventions/testing.md`](../../../docs/architecture/frontend/conventions/testing.md):

- **Componente** (RTL) — `create-brokerage-drawer` (validação, submit), `edit-brokerage-drawer`, `own-brokerage-screen`, `deactivate-brokerage-confirm-dialog`.
- **Hooks** — `useCreateBrokerage`, `useUpdateBrokerage`, `useDeactivateBrokerage` com `QueryClient` de teste e `api/` mockado.
- **E2E** (Playwright) — `platform_admin` cria corretora → primeiro admin define senha → loga; `platform_admin` desativa uma corretora → login de um usuário dela cai na tela de bloqueado (mensagem de corretora, não de conta) → reativação restaura o acesso; `brokerage_admin` tentando acessar `/brokerages` é bloqueado.
- **Fora do escopo automatizado**: a chamada de verdade pra BrasilAPI/ViaCEP (Requirement 7) — dependência de rede externa fora do controle do teste, mesmo critério já usado pro envio de e-mail via SMTP (Task 2/5/10 da spec `users`). Os testes de componente mockam `fetchCnpjData`/`fetchCepData`; o preenchimento manual dos campos (sem usar "Buscar") é o que o E2E de criação continua cobrindo.
