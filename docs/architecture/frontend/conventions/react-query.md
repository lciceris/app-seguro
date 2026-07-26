# React Query

> Padrões de uso do TanStack Query. Para o porquê de adotá-lo, ver [ADR 003](../adr/003-react-query.md).

## Onde vive cada coisa

- **`app/query/`** — instância do `QueryClient` e opções padrão (`staleTime`, `retry`, etc.).
- **`shared/lib/react-query/`** — wrapper/config de baixo nível do React Query (ex. um helper genérico de query key factory, se necessário entre features).
- **`features/<feature>/api/`** — as funções que efetivamente chamam o Supabase (uma pasta por operação, ver [`folder-structure.md`](folder-structure.md)). Não usam hooks do React Query diretamente — só retornam o dado ou lançam o erro.
- **`features/<feature>/hooks/`** — os hooks que envolvem as funções de `api/` em `useQuery`/`useMutation` (ex. `use-quotation/`, `use-create-quotation/`, `use-update-quotation/`).
- **`features/<feature>/constants/`** — as query keys daquela feature (ver abaixo). Query keys são específicas de cada feature, não vão para `shared/constants/`.

## Query keys

Cada feature define suas próprias query keys como uma factory hierárquica, não como strings soltas:

```ts
// features/quotations/constants/query-keys.ts
export const quotationKeys = {
  all: ["quotations"] as const,
  lists: () => [...quotationKeys.all, "list"] as const,
  list: (filters: QuotationFilters) => [...quotationKeys.lists(), filters] as const,
  details: () => [...quotationKeys.all, "detail"] as const,
  detail: (id: string) => [...quotationKeys.details(), id] as const,
};
```

Isso permite invalidar por granularidade — `quotationKeys.all` invalida tudo da feature, `quotationKeys.lists()` invalida só as listagens, `quotationKeys.detail(id)` invalida uma cotação específica.

## Queries

```ts
// features/quotations/hooks/use-quotation.ts
export function useQuotation(id: string) {
  return useQuery({
    queryKey: quotationKeys.detail(id),
    queryFn: () => getQuotation(id),
  });
}
```

- `staleTime` padrão vem de `app/query/` — só sobrescrever por query quando o dado tiver uma cadência de mudança claramente diferente (ex. dados que mudam raramente podem ter `staleTime` maior).

## Mutations e invalidação

Substitui a regra antiga de "sempre refazer o fetch manualmente" — a mutation invalida a query key afetada, e o React Query cuida do refetch:

```ts
// features/quotations/hooks/use-create-quotation.ts
export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
    },
  });
}
```

## Optimistic updates

Disponível via `onMutate`/`onError`/`onSettled`, mas **não é obrigatório em toda mutation** — usar seletivamente onde a latência percebida importa (ex. alternar status de uma cotação numa lista), não como padrão default para tudo.

## Prefetch

Disponível (`queryClient.prefetchQuery`) para casos como pré-carregar o detalhe de uma cotação ao passar o mouse sobre a linha da lista — também opcional, aplicado caso a caso, não uma regra geral.
