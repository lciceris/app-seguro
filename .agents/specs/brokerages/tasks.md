# Implementation Plan

- [x] 1. Schema e RLS base
  - [x] 1.1 Migration: enum `brokerage_status` (`active`, `inactive`) + coluna `status` em `brokerages` (not null, default `active`)
    - _Requirements: 5.1_
  - [x] 1.2 Migration: seed da corretora especial da plataforma (`id` fixo `00000000-0000-0000-0000-000000000001`)
    - _Requirements: 1.1_
  - [x] 1.3 Migration: estender `get_my_role()`/`get_my_brokerage_id()` (definidas na spec `auth`) pra também exigir `brokerages.status = 'active'`, além de `users.status = 'active'` já existente
    - _Requirements: 5.2_
  - [x] 1.4 Migration: policy `brokerages_select_own_unconditional` — lê a própria corretora via o `brokerage_id` salvo em `users`, sem depender de `get_my_brokerage_id()` (continua funcionando com a corretora inativa)
    - _Requirements: 5.3_
  - [x] 1.5 Migration: policy `brokerages_select_all_platform_admin` (sem filtro de `brokerage_id`)
    - _Requirements: 3.1_
  - [x] 1.6 Migration: policies `brokerages_update_own` e `brokerages_update_platform_admin` + GRANT column-level (`name`/`logo_url`/`primary_color` vs. `name`/`plan_id`/`status`)
    - _Requirements: 4.2, 6.1_
  - [x] 1.7 Migration: trigger `enforce_brokerage_update_columns` (`BEFORE UPDATE`) — bloqueia `brokerage_admin` de mudar `plan_id`/`status` e `platform_admin` de mudar `logo_url`/`primary_color`, já que GRANT column-level não diferencia por policy/linha
    - _Requirements: 4.3, 6.2_
  - [x] 1.8 (fix de bug, encontrado ao verificar a Task 1 manualmente) A função do trigger 1.7 chamava `get_my_role()`/`get_my_brokerage_id()` sem qualificar o schema — com `search_path = ''` (`SECURITY DEFINER`), isso falha com "function get_my_role() does not exist" e quebra **qualquer** UPDATE em `brokerages`, inclusive via service role. Migration de fix qualifica as chamadas com `public.`.
    - _Requirements: infra_

  Verificado com usuários/corretoras reais (script efêmero, limpo depois): `platform_admin` vê todas as corretoras e edita nome/plano/status de qualquer uma, mas é bloqueado pelo trigger ao tentar editar logo/cor de uma corretora que não é a sua; `brokerage_admin` só vê/edita a própria (nome/logo/cor), e é bloqueado ao tentar mudar o próprio plano/status; desativar uma corretora via `service role` faz `get_my_role()` retornar `null` pra todos os usuários dela (cascata funcionando); mesmo com a corretora inativa, `brokerages_select_own_unconditional` ainda permite ler os próprios dados da corretora (necessário pra Task 9.4 diferenciar a causa do bloqueio). Aproveitado pra migrar o usuário `platform_admin` de teste (`lciceris@gmail.com`, criado antes desta spec existir) da corretora normal em que estava pra a corretora especial "Plataforma", e remover a corretora órfã que sobrou.

- [x] 2. Edge Function `create-brokerage`
  - [x] 2.1 Criar `_shared/verify-platform-admin.ts` — confirma só `get_my_role() === 'platform_admin'`, sem checagem de corretora (operação inerentemente cross-tenant, diferente de `verify-admin.ts`)
    - _Requirements: 2.3_
  - [x] 2.2 Criar Edge Function `create-brokerage` — cria a linha em `brokerages`, convida o primeiro usuário como `brokerage_admin` dela (reaproveita a lógica de `invite-user` da spec `users`), com rollback da corretora se o convite falhar
    - _Requirements: 2.1, 2.2, 2.4_

  Verificado com usuários reais via chamada HTTP direta (fora da UI, já que ainda não existe frontend): `seller` chamando a função → 403; `brokerage_admin` chamando → 403 (só `platform_admin` passa); `platform_admin` criando uma corretora nova → o convite falha por causa do domínio de teste (mesma limitação de SMTP já documentada nas Tasks 2/5/10 da spec `users`), e o rollback foi confirmado de verdade — a corretora não ficou órfã no banco depois da falha. Deployada com `verify_jwt = false` (mesmo padrão de `invite-user`/`update-user-password`, ver `supabase/config.toml`).

  **Não verificado** (mesma limitação já registrada nas Tasks 2/5/10 da spec `users`): envio real do e-mail de convite do primeiro admin — depende da configuração de SMTP/Resend, ainda pendente.

