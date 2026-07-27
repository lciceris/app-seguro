# Diagrama — Auth Flow

> Login, requisição autenticada, refresh e logout. Fluxos de convite/definição de senha ficam para quando documentarmos Edge Functions.

## Login

```
Usuário envia email + senha (/login)
   ↓
Supabase Auth valida as credenciais
   ↓
Emite JWT (access token) + refresh token
   ↓
Cliente Supabase JS guarda a sessão
   ↓
App redireciona por perfil (ver conventions/permissions.md)
```

## Requisição autenticada

```
Cliente → PostgREST / Edge Function  (Authorization: Bearer <JWT>)
   ↓
Postgres extrai auth.uid() do JWT
   ↓
RLS avalia a policy via get_my_role() / get_my_brokerage_id()  (ver adr/002-security-definer-rls.md)
   ↓
Retorna só as linhas permitidas — ou nenhuma, sem erro  (ver conventions/rls.md)
```

## Refresh

```
Access token perto de expirar
   ↓
Cliente Supabase JS troca o refresh token por um access token novo — automático, silencioso pro usuário
```

## Logout

```
Cliente limpa a sessão local
   ↓
Supabase invalida a sessão no servidor
```
