# Implementation Plan

- [ ] 1. Schema e RLS base
  - [ ] 1.1 Migration: enums `vehicle_type` e `vehicle_usage` (catálogo fixo de frota)
    - _Requirements: 1.1_
  - [ ] 1.2 Migration: tabela `vehicles` (tenant-scoped, `client_id` fk `clients(id)`; `plate` obrigatória, demais campos opcionais; `is_active` default `true`; trigger `set_updated_at`)
    - _Requirements: 1.1_
  - [ ] 1.3 Migration: RLS de `vehicles` — `vehicles_select`, `vehicles_insert`, `vehicles_update` reaproveitando `is_my_client(client_id)` (já existe, spec `clients`); sem policy de DELETE
    - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 3.2, 4.1, 4.2_

  Verificar com usuários/corretoras de teste reais (script efêmero, limpo depois): `seller` cadastra veículo só pra um cliente vinculado a ele; `seller` bloqueado ao tentar cadastrar veículo pra um cliente que não é dele; `supervisor`/`brokerage_admin`/`platform_admin` cadastram veículo pra qualquer cliente da corretora; um segundo `seller` (sem o cliente vinculado) não enxerga o veículo; `analyst` e `viewer` não enxergam nenhum veículo (RLS silenciosa — nem SELECT).

- [ ] 2. Camada de dados do frontend
  - [ ] 2.1 Criar `features/vehicles/types/vehicle.ts` + `constants/query-keys.ts` + `constants/labels.ts` (`VEHICLE_TYPE_LABELS`, `VEHICLE_USAGE_LABELS`)
    - _Requirements: infra_
  - [ ] 2.2 Criar `features/vehicles/api/` — `list-vehicles`, `get-vehicle`, `create-vehicle`, `update-vehicle`, `deactivate-vehicle`, `reactivate-vehicle`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2_
  - [ ] 2.3 Criar `features/vehicles/hooks/` correspondentes — cada mutation invalida a query certa
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2_

- [ ] 3. Listagem de veículos
  - [ ] 3.1 Criar `features/vehicles/screens/vehicles-list-screen/` — tabela com placa, cliente, marca/modelo, tipo, status; busca por placa, chassi ou nome do cliente; `<Outlet/>` pros drawers aninhados
    - _Requirements: 2.1, 2.2, 5.3_
  - [ ] 3.2 Criar `pages/vehicles/vehicles-page.tsx` e registrar a rota `/vehicles` (restrita a `platform_admin`, `brokerage_admin`, `supervisor`, `seller`)
    - _Requirements: 2.3_

- [ ] 4. Cadastrar veículo
  - [ ] 4.1 Criar `features/vehicles/validations/create-vehicle-schema.ts` (placa obrigatória; demais campos opcionais)
    - _Requirements: 1.1_
  - [ ] 4.2 Criar `features/vehicles/components/create-vehicle-drawer/` — seletor de cliente via `useClients()` (RLS já escopa por role)
    - _Requirements: 1.1, 1.2_
  - [ ] 4.3 Criar `pages/vehicles/add/add-vehicle-page.tsx` como rota filha `/vehicles/add`
    - _Requirements: 1.1_

- [ ] 5. Ver detalhe de um veículo
  - [ ] 5.1 Criar `features/vehicles/components/vehicle-detail-drawer/`
    - _Requirements: 3.1_
  - [ ] 5.2 Criar `pages/vehicles/[vehicleId]/vehicle-detail-page.tsx` como rota filha `/vehicles/:vehicleId`
    - _Requirements: 3.1_

- [ ] 6. Editar veículo
  - [ ] 6.1 Criar `features/vehicles/validations/edit-vehicle-schema.ts`
    - _Requirements: 4.1_
  - [ ] 6.2 Criar `features/vehicles/components/edit-vehicle-drawer/`
    - _Requirements: 4.1, 4.2, 4.3_
  - [ ] 6.3 Criar `pages/vehicles/[vehicleId]/edit/edit-vehicle-page.tsx` como rota filha `/vehicles/:vehicleId/edit`
    - _Requirements: 4.1_

- [ ] 7. Inativar e reativar veículo
  - [ ] 7.1 Criar `features/vehicles/components/deactivate-vehicle-confirm-dialog/` (`AlertDialog`, mesmo padrão de `deactivate-client`)
    - _Requirements: 5.1_
  - [ ] 7.2 Ações na listagem — inativar (com confirmação) e reativar (um clique, sem confirmação)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Testes
  - [ ] 8.1 Testes de componente: `create-vehicle-drawer` (validação, submit, seletor de cliente), `edit-vehicle-drawer`, `deactivate-vehicle-confirm-dialog`
    - _Requirements: 1.1, 4.1, 5.1_
  - [ ] 8.2 Testes de hook: `useCreateVehicle`, `useUpdateVehicle`
    - _Requirements: 1.1, 4.1_
  - [ ] 8.3 Teste E2E: `seller` cadastra veículo só pra um cliente próprio → aparece na listagem dele → um segundo `seller` sem esse cliente não vê (isolamento em cascata)
    - _Requirements: 1.2, 2.2_
  - [ ] 8.4 Teste E2E: `brokerage_admin` inativa um veículo → continua listado com indicação de inativo → reativa
    - _Requirements: 5.1, 5.2, 5.3_
