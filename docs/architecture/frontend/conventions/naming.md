# Nomenclatura

> Todas as convenções relacionadas à escrita e nomeação de código.

| Item | Convenção | Exemplos |
|---|---|---|
| Pastas | kebab-case | `quotation-form`, `use-local-storage`, `format-date` |
| Arquivos | kebab-case | `button.tsx`, `quotation-service.ts`, `format-date.ts` |
| Componentes | `export function Nome() {}` | `export function Button() {}` |
| Hooks | `useNome` | `useAuth()`, `useQuotation()` |
| Types | `interface`/`type` | `interface User {}`, `type Vehicle = {}` |
| Constantes | objeto nomeado | `const STORAGE_KEYS = {}`, `const QUERY_KEYS = {}` |

## Componentes: sempre function declaration nomeada

```tsx
// ✔ Correto
export function Button() {}

// ✖ Evitar
export default function Button() {}
const Button = () => {};
export default Button;
```

Nunca usar `export default` — todo export é nomeado, para que o `index.ts` de cada módulo reexporte explicitamente (`export * from "./button"`) e as importações em outros arquivos fiquem explícitas sobre o que estão importando.

## Todo módulo tem um arquivo `index.ts`

Toda pasta que representa um módulo tem um arquivo chamado exatamente `index.ts`, responsável por reexportar a API pública desse módulo:

```
button/
    button.tsx
    index.ts
```
```ts
// index.ts
export * from "./button";
```

(O comportamento de import decorrente disso — nunca importar o arquivo interno diretamente — está em [`imports.md`](imports.md); as regras de quem pode depender de quem estão em [`module-boundaries.md`](module-boundaries.md).)
