# Implementation Plan

- [x] 1. Schema e RLS base
  - [x] 1.1 Migration: enums `client_type` (`individual`, `company`) e `client_segment` (`lead`, `active`, `vip`, `inactive`)
    - _Requirements: 1.1_
  - [x] 1.2 Migration: tabela `clients` (tenant-scoped — todos os campos PF/PJ, endereço, contato comercial e financeiro, segmento, origem do lead, observações; trigger `set_updated_at`)
    - _Requirements: 1.1_
  - [x] 1.3 Migration: tabela `client_sellers` (vínculo N:N, `UNIQUE(client_id, seller_id)`, `is_primary`)
    - _Requirements: 1.2, 5.1_
  - [x] 1.4 Migration: funções `SECURITY DEFINER` — `get_client_brokerage_id(uuid)` e `is_my_client(uuid)`
    - _Requirements: infra_
  - [x] 1.5 Migration: RLS de `clients` — `clients_select`, `clients_insert`, `clients_update` (sem policy de DELETE)
    - _Requirements: 1.4, 2.1, 2.2, 2.3, 4.1, 4.2, 4.3_
  - [x] 1.6 Migration: RLS de `client_sellers` — `client_sellers_select`, `client_sellers_manage` (INSERT/UPDATE/DELETE restrito a `platform_admin`/`brokerage_admin`/`supervisor`)
    - _Requirements: 3.1, 3.2, 5.1, 5.2, 5.3, 5.4_
  - [x] 1.7 Migration: trigger `enforce_single_primary_seller` em `client_sellers` (desmarca o principal anterior)
    - _Requirements: 5.3_
  - [x] 1.8 Migration: trigger `auto_link_seller_as_primary` em `clients` (vincula `seller` criador como principal, via `SECURITY DEFINER`, sem abrir INSERT direto pra `seller` em `client_sellers`)
    - _Requirements: 1.2_
  - [x] 1.9 (achado durante a verificação, não é lacuna) `INSERT ... RETURNING` reavalia a policy de SELECT antes do trigger `AFTER INSERT` terminar — documentado em design.md ("Pegadinha confirmada"). Impacta diretamente como `create-client` (Task 2) precisa ser implementado: `insert()` e `select()` em duas requisições separadas, nunca encadeadas.
    - _Requirements: infra_

  8 migrations aplicadas no projeto hospedado (`supabase db push --linked`) e tipos TypeScript regenerados (`supabase gen types typescript`). Verificado com usuários/corretoras de teste reais (script efêmero, limpo depois): `seller` cria cliente → vínculo automático como principal confirmado em `client_sellers` (usando insert/select separados, ver 1.9); `seller` bloqueado ao tentar inserir vínculo de outro vendedor diretamente (RLS); um segundo `seller` sem vínculo não enxerga o cliente; `supervisor` enxerga qualquer cliente da corretora e consegue adicionar um segundo vendedor (secundário); o vendedor recém-adicionado passa a enxergar o cliente; `supervisor` marca o segundo vendedor como principal → trigger desmarca o primeiro automaticamente (só 1 principal confirmado no banco); cliente criado por `supervisor` não tem vínculo automático (trigger só age pra `seller`); `supervisor` inativa cliente via `UPDATE segment = 'inactive'` com sucesso.

- [x] 2. Camada de dados do frontend
  - [x] 2.1 Criar `features/clients/types/client.ts` + `constants/query-keys.ts`
    - _Requirements: infra_
  - [x] 2.2 Criar `features/clients/api/` — `list-clients`, `get-client`, `create-client`, `update-client`, `deactivate-client`, `reactivate-client`, `list-client-sellers`, `add-client-seller`, `remove-client-seller` (com a checagem de principal-sem-substituto — ver design.md), `set-primary-client-seller`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2, 5.3, 6.1, 6.2_
  - [x] 2.3 Criar `features/clients/hooks/` correspondentes — cada mutation invalida a query certa. `useCreateClient` pega o `brokerage_id` do auth store internamente (`create-client` API recebe `brokerage_id` explícito, mas quem chama é o hook, nunca o componente/formulário — mesmo padrão de `useDisableInsurer`).
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2, 5.3, 6.1, 6.2_

  `create-client` implementa o fix da pegadinha encontrada na Task 1 (`insert()` e `select()` em duas requisições separadas, `id` gerado no cliente). Verificação ponta a ponta desses hooks fica pra quando a UI (Task 3+) existir e puder exercitá-los pelo navegador — a RLS/triggers por trás já foram validados com usuários reais na Task 1. `npx tsc --noEmit` e `npx eslint src/features/clients` sem erros.

