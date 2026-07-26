# ADR 003 — TanStack Query como camada de server state

**Data:** 2026-07-25
**Status:** Aceito

**Contexto:** O backend é o Supabase (ver [ADR 001](001-spa-react-router-v7.md)) — o cliente Supabase retorna promises simples, sem cache, deduplicação de requisições, revalidação em background ou invalidação automática após mutações. O `fleet-auth-gate` original já tinha `@tanstack/react-query` como dependência, mas subutilizada; a maior parte das telas fazia fetch manual em `useEffect` e recarregava a lista inteira manualmente após qualquer insert/update/delete (regra "sempre refazer o fetch" do CLAUDE.md antigo).

**Problema:** Sem uma camada dedicada de server state, cada feature reimplementa loading/error/refetch do zero, não há cache nem deduplicação entre componentes que pedem o mesmo dado, e a invalidação depende de lembrar manualmente de re-chamar o fetch em todo lugar relevante.

**Decisão:** Adotar o TanStack Query como camada de server state para toda comunicação com o Supabase (queries e mutations). Estado de UI local continua fora dele — ver [ADR 004](004-state-management.md) (quando for escrita) para a fronteira entre server state e local/UI state.

**Justificativa:**
- Resolve exatamente os problemas listados acima: cache, deduplicação, revalidação em background, e invalidação declarativa via `invalidateQueries` no lugar de refetch manual espalhado pelo código.
- Já era uma dependência do projeto original — não é uma biblioteca nova para a equipe aprender, só passa a ser usada de verdade em vez de instalada e ignorada.
- Tem uma API de mutations mais completa que alternativas mais simples (ex. SWR), incluindo optimistic updates e callbacks de ciclo de vida (`onMutate`/`onError`/`onSettled`), úteis para os fluxos de negociação/status de cotação que têm várias transições encadeadas.

**Alternativas consideradas:**
- *Fetch manual em `useEffect` (o padrão antigo)* — sem cache nem deduplicação, cada feature reinventa loading/error, invalidação depende de lembrar de chamar `fetchData()` manualmente em todo lugar (fonte de bugs no projeto original).
- *SWR* — API mais enxuta, mas mutations mais limitadas; não haveria ganho real sobre o React Query, que já era dependência do projeto.
- *Apollo Client / Relay* — feitos para GraphQL; o Supabase usa PostgREST/RPC, não GraphQL — não se aplica.
- *Zustand para server state* — misturar cache de servidor num store global é um anti-padrão: server state tem semântica própria (staleness, refetch em background, dedup) que não é a mesma coisa que estado local da aplicação.

**Consequências:**
- Toda leitura/escrita ao Supabase passa por uma função em `features/<feature>/api/`, consumida via hook `useQuery`/`useMutation` em `features/<feature>/hooks/`.
- A regra antiga "sempre refazer o fetch após insert/update/delete" é substituída por invalidação de query key — ver [`conventions/react-query.md`](../conventions/react-query.md) para o padrão exato.
- `app/query/` guarda a instância do `QueryClient` e as opções padrão (staleTime, retry); `app/providers/` inclui o `QueryClientProvider`.
