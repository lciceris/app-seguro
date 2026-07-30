# Implementation Plan

- [x] 1. RLS e função adicionais (estendem a base de `auth`)
  - [x] 1.0 (fix de lacuna) Migration: `brokerages.plan_id` (fk `plans`, nullable) — a spec `auth` nunca vinculou `brokerages` a `plans`, sem isso `can_add_user()` não tinha como saber o limite. Sem plano vinculado = sem limite, até existir uma feature de billing/planos.
    - _Requirements: 1.2_
  - [x] 1.1 Migration: policy adicional em `users` para `brokerage_admin`/`platform_admin` gerenciarem (SELECT/INSERT/UPDATE) outros usuários da própria corretora
    - _Requirements: 1.1, 3.1, 4.1, 5.1_
  - [x] 1.2 Migration: função `can_add_user(brokerage_id)` (SECURITY DEFINER) comparando usuários ativos vs. `plans.max_users` — verificado via RPC direto (sem plano vinculado → `true`)
    - _Requirements: 1.2_
  - [x] 1.3 (fix de lacuna, encontrado ao iniciar a Task 3) Migration: policy `users_select_supervisor` — a 1.1 só cobria `brokerage_admin`/`platform_admin`, mas `supervisor` também tem leitura sobre usuários (ver `conventions/permissions.md` e Requirement 5 — ver detalhe)
    - _Requirements: 5.1_

- [x] 2. Edge Functions
  - [x] 2.1 Criar Edge Function `invite-user` (cria no Auth via `inviteUserByEmail`, checa `can_add_user`, insere em `users`, com rollback do usuário do Auth se o insert falhar)
    - _Requirements: 1.1, 1.2_
  - [x] 2.2 Criar Edge Function `update-user-password`
    - _Requirements: 2.1_
  - [x] 2.3 (fix de segurança, não estava no design original) `_shared/verify-admin.ts` — as Edge Functions usam o cliente service role, que ignora RLS por completo; sem essa verificação, qualquer usuário autenticado poderia chamar a função direto (fora da UI) e convidar/resetar senha de qualquer um, de qualquer corretora. Valida o JWT de quem chamou com o cliente ANON (respeitando RLS) via `get_my_role()`/`get_my_brokerage_id()`, e cada função confirma que o `brokerage_id`/`user_id` do payload pertence à corretora de quem está chamando.

  Verificado com usuários reais (admin, seller, admin de outra corretora): seller convidando → 403; admin de outra corretora convidando pra esta → 403; seller resetando senha → 403; admin resetando senha do próprio seller → sucesso, e a senha nova funciona de verdade pra logar; admin resetando senha de usuário de outra corretora → 403; convite bloqueado quando `can_add_user()` nega (plano com limite atingido) → 422.

  **Não verificado**: o envio real do e-mail de convite (`inviteUserByEmail` bem-sucedido) — o SMTP sandbox do Supabase rejeitou o domínio de teste e depois bateu rate limit. Não configuramos SMTP/Resend pro projeto novo ainda (ver `docs/architecture/backend/conventions/external-integrations.md`) — isso é um passo de infra pendente, não um bug de código. A lógica de permissão/negócio em volta do envio está toda verificada.

- [x] 3. Camada de dados do frontend
  - [x] 3.0 (infra) `features/users/types/user.ts` (tipo `User` derivado de `Database`) + excluído `database-types.ts` do ESLint/Prettier (arquivo gerado, não é código nosso)
    - _Requirements: infra_
  - [x] 3.1 Criar `features/users/constants/query-keys.ts`
    - _Requirements: infra_
  - [x] 3.2 Criar `features/users/api/` — `list-users`, `get-user`, `invite-user`, `update-user`, `update-user-password`, `deactivate-user`, `reactivate-user`
    - _Requirements: 1.1, 2.1, 3.1, 3.5, 4.1, 5.1_
  - [x] 3.3 Criar `features/users/hooks/` — `useUsers`, `useUser`, `useInviteUser`, `useUpdateUser`, `useUpdateUserPassword`, `useDeactivateUser`, `useReactivateUser` — cada mutation invalida `userKeys.lists()`/`detail()` correspondente
    - _Requirements: 1.1, 2.1, 3.1, 3.5, 4.1, 5.1_

  Verificação ponta a ponta desses hooks fica pra quando a UI (Task 4+) existir e puder exercitá-los pelo navegador, em vez de testar isoladamente agora.

- [x] 4. Listagem de usuários
  - [x] 4.0 (infra) shadcn `skeleton`, `tooltip`, `badge` + `TooltipProvider` em `app/providers` (não existiam ainda)
    - _Requirements: infra_
  - [x] 4.1 Criar `features/users/screens/users-list-screen/` — tabela com skeleton no loading, erro com retry, empty state, badge de status, ícones Ver/Editar com tooltip, `<Outlet/>` pros drawers aninhados (Tasks 5-7)
    - _Requirements: 5.1_
  - [x] 4.2 Criar `pages/users/users-page.tsx` e registrar a rota `/users` (restrita a `platform_admin`/`brokerage_admin`/`supervisor` via `allowedRoles`)
    - _Requirements: 5.1_

  Verificado com usuários reais: lista renderiza (admin/seller ativos + 1 inativo) sem erro de console; `seller` tentando acessar `/users` diretamente é bloqueado e redirecionado pra própria rota inicial.

- [x] 5. Convidar usuário
  - [x] 5.1 Criar `features/users/validations/invite-user-schema.ts`
    - _Requirements: 1.1_
  - [x] 5.2 Criar `features/users/components/invite-user-drawer/` (inclui feedback de limite de plano atingido)
    - _Requirements: 1.1, 1.2_
  - [x] 5.3 Criar `pages/users/add/add-user-page.tsx` como rota filha `/users/add`
    - _Requirements: 1.1_
  - [x] 5.4 (fix de bug, encontrado ao testar pelo navegador) CORS nas Edge Functions `invite-user`/`update-user-password` — o `verify_jwt` da plataforma interceptava o preflight `OPTIONS` (que não carrega `Authorization`) e respondia 401 sem cabeçalho CORS, quebrando toda chamada feita a partir do navegador (via curl/Task 2 isso nunca apareceu). Fix: `_shared/cors.ts` + tratamento de `OPTIONS` nas duas funções, deployadas com `verify_jwt = false` (já é redundante — `_shared/verify-admin.ts` faz essa checagem sozinho) via `supabase/config.toml`.

  Verificado com usuários reais pelo navegador (Playwright): drawer abre sobre a listagem via `/users/add` sem perder a lista de fundo; validação client-side (campos vazios) aparece inline sem chamar a API; submit válido chega de fato na Edge Function (confirmado o fix de CORS) e retorna o erro de domínio de e-mail inválido do SMTP sandbox — mesma limitação já documentada na Task 2, agora também exposta corretamente como toast na UI; admin de corretora com `plans.max_users` atingido recebe o erro "Limite de usuários do plano atingido." inline no campo Perfil, sem sequer chegar a tentar o envio do e-mail. Nenhum erro de console.

  **Não verificado** (mesma limitação já registrada na Task 2): envio real do e-mail de convite — depende da configuração de SMTP/Resend, ainda pendente.

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
