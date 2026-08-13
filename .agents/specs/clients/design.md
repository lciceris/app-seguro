# Design Document

## Overview

Cadastro de clientes das corretoras (PF/PJ), com vínculo N:N a vendedores (`client_sellers`) que sustenta a regra central da spec: `seller` só enxerga e edita os clientes vinculados a ele; os demais perfis com acesso (`platform_admin`, `brokerage_admin`, `supervisor`, `viewer`) veem todos os clientes da própria corretora. Uma única tela de listagem/gestão serve todos esses perfis — a diferença de escopo é resolvida inteiramente pela RLS, não por rotas separadas (mesmo critério já usado em `/users`).

## Architecture

- **Frontend**: `features/clients/` — feature própria.
- **Backend**: duas tabelas novas — `clients` (tenant-scoped, padrão `brokerage_id`) e `client_sellers` (vínculo N:N, sem `brokerage_id` próprio — herda o da tabela `clients` via função auxiliar). Nenhuma Edge Function: tudo é RLS + um trigger de conveniência (ver abaixo).
- Dois enums novos: `client_type` (`individual` | `company`) e `client_segment` (`lead` | `active` | `vip` | `inactive`) — já documentados como enum na visão de produto original, mesmo padrão de `user_role`/`brokerage_status`.

## Components and Interfaces

```
clients/
├── api/            list-clients, get-client, create-client, update-client,
│                   deactivate-client, reactivate-client,
│                   list-client-sellers, add-client-seller, remove-client-seller,
│                   set-primary-client-seller
├── screens/
│   └── clients-list-screen/       → /clients (todos os perfis com acesso — RLS resolve o escopo)
├── components/
│   ├── create-client-drawer/      → /clients/add
│   ├── client-detail-drawer/      → /clients/:clientId (inclui seção de vendedores vinculados)
│   ├── edit-client-drawer/        → /clients/:clientId/edit
│   └── deactivate-client-confirm-dialog/
├── hooks/          useClients, useClient, useCreateClient, useUpdateClient,
│                   useDeactivateClient, useReactivateClient,
│                   useClientSellers, useAddClientSeller, useRemoveClientSeller,
│                   useSetPrimaryClientSeller
├── validations/     create-client-schema.ts, edit-client-schema.ts
├── constants/       query-keys.ts
└── index.ts
```

```
pages/
└── clients/
    ├── clients-page.tsx               → /clients                (ClientsListScreen)
    ├── add/
    │   └── add-client-page.tsx        → /clients/add             (CreateClientDrawer, rota filha)
    └── [clientId]/
        ├── client-detail-page.tsx     → /clients/:clientId       (ClientDetailDrawer, rota filha)
        └── edit/
            └── edit-client-page.tsx   → /clients/:clientId/edit  (EditClientDrawer, rota filha)
```

### Screen vs. Drawer

Mesmo critério de `/users`: uma única screen de gestão (`/clients`) com `<Outlet/>` pros drawers aninhados de criar/ver/editar, sobrepostos à lista. Gestão de vendedores vinculados (Requirement 5) **não** é uma rota/drawer própria — CLAUDE.md proíbe modal dentro de drawer, e o conjunto de ações (adicionar, remover, marcar principal) é pequeno o suficiente pra caber como uma seção a mais dentro do próprio `client-detail-drawer`, sem navegação adicional.

### Formulário de criação — vendedor(es) responsável(is) é condicional por role

`create-client-drawer` renderiza um seletor de vendedores (multi-select com "marcar como principal") só quando `usuario.role !== 'seller'`. Quando `seller` cria o cliente, não existe esse campo — o vínculo como principal é automático (ver trigger `auto_link_seller_as_primary` abaixo), então o formulário de `seller` fica mais enxuto. Mesmo critério condicional já usado em `insurer-catalog-screen` (`canToggle`).

## Data Models

### Enums novos

```sql
create type client_type as enum ('individual', 'company');
create type client_segment as enum ('lead', 'active', 'vip', 'inactive');
```

### `clients` (nova, tenant-scoped)

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid, pk | |
| `brokerage_id` | uuid, not null, fk `brokerages(id)` on delete cascade | |
| `client_type` | `client_type`, not null, default `'company'` | |
| `legal_name` | text, not null | razão social (PJ) ou nome completo (PF) |
| `trade_name` | text, nullable | nome fantasia |
| `tax_id` | text, nullable | CNPJ (PJ) ou CPF (PF) |
| `birth_date` | date, nullable | PF |
| `business_code` | text, nullable | CNAE principal (PJ) |
| `industry` | text, nullable | setor (PJ) |
| `state_registration` | text, nullable | inscrição estadual (PJ) |
| `zip_code`, `street`, `street_number`, `complement`, `neighborhood`, `city`, `state` | text, nullable | endereço |
| `contact_name`, `contact_role`, `contact_email`, `contact_phone` | text, nullable | contato comercial |
| `financial_name`, `financial_email` | text, nullable | contato financeiro |
| `segment` | `client_segment`, not null, default `'lead'` | |
| `lead_source` | text, nullable | |
| `notes` | text, nullable | |
| `created_at`, `updated_at` | timestamptz | trigger `set_updated_at` (já existe) |

