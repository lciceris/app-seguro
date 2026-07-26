# Limites entre Módulos

> Foco exclusivo em limites e dependências entre módulos — nomenclatura está em [`naming.md`](naming.md), sintaxe de import está em [`imports.md`](imports.md), organização de pastas está em [`folder-structure.md`](folder-structure.md).

## Regra de ouro

**Uma feature nunca deve acessar diretamente arquivos internos de outra feature.** A comunicação entre features acontece apenas pela API pública exposta no `index.ts` da própria feature.

Essa regra garante baixo acoplamento, facilita refatorações e mantém cada domínio isolado — e combina diretamente com o princípio "um módulo = uma pasta" (ver [`folder-structure.md`](folder-structure.md)), deixando a estrutura previsível e navegável mesmo com o projeto grande.

## `index.ts` como fronteira do módulo

O `index.ts` de um módulo (componente, hook, feature) é o único ponto de contato permitido com esse módulo a partir de fora. Ele não é um "barrel que reexporta tudo por conveniência" — é a fronteira deliberada entre o que é público e o que é implementação interna. Isso vale tanto para módulos pequenos (`shared/components/button/`) quanto para features inteiras (`features/quotations/`).

## Direção de dependência entre camadas

Diagrama em [`diagrams/architecture.md`](../diagrams/architecture.md). Regras:

- **`app/`** pode importar de qualquer camada — é a raiz de composição (monta providers, router, query client a partir de `pages/`, `features/` e `shared/`).
- **`pages/`** só pode importar da `screens/` pública de uma feature (via `index.ts` dela) e de `shared/`. Nunca de outra pasta em `pages/`, nunca de arquivos internos de uma feature.
- **`features/`** pode importar livremente de `shared/`. Pode importar de outra feature, mas **somente** através do `index.ts` público dela (ver Regra de ouro acima) — nunca de arquivos internos de outra feature.
- **`shared/`** (`components/`, `hooks/`, `utils/`, `services/`, `constants/`, `types/`) pode importar de `shared/lib/`. **Nunca** importa de `features/` ou `pages/` — isso inverteria a dependência e quebraria o princípio de `shared/` ser genérico e reutilizável (ver [ADR 002](../adr/002-feature-first.md)).
- **`shared/lib/`** é a camada mais baixa — não importa de nenhuma outra parte da aplicação, só das bibliotecas externas que encapsula.

O que isso proíbe na prática:
- `shared/` importar algo de dentro de `features/*` (inverteria a dependência).
- Uma `page` renderizar um componente interno de uma feature sem passar pela `screens/` exportada no `index.ts`.
- Uma feature importar `features/outra-feature/components/algo` diretamente, em vez de `features/outra-feature` (o `index.ts`).
