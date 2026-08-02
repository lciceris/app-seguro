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

- [x] 6. Ver detalhe de usuário
  - [x] 6.1 Criar `features/users/components/user-detail-drawer/`
    - _Requirements: 5.1_
  - [x] 6.2 Criar `pages/users/[userId]/user-detail-page.tsx` como rota filha `/users/:userId`
    - _Requirements: 5.1_

  Verificado com usuários reais pelo navegador: `brokerage_admin` abre `/users/:userId` e vê nome/e-mail/telefone/perfil/status corretos, com a listagem ainda montada por trás do drawer; `supervisor` também consegue abrir o mesmo detalhe (Requirement 5.1); `seller` tentando acessar `/users/:userId` diretamente é bloqueado pelo `ProtectedRoute` antes de chegar no drawer (Requirement 5.2 — já coberto estruturalmente pela mesma restrição de `allowedRoles` usada em `/users`). Botão "Fechar" volta pra `/users`. Nenhum erro de console.

- [x] 7. Editar usuário
  - [x] 7.1 Criar `features/users/validations/edit-user-schema.ts` (nome, telefone, perfil — sem e-mail)
    - _Requirements: 4.1, 4.3_
  - [x] 7.2 Criar `features/users/components/edit-user-drawer/`
    - _Requirements: 4.1_
  - [x] 7.3 Criar `pages/users/[userId]/edit/edit-user-page.tsx` como rota filha `/users/:userId/edit`
    - _Requirements: 4.1_
  - [x] 7.4 (fix de lacuna, encontrado ao testar o submit real) Migration: GRANT de `role`/`status` em `users` + trigger `prevent_self_privilege_escalation` — o GRANT column-level da spec `auth` só liberava `full_name, phone, avatar_url` pra `authenticated` (o resto era bloqueado em nível de privilégio, antes mesmo da RLS ser avaliada). A policy `users_update_managed` (Task 1.1) e o fluxo de desativar/reativar (Task 9, ainda não implementado) precisam escrever `role`/`status` de **outros** usuários, mas GRANT é por role do Postgres, não por policy — não dava pra liberar a coluna só pra uma policy. Substitui a proteção contra auto-promoção (que antes vivia inteiramente no GRANT restrito) por um trigger `BEFORE UPDATE` que bloqueia especificamente quando `auth.uid() = id` e `role`/`status`/`brokerage_id` mudam.
    - _Requirements: 4.1_
  - [x] 7.5 (fix de UX, não é bug funcional) `Select` do perfil em `invite-user-drawer` e `edit-user-drawer` — warning do React de "uncontrolled to controlled" porque `field.value` do RHF começa `undefined` até o primeiro `reset()`/preenchimento. Fix: `value={field.value ?? ""}`.
    - _Requirements: infra_

  Verificado com usuários reais pelo navegador: `brokerage_admin` vê os botões "Convidar usuário" e o ícone Editar; abre o drawer de edição, que vem pré-preenchido com os dados atuais do usuário-alvo; altera nome, telefone e perfil e salva — `PATCH` retorna 200, toast de sucesso, volta pra `/users`, lista já reflete os novos dados via invalidação de query. `supervisor` não vê nem "Convidar usuário" nem o ícone Editar na lista (Requirement 4.2), e é redirecionado pro próprio home se tentar acessar `/users/:userId/edit` direto pela URL (nova policy de rota restrita a `platform_admin`/`brokerage_admin`, separada da rota de detalhe que ainda permite `supervisor`). Confirmado via chamada direta (fora da UI): o próprio usuário tentando promover o próprio `role` é bloqueado pelo trigger, mas editar o próprio `full_name` continua funcionando normalmente. Nenhum erro de console.

- [x] 8. Reset de senha
  - [x] 8.1 Criar `features/users/validations/reset-password-schema.ts`
    - _Requirements: 2.1_
  - [x] 8.2 Criar `features/users/components/reset-password-dialog/` (formulário local, sem rota)
    - _Requirements: 2.1_

  Verificado com usuários reais pelo navegador: `brokerage_admin` abre o dialog pelo ícone de chave na linha do usuário-alvo; senhas diferentes mostram erro inline ("As senhas não coincidem") sem chamar a API; "Cancelar" fecha sem submeter; envio válido chama a Edge Function `update-user-password` (já validada na Task 2), retorna sucesso, mostra toast e fecha o dialog. Confirmado ponta a ponta: o usuário-alvo consegue logar de verdade com a senha nova. Botão só aparece pra `brokerage_admin`/`platform_admin` (mesmo `canManageUsers` da Task 7). Nenhum erro de console.

