# Implementation Plan

- [ ] 1. RLS e função adicionais (estendem a base de `auth`)
  - [ ] 1.1 Migration: policy adicional em `users` para `brokerage_admin`/`platform_admin` gerenciarem (SELECT/INSERT/UPDATE) outros usuários da própria corretora
    - _Requirements: 1.1, 3.1, 4.1, 5.1_
  - [ ] 1.2 Migration: função `can_add_user(brokerage_id)` (SECURITY DEFINER) comparando usuários ativos vs. `plans.max_users`
    - _Requirements: 1.2_

- [ ] 2. Edge Functions
  - [ ] 2.1 Criar Edge Function `invite-user` (cria no Auth, checa `can_add_user`, insere em `users`, envia email de convite)
    - _Requirements: 1.1, 1.2_
  - [ ] 2.2 Criar Edge Function `update-user-password`
    - _Requirements: 2.1_

- [ ] 3. Camada de dados do frontend
  - [ ] 3.1 Criar `features/users/constants/query-keys.ts`
    - _Requirements: infra_
  - [ ] 3.2 Criar `features/users/api/` — `list-users`, `get-user`, `invite-user`, `update-user`, `update-user-password`, `deactivate-user`, `reactivate-user`
    - _Requirements: 1.1, 2.1, 3.1, 3.5, 4.1, 5.1_
  - [ ] 3.3 Criar `features/users/hooks/` — `useUsers`, `useUser`, `useInviteUser`, `useUpdateUser`, `useUpdateUserPassword`, `useDeactivateUser`, `useReactivateUser`
    - _Requirements: 1.1, 2.1, 3.1, 3.5, 4.1, 5.1_

- [ ] 4. Listagem de usuários
  - [ ] 4.1 Criar `features/users/screens/users-list-screen/`
    - _Requirements: 5.1_
  - [ ] 4.2 Criar `pages/users/users-page.tsx` e registrar a rota `/users`
    - _Requirements: 5.1_

- [ ] 5. Convidar usuário
  - [ ] 5.1 Criar `features/users/validations/invite-user-schema.ts`
    - _Requirements: 1.1_
  - [ ] 5.2 Criar `features/users/components/invite-user-drawer/` (inclui feedback de limite de plano atingido)
    - _Requirements: 1.1, 1.2_
  - [ ] 5.3 Criar `pages/users/add/add-user-page.tsx` como rota filha `/users/add`
    - _Requirements: 1.1_

- [ ] 6. Ver detalhe de usuário
  - [ ] 6.1 Criar `features/users/components/user-detail-drawer/`
    - _Requirements: 5.1_
  - [ ] 6.2 Criar `pages/users/[userId]/user-detail-page.tsx` como rota filha `/users/:userId`
    - _Requirements: 5.1_

- [ ] 7. Editar usuário
  - [ ] 7.1 Criar `features/users/validations/edit-user-schema.ts` (nome, telefone, perfil — sem e-mail)
    - _Requirements: 4.1, 4.3_
  - [ ] 7.2 Criar `features/users/components/edit-user-drawer/`
    - _Requirements: 4.1_
  - [ ] 7.3 Criar `pages/users/[userId]/edit/edit-user-page.tsx` como rota filha `/users/:userId/edit`
    - _Requirements: 4.1_

- [ ] 8. Reset de senha
  - [ ] 8.1 Criar `features/users/validations/reset-password-schema.ts`
    - _Requirements: 2.1_
  - [ ] 8.2 Criar `features/users/components/reset-password-dialog/` (formulário local, sem rota)
    - _Requirements: 2.1_

- [ ] 9. Desativar e reativar usuário
  - [ ] 9.1 Criar `features/users/components/deactivate-confirm-dialog/` (`AlertDialog`, sem rota)
    - _Requirements: 3.1, 3.4_
  - [ ] 9.2 Implementar ação de reativar na listagem (sem dialog de confirmação — reativar não é destrutivo)
    - _Requirements: 3.5_

- [ ] 10. Testes
  - [ ] 10.1 Testes de componente: `invite-user-drawer`, `edit-user-drawer`, `deactivate-confirm-dialog`
    - _Requirements: 1.1, 4.1, 3.1_
  - [ ] 10.2 Testes de hook: `useInviteUser`, `useUpdateUser`, `useDeactivateUser`, `useUpdateUserPassword`
    - _Requirements: 1.1, 4.1, 3.1, 2.1_
  - [ ] 10.3 Teste E2E: convite → definir senha → primeiro login (ponta a ponta com a spec `auth`)
    - _Requirements: 1.1_
  - [ ] 10.4 Teste E2E: desativação → tentativa de login bloqueada → reativação → login funciona de novo
    - _Requirements: 3.1, 3.2, 3.3, 3.5_
