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

- [ ] 3. Funções SECURITY DEFINER e RLS base
  - [ ] 3.1 Migration: função `get_my_role()` (SECURITY DEFINER, `search_path` fixado, considera `status = active`)
    - _Requirements: 5.2, 4.4_
  - [ ] 3.2 Migration: função `get_my_brokerage_id()` (mesmo padrão)
    - _Requirements: 5.2, 4.4_
  - [ ] 3.3 Migration: habilitar RLS em `brokerages` + policy de SELECT da própria corretora
    - _Requirements: 5.3_
  - [ ] 3.4 Migration: habilitar RLS em `plans` + policy de SELECT para todo usuário autenticado
    - _Requirements: 5.3_
  - [ ] 3.5 Migration: habilitar RLS em `users` + policy de SELECT/UPDATE de auto-acesso (`id = auth.uid()`)
    - _Requirements: 5.2, 5.3_

- [ ] 4. Cliente Supabase tipado (frontend)
  - [ ] 4.1 Gerar tipos TypeScript (`supabase gen types typescript`)
    - _Requirements: infra_
  - [ ] 4.2 Criar `shared/lib/supabase/` com o cliente configurado usando os tipos gerados
    - _Requirements: infra_

- [ ] 5. Auth store e camada de dados
  - [ ] 5.1 Criar `features/auth/store/auth-store.ts` (Zustand) com o shape `usuario`
    - _Requirements: 1.1, 2.1_
  - [ ] 5.2 Criar `features/auth/api/` — `login`, `logout`, `get-session`
    - _Requirements: 1.1, 2.1, 3.1_
  - [ ] 5.3 Criar `features/auth/hooks/` — `useLogin`, `useLogout`, `useSession` (envolvendo `api/` em `useMutation`/`useQuery`)
    - _Requirements: 1.1, 2.1, 2.2, 3.1_

- [ ] 6. Tela de login
  - [ ] 6.1 Criar `features/auth/validations/login-schema.ts` (Zod)
    - _Requirements: 1.1_
  - [ ] 6.2 Criar `features/auth/screens/login-screen/` (formulário + integração com `useLogin`, erro genérico em toast)
    - _Requirements: 1.1, 1.2_
  - [ ] 6.3 Criar `pages/login/login-page.tsx` e registrar a rota `/login`
    - _Requirements: 1.1_
  - [ ] 6.4 Implementar redirecionamento de `/login` para a rota inicial quando já autenticado
    - _Requirements: 1.4_

- [ ] 7. Proteção de rota e redirecionamento por perfil
  - [ ] 7.1 Criar `features/auth/components/protected-route/`
    - _Requirements: 4.1, 4.2_
  - [ ] 7.2 Implementar a tabela de rota inicial por perfil e o redirect pós-login
    - _Requirements: 1.3, 4.3_
  - [ ] 7.3 Integrar `protected-route` no `app/router/` envolvendo as rotas protegidas
    - _Requirements: 4.1, 4.2_

- [ ] 8. Sessão — restauração e refresh
  - [ ] 8.1 Implementar restauração de sessão ao carregar a aplicação (`useSession` lido no boot do `app/`)
    - _Requirements: 2.1_
  - [ ] 8.2 Confirmar/configurar o refresh automático de token do cliente Supabase (comportamento padrão do SDK, validar que está ativo)
    - _Requirements: 2.2_
  - [ ] 8.3 Tratar refresh token expirado/inválido — encerrar sessão e redirecionar para `/login`
    - _Requirements: 2.3_

- [ ] 9. Definir senha após convite
  - [ ] 9.1 Criar `features/auth/validations/set-password-schema.ts`
    - _Requirements: 6.1_
  - [ ] 9.2 Criar `features/auth/screens/set-password-screen/`
    - _Requirements: 6.1, 6.2_
  - [ ] 9.3 Criar `pages/set-password/set-password-page.tsx` e registrar a rota
    - _Requirements: 6.1_

- [ ] 10. Conta desativada
  - [ ] 10.1 Criar `features/auth/screens/account-deactivated-screen/`
    - _Requirements: 4.4_
  - [ ] 10.2 Detectar `status = inactive` logo após login (em `useSession`/`protected-route`), encerrar sessão e redirecionar para a tela de conta desativada
    - _Requirements: 4.4_

- [ ] 11. Testes
  - [ ] 11.1 Testes de componente: `login-screen`, `set-password-screen`
    - _Requirements: 1.1, 1.2, 6.1_
  - [ ] 11.2 Testes de hook: `useLogin`, `useSession` (com `QueryClient` de teste e sessão mockada)
    - _Requirements: 1.1, 2.1_
  - [ ] 11.3 Teste E2E: login → redirect por perfil → reload preserva sessão → logout
    - _Requirements: 1.1, 1.3, 2.1, 3.1, 3.2_
