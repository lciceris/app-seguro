# Implementation Plan

- [x] 1. Schema e RLS base
  - [x] 1.1 Migration: tabela `insurers` (catálogo global — `name`, `cnpj`, `email`, `phone`, `website`, `contact_name`, `response_time_days`, `display_order`, `notes`, sem coluna de status)
    - _Requirements: 1.1_
  - [x] 1.2 Migration: RLS de `insurers` — `insurers_select_managed` (`platform_admin`/`brokerage_admin`), `insurers_insert_platform_admin`, `insurers_update_platform_admin`
    - _Requirements: 1.3, 2.2, 3.2, 4.2_
  - [x] 1.3 Migration: tabela `brokerage_disabled_insurers` (pk composta `brokerage_id`/`insurer_id`, modelada como lista de exceções — ver design.md)
    - _Requirements: 5.2, 5.3_
  - [x] 1.4 Migration: RLS de `brokerage_disabled_insurers` — `brokerage_disabled_insurers_select_own`, `brokerage_disabled_insurers_insert_own`, `brokerage_disabled_insurers_delete_own`
    - _Requirements: 5.2, 5.3, 5.6_

  Verificado com usuários/corretoras de teste reais (script efêmero, limpo depois): `platform_admin` cria e edita seguradoras; `brokerage_admin` lê o catálogo mas é bloqueado ao tentar criar/editar (RLS silenciosa — 0 linhas afetadas, dado no banco intacto); `seller` não enxerga nenhuma seguradora. `brokerage_admin` A desabilita uma seguradora só pra própria corretora — bloqueado ao tentar fazer isso pra outra corretora, e um `seller` da mesma corretora também é bloqueado (só `brokerage_admin` gerencia). Confirmado o isolamento por corretora via o embed do catálogo: a corretora A vê a seguradora como desabilitada, a corretora B continua vendo como habilitada. Reabilitar (`DELETE`) funciona e volta ao estado padrão.

- [ ] 2. Camada de dados do frontend
  - [ ] 2.1 Criar `features/insurers/types/insurer.ts` + `constants/query-keys.ts`
    - _Requirements: infra_
  - [ ] 2.2 Criar `features/insurers/api/` — `list-insurers`, `get-insurer`, `create-insurer`, `update-insurer`, `list-insurer-catalog`, `disable-insurer`, `enable-insurer`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2, 5.3_
  - [ ] 2.3 Criar `features/insurers/hooks/` correspondentes — cada mutation invalida a query certa
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2, 5.3_

- [ ] 3. Listagem de seguradoras (platform_admin)
  - [ ] 3.1 Criar `features/insurers/screens/insurers-list-screen/` — tabela com nome, CNPJ, ações (mesmo padrão visual de `users-list-screen`/`brokerages-list-screen`), `<Outlet/>` pros drawers aninhados
    - _Requirements: 2.1_
  - [ ] 3.2 Criar `pages/insurers/insurers-page.tsx` e registrar a rota `/insurers` (restrita a `platform_admin`)
    - _Requirements: 2.2_

- [ ] 4. Cadastrar seguradora
  - [ ] 4.1 Criar `features/insurers/validations/create-insurer-schema.ts` (nome obrigatório; CNPJ, e-mail, telefone, website, contato, prazo de resposta, ordem de exibição e observações opcionais)
    - _Requirements: 1.1_
  - [ ] 4.2 Criar `features/insurers/components/create-insurer-drawer/`
    - _Requirements: 1.1_
  - [ ] 4.3 Criar `pages/insurers/add/add-insurer-page.tsx` como rota filha `/insurers/add`
    - _Requirements: 1.1_

- [ ] 5. Ver detalhe de uma seguradora
  - [ ] 5.1 Criar `features/insurers/components/insurer-detail-drawer/`
    - _Requirements: 3.1_
  - [ ] 5.2 Criar `pages/insurers/[insurerId]/insurer-detail-page.tsx` como rota filha `/insurers/:insurerId`
    - _Requirements: 3.1_

- [ ] 6. Editar seguradora
  - [ ] 6.1 Criar `features/insurers/validations/edit-insurer-schema.ts`
    - _Requirements: 4.1_
  - [ ] 6.2 Criar `features/insurers/components/edit-insurer-drawer/`
    - _Requirements: 4.1_
  - [ ] 6.3 Criar `pages/insurers/[insurerId]/edit/edit-insurer-page.tsx` como rota filha `/insurers/:insurerId/edit`
    - _Requirements: 4.1_

- [ ] 7. Habilitar/desabilitar seguradora por corretora (brokerage_admin)
  - [ ] 7.1 Criar `features/insurers/screens/insurer-catalog-screen/` — lista com toggle inline habilitado/desabilitado, sem dialog de confirmação (ação reversível a qualquer momento)
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ] 7.2 Criar `pages/my-insurers/my-insurers-page.tsx` e registrar a rota `/my-insurers` (restrita a `platform_admin`/`brokerage_admin`)
    - _Requirements: 5.6_

- [ ] 8. Testes
  - [ ] 8.1 Testes de componente: `create-insurer-drawer`, `edit-insurer-drawer`, `insurer-catalog-screen`
    - _Requirements: 1.1, 4.1, 5.2, 5.3_
  - [ ] 8.2 Testes de hook: `useCreateInsurer`, `useUpdateInsurer`, `useDisableInsurer`
    - _Requirements: 1.1, 4.1, 5.2_
  - [ ] 8.3 Teste E2E: `platform_admin` cadastra seguradora → aparece no catálogo de `/my-insurers`
    - _Requirements: 1.1, 5.1_
  - [ ] 8.4 Teste E2E: `brokerage_admin` desabilita uma seguradora → some das opções dele, mas uma segunda corretora continua vendo normalmente (isolamento) → reabilita
    - _Requirements: 5.2, 5.3_
