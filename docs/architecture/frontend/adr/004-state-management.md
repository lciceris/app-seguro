# ADR 004 — Gerenciamento de estado: quando usar cada abordagem

**Data:** 2026-07-25
**Status:** Aceito

**Contexto:** O projeto usa várias formas de estado: dado de servidor vindo do Supabase (React Query, ver [ADR 003](003-react-query.md)), estado de UI local, estado compartilhado dentro de uma feature, e estado que idealmente deveria refletir na URL (filtros, paginação, aba ativa). Sem um critério explícito, cada desenvolvedor escolhe a ferramenta por preferência — o que gera inconsistência (um filtro de lista guardado em Zustand numa feature e em `useState` em outra) e dificulta a leitura do código.

**Problema:** Definir, para cada tipo de estado, qual mecanismo usar — sem cair no extremo de um store global pra tudo, nem no extremo de duplicar server state em estado local.

**Decisão:** Escalonamento do mais simples ao mais amplo — sempre a opção mais simples que resolve o caso, só subindo de nível quando necessário:

1. **Dado de servidor** (vindo do Supabase) → sempre React Query ([ADR 003](003-react-query.md)). Nunca duplicado em Zustand, Context ou `useState`.
2. **Estado de UI local a um único componente** (toggle, valor de input antes de submeter, hover, aba dentro de um componente isolado) → `useState`.
3. **Estado compartilhado entre um grupo de componentes de uma mesma tela/fluxo, mas que não sai dali** (ex.: passo atual e dados coletados de um formulário em múltiplas etapas) → Context, local à feature.
4. **Estado compartilhado entre partes distantes da aplicação, ou genuinamente global** (usuário autenticado, corretora atual, cor primária dinâmica) → Zustand. `features/<feature>/store/` é permitido (ver [`folder-structure.md`](../conventions/folder-structure.md)), mas é exceção, não padrão — a maioria dos casos se resolve nos níveis 2–3 antes de chegar aqui.
5. **Estado que deveria ser compartilhável por URL** (bookmark, botão voltar, link compartilhável) — filtros de listagem, paginação, aba ativa numa tela de detalhe, ordenação → search params via React Router (`useSearchParams`), nunca em `useState`/Context/Zustand.

**Justificativa:**
- Evita duplicar server state em estado local — fonte clássica de bugs de dessincronização (a lista mostra dado desatualizado porque ninguém lembrou de atualizar o estado local depois de uma mutation).
- O único uso real de Zustand no `fleet-auth-gate` original era a auth store (`usuario`, global, único) — esta decisão formaliza que esse continua sendo o caso principal, sem abrir precedente para todo estado de UI virar um store.
- URL state aproveita a aplicação já ser fortemente orientada a rotas (drawers como rota aninhada, ver [ADR 002](002-feature-first.md)) — filtros e paginação fora da URL se perdem ao navegar ou recarregar a página.

**Alternativas consideradas:**
- *Um único store Zustand global para tudo* — simples no início, mas mistura server state com UI state e cresce sem limite claro; era exatamente o problema que o projeto original evitava ao usar Zustand só para auth.
- *Context para tudo, sem Zustand* — evita uma dependência, mas Context re-renderiza toda a árvore de consumidores a cada mudança — inadequado para estado lido por componentes distantes e que muda com frequência (ex. cor primária da corretora, lida na sidebar inteira e em botões espalhados pela UI).

**Consequências:**
- `features/<feature>/store/` só é criado quando o estado realmente precisa atravessar múltiplas telas/componentes distantes da mesma feature — não é parte obrigatória de toda feature.
- Filtros e paginação de listagens sempre em search params, nunca em store ou state local — vira item de checklist ao criar uma nova tela de listagem (`guides/creating-a-feature.md`, quando escrito).
