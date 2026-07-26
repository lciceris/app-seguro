# Estrutura de Pastas

> Responsabilidade de cada pasta, quando usar e quando não usar. Para a árvore visual completa, ver [`diagrams/project-structure.md`](../diagrams/project-structure.md). Para o racional de ser feature-first, ver [ADR 002](../adr/002-feature-first.md).

## Uma responsabilidade por módulo

Cada módulo tem sua própria pasta. Nunca deixar arquivos soltos direto dentro das pastas principais.

✔ Correto
```
components/
    button/
    modal/
    input/
```
✖ Evitar
```
components/
    button.tsx
    modal.tsx
    input.tsx
```

## `app/`

Responsável pela inicialização da aplicação. **Não contém regra de negócio.**

- **`config/`** — configurações globais (env vars, feature flags).
- **`providers/`** — providers React (ex. `AuthProvider`, `ThemeProvider`, `QueryProvider`).
- **`query/`** — configuração do TanStack Query.
- **`router/`** — definição das rotas.
- **`theme/`** — tema da aplicação.

## `assets/`

Arquivos estáticos: `fonts/`, `icons/`, `images/`, `styles/`.

## `shared/`

Código reutilizado por toda a aplicação — só entra aqui quando usado por 2+ features (ver [ADR 002](../adr/002-feature-first.md)).

- **`components/`** — componentes reutilizáveis, um módulo por pasta (ver diagrama).
- **`hooks/`** — hooks compartilhados (`use-debounce/`, `use-local-storage/`, `use-media-query/`), mesmo padrão módulo + `index.ts`.
- **`utils/`** — funções puras (`format-date/`, `format-currency/`, `debounce/`).
- **`services/`** — serviços compartilhados. Não teremos um `http-client/` genérico como em APIs REST tradicionais — o cliente Supabase (`shared/lib/supabase/`) já cumpre esse papel. Exemplo real: `storage-service/` (helpers de upload/download para os buckets do Supabase Storage — `brokerage-assets`, `avatars`, `qar-attachments`).
- **`constants/`** — constantes compartilhadas (`query-keys/`, `routes/`, `storage-keys/`).
- **`types/`** — tipos compartilhados (`api/`, `common/`, `pagination/`).
- **`lib/`** — wrappers/configuração de bibliotecas externas, uma pasta por biblioteca, cada uma seguindo o mesmo padrão módulo + `index.ts`. No nosso stack: `supabase/` (cliente tipado), `date-fns/` (helpers de data com locale ptBR), `zod/` (schemas/config base), `react-query/` (config do `QueryClient`, referenciada por `app/query/`).

## `features/`

Cada feature representa um domínio da aplicação — tudo relacionado a ela permanece dentro dela (ver diagrama para a árvore completa de uma feature).

- **`api/`** — comunicação com o backend, uma pasta por endpoint/operação.
- **`components/`** — componentes da feature. Inclui os **drawers** de criar/editar (formulários que abrem como rota aninhada — nunca como `Dialog` dentro de outro drawer, sempre navegação interna): não têm pasta própria, são só mais um componente aqui (ex. `components/quotation-form-drawer/`).
- **`screens/`** — componente(s) de tela renderizados pelo `pages/` (ex. `quotation-screen/`). Ficam em pasta dedicada, separada de `components/`, porque representam especificamente a tela-raiz que uma rota renderiza — diferente dos demais componentes da feature, que são peças internas.
- **`hooks/`** — hooks da feature.
- **`services/`** — orquestração da regra de negócio.
- **`utils/`** — funções específicas da feature.
- **`validations/`** — schemas do Zod.
- **`store/`** — estado da feature (Zustand, Context, etc.).
- **`constants/`** — constantes exclusivas da feature.
- **`types/`** — tipos da feature.
- **`index.ts`** — API pública da feature (ver [limites de módulo](module-boundaries.md)).

## `pages/`

As páginas representam **exclusivamente as rotas** da aplicação. Devem ter o mínimo de lógica possível — apenas renderizam a tela (`screens/`) exportada pela feature correspondente.

A estrutura de pastas em `pages/` espelha a hierarquia da URL (uma pasta por segmento de rota), em vez do dot-path plano usado no `fleet-auth-gate` original (ver diagrama).

```tsx
// pages/quotations/quotations-page.tsx
import { QuotationScreen } from "@/features/quotations/screens/quotation-screen";

export function QuotationsPage() {
  return <QuotationScreen />;
}
```
