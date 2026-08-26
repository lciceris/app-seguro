# Design Document — brokerages-list-filters

## Overview

Segue exatamente o padrão já usado em `quotations-list-screen.tsx`/`policies-list-screen.tsx`: sentinelas de módulo (`ALL_STATUS_VALUE`, `ALL_PLAN_VALUE`, `NO_PLAN_VALUE`), estado local por `useState`, filtro client-side via `useMemo` (sem nova query — `list-brokerages.ts` já traz `status` e `plan_id`), e dois `Select` do shadcn na toolbar, ao lado da busca existente.

`usePlans()` (já existente, usado no form de criar/editar corretora) é reaproveitado para popular o `Select` de plano — sem duplicar fetch.

## Toolbar

```tsx
<div className="mb-4 flex items-center gap-3">
  <div className="relative max-w-sm flex-1">{/* busca existente */}</div>
  <Select value={statusFilter} onValueChange={setStatusFilter}>...</Select>
  <Select value={planFilter} onValueChange={setPlanFilter}>...</Select>
</div>
```

## Lógica de filtro

```ts
const filteredBrokerages = useMemo(() => {
  if (!brokerages) return brokerages;
  const query = normalize(search.trim());
  return brokerages.filter((brokerage) => {
    if (statusFilter !== ALL_STATUS_VALUE && brokerage.status !== statusFilter) return false;
    if (planFilter !== ALL_PLAN_VALUE) {
      const matchesPlan = planFilter === NO_PLAN_VALUE ? !brokerage.plan_id : brokerage.plan_id === planFilter;
      if (!matchesPlan) return false;
    }
    if (!query) return true;
    const name = normalize(brokerage.name);
    const taxId = brokerage.tax_id ? normalize(brokerage.tax_id) : "";
    return name.includes(query) || taxId.includes(query);
  });
}, [brokerages, search, statusFilter, planFilter]);
```

`hasActiveFilter` (busca OU status OU plano diferentes do padrão) decide a mensagem do `TableEmptyState`.

## Testing Strategy

- `tsc`/`eslint`/`vitest` completos (sem teste de componente novo — não há suíte de componente pra essa tela hoje, consistente com o resto do projeto).
- Verificação visual real via Playwright: aplicar cada filtro isoladamente e em combinação, confirmar contagem de linhas e mensagem de vazio, depois limpar (`rm`) o script.
