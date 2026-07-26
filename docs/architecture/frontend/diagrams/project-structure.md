# Diagrama — Estrutura do Projeto

> Apenas a árvore visual. Para o que vai em cada pasta e por quê, ver [`conventions/folder-structure.md`](../conventions/folder-structure.md).

## Raiz de `src/`

```
src/
│
├── app/
│   ├── config/
│   ├── providers/
│   ├── query/
│   ├── router/
│   └── theme/
│
├── assets/
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   └── styles/
│
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── services/
│   ├── constants/
│   ├── types/
│   └── lib/
│
├── features/
│
├── pages/
│
├── main.tsx
└── vite-env.d.ts
```

## `shared/components/` (um módulo por pasta)

```
components/
│
├── button/
│   ├── button.tsx
│   └── index.ts
│
├── input/
│   ├── input.tsx
│   └── index.ts
│
├── modal/
│   ├── modal.tsx
│   └── index.ts
│
└── table/
    ├── table.tsx
    └── index.ts
```

## `features/` (uma pasta por domínio)

```
features/
│
├── auth/
├── quotations/
├── users/
└── vehicles/
```

## Estrutura interna de uma feature

```
quotations/
│
├── api/            → comunicação com o backend (uma pasta por endpoint/operação)
├── components/      → componentes da feature (inclui drawers de criar/editar)
├── screens/         → componente(s) de tela renderizados pelo pages/ (ex. quotation-screen/)
├── hooks/           → hooks da feature
├── services/        → orquestração da regra de negócio
├── utils/           → funções específicas da feature
├── validations/      → schemas do Zod
├── store/           → estado da feature (Zustand, Context, etc.)
├── constants/       → constantes exclusivas da feature
├── types/           → tipos da feature
└── index.ts         → API pública da feature
```

## `features/quotations/api/` (um módulo por operação)

```
api/
│
├── create-quotation/
│   ├── create-quotation.ts
│   └── index.ts
│
├── get-quotation/
│   ├── get-quotation.ts
│   └── index.ts
│
└── update-quotation/
    ├── update-quotation.ts
    └── index.ts
```

## `pages/` (uma pasta por segmento de URL)

```
pages/
│
├── clients/
│   ├── clients-page.tsx              → /clients
│   └── [clientId]/
│       ├── client-detail-page.tsx    → /clients/:clientId
│       └── vehicles/
│           └── new/
│               └── new-vehicle-page.tsx  → /clients/:clientId/vehicles/new
│
└── quotations/
    └── quotations-page.tsx           → /quotations
```
