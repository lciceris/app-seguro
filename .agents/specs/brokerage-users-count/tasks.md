# Tasks — brokerage-users-count

- [x] 1. Migration `count_active_users`
  - [x] 1.1 Criar a função SQL (`security definer`, checagem de autorização, `search_path` fixo) em `supabase/migrations/`
    - _Requirements: 1.1, 1.2, 1.3_ — bug encontrado via verificação real (chamada não qualificada a `get_my_role()`/`get_my_brokerage_id()` com `search_path = ''`) e corrigido numa segunda migration, nunca editando a primeira já aplicada.

- [x] 2. API e hook
  - [x] 2.1 `api/count-active-users/count-active-users.ts` (`supabase.rpc`) + `index.ts`
    - _Requirements: 1.1_
  - [x] 2.2 `hooks/use-active-users-count/use-active-users-count.ts` + `index.ts`
    - _Requirements: 1.1_

- [x] 3. Card no drawer de detalhe
  - [x] 3.1 Card "Usuários ativos" em `brokerage-detail-drawer.tsx`, com loading próprio
    - _Requirements: 2.1, 2.2_

- [x] 4. Backlog e verificação final
  - [x] 4.1 Entrada em `docs/product/roadmap.md` pro KPI completo (conta vs. limite do plano) + gestão de plano
    - _Requirements: 3.1_
  - [x] 4.2 Rodar `tsc`/`eslint`/`vitest` completos; e2e real (Playwright) criando corretora com usuários ativos/inativos, confirmando a contagem correta no card e que outro role não consegue chamar a função pra corretora alheia
    - _Requirements: infra_ — confirmado: card mostrou "2 usuários ativos" corretamente (2 ativos + 1 inativo cadastrados), e um brokerage_admin de outra corretora recebeu erro ao chamar a função pra corretora alheia.
