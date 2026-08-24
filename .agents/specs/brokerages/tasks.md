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

- [x] 6. Ver detalhe de uma corretora
  - [x] 6.1 Criar `features/brokerages/components/brokerage-detail-drawer/`
    - _Requirements: 4.1_
  - [x] 6.2 Criar `pages/brokerages/[brokerageId]/brokerage-detail-page.tsx` como rota filha `/brokerages/:brokerageId`
    - _Requirements: 4.1_
  - [x] 6.3 (ajuste, não é lacuna) `get-brokerage` passou a fazer o mesmo embed com `plans(name)` já usado em `list-brokerages` (Task 4.3), pra mostrar o nome do plano no detalhe.
    - _Requirements: infra_

  Verificado com o usuário `platform_admin` real pelo navegador: abre `/brokerages/:brokerageId` e vê nome/plano/status corretos, com a listagem ainda montada por trás do drawer. Botão "Fechar" volta pra `/brokerages`. Nenhum erro de console.

- [x] 7. Editar uma corretora (platform_admin)
  - [x] 7.1 Criar `features/brokerages/validations/edit-brokerage-schema.ts` (nome, plano vinculado — sem logo/cor)
    - _Requirements: 4.2, 4.3_
  - [x] 7.2 Criar `features/brokerages/components/edit-brokerage-drawer/`
    - _Requirements: 4.2_
  - [x] 7.3 Criar `pages/brokerages/[brokerageId]/edit/edit-brokerage-page.tsx` como rota filha `/brokerages/:brokerageId/edit`
    - _Requirements: 4.2_
  - [x] 7.4 (infra) `features/brokerages/api/list-plans` + `hooks/use-plans` — `plans` ainda não tem spec própria; único consumidor até agora é o `Select` de plano deste drawer.
    - _Requirements: infra_
  - [x] 7.5 (fix de bug, encontrado ao verificar manualmente) O `Select` controlado (via `Controller` + `reset()` num `useEffect`) nunca refletia o valor pré-selecionado ao abrir o drawer — sempre mostrava o placeholder, mesmo esperando vários segundos (não era race condition, era estrutural). O submit funcionava certo (o valor ia pro banco correto), só a exibição inicial que ficava errada. Fix: extraído um subcomponente (`EditBrokerageForm`) que só monta quando os dados já chegaram, usando-os como `defaultValues` do `useForm` diretamente, em vez de popular via `reset()` depois de montado. **O mesmo bug existia em `edit-user-drawer` da spec `users` (Task 7.2 de lá) — corrigido junto, com a mesma técnica**, já que é a mesma causa raiz.
    - _Requirements: infra_

  Verificado com o usuário `platform_admin` real pelo navegador: editar nome funciona; vincular um plano funciona (`plan_id` atualizado corretamente no banco) e o `Select` mostra o nome do plano certo ao reabrir o drawer; voltar pra "Sem plano" também funciona (`plan_id` volta a `null`). Reconfirmado depois do fix que `edit-user-drawer` (spec `users`) continua funcionando de ponta a ponta (nome, telefone e perfil mudam corretamente) e que os 20 testes automatizados existentes continuam passando. Nenhum erro de console.

- [x] 8. Desativar e reativar uma corretora
  - [x] 8.1 Criar `features/brokerages/components/deactivate-brokerage-confirm-dialog/` (`AlertDialog`, sem rota)
    - _Requirements: 5.1_
  - [x] 8.2 Implementar ação de reativar na listagem (sem dialog de confirmação — reativar não é destrutivo)
    - _Requirements: 5.4_

  Verificado com usuários reais pelo navegador: `platform_admin` desativa uma corretora pela listagem — `AlertDialog` menciona o nome da corretora, confirmar desativa de verdade (badge muda pra "Inativo", toast de sucesso); reativar funciona como ação direta sem dialog (Requirement 5.4). Confirmado o mecanismo de dados por trás (Requirement 5.2): com a corretora inativa, `get_my_role()` retorna `null` pro usuário dela via chamada direta — o login (autenticação em si) continua funcionando normalmente (é independente de RLS), mas toda leitura de dados operacionais fica bloqueada, e a linha própria em `users` continua legível (self-access, não depende de `get_my_role()`), que é o mecanismo que a Task 9 vai usar pra detectar a causa do bloqueio.

  **Gap conhecido, escopo da Task 9**: hoje o `ProtectedRoute` só verifica `usuario.status`, nunca o status da corretora — por isso um usuário de uma corretora desativada ainda consegue "entrar" no app (a home carrega, mesmo que as queries de dados por trás estejam todas bloqueadas pela RLS). Isso é exatamente o que a Task 9 resolve, não uma regressão desta task.