- [x] 9. Desativar e reativar usuário
  - [x] 9.1 Criar `features/users/components/deactivate-confirm-dialog/` (`AlertDialog`, sem rota)
    - _Requirements: 3.1, 3.4_
  - [x] 9.2 Implementar ação de reativar na listagem (sem dialog de confirmação — reativar não é destrutivo)
    - _Requirements: 3.5_
  - [x] 9.3 (decisão de UX, não pedida explicitamente) Esconder as ações de desativar/reativar na própria linha do usuário logado — o trigger `prevent_self_privilege_escalation` (Task 7.4) já bloqueia `status` mudar via auto-UPDATE em nível de banco, mas mostrar o botão pro próprio admin só pra ele receber um erro genérico não ajuda ninguém.
    - _Requirements: infra_

  Verificado com usuários reais pelo navegador: `brokerage_admin` não vê ação de desativar/reativar na própria linha; na linha de outro usuário, "Desativar" abre `AlertDialog` mencionando o nome do usuário-alvo, "Cancelar" fecha sem alterar nada, confirmar desativa de verdade (`PATCH` retorna `status: inactive`, toast de sucesso, badge muda pra "Inativo" na lista). Confirmado o efeito real: o usuário desativado tentando logar é redirecionado pra `/account-deactivated` (Requirement 3.3, já validado na spec `auth`). "Reativar" funciona como ação direta sem dialog de confirmação (Requirement 3.5 — reativar não é destrutivo), toast de sucesso, badge volta pra "Ativo", e o login volta a funcionar normalmente. Nenhum erro de console.

- [x] 10. Testes
  - [x] 10.1 Testes de componente: `invite-user-drawer`, `edit-user-drawer`, `deactivate-confirm-dialog`
    - _Requirements: 1.1, 4.1, 3.1_
  - [x] 10.2 Testes de hook: `useInviteUser`, `useUpdateUser`, `useDeactivateUser`, `useUpdateUserPassword`
    - _Requirements: 1.1, 4.1, 3.1, 2.1_
  - [x] 10.3 Teste E2E: convite → definir senha → primeiro login (ponta a ponta com a spec `auth`)
    - _Requirements: 1.1_
  - [x] 10.4 Teste E2E: desativação → tentativa de login bloqueada → reativação → login funciona de novo
    - _Requirements: 3.1, 3.2, 3.3, 3.5_
  - [x] 10.5 (fix de infra, encontrado ao escrever os testes) `src/test-setup.ts` ganhou stubs de `scrollIntoView`/`hasPointerCapture`/`setPointerCapture`/`releasePointerCapture` — jsdom não implementa essas APIs e o Radix `Select` (usado em `invite-user-drawer`/`edit-user-drawer`) depende delas pra abrir, quebrando qualquer teste que interaja com ele sem esse stub.
    - _Requirements: infra_

  **Testes de componente/hook** (`npx vitest run`): 20/20 passando. Os hooks mockam a camada `api/` e conferem a chamada com os argumentos corretos (via `renderHook` + `waitFor`); os componentes mockam os hooks da própria feature e usam `renderWithProviders` — `invite-user-drawer`/`edit-user-drawer` precisaram de `@testing-library/user-event` (em vez de `fireEvent`) pra interagir de forma realista com o `Select` do Radix, e de `within(listbox)`/`{ selector: "p" }` pra desambiguar textos que aparecem duplicados (o `<select>` nativo oculto que o Radix mantém por baixo repete o mesmo texto das opções visíveis).

  **Testes E2E** (`npx playwright test`, contra o Supabase real): `e2e/users-invite.spec.ts` usa `admin.auth.admin.generateLink({ type: "invite" })` pra obter um link de convite válido sem depender do SMTP realmente enviar o e-mail (mesma limitação das Tasks 2 e 5) — abre o link, define a senha, desloga e loga de novo com a senha nova, confirmando o mecanismo de "primeiro acesso" ponta a ponta. `e2e/users-deactivate.spec.ts` desativa um usuário pela UI, confirma que o login dele passa a cair em `/account-deactivated`, reativa (sem dialog), e confirma que o login volta a funcionar. Ambos passando, junto com o `e2e/auth.spec.ts` já existente (3/3).
