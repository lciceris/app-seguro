# Testing

> Organização, localização, nomenclatura e estratégia de testes.

## Ferramentas

- **Vitest** — test runner. Integração nativa com Vite (reaproveita a config existente do projeto em vez de duplicar setup como seria necessário com Jest).
- **React Testing Library** — testes de componente, focados em comportamento observável pelo usuário, não em detalhes de implementação interna.
- **Playwright** — testes E2E de fluxos completos, quando necessário.

## Localização dos arquivos

Co-localizado com o módulo que testa — não uma pasta `__tests__` separada. Mesmo padrão de módulo-por-pasta já estabelecido (ver [`folder-structure.md`](folder-structure.md)):

```
button/
    button.tsx
    button.test.tsx
    index.ts
```

O teste é parte do módulo, não um artefato à parte guardado em outro lugar.

## Nomenclatura

`<nome-do-arquivo>.test.ts` / `.test.tsx` — kebab-case, mesmo nome do arquivo testado + sufixo `.test`.

## O que testar em cada camada

- **`shared/utils/*`** — funções puras: teste unitário direto, sem mocks.
- **`shared/components/*`, `features/*/components/*`** — comportamento via React Testing Library (o que o usuário vê/faz), nunca snapshot testing nem teste de implementação interna.
- **`features/*/api/*`** — não precisa de teste unitário isolado (é uma chamada fina ao Supabase, ver [`react-query.md`](react-query.md)); a cobertura vem do teste do hook que consome essa função, ou fica para o E2E.
- **`features/*/hooks/*`** (`useQuery`/`useMutation`) — testar com um `QueryClient` de teste, mockando a função de `api/`.
- **Fluxos completos** (criar cotação, login, convite de usuário) — E2E com Playwright, fora da suíte de testes unitários/componente.

## O que não testar

- Componentes puramente apresentacionais, sem lógica condicional.
- Wrappers finos de biblioteca externa (`shared/lib/*`) — testar a biblioteca em si não agrega valor.

## Estratégia

Não perseguir 100% de cobertura. Prioridade, nessa ordem:

1. Lógica de negócio pura (`utils/`, `validations/`).
2. Comportamento de componente compartilhado (`shared/components/`).
3. Fluxos críticos de ponta a ponta (E2E) — cotação completa, login, convite de usuário.
