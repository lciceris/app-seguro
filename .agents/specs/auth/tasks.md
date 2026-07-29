# Implementation Plan

- [x] 1. Configuração inicial do Supabase
  - [x] 1.1 Criar o projeto Supabase novo e vincular via CLI (`supabase link`)
    - Projeto "App Seguro" (`avceledthuyuvuhcdjeb`, sa-east-1) criado e linkado
  - [x] 1.2 Configurar `.env` do frontend (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)
    - _Requirements: infra_

- [x] 2. Schema — tabelas núcleo
  - [x] 2.1 Migration: enums `user_role` e `user_status`
    - _Requirements: 5.1_
  - [x] 2.2 Migration: tabela `brokerages` (id, name, primary_color, logo_url, timestamps) + trigger `set_updated_at`
    - _Requirements: 5.1_
  - [x] 2.3 Migration: tabela `plans` (id, name, max_users, timestamps) + trigger `set_updated_at`
    - _Requirements: 5.1_
  - [x] 2.4 Migration: tabela `users` (id → `auth.users`, `brokerage_id`, `role`, `status`, dados de perfil, timestamps) + trigger `set_updated_at`
    - _Requirements: 5.1_

- [x] 3. Funções SECURITY DEFINER e RLS base
  - [x] 3.1 Migration: função `get_my_role()` (SECURITY DEFINER, `search_path` fixado, considera `status = active`)
    - _Requirements: 5.2, 4.4_
  - [x] 3.2 Migration: função `get_my_brokerage_id()` (mesmo padrão)
    - _Requirements: 5.2, 4.4_
  - [x] 3.3 Migration: habilitar RLS em `brokerages` + policy de SELECT da própria corretora
    - _Requirements: 5.3_
  - [x] 3.4 Migration: habilitar RLS em `plans` + policy de SELECT para todo usuário autenticado
    - _Requirements: 5.3_
  - [x] 3.5 Migration: habilitar RLS em `users` + policy de SELECT/UPDATE de auto-acesso (`id = auth.uid()`), com GRANT restrito por coluna (nunca `role`/`status`/`brokerage_id`) pra impedir auto-promoção
    - _Requirements: 5.2, 5.3_

- [x] 4. Cliente Supabase tipado (frontend)
  - [x] 4.1 Gerar tipos TypeScript (`supabase gen types typescript`)
    - _Requirements: infra_
  - [x] 4.2 Criar `shared/lib/supabase/` com o cliente configurado usando os tipos gerados
    - _Requirements: infra_

- [x] 5. Auth store e camada de dados
  - [x] 5.1 Criar `features/auth/store/auth-store.ts` (Zustand) com o shape `usuario`
    - _Requirements: 1.1, 2.1_
  - [x] 5.2 Criar `features/auth/api/` — `login`, `logout`, `get-session`
    - _Requirements: 1.1, 2.1, 3.1_
  - [x] 5.3 Criar `features/auth/hooks/` — `useLogin`, `useLogout`, `useSession` (envolvendo `api/` em `useMutation`/`useQuery`)
    - _Requirements: 1.1, 2.1, 2.2, 3.1_

- [x] 5.5 Setup de design system e providers base (pré-requisito da Task 6, não existia ainda)
  - [x] 5.5.1 shadcn init (`components.json` — aliases apontando pra `shared/` —, `Button`, `Input`, `Label`). Sem componente `Form`: o registry atual do shadcn não tem mais esse wrapper específico de RHF (virou `Field`, genérico/Base UI) — login-screen usa `react-hook-form` direto (`register`), sem necessidade do `Field` para um formulário de 2 campos.
    - _Requirements: infra_
  - [x] 5.5.2 Tokens de design em `globals.css` (paleta do CLAUDE.md original: sidebar, page bg, primary dinâmico, etc.)
    - _Requirements: infra_
  - [x] 5.5.3 Providers base em `app/` — `QueryClientProvider`, `BrowserRouter`, `Toaster` (sonner) — integrados em `main.tsx`
    - _Requirements: infra_

- [x] 6. Tela de login
  - [x] 6.1 Criar `features/auth/validations/login-schema.ts` (Zod)
    - _Requirements: 1.1_
  - [x] 6.2 Criar `features/auth/screens/login-screen/` (formulário + integração com `useLogin`, erro genérico em toast)
    - _Requirements: 1.1, 1.2_
  - [x] 6.3 Criar `pages/login/login-page.tsx` e registrar a rota `/login`
    - _Requirements: 1.1_
  - [x] 6.4 Implementar redirecionamento de `/login` para a rota inicial quando já autenticado — redireciona pra `/` por enquanto; a tabela real de rota-por-perfil é da Task 7
    - _Requirements: 1.4_

