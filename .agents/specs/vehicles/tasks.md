# Implementation Plan

- [x] 1. Schema e RLS base
  - [x] 1.1 Migration: enums `vehicle_type` e `vehicle_usage` (catálogo fixo de frota)
    - _Requirements: 1.1_
  - [x] 1.2 Migration: tabela `vehicles` (tenant-scoped, `client_id` fk `clients(id)`; `plate` obrigatória, demais campos opcionais; `is_active` default `true`; trigger `set_updated_at`)
    - _Requirements: 1.1_
  - [x] 1.3 Migration: RLS de `vehicles` — `vehicles_select`, `vehicles_insert`, `vehicles_update` reaproveitando `is_my_client(client_id)` (já existe, spec `clients`); sem policy de DELETE
    - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 3.2, 4.1, 4.2_

  3 migrations aplicadas no projeto hospedado (`supabase db push --linked`) e tipos TypeScript regenerados. Verificado com usuários/corretoras de teste reais (script efêmero, limpo depois): `seller` A cadastra veículo pro próprio cliente; `seller` A bloqueado ao tentar cadastrar veículo pra um cliente de outro vendedor; `seller` B (sem o cliente vinculado) não enxerga o veículo; `supervisor` enxerga o veículo e cadastra veículo pra qualquer cliente da corretora; `viewer` não enxerga nenhum veículo (sem policy nenhuma pra esse role — nem leitura, diferente de `clients`); `supervisor` inativa via `UPDATE is_active = false` com sucesso. Nenhuma função nova precisou ser criada — `is_my_client()` da spec `clients` reaproveitada como planejado.

- [x] 2. Camada de dados do frontend
  - [x] 2.1 Criar `features/vehicles/types/vehicle.ts` + `constants/query-keys.ts` + `constants/labels.ts` (`VEHICLE_TYPE_LABELS`, `VEHICLE_USAGE_LABELS`)
    - _Requirements: infra_
  - [x] 2.2 Criar `features/vehicles/api/` — `list-vehicles`, `get-vehicle`, `create-vehicle`, `update-vehicle`, `deactivate-vehicle`, `reactivate-vehicle`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2_
  - [x] 2.3 Criar `features/vehicles/hooks/` correspondentes — cada mutation invalida a query certa. `useCreateVehicle` pega o `brokerage_id` do auth store internamente, mesmo padrão de `useCreateClient`.
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2_

  `list-vehicles`/`get-vehicle` fazem embed com `clients(id, legal_name)` (`VehicleWithClient`) pra exibir o nome do cliente na listagem/detalhe sem uma segunda query. Diferente de `create-client`, `create-vehicle`/`update-vehicle` usam `.insert()/.update().select().single()` normal — não há trigger nenhum em `vehicles` que crie a pegadinha de `RETURNING` encontrada na spec `clients`. `npx tsc --noEmit` e `npx eslint src/features/vehicles` sem erros. Verificação ponta a ponta desses hooks fica pra quando a UI (Task 3+) existir.

- [x] 3. Listagem de veículos
  - [x] 3.1 Criar `features/vehicles/screens/vehicles-list-screen/` — tabela com placa, cliente, marca/modelo, tipo, status; busca por placa, chassi ou nome do cliente; `<Outlet/>` pros drawers aninhados
    - _Requirements: 2.1, 2.2, 5.3_
  - [x] 3.2 Criar `pages/vehicles/vehicles-page.tsx` e registrar a rota `/vehicles` (restrita a `platform_admin`, `brokerage_admin`, `supervisor`, `seller`)
    - _Requirements: 2.3_

  Verificado com usuários de teste reais pelo navegador (script efêmero, limpo depois): `seller` A (vinculado a 1 cliente com 2 veículos) vê os 2 na listagem; badge "Inativo" e label de tipo em pt-BR (`VEHICLE_TYPE_LABELS`) renderizam corretamente; busca por placa filtra certo; `seller` B (sem cliente vinculado) vê a listagem vazia; `viewer` é bloqueado pela rota e redirecionado pra própria rota inicial (`/clients`) — nem chega a montar a tela. Botões "Ver"/"Editar" já apontam pra `/vehicles/:id`/`/vehicles/:id/edit` (rota vem nas Tasks 5/6) e "Novo veículo" pra `/vehicles/add` (Task 4), mesmo padrão de UI-antecipada já usado em `insurers`/`clients`.