- [x] 3. Camada de dados do frontend
  - [x] 3.1 Criar `features/brokerages/types/brokerage.ts` + `constants/query-keys.ts` (+ `constants/platform-brokerage.ts` com o id fixo da corretora especial)
    - _Requirements: infra_
  - [x] 3.2 Criar `features/brokerages/api/` — `list-brokerages`, `get-brokerage`, `create-brokerage`, `update-brokerage`, `deactivate-brokerage`, `reactivate-brokerage`, `get-own-brokerage`, `update-own-brokerage`
    - _Requirements: 2.1, 3.1, 4.1, 4.2, 5.1, 5.4, 6.1_
  - [x] 3.3 Criar `features/brokerages/hooks/` correspondentes — cada mutation invalida `brokerageKeys.lists()`/`detail()`/`own()`
    - _Requirements: 2.1, 3.1, 4.1, 4.2, 5.1, 5.4, 6.1_
  - [x] 3.4 (refatoração, não é lacuna) Extraído `shared/utils/extract-function-error-message/` — a mesma lógica de parsing de erro de Edge Function já existia em `users/api/invite-user.ts`; com `create-brokerage.ts` precisando dela de novo, duas ocorrências idênticas já justificava o compartilhamento. `invite-user.ts` foi atualizado pra importar dali.
    - _Requirements: infra_

  Verificação ponta a ponta desses hooks fica pra quando a UI (Task 4+) existir e puder exercitá-los pelo navegador — a RLS/trigger por trás já foi validada com usuários reais na Task 1.

- [x] 4. Listagem de corretoras (platform_admin)
  - [x] 4.1 Criar `features/brokerages/screens/brokerages-list-screen/` — tabela com nome, plano, status, ações (mesmo padrão visual da `users-list-screen`), `<Outlet/>` pros drawers aninhados
    - _Requirements: 3.1_
  - [x] 4.2 Criar `pages/brokerages/brokerages-page.tsx` e registrar a rota `/brokerages` (restrita a `platform_admin`)
    - _Requirements: 3.2_
  - [x] 4.3 (ajuste, não é lacuna) `list-brokerages` passou a fazer embed com `plans(name)` — só 1 relacionamento entre `brokerages` e `plans`, embed direto é seguro (diferente do caso `quotations`/`quotation_insurers`, que tem 2 relacionamentos e por isso exige queries separadas). Tipo novo `BrokerageWithPlan` em `types/brokerage.ts`.
    - _Requirements: infra_

  Verificado com usuários/corretoras reais pelo navegador: `platform_admin` (usuário real `lciceris@gmail.com`) vê as corretoras de teste com o nome do plano vinculado ou "Sem plano", badge de status correto, e **não** vê a corretora especial "Plataforma" na lista (filtro funcionando); `brokerage_admin` tentando acessar `/brokerages` diretamente é bloqueado e redirecionado pra própria rota inicial. Nenhum erro de console.