- [x] 3. Listagem de clientes
  - [x] 3.1 Criar `features/clients/screens/clients-list-screen/` — tabela com nome/razão social, tipo, CPF/CNPJ, segmento (com indicação visual de inativo), cidade/UF; busca por nome/razão social ou CPF/CNPJ; `<Outlet/>` pros drawers aninhados
    - _Requirements: 2.1, 2.2, 6.4_
  - [x] 3.2 Criar `pages/clients/clients-page.tsx` e registrar a rota `/clients` (restrita a `platform_admin`, `brokerage_admin`, `supervisor`, `seller`, `viewer`)
    - _Requirements: 2.3_

  Verificado com usuários de teste reais pelo navegador (script efêmero, limpo depois): `seller` A (vinculado a 1 cliente) vê só o próprio na listagem, com botão "Novo cliente" visível; `seller` B (sem vínculo nenhum) vê a listagem vazia; `viewer` vê todos os 2 clientes da corretora, sem botão "Novo cliente" nem ícone Editar (RLS + `canEdit` condicional na UI); busca por nome parcial e por CNPJ filtra corretamente; badge de segmento (`VIP`) renderiza com a cor certa. Botões "Ver"/"Editar" já apontam pra `/clients/:id`/`/clients/:id/edit` (ainda sem rota registrada — Tasks 5/6) e "Novo cliente" pra `/clients/add` (Task 4), seguindo o mesmo padrão já usado em `insurers` Task 3 (UI antecipada, rota vem depois).

- [ ] 4. Cadastrar cliente
  - [ ] 4.1 Criar `features/clients/validations/create-client-schema.ts` (razão social/nome obrigatório; demais campos opcionais)
    - _Requirements: 1.1_
  - [ ] 4.2 Criar `features/clients/components/create-client-drawer/` — seletor de vendedores (multi-select + principal) só quando `usuario.role !== 'seller'`
    - _Requirements: 1.1, 1.2, 1.3_
  - [ ] 4.3 Criar `pages/clients/add/add-client-page.tsx` como rota filha `/clients/add`
    - _Requirements: 1.1_

- [ ] 5. Ver detalhe de um cliente (com gestão de vendedores vinculados)
  - [ ] 5.1 Criar `features/clients/components/client-detail-drawer/` — todos os campos cadastrais + seção de vendedores vinculados (badge de principal; para `platform_admin`/`brokerage_admin`/`supervisor`: adicionar, remover — com seletor inline de substituto quando remover o principal e restarem outros — e marcar principal; `seller` só visualiza)
    - _Requirements: 3.1, 3.2, 5.1, 5.2, 5.3, 5.4_
  - [ ] 5.2 Criar `pages/clients/[clientId]/client-detail-page.tsx` como rota filha `/clients/:clientId`
    - _Requirements: 3.1_

- [ ] 6. Editar cliente
  - [ ] 6.1 Criar `features/clients/validations/edit-client-schema.ts`
    - _Requirements: 4.1_
  - [ ] 6.2 Criar `features/clients/components/edit-client-drawer/`
    - _Requirements: 4.1, 4.2, 4.3_
  - [ ] 6.3 Criar `pages/clients/[clientId]/edit/edit-client-page.tsx` como rota filha `/clients/:clientId/edit`
    - _Requirements: 4.1_

- [ ] 7. Inativar e reativar cliente
  - [ ] 7.1 Criar `features/clients/components/deactivate-client-confirm-dialog/` (`AlertDialog`, mesmo padrão de `deactivate-brokerage`/`deactivate-user`)
    - _Requirements: 6.1, 6.3_
  - [ ] 7.2 Ações na listagem/detalhe — inativar (com confirmação) e reativar (um clique, sem confirmação)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 8. Testes
  - [ ] 8.1 Testes de componente: `create-client-drawer` (validação, submit, seletor de vendedores condicional), `edit-client-drawer`, `client-detail-drawer` (adicionar/remover/trocar principal), `deactivate-client-confirm-dialog`
    - _Requirements: 1.1, 4.1, 5.1, 5.2, 5.3, 6.1_
  - [ ] 8.2 Testes de hook: `useCreateClient`, `useUpdateClient`, `useAddClientSeller`, `useRemoveClientSeller`
    - _Requirements: 1.1, 4.1, 5.1, 5.2_
  - [ ] 8.3 Teste E2E: `seller` cadastra cliente → vínculo automático como principal → um segundo `seller` de teste não o vê (isolamento por vínculo)
    - _Requirements: 1.2, 2.2_
  - [ ] 8.4 Teste E2E: `supervisor` cadastra cliente escolhendo dois vendedores → detalhe mostra ambos, um marcado como principal
    - _Requirements: 1.3, 3.1_
  - [ ] 8.5 Teste E2E: `brokerage_admin` inativa um cliente → continua listado com indicação de inativo → reativa
    - _Requirements: 6.1, 6.2, 6.4_
