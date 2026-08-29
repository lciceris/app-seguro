# Design Document — insurer-catalog-and-ordering

## 1. `insurer-catalog-screen.tsx` — mesmo padrão de `insurers-list-screen.tsx`

Estrutura idêntica às outras listagens (painel, busca client-side por nome/CNPJ com `normalize()`, contador, `Table` compartilhada). Colunas: Nome, CNPJ, Habilitada (mantém a lógica de `Switch`/`Badge` exatamente como está — só a marcação ao redor muda).

```tsx
<div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
  <div className="mb-4">
    <h1 className="text-lg font-semibold text-foreground">Minhas seguradoras</h1>
    <p className="text-xs text-muted-foreground">{contador}</p>
  </div>
  <div className="mb-4 relative max-w-sm">{/* Input de busca, ícone Search */}</div>
  <Table>
    <TableHeader><TableRow>
      <TableHead>Nome</TableHead><TableHead>CNPJ</TableHead>
      <TableHead className="text-right">Habilitada</TableHead>
    </TableRow></TableHeader>
    <TableBody>{/* loading/error/empty via TableSkeletonRow/TableErrorState/TableEmptyState, colSpan={3} */}</TableBody>
  </Table>
</div>
```

`canToggle`, `handleToggle`, `isEnabled` não mudam nada — só a JSX ao redor.

## 2. Reordenação em `insurers-list-screen.tsx`

### API — `src/features/insurers/api/reorder-insurer/reorder-insurer.ts`

```ts
import { supabase } from "@/shared/lib/supabase";

export interface SwapInsurerOrderInput {
  first: { id: string; display_order: number };
  second: { id: string; display_order: number };
}

// Duas seguradoras trocam de posição — cada uma recebe o display_order da
// outra. Sem transação (Supabase client não suporta multi-statement), mas
// o risco de inconsistência num update sequencial de 2 linhas é aceitável
// aqui (não é dado financeiro).
export async function swapInsurerOrder({ first, second }: SwapInsurerOrderInput) {
  const { error: firstError } = await supabase
    .from("insurers")
    .update({ display_order: first.display_order })
    .eq("id", first.id);
  if (firstError) throw firstError;

  const { error: secondError } = await supabase
    .from("insurers")
    .update({ display_order: second.display_order })
    .eq("id", second.id);
  if (secondError) throw secondError;
}
```

### Hook — `src/features/insurers/hooks/use-reorder-insurer/use-reorder-insurer.ts`

```ts
export function useReorderInsurer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: swapInsurerOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: insurerKeys.lists() }),
  });
}
```

### UI — `insurers-list-screen.tsx`

Nova coluna (ou dentro de Ações) com dois ícones (`ArrowUp`/`ArrowDown`, lucide-react). "Posição efetiva" de cada linha = `insurer.display_order ?? index` (índice na lista já ordenada/filtrada — só usado pra calcular o valor a persistir, nunca gravado sozinho sem um clique).

```tsx
function handleMove(index: number, direction: -1 | 1) {
  const target = index + direction;
  if (!insurers || target < 0 || target >= insurers.length) return;
  const current = insurers[index];
  const other = insurers[target];
  reorderInsurer.mutate({
    first: { id: current.id, display_order: other.display_order ?? target },
    second: { id: other.id, display_order: current.display_order ?? index },
  });
}
```

- Botão "mover pra cima" desabilitado no `index === 0`; "mover pra baixo" desabilitado no último índice.
- Os dois botões desabilitados quando `search` não está vazio (Requirement 2.5) — reordenar exige a lista completa (`insurers`, não `filteredInsurers`).
- `reorderInsurer.isPending` desabilita os botões durante a troca, evitando duplo clique.

## Addendum — ordem própria por corretora (`brokerage_insurer_order`)

Nova tabela, mesmo padrão RLS de `brokerage_disabled_insurers` (select própria corretora; insert/update só `brokerage_admin`):

```sql
create table brokerage_insurer_order (
  brokerage_id uuid not null references brokerages (id) on delete cascade,
  insurer_id uuid not null references insurers (id) on delete cascade,
  display_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (brokerage_id, insurer_id)
);
```

`list-insurer-catalog.ts` embeda a nova tabela junto (`brokerage_insurer_order(display_order)`) — RLS já escopa pra própria corretora, então o embed vem vazio ou com 1 linha. `InsurerCatalogEntry` ganha esse campo.

`insurer-catalog-screen.tsx`:
- `effectiveOrder(insurer) = brokerage_insurer_order[0]?.display_order ?? insurer.display_order ?? Infinity` — ordem própria primeiro, catálogo global depois, nome por último (desempate).
- Novo `sortedInsurers` (`useMemo`) ordena por `effectiveOrder` antes do filtro de busca — `filteredInsurers` passa a filtrar `sortedInsurers`, não o array cru do hook.
- Coluna "Ordem" com as mesmas duas setas de `insurers-list-screen`, só renderizada quando `canToggle` (mesma regra do `Switch`) — `platform_admin` não vê a coluna.
- `handleMove` chama `useReorderBrokerageInsurer` (novo hook), que faz `upsert` (não update simples — a linha pode não existir ainda) em `brokerage_insurer_order` via `swapBrokerageInsurerOrder` (`src/features/insurers/api/reorder-brokerage-insurer/`).

```ts
export async function swapBrokerageInsurerOrder({ brokerageId, first, second }) {
  await supabase.from("brokerage_insurer_order").upsert(
    { brokerage_id: brokerageId, insurer_id: first.insurerId, display_order: first.display_order },
    { onConflict: "brokerage_id,insurer_id" },
  );
  await supabase.from("brokerage_insurer_order").upsert(
    { brokerage_id: brokerageId, insurer_id: second.insurerId, display_order: second.display_order },
    { onConflict: "brokerage_id,insurer_id" },
  );
}
```

## Testing Strategy

- `tsc`/`eslint`/`vitest run` completos.
- Ajustar `insurer-catalog-screen.test.tsx` só se a troca de marcação quebrar alguma query (usa `getByRole("switch")`/`getByRole("row")`, que sobrevivem à troca pra `Table` compartilhada — confirmar rodando antes de mexer).
- Novo teste pra `use-reorder-insurer` (mesmo padrão de `use-disable-insurer.test.tsx`).
- Rodar `e2e/insurers-catalog-toggle.spec.ts` (usa `page.locator("tr", ...)`/`getByRole("switch")`, deve sobreviver) pra confirmar que o redesign não quebrou o fluxo real.
- Verificação visual via Playwright: "Minhas seguradoras" no padrão novo; mover uma seguradora pra cima/baixo em `insurers-list-screen` persiste e reflete no reload; setas desabilitadas com busca ativa e nas pontas da lista.