- [x] 9. Editar a própria corretora (brokerage_admin)
  - [x] 9.1 Criar `features/brokerages/validations/edit-own-brokerage-schema.ts` (nome, logo, cor primária — sem plano/status)
    - _Requirements: 6.1, 6.2_
  - [x] 9.2 Criar `features/brokerages/screens/own-brokerage-screen/` (screen própria, não drawer — sem lista por trás)
    - _Requirements: 6.1_
  - [x] 9.3 Criar `pages/my-brokerage/my-brokerage-page.tsx` e registrar a rota `/my-brokerage` (restrita a `brokerage_admin`/`platform_admin`)
    - _Requirements: 6.1, 6.4_
  - [x] 9.4 Adaptar `account-deactivated-screen` (spec `auth`) pra diferenciar "conta desativada" de "corretora desativada"
    - _Requirements: 5.3_
  - [x] 9.5 (fix de bug real, encontrado ao verificar manualmente) `ProtectedRoute`/`LoginPage` (spec `auth`) checavam só `usuario.status !== "active"` pra bloquear — nunca consideravam a corretora, então um usuário de uma corretora desativada conseguia "entrar" no app normalmente (a home carregava, mesmo com toda leitura de dados bloqueada por RLS por trás). Fix em duas partes:
    - `get-session.ts` passou a trazer `brokerages(..., status)` no embed e expor `brokerage_status` no objeto `Usuario` (`auth-store.ts`) — sinal explícito, não a ausência do embed (que agora **sempre** funciona pra própria corretora, ver 9.6).
    - `ProtectedRoute` e `LoginPage` passaram a checar `usuario.status !== "active" || usuario.brokerage_status === "inactive"`.
    - _Requirements: 5.2_
  - [x] 9.6 (fix de bug real, encontrado ao verificar manualmente) `brokerages_select_own_unconditional` (Task 1.4) usava uma subquery inline na policy — funcionava de forma isolada, mas se mostrou inconsistente no fluxo real do app. Substituída por uma função `SECURITY DEFINER` (`get_my_brokerage_id_unconditional()`), mesmo padrão já comprovado de `get_my_role()`/`get_my_brokerage_id()`.
    - _Requirements: infra_
  - [x] 9.7 (fix de bug real, o mais sutil de todos) A implementação original de "diferenciar a causa" fazia uma segunda chamada de rede (`getDeactivationReason`) dentro da própria tela — sofria de uma corrida real de autenticação e foi descartada. A abordagem final reaproveita `usuario.status`/`brokerage_status` que **já vêm** de `get-session.ts` (populados durante o login), sem nenhuma chamada extra. Ainda assim, a causa raiz do bug observado era outra: `AccountDeactivatedPage` (spec `auth`, já existente) desloga automaticamente ao montar essa tela (logout de segurança) — isso faz `usuario` virar `null` pouco depois do primeiro render, e a tela (que recalculava a mensagem a cada render) trocava para a mensagem errada assim que o logout completava. Fix: captura a causa uma única vez (`setState` condicional no corpo do componente — não num `useEffect`, que o React Compiler deste projeto rejeita para esse padrão) e nunca mais atualiza depois.
    - _Requirements: 5.3_

  Verificado extensivamente com usuários/corretoras reais pelo navegador (múltiplas rodadas seguidas, inclusive com contextos de browser isolados por login, pra descartar qualquer resquício entre sessões): `brokerage_admin` edita nome/logo/cor da própria corretora com sucesso (dado refletido no banco); usuário individualmente desativado (corretora ativa) vê "Sua conta foi desativada..."; `brokerage_admin` ativo com a corretora desativada vê "O acesso da sua corretora à plataforma foi desativado..." — as duas mensagens nunca mais se confundiram depois do fix 9.7; após reativar a corretora, o login volta a funcionar normalmente. Nenhum erro de console.