Índice em `brokerage_id` (filtro RLS) e em `tax_id` (busca).

### `client_sellers` (nova, vínculo N:N)

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid, pk | |
| `client_id` | uuid, not null, fk `clients(id)` on delete cascade | |
| `seller_id` | uuid, not null, fk `users(id)` on delete cascade | |
| `is_primary` | boolean, not null, default `false` | |
| `created_at` | timestamptz | |

`UNIQUE(client_id, seller_id)` — um vendedor não se vincula duas vezes ao mesmo cliente. Sem `brokerage_id` próprio — deriva do `client_id` via `get_client_brokerage_id()` (ver RLS).

### Trigger: `enforce_single_primary_seller`

Só um vendedor principal por cliente. Em vez de depender só do frontend pra desmarcar o anterior (duas requisições, janela de inconsistência), um trigger `AFTER INSERT OR UPDATE OF is_primary` desmarca qualquer outro `is_primary = true` do mesmo `client_id` quando a linha afetada tem `is_primary = true`:

```sql
create function enforce_single_primary_seller() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.is_primary then
    update public.client_sellers
      set is_primary = false
      where client_id = new.client_id
        and id <> new.id
        and is_primary = true;
  end if;
  return new;
end;
$$;
```

Frontend só precisa dar `UPDATE client_sellers SET is_primary = true WHERE id = ...` — o trigger cuida do resto (Requirement 5.3).

### Pegadinha confirmada: `INSERT ... RETURNING` reavalia a policy de SELECT antes do trigger `AFTER INSERT` terminar

Verificado com um `seller` de teste real: `supabase.from('clients').insert({...}).select().single()` (um único request, `INSERT ... RETURNING`) falha com `"new row violates row-level security policy for table clients"` **mesmo a `WITH CHECK` de `clients_insert` sendo satisfeita** — porque o `RETURNING` reavalia a policy de **SELECT** sobre a linha recém-criada, e essa reavaliação acontece antes do trigger `auto_link_seller_as_primary` (`AFTER INSERT`, definido a seguir) terminar de inserir o vínculo em `client_sellers`. Nesse instante, `is_my_client(id)` ainda é `false` pro próprio criador.

Fix confirmado: a API `create-client` **não pode** encadear `.insert().select()` numa única chamada — precisa separar em duas requisições (duas transações distintas): `insert()` sem `.select()`, depois um `select().eq('id', id).single()` à parte (com `id` gerado no cliente via `crypto.randomUUID()`, já que sem `.select()` o Supabase não devolve a linha criada). Na segunda requisição, a primeira transação (insert + trigger) já foi commitada por inteiro, então `is_my_client(id)` já é `true`. Essa mesma técnica é usada uniformemente pra todos os perfis (não só `seller`) — mais simples que ramificar por role.

### Trigger: `auto_link_seller_as_primary`

Quando `seller` cria um cliente (Requirement 1.2), ele precisa ser vinculado automaticamente como principal — mas a RLS de `client_sellers` (ver abaixo) só libera INSERT pra `platform_admin`/`brokerage_admin`/`supervisor`, de propósito (Requirement 5.4: `seller` nunca gerencia vínculos diretamente, nem o próprio). Resolvido com um trigger `AFTER INSERT ON clients`, `SECURITY DEFINER`, que insere a linha em nome do sistema — sem abrir uma brecha de INSERT direto pra `seller` em `client_sellers`:

```sql
create function auto_link_seller_as_primary() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if public.get_my_role() = 'seller' then
    insert into public.client_sellers (client_id, seller_id, is_primary)
    values (new.id, auth.uid(), true);
  end if;
  return new;
end;
$$;
```

### Função auxiliar: `get_client_brokerage_id(uuid)`

`client_sellers` não tem `brokerage_id` próprio — a RLS dela depende do `brokerage_id` do cliente pai. Seguindo a lição já aprendida na spec `brokerages` (Task 9: subquery inline em policy RLS é inconsistente em tráfego real da aplicação, mesmo passando em teste isolado), esse lookup vira uma função `SECURITY DEFINER`, nunca uma subquery inline na policy:

```sql
create function get_client_brokerage_id(p_client_id uuid) returns uuid
language sql security definer set search_path = '' stable as $$
  select brokerage_id from public.clients where id = p_client_id;
$$;
```

### Função auxiliar: `is_my_client(uuid)`

