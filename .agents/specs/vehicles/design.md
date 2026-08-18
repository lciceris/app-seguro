# Design Document

## Overview

Cadastro de veículos das frotas seguradas — cada veículo pertence a exatamente um cliente (`client_id`), tabela tenant-scoped padrão. Reaproveita a função `is_my_client(client_id)` já criada na spec `clients` pra resolver a mesma regra de visibilidade em cascata: `seller` só enxerga/edita veículos dos próprios clientes. Sem a complexidade de vínculo N:N de `clients` — aqui é uma FK simples (`vehicles.client_id → clients.id`).

## Architecture

- **Frontend**: `features/vehicles/` — feature própria.
- **Backend**: uma tabela nova (`vehicles`, tenant-scoped) + dois enums novos (`vehicle_type`, `vehicle_usage`, catálogo fixo de frota). Nenhuma Edge Function: tudo é RLS.
- Enums seguem o mesmo padrão de valor em inglês/`snake_case` + label em pt-BR no frontend já usado em `user_role`/`client_type`/`client_segment` — não os literais em maiúsculas com acento do catálogo original do fleet-auth-gate.

## Components and Interfaces

```
vehicles/
├── api/            list-vehicles, get-vehicle, create-vehicle, update-vehicle,
│                   deactivate-vehicle, reactivate-vehicle
├── screens/
│   └── vehicles-list-screen/      → /vehicles (todos os perfis com acesso — RLS resolve o escopo)
├── components/
│   ├── create-vehicle-drawer/     → /vehicles/add
│   ├── vehicle-detail-drawer/     → /vehicles/:vehicleId
│   ├── edit-vehicle-drawer/       → /vehicles/:vehicleId/edit
│   └── deactivate-vehicle-confirm-dialog/
├── hooks/          useVehicles, useVehicle, useCreateVehicle, useUpdateVehicle,
│                   useDeactivateVehicle, useReactivateVehicle
├── validations/     create-vehicle-schema.ts, edit-vehicle-schema.ts
├── constants/       query-keys.ts, labels.ts (VEHICLE_TYPE_LABELS, VEHICLE_USAGE_LABELS)
└── index.ts
```

```
pages/
└── vehicles/
    ├── vehicles-page.tsx               → /vehicles                (VehiclesListScreen)
    ├── add/
    │   └── add-vehicle-page.tsx        → /vehicles/add             (CreateVehicleDrawer, rota filha)
    └── [vehicleId]/
        ├── vehicle-detail-page.tsx     → /vehicles/:vehicleId      (VehicleDetailDrawer, rota filha)
        └── edit/
            └── edit-vehicle-page.tsx   → /vehicles/:vehicleId/edit (EditVehicleDrawer, rota filha)
```

Mesmo critério de `/clients`: uma única screen de gestão com `<Outlet/>` pros drawers aninhados. Sem seção "Veículos deste cliente" embutida no `client-detail-drawer` nessa spec (ver Requirements, decisão explícita de escopo).

### Seletor de cliente no formulário

`create-vehicle-drawer`/`edit-vehicle-drawer` usam `useClients()` (já exportado por `@/features/clients`) pra popular o `Select` de cliente — a RLS de `clients` já resolve o escopo certo por role automaticamente (um `seller` só vê os próprios clientes nesse seletor, sem lógica extra no frontend).

## Data Models

### Enums novos

```sql
create type vehicle_type as enum (
  'tow_truck', 'semi_trailer', 'heavy_truck', 'light_truck', 'bus',
  'heavy_pickup', 'light_pickup', 'passenger_car', 'motorcycle'
);

create type vehicle_usage as enum (
  'cargo_transport', 'commercial', 'private', 'tow_service', 'test_drive',
  'driving_school', 'garbage_collector', 'funeral_service', 'walk_in_rental',
  'contract_rental', 'taxi', 'passenger_transport', 'school_transport'
);
```

### `vehicles` (nova, tenant-scoped)

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid, pk | |
| `brokerage_id` | uuid, not null, fk `brokerages(id)` on delete cascade | |
| `client_id` | uuid, not null, fk `clients(id)` on delete cascade | |
| `plate` | text, not null | |
| `chassis` | text, nullable | |
| `identification_code` | text, nullable | |
| `renavam` | text, nullable | |
| `brand`, `model` | text, nullable | |
| `manufacture_year`, `model_year` | integer, nullable | |
| `vehicle_type` | `vehicle_type`, nullable | |
| `vehicle_usage` | `vehicle_usage`, nullable | |
| `fuel_type` | text, nullable | |
| `fipe_code` | text, nullable | |
| `fipe_value`, `declared_value` | numeric, nullable | |
| `overnight_zip_code` | text, nullable | |
| `main_state` | text, nullable | |
| `has_tracker` | boolean, not null, default `false` | |
| `tracker_model` | text, nullable | |
| `accessories` | text, nullable | |
| `main_driver` | text, nullable | |
| `has_claim_history` | boolean, not null, default `false` | |
| `notes` | text, nullable | |
| `is_active` | boolean, not null, default `true` | |
| `created_at`, `updated_at` | timestamptz | trigger `set_updated_at` |

Índices em `brokerage_id`, `client_id` e `plate` (filtro RLS + busca).

### RLS

Reaproveita `is_my_client(client_id)` (já existe, `SECURITY DEFINER`, ver `.agents/specs/clients/design.md`) — nenhuma função nova precisa ser criada.

```sql
-- vehicles_select / vehicles_insert / vehicles_update (mesma condição nos três)
brokerage_id = get_my_brokerage_id()
and (
  get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
  or (get_my_role() = 'seller' and is_my_client(client_id))
)
```

`analyst` e `viewer` não aparecem em nenhuma policy — sem SELECT, ficam automaticamente sem nenhum acesso (Requirement 2.3), diferente de `clients` onde `viewer` tinha leitura ampla. Sem policy de DELETE — nunca é excluído (Requirement 5, só `is_active = false` via UPDATE comum).

## Error Handling

- Erros de validação de formulário (criar/editar veículo) — inline por campo, via React Hook Form. `plate` obrigatória (Requirement 1.1).
- Ação sem permissão — bloqueada por RLS; botão/rota nem aparece pra quem não tem permissão.
- Inativar veículo — `AlertDialog` de confirmação (mesmo padrão de `deactivate-client`). Reativar — ação de um clique, sem confirmação.

## Testing Strategy

Seguindo o padrão já usado nas specs anteriores:

- **Componente** (RTL) — `create-vehicle-drawer` (validação, submit, seletor de cliente escopado por role), `edit-vehicle-drawer`, `deactivate-vehicle-confirm-dialog`.
- **Hooks** — `useCreateVehicle`, `useUpdateVehicle` com `QueryClient` de teste e `api/` mockado.
- **E2E** (Playwright) — `seller` cadastra veículo só pra um cliente próprio (seletor não mostra clientes de outro `seller`) → aparece na listagem dele; um segundo `seller` sem esse cliente não vê o veículo (isolamento em cascata); `brokerage_admin` inativa um veículo → continua listado com indicação de inativo → reativa.