- [x] 10. Testes
  - [x] 10.1 Testes de componente: `create-brokerage-drawer`, `edit-brokerage-drawer`, `deactivate-brokerage-confirm-dialog`, `own-brokerage-screen`
    - _Requirements: 2.1, 4.2, 5.1, 6.1_
  - [x] 10.2 Testes de hook: `useCreateBrokerage`, `useUpdateBrokerage`, `useDeactivateBrokerage`
    - _Requirements: 2.1, 4.2, 5.1_
  - [x] 10.3 Teste E2E: `platform_admin` cria corretora → primeiro admin define senha → login
    - _Requirements: 2.1_
  - [x] 10.4 Teste E2E: desativação de corretora → login de um usuário dela cai na tela de bloqueio com a mensagem certa → reativação → login funciona de novo
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  **Testes de componente/hook** (`npx vitest run`): 33/33 passando (13 novos desta spec + os 20 já existentes de `auth`/`users`, sem nenhuma regressão). `edit-brokerage-drawer` precisou de `@testing-library/user-event` + `within(listbox)` pra interagir com o `Select` do Radix, mesmo padrão já usado em `invite-user-drawer`/`edit-user-drawer` da spec `users`.

  **Testes E2E** (`npx playwright test`, contra o Supabase real): `e2e/brokerages-create.spec.ts` cobre tanto a criação pela UI real (confirmando o rollback quando o convite falha por SMTP) quanto "definir senha → login" via `generateLink` (mesma técnica da spec `users`, contorna só a limitação de envio de e-mail). `e2e/brokerages-deactivate.spec.ts` desativa uma corretora pela UI, confirma que um usuário dela cai em `/account-deactivated` com a mensagem de **corretora** (não de conta — o núcleo do que a Task 9 corrigiu), reativa, e confirma que o login volta a funcionar. Encontrado e corrigido no caminho: a home do `brokerage_admin` (`/quotations`) ainda não é uma rota implementada, então nada reage a um `signOut()` feito ali navegando pra `/login` sozinho — o teste precisou navegar explicitamente. Todos os 6 testes E2E do projeto passando (3 novos + `auth`/`users-invite`/`users-deactivate` já existentes).

- [x] 11. Schema — cadastro completo de empresa
  - [x] 11.1 Migration: colunas novas em `brokerages` (`trade_name`, `tax_id` com `unique`, `business_code`, `state_registration`, `email`, `phone`, `zip_code`, `street`, `street_number`, `complement`, `neighborhood`, `city`, `state`, `representative_name`, `representative_email`, `financial_name`, `financial_email`, `plan_expires_at`)
    - _Requirements: 2.2_
  - [x] 11.2 Migration: atualizar `enforce_brokerage_update_columns` — `brokerage_admin` ganha as colunas de empresa (todas exceto `plan_expires_at`); `platform_admin` ganha `plan_expires_at`
    - _Requirements: 4.2, 4.3, 6.1_
  - [x] 11.3 Regenerar `database-types.ts`
    - _Requirements: infra_

- [x] 12. Busca de CNPJ/CEP (infra compartilhada)
  - [x] 12.1 Criar `src/shared/lib/brasil-api.ts` (`fetchCnpjData`)
    - _Requirements: 7.1_
  - [x] 12.2 Criar `src/shared/lib/via-cep.ts` (`fetchCepData`)
    - _Requirements: 7.2_

- [x] 13. Cadastro completo (criação, platform_admin)
  - [x] 13.1 Atualizar Edge Function `create-brokerage` — aceita e insere os campos de empresa (opcionais) além de `brokerage_name`/`admin_full_name`/`admin_email`
    - _Requirements: 2.2_
  - [x] 13.2 Atualizar `create-brokerage-schema.ts` + `api/create-brokerage.ts` (`CreateBrokerageInput`) com os campos novos
    - _Requirements: 2.2_
  - [x] 13.3 Atualizar `create-brokerage-drawer.tsx` — seções Identificação/Endereço/Representante/Financeiro (mesmo padrão de `create-client-drawer`) + botões "Buscar" (CNPJ/CEP)
    - _Requirements: 2.2, 7.1, 7.2, 7.3_

- [ ] 14. Edição pela própria corretora (brokerage_admin)
  - [ ] 14.1 Atualizar `edit-own-brokerage-schema.ts` + `api/update-own-brokerage.ts` com os campos de empresa
    - _Requirements: 6.1_
  - [ ] 14.2 Atualizar `own-brokerage-screen.tsx` — mesmas seções + busca do 13.3
    - _Requirements: 6.1, 7.1, 7.2, 7.3, 7.4_

- [ ] 15. Edição pelo platform_admin — data de expiração do plano
  - [ ] 15.1 Atualizar `edit-brokerage-schema.ts` + `api/update-brokerage.ts` + `edit-brokerage-drawer.tsx` — campo `plan_expires_at` (`DatePicker`) ao lado de `plan_id`
    - _Requirements: 4.2_

- [ ] 16. Detalhe — exibir todos os dados
  - [ ] 16.1 Atualizar `brokerage-detail-drawer.tsx` — exibe todos os campos novos (somente leitura) + `plan_expires_at`
    - _Requirements: 4.1_

- [ ] 17. Testes
  - [ ] 17.1 Atualizar testes de componente existentes (`create-brokerage-drawer`, `own-brokerage-screen`, `edit-brokerage-drawer`) pros campos novos — mock de `fetchCnpjData`/`fetchCepData`
    - _Requirements: 2.2, 4.2, 6.1, 7.1, 7.2, 7.3_
  - [ ] 17.2 Atualizar `e2e/brokerages-create.spec.ts` — preenche (parte d)os campos novos manualmente e confirma persistência (sem exercitar a busca de verdade, ver design.md)
    - _Requirements: 2.2_