Mesmo raciocínio pra resolver "esse `seller` está vinculado a esse cliente":

```sql
create function is_my_client(p_client_id uuid) returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.client_sellers
    where client_id = p_client_id and seller_id = auth.uid()
  );
$$;
```

### RLS

- **`clients`**:
  - `clients_select`: `brokerage_id = get_my_brokerage_id() AND (get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'viewer') OR (get_my_role() = 'seller' AND is_my_client(id)))` (Requirements 2.1, 2.2).
  - `clients_insert`: `brokerage_id = get_my_brokerage_id() AND get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'seller')` (Requirement 1.1, 1.4).
  - `clients_update`: mesma condição de `clients_select` — quem enxerga, edita (Requirement 4.1, 4.2; `viewer` fica de fora porque não está nem no SELECT liberado geral nem pode ser `seller`, mas ainda assim reforçado explicitamente: `viewer` está no grupo de SELECT amplo mas **não** no de UPDATE).

  Reformulando pra deixar `viewer` fora do UPDATE (Requirement 4.3):
  ```sql
  -- clients_update
  brokerage_id = get_my_brokerage_id()
  and (
    get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
    or (get_my_role() = 'seller' and is_my_client(id))
  )
  ```
  - Sem policy de DELETE — nunca é excluído (Requirement 6, só `segment = 'inactive'` via UPDATE comum).

- **`client_sellers`**:
  - `client_sellers_select`: `get_client_brokerage_id(client_id) = get_my_brokerage_id() AND (get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'viewer') OR seller_id = auth.uid())` — um `seller` vê os vínculos do(s) cliente(s) dele mesmo que não seja o vínculo específico dele (ex.: outro vendedor secundário no mesmo cliente), então a condição usa `is_my_client(client_id)` em vez de `seller_id = auth.uid()` pra cobrir isso corretamente:
  ```sql
  -- client_sellers_select
  get_client_brokerage_id(client_id) = get_my_brokerage_id()
  and (
    get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'viewer')
    or is_my_client(client_id)
  )
  ```
  - `client_sellers_manage` (INSERT/UPDATE/DELETE): `get_client_brokerage_id(client_id) = get_my_brokerage_id() AND get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')` (Requirement 5.1, 5.2, 5.3, 5.4 — `seller` nunca aparece aqui; o vínculo automático de criação passa pelo trigger `SECURITY DEFINER`, não por essa policy).

### Remoção do vendedor principal quando restam outros vínculos

Requirement 5.2 exige que, ao remover o vendedor principal enquanto outros continuam vinculados, um novo principal seja escolhido antes de confirmar. Isso é responsabilidade da função de API `remove-client-seller` (camada `api/`, não RLS/trigger): antes de fazer o `DELETE`, ela verifica se a linha é `is_primary` e se há outros vínculos restantes — se houver, exige um `newPrimaryId` como parâmetro e faz o `UPDATE` de promoção antes do `DELETE`. O componente (`client-detail-drawer`) resolve isso na UI: ao clicar em remover o principal com outros vendedores presentes, abre um pequeno seletor inline pra escolher o substituto antes de confirmar a remoção (sem navegação, sem modal — mesma seção da tela).

## Error Handling

- Erros de validação de formulário (criar/editar cliente) — inline por campo, via React Hook Form.
- Ação sem permissão — bloqueada por RLS; botão/rota nem aparece pra quem não tem permissão.
- Inativar cliente — `AlertDialog` de confirmação (mesmo padrão de `deactivate-user`/`deactivate-brokerage`: efeito visível e persistente, embora reversível). Reativar — ação de um clique, sem confirmação (mesma assimetria já usada em `brokerages`).
- Remover vendedor principal com outros vínculos restantes e sem substituto escolhido — erro tratado na API (`remove-client-seller` lança antes de tentar o DELETE), toast de erro orientando a escolher um novo principal primeiro.

## Testing Strategy

Seguindo o padrão já usado nas specs anteriores:

- **Componente** (RTL) — `create-client-drawer` (validação, submit, campo de vendedor condicional por role), `edit-client-drawer`, `client-detail-drawer` (seção de vendedores: adicionar, remover, trocar principal), `deactivate-client-confirm-dialog`.
- **Hooks** — `useCreateClient`, `useUpdateClient`, `useAddClientSeller`, `useRemoveClientSeller` com `QueryClient` de teste e `api/` mockado.
- **E2E** (Playwright) — `seller` cadastra um cliente → fica vinculado como principal automaticamente e o vê na própria listagem; um segundo `seller` de teste não o vê (isolamento por vínculo); `supervisor` cadastra um cliente escolhendo dois vendedores → ambos aparecem no detalhe, um marcado como principal; `brokerage_admin` inativa um cliente → continua listado com indicação de inativo → reativa.
