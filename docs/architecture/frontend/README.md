# Frontend — Documentação de Arquitetura

Documentação de arquitetura e convenções do frontend, escrita antes da implementação (SDD). Dividida por responsabilidade:

- **`adr/`** — decisões arquiteturais: contexto, decisão, justificativa, alternativas consideradas, consequências. Não contém estrutura de pastas, exemplos de import, convenções de nomenclatura ou tutoriais — isso vive em `conventions/` e `guides/`.
- **`conventions/`** — regras permanentes do projeto (estrutura de pastas, nomenclatura, imports, limites entre módulos).
- **`guides/`** — documentos operacionais, ensinando como criar novos artefatos seguindo os padrões definidos.
- **`diagrams/`** — só diagramas e explicações visuais, sem repetir texto que já está em `conventions/`.

## Existente

| Documento | Conteúdo |
|---|---|
| [`adr/001-spa-react-router-v7.md`](adr/001-spa-react-router-v7.md) | SPA client-side + React Router v7 (modo library) |
| [`adr/002-feature-first.md`](adr/002-feature-first.md) | Organização de `src/` por domínio (feature-first) |
| [`conventions/folder-structure.md`](conventions/folder-structure.md) | Responsabilidade de cada pasta (`app/`, `shared/`, `features/`, `pages/`) |
| [`conventions/naming.md`](conventions/naming.md) | kebab-case, `useNome`, `export function`, sem default export, `index.ts` |
| [`conventions/imports.md`](conventions/imports.md) | Sem barrel exports globais, sempre importar pela pasta do módulo |
| [`conventions/module-boundaries.md`](conventions/module-boundaries.md) | Regra de ouro + direção de dependência entre camadas (`app` → `pages` → `features` → `shared` → `shared/lib`) |
| [`diagrams/project-structure.md`](diagrams/project-structure.md) | Árvores de pastas (raiz, `shared/components/`, `features/`, `pages/`) |
| [`diagrams/architecture.md`](diagrams/architecture.md) | Diagrama de camadas e direção de dependência |
| [`adr/003-react-query.md`](adr/003-react-query.md) | Por que TanStack Query como camada de server state |
| [`conventions/react-query.md`](conventions/react-query.md) | Query keys, queries, mutations, invalidação, optimistic update, prefetch |
| [`conventions/forms.md`](conventions/forms.md) | React Hook Form + Zod, sanitização, integração com mutations, sucesso/erro |
| [`adr/004-state-management.md`](adr/004-state-management.md) | Escalonamento: React Query → `useState` → Context → Zustand → URL state |
| [`conventions/ui-patterns.md`](conventions/ui-patterns.md) | Loading, skeleton, empty state, error state, retry, toast, confirm dialog, success feedback |
| [`guides/creating-a-feature.md`](guides/creating-a-feature.md) | Checklist pra criar uma feature nova, amarrando todos os documentos acima |
| [`conventions/testing.md`](conventions/testing.md) | Vitest + RTL + Playwright, co-localização, o que testar em cada camada, estratégia |

## Sequência planejada — concluída ✅

1. ~~Module Boundaries~~ (`conventions/module-boundaries.md` + `diagrams/architecture.md`)
2. ~~React Query~~ (`adr/003-react-query.md` + `conventions/react-query.md`)
3. ~~Forms~~ (`conventions/forms.md`)
4. ~~State Management~~ (`adr/004-state-management.md`)
5. ~~UI Patterns~~ (`conventions/ui-patterns.md`)
6. ~~Creating a Feature~~ (`guides/creating-a-feature.md`)
7. ~~Testing~~ (`conventions/testing.md`)

Todas as lacunas identificadas na análise crítica original foram formalizadas. Arquivos ainda não criados por falta de conteúdo concreto: `guides/creating-a-page.md`, `guides/creating-a-component.md`, `guides/creating-an-api.md`, `guides/creating-a-form.md`, `diagrams/request-flow.md` — criados quando surgir necessidade real, não por antecipação.