- [x] 5. Criar corretora
  - [x] 5.1 Criar `features/brokerages/validations/create-brokerage-schema.ts` (nome da corretora, nome/email do primeiro admin)
    - _Requirements: 2.1_
  - [x] 5.2 Criar `features/brokerages/components/create-brokerage-drawer/` (inclui feedback de erro no convite do primeiro admin)
    - _Requirements: 2.1, 2.2_
  - [x] 5.3 Criar `pages/brokerages/add/add-brokerage-page.tsx` como rota filha `/brokerages/add`
    - _Requirements: 2.1_

  Verificado com o usuário `platform_admin` real pelo navegador: drawer abre sobre a listagem via `/brokerages/add` sem perder a lista de fundo; validação client-side (campos vazios) aparece inline sem chamar a API; submit válido chega de fato na Edge Function e retorna o erro de domínio de e-mail inválido do SMTP sandbox (mesma limitação já documentada nas Tasks 2/5/10 da spec `users` e na Task 2 desta spec) — o toast de erro aparece corretamente, e o rollback foi reconfirmado a partir da UI: a corretora não ficou órfã no banco. Nenhum erro de console.

  **Não verificado** (mesma limitação já registrada): envio real do e-mail de convite do primeiro admin.

- [ ] 6. Ver detalhe de uma corretora
  - [ ] 6.1 Criar `features/brokerages/components/brokerage-detail-drawer/`
    - _Requirements: 4.1_
  - [ ] 6.2 Criar `pages/brokerages/[brokerageId]/brokerage-detail-page.tsx` como rota filha `/brokerages/:brokerageId`
    - _Requirements: 4.1_

- [ ] 7. Editar uma corretora (platform_admin)
  - [ ] 7.1 Criar `features/brokerages/validations/edit-brokerage-schema.ts` (nome, plano vinculado — sem logo/cor)
    - _Requirements: 4.2, 4.3_
  - [ ] 7.2 Criar `features/brokerages/components/edit-brokerage-drawer/`
    - _Requirements: 4.2_
  - [ ] 7.3 Criar `pages/brokerages/[brokerageId]/edit/edit-brokerage-page.tsx` como rota filha `/brokerages/:brokerageId/edit`
    - _Requirements: 4.2_

- [ ] 8. Desativar e reativar uma corretora
  - [ ] 8.1 Criar `features/brokerages/components/deactivate-brokerage-confirm-dialog/` (`AlertDialog`, sem rota)
    - _Requirements: 5.1_
  - [ ] 8.2 Implementar ação de reativar na listagem (sem dialog de confirmação — reativar não é destrutivo)
    - _Requirements: 5.4_

- [ ] 9. Editar a própria corretora (brokerage_admin)
  - [ ] 9.1 Criar `features/brokerages/validations/edit-own-brokerage-schema.ts` (nome, logo, cor primária — sem plano/status)
    - _Requirements: 6.1, 6.2_
  - [ ] 9.2 Criar `features/brokerages/screens/own-brokerage-screen/` (screen própria, não drawer — sem lista por trás)
    - _Requirements: 6.1_
  - [ ] 9.3 Criar `pages/my-brokerage/my-brokerage-page.tsx` e registrar a rota `/my-brokerage` (restrita a `brokerage_admin`/`platform_admin`)
    - _Requirements: 6.1, 6.4_
  - [ ] 9.4 Adaptar `account-deactivated-screen` (spec `auth`) pra diferenciar "conta desativada" de "corretora desativada", consultando `brokerages_select_own_unconditional`
    - _Requirements: 5.3_

- [ ] 10. Testes
  - [ ] 10.1 Testes de componente: `create-brokerage-drawer`, `edit-brokerage-drawer`, `deactivate-brokerage-confirm-dialog`, `own-brokerage-screen`
    - _Requirements: 2.1, 4.2, 5.1, 6.1_
  - [ ] 10.2 Testes de hook: `useCreateBrokerage`, `useUpdateBrokerage`, `useDeactivateBrokerage`
    - _Requirements: 2.1, 4.2, 5.1_
  - [ ] 10.3 Teste E2E: `platform_admin` cria corretora → primeiro admin define senha → login
    - _Requirements: 2.1_
  - [ ] 10.4 Teste E2E: desativação de corretora → login de um usuário dela cai na tela de bloqueio com a mensagem certa → reativação → login funciona de novo
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