- [x] 4. Cadastrar veículo
  - [x] 4.1 Criar `features/vehicles/validations/create-vehicle-schema.ts` (placa obrigatória; demais campos opcionais)
    - _Requirements: 1.1_
  - [x] 4.2 Criar `features/vehicles/components/create-vehicle-drawer/` — seletor de cliente via `useClients()` (RLS já escopa por role)
    - _Requirements: 1.1, 1.2_
  - [x] 4.3 Criar `pages/vehicles/add/add-vehicle-page.tsx` como rota filha `/vehicles/add`
    - _Requirements: 1.1_

  Verificado com dois `seller`s de teste reais pelo navegador (script efêmero, limpo depois): o seletor de cliente do `seller` A mostra só o próprio cliente vinculado — o cliente do `seller` B nem aparece na lista, sem precisar de nenhuma lógica extra no frontend (a RLS de `clients` já resolve isso via `useClients()`); submit com tipo/uso escolhidos, checkbox de rastreador marcado e campo de modelo do rastreador preenchido salva tudo corretamente no banco (número como `number`, não string); veículo aparece na listagem. Nenhum erro de console.

- [x] 5. Ver detalhe de um veículo
  - [x] 5.1 Criar `features/vehicles/components/vehicle-detail-drawer/`
    - _Requirements: 3.1_
  - [x] 5.2 Criar `pages/vehicles/[vehicleId]/vehicle-detail-page.tsx` como rota filha `/vehicles/:vehicleId`
    - _Requirements: 3.1_

  Verificado com `supervisor` e `seller` de teste reais pelo navegador (script efêmero, limpo depois): `supervisor` vê todos os campos cadastrados, incluindo nome do cliente, status, tipo/uso em pt-BR, valores formatados em `R$` e booleanos como "Sim"/"Não"; "Fechar" navega de volta pra `/vehicles`; `seller` sem vínculo com o cliente do veículo é bloqueado pela RLS (erro tratado com retry). Nenhum erro de console.

- [x] 6. Editar veículo
  - [x] 6.1 Criar `features/vehicles/validations/edit-vehicle-schema.ts`
    - _Requirements: 4.1_
  - [x] 6.2 Criar `features/vehicles/components/edit-vehicle-drawer/`
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 6.3 Criar `pages/vehicles/[vehicleId]/edit/edit-vehicle-page.tsx` como rota filha `/vehicles/:vehicleId/edit`
    - _Requirements: 4.1_
  - [x] 6.4 (achado durante a verificação, não é lacuna) Race condition nova, diferente da já conhecida (`defaultValues`-no-`useForm`): o Select de cliente depende de uma SEGUNDA query assíncrona (`useClients()`), não só de `useVehicle()`. Gatear o mount do formulário só em `vehicle` deixava o Select nascer em branco por um instante sempre que `clients` resolvia depois de `vehicle`. Corrigido gateando `EditVehicleDrawer` em `isVehicleLoading || isClientsLoading`.
    - _Requirements: infra_

  Verificado com usuário `supervisor` real pelo navegador (script efêmero, limpo depois, rodado 3x pra confirmar que não é flakiness): drawer de edição abre sobre a listagem via `/vehicles/:vehicleId/edit`; todos os valores atuais (placa, cliente, tipo, checkbox de rastreador) vêm pré-preenchidos corretamente e de forma consistente nas 3 execuções, sem o Select de cliente aparecer em branco; trocar o cliente vinculado e a placa e salvar atualiza corretamente no banco (`client_id` trocado confirmado) e a listagem reflete a nova placa. Nenhum erro de console.

- [x] 7. Inativar e reativar veículo
  - [x] 7.1 Criar `features/vehicles/components/deactivate-vehicle-confirm-dialog/` (`AlertDialog`, mesmo padrão de `deactivate-client`)
    - _Requirements: 5.1_
  - [x] 7.2 Ações na listagem — inativar (com confirmação) e reativar (um clique, sem confirmação)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  Verificado com `brokerage_admin` real pelo navegador (script efêmero, limpo depois): inativa um veículo ativo → `AlertDialog` de confirmação aparece, confirma, toast de sucesso, `is_active` vira `false` no banco e o veículo **continua listado** com badge "Inativo" (não desaparece); reativa com um clique só (sem `AlertDialog`), `is_active` volta pra `true` no banco. Ação disponível pros 4 perfis com acesso à listagem (sem restrição extra além da já garantida pela RLS — `seller` só inativa veículos dos próprios clientes, automaticamente).

- [ ] 8. Testes
  - [ ] 8.1 Testes de componente: `create-vehicle-drawer` (validação, submit, seletor de cliente), `edit-vehicle-drawer`, `deactivate-vehicle-confirm-dialog`
    - _Requirements: 1.1, 4.1, 5.1_
  - [ ] 8.2 Testes de hook: `useCreateVehicle`, `useUpdateVehicle`
    - _Requirements: 1.1, 4.1_
  - [ ] 8.3 Teste E2E: `seller` cadastra veículo só pra um cliente próprio → aparece na listagem dele → um segundo `seller` sem esse cliente não vê (isolamento em cascata)
    - _Requirements: 1.2, 2.2_
  - [ ] 8.4 Teste E2E: `brokerage_admin` inativa um veículo → continua listado com indicação de inativo → reativa
    - _Requirements: 5.1, 5.2, 5.3_