- [x] 7. Proteção de rota e redirecionamento por perfil
  - [x] 7.1 Criar `features/auth/components/protected-route/`
    - _Requirements: 4.1, 4.2_
  - [x] 7.2 Implementar a tabela de rota inicial por perfil e o redirect pós-login
    - _Requirements: 1.3, 4.3_
  - [x] 7.3 Integrar `protected-route` no `app/router/` envolvendo as rotas protegidas — criada `pages/home/home-page.tsx` como placeholder de `/` (rota real do seller/analyst) só pra provar o mecanismo ponta a ponta
    - _Requirements: 4.1, 4.2_
  - [x] 7.4 (fix) `useLogin`/`useLogout` não sincronizavam o cache do React Query (`authKeys.session`), só a store Zustand — `useSession()` ficava com dado desatualizado até um refetch manual. Corrigido com `queryClient.setQueryData`. Verificado ponta a ponta com usuário real (login → redirect por perfil → sessão persiste no reload → `/login` redireciona de volta quando já autenticado).

- [x] 8. Sessão — restauração e refresh
  - [x] 8.1 Implementar restauração de sessão ao carregar a aplicação (`useSession` lido no boot do `app/`) — já coberto por `ProtectedRoute`/`LoginPage` (verificado no reload da Task 7)
    - _Requirements: 2.1_
  - [x] 8.2 Confirmar/configurar o refresh automático de token do cliente Supabase — `autoRefreshToken`/`persistSession` explicitados em `client.ts` (já eram o padrão do SDK, deixados explícitos)
    - _Requirements: 2.2_
  - [x] 8.3 Tratar refresh token expirado/inválido — encerrar sessão e redirecionar para `/login` — `use-auth-state-listener` reage a `SIGNED_OUT` do próprio SDK (cobre logout explícito e refresh falho em background), limpa store + cache do React Query. Verificado disparando `signOut()` em background: app redireciona sozinho pro `/login` sem reload manual.
    - _Requirements: 2.3_

- [x] 9. Definir senha após convite
  - [x] 9.1 Criar `features/auth/validations/set-password-schema.ts`
    - _Requirements: 6.1_
  - [x] 9.2 Criar `features/auth/screens/set-password-screen/` — usa `supabase.auth.updateUser({ password })`, a sessão de convite já é estabelecida automaticamente pelo `detectSessionInUrl` (padrão do SDK) ao clicar o link do e-mail
    - _Requirements: 6.1, 6.2_
  - [x] 9.3 Criar `pages/set-password/set-password-page.tsx` e registrar a rota `/set-password`
    - _Requirements: 6.1_

  Verificado ponta a ponta com usuário real: login → `/set-password` → validação de senhas diferentes → senha definida com sucesso → redirect pro home → logout → login com a senha NOVA funciona.

- [x] 10. Conta desativada
  - [x] 10.1 Criar `features/auth/screens/account-deactivated-screen/`
    - _Requirements: 4.4_
  - [x] 10.2 Detectar `status = inactive` logo após login (em `useSession`/`protected-route`), encerrar sessão e redirecionar para a tela de conta desativada — `protected-route` e `login-page` checam `usuario.status`; a página de destino (`account-deactivated-page`) chama `useLogout` no mount, centralizando o encerramento de sessão num único lugar
    - _Requirements: 4.4_

  Fix relacionado: `get-session.ts` acessava `data.brokerages.name` direto, o que quebrava em runtime pra usuário inativo (o embed de `brokerages` vem `null`, já que `get_my_brokerage_id()` retorna `NULL` pra quem não está `active` — RLS negando, não erro). Corrigido com optional chaining; `brokerage_name`/`primary_color`/`logo_url` agora são nullable no tipo `Usuario`.

  Verificado ponta a ponta com usuário `status = inactive` real: login → redireciona pra `/account-deactivated` (sem crash) → sessão é encerrada automaticamente → tentar acessar `/` depois manda pro `/login`.

- [x] 11. Testes
  - [x] 11.0 (infra) Configurar Vitest + React Testing Library + Playwright pela primeira vez no projeto — nada disso existia ainda. `vite.config.ts` ganhou o bloco `test` (jsdom, sem `globals: true` — imports explícitos, por consistência com o resto do projeto), `src/test-setup.ts` (jest-dom + cleanup manual do RTL, necessário justamente por não usar `globals`), `playwright.config.ts` (`webServer` sobe o `npm run dev` sozinho, `--no-sandbox` necessário neste ambiente), `shared/lib/test-utils` (helper `renderWithProviders` reaproveitado pelos testes de componente). Scripts novos: `test`, `test:watch`, `test:e2e`.
    - _Requirements: infra_
  - [x] 11.1 Testes de componente: `login-screen`, `set-password-screen` — mockando os hooks (`useLogin`/`useSetPassword`), não a API, testando validação de campo e chamada da mutation
    - _Requirements: 1.1, 1.2, 6.1_
  - [x] 11.2 Testes de hook: `useLogin`, `useSession` (com `QueryClient` de teste e `api/` mockada, verificando que a auth store é populada corretamente)
    - _Requirements: 1.1, 2.1_
  - [x] 11.3 Teste E2E (`e2e/auth.spec.ts`, Playwright): cria/remove um usuário real via API admin (`SUPABASE_SERVICE_ROLE_KEY`, só em `.env` local) — login → redirect por perfil → reload preserva sessão → logout
    - _Requirements: 1.1, 1.3, 2.1, 3.1, 3.2_

  7 testes unitários/componente (`npm run test`) + 1 E2E (`npm run test:e2e`) passando.
