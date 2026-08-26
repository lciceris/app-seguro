# Design Document — brokerage-users-count

## Overview

Uma função SQL nova (migration), um par api/hook novo na feature `brokerages` (mesmo padrão de `get-brokerage`/`use-brokerage`), e um card novo no drawer de detalhe.

## Components and Interfaces

### 1. Migration — `count_active_users`

```sql
create or replace function count_active_users(p_brokerage_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if get_my_role() <> 'platform_admin' and p_brokerage_id <> get_my_brokerage_id() then
    raise exception 'Não autorizado.';
  end if;

  return (
    select count(*)::integer
    from public.users
    where brokerage_id = p_brokerage_id
      and status = 'active'
  );
end;
$$;
```

Mesmo padrão de `can_add_user()` (comparação de usuários ativos, `security definer`, `search_path` fixo) — a diferença é o retorno (número em vez de booleano) e a checagem de autorização explícita, necessária porque esta função é chamada direto do frontend (não só server-side por uma Edge Function).

### 2. `api/count-active-users/count-active-users.ts`

```tsx
import { supabase } from "@/shared/lib/supabase";

export async function countActiveUsers(brokerageId: string) {
  const { data, error } = await supabase.rpc("count_active_users", {
    p_brokerage_id: brokerageId,
  });

  if (error) throw error;
  return data as number;
}
```

### 3. `hooks/use-active-users-count/use-active-users-count.ts`

```tsx
import { useQuery } from "@tanstack/react-query";

import { countActiveUsers } from "../../api/count-active-users";
import { brokerageKeys } from "../../constants/query-keys";

export function useActiveUsersCount(brokerageId: string) {
  return useQuery({
    queryKey: [...brokerageKeys.detail(brokerageId), "active-users-count"],
    queryFn: () => countActiveUsers(brokerageId),
  });
}
```

### 4. `brokerage-detail-drawer.tsx`

Novo card "Usuários ativos", inserido como primeiro card do corpo (mesma ideia do protótipo aprovado — o KPI aparece antes do resto):

```tsx
const { data: activeUsersCount, isLoading: isLoadingUsers } = useActiveUsersCount(brokerageId!);

<div className="rounded-xl border border-border bg-card shadow-sm p-5">
  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
    Usuários ativos
  </p>
  {isLoadingUsers ? (
    <Skeleton className="h-7 w-16" />
  ) : (
    <p className="text-2xl font-bold text-foreground">
      {activeUsersCount} <span className="text-sm font-normal text-muted-foreground">usuários ativos</span>
    </p>
  )}
</div>
```

Sem barra de progresso, sem "de X do plano" — só o número (Requirement 1/2). Estado de erro: card mostra "—" silenciosamente (não vale a pena um botão "tentar novamente" pra um dado secundário; o resto do drawer já tem seu próprio tratamento de erro).

## Backlog (fora desta spec)

Entrada em `docs/product/roadmap.md`: KPI completo "X de Y usuários (conforme o plano)" com barra de progresso, comparando `count_active_users` com `plans.max_users` (já embeddado via `brokerage.plans` — precisaria ganhar `max_users` no embed) — fica pra quando a feature de planos for atacada.

## Testing Strategy

- Teste de componente: nenhum novo obrigatório (card simples, mesmo padrão de loading/valor já coberto em outros lugares) — se o tempo permitir, um teste de que o card renderiza o número retornado pelo hook.
- E2E: ajustar/estender um teste existente de `brokerages` (ou novo) que cria um platform_admin, uma corretora com 2 usuários ativos e 1 inativo, abre o detalhe, e confirma "2 usuários ativos" no card — valida a função SQL de ponta a ponta (não só mockada).
- Verificação manual: confirmar que um `brokerage_admin` de uma corretora **não** consegue chamar `count_active_users` pra outra corretora (RPC direto, simulando um usuário mal-intencionado) — a função deve lançar erro.
