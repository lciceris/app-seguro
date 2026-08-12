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

- [x] 2. Camada de dados do frontend
  - [x] 2.1 Criar `features/insurers/types/insurer.ts` + `constants/query-keys.ts`
    - _Requirements: infra_
  - [x] 2.2 Criar `features/insurers/api/` — `list-insurers`, `get-insurer`, `create-insurer`, `update-insurer`, `list-insurer-catalog`, `disable-insurer`, `enable-insurer`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2, 5.3_
  - [x] 2.3 Criar `features/insurers/hooks/` correspondentes — cada mutation invalida a query certa. `useDisableInsurer`/`useEnableInsurer` pegam o `brokerage_id` do auth store internamente, então o componente só passa o `insurerId`.
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2, 5.3_

  Verificação ponta a ponta desses hooks fica pra quando a UI (Task 3+) existir e puder exercitá-los pelo navegador — a RLS por trás já foi validada com usuários reais na Task 1.

- [x] 3. Listagem de seguradoras (platform_admin)
  - [x] 3.1 Criar `features/insurers/screens/insurers-list-screen/` — tabela com nome, CNPJ, ações (mesmo padrão visual de `users-list-screen`/`brokerages-list-screen`), `<Outlet/>` pros drawers aninhados
    - _Requirements: 2.1_
  - [x] 3.2 Criar `pages/admin/insurers/insurers-page.tsx` e registrar a rota `/admin/insurers` (restrita a `platform_admin`)
    - _Requirements: 2.2_
  - [x] 3.3 (ajuste, não é lacuna) A rota é `/admin/insurers`, não `/insurers` — bate com `INITIAL_ROUTE_BY_ROLE.platform_admin` já definido na spec `auth`. `pages/` segue movido pra `pages/admin/insurers/` pra espelhar a URL (convenção já estabelecida).
    - _Requirements: infra_

  Verificado com o usuário `platform_admin` real pelo navegador: lista seguradoras de teste com nome e CNPJ (ou "—" quando não informado); `brokerage_admin` tentando acessar `/admin/insurers` diretamente é bloqueado e redirecionado pra própria rota inicial. Nenhum erro de console.

- [x] 4. Cadastrar seguradora
  - [x] 4.1 Criar `features/insurers/validations/create-insurer-schema.ts` (nome obrigatório; CNPJ, e-mail, telefone, website, contato, prazo de resposta, ordem de exibição e observações opcionais)
    - _Requirements: 1.1_
  - [x] 4.2 Criar `features/insurers/components/create-insurer-drawer/`
    - _Requirements: 1.1_
  - [x] 4.3 Criar `pages/admin/insurers/add/add-insurer-page.tsx` como rota filha `/admin/insurers/add`
    - _Requirements: 1.1_
  - [x] 4.4 (infra) shadcn `textarea` (não existia ainda) — usado no campo Observações
    - _Requirements: infra_

  Verificado com o usuário `platform_admin` real pelo navegador: drawer abre sobre a listagem via `/admin/insurers/add` sem perder a lista de fundo; validação de nome obrigatório e de formato de e-mail aparecem inline sem chamar a API; submit com todos os campos preenchidos (CNPJ, e-mail, telefone, website, contato, prazo de resposta, ordem de exibição, observações) salva corretamente — números confirmados como `number` no banco (não string), toast de sucesso, volta pra lista. Nenhum erro de console.

- [x] 5. Ver detalhe de uma seguradora
  - [x] 5.1 Criar `features/insurers/components/insurer-detail-drawer/`
    - _Requirements: 3.1_
  - [x] 5.2 Criar `pages/admin/insurers/[insurerId]/insurer-detail-page.tsx` como rota filha `/admin/insurers/:insurerId`
    - _Requirements: 3.1_

  Verificado com usuário `platform_admin` real pelo navegador (script efêmero, limpo depois): drawer abre sobre a listagem via `/admin/insurers/:insurerId` sem perder a lista de fundo; todos os campos cadastrais aparecem corretamente (nome, CNPJ, e-mail, telefone comercial, website, contato comercial, prazo de resposta, ordem de exibição, observações — sem campo de status, já que não existe na tabela); "Fechar" navega de volta pra `/admin/insurers`. Nenhum erro de console.

- [x] 6. Editar seguradora
  - [x] 6.1 Criar `features/insurers/validations/edit-insurer-schema.ts`
    - _Requirements: 4.1_
  - [x] 6.2 Criar `features/insurers/components/edit-insurer-drawer/`
    - _Requirements: 4.1_
  - [x] 6.3 Criar `pages/admin/insurers/[insurerId]/edit/edit-insurer-page.tsx` como rota filha `/admin/insurers/:insurerId/edit`
    - _Requirements: 4.1_

  Verificado com usuário `platform_admin` real pelo navegador (script efêmero, limpo depois): drawer de edição abre sobre a listagem via `/admin/insurers/:insurerId/edit`; os valores atuais (nome, CNPJ, prazo de resposta) já vêm pré-preenchidos corretamente no primeiro render, sem depender de `reset()` pós-mount (mesmo padrão de `edit-brokerage-drawer`/`edit-user-drawer`, aqui sem Select controlado); editar nome e e-mail e salvar atualiza corretamente no banco (confirmado via query direta) e a listagem reflete o novo nome. Nenhum erro de console.

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
