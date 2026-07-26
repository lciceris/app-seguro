# Criando uma Feature

> Checklist para criar uma nova feature do zero, amarrando os padrões já definidos em `adr/` e `conventions/`.

## 1. Criar a pasta

`features/<nome-da-feature>/`, kebab-case (ver [`naming.md`](../conventions/naming.md)).

## 2. Criar só as subpastas que a feature realmente precisa

Não criar todas por padrão — cada uma existe só se a feature tiver essa necessidade (ver [`folder-structure.md`](../conventions/folder-structure.md) para o detalhe de cada uma):

- **`api/`** — se a feature busca/envia dado ao Supabase.
- **`components/`** — componentes da feature, incluindo drawers de criar/editar.
- **`screens/`** — se a feature tem uma tela renderizada por uma rota em `pages/`.
- **`hooks/`** — os `useQuery`/`useMutation` que envolvem o `api/` (ver [`react-query.md`](../conventions/react-query.md)).
- **`services/`** — só se houver orquestração de regra de negócio além do que os hooks já fazem.
- **`utils/`** — funções puras específicas da feature.
- **`validations/`** — se a feature tem formulário (ver [`forms.md`](../conventions/forms.md)).
- **`store/`** — só se o estado realmente precisar de Zustand — é exceção, não regra (ver [ADR 004](../adr/004-state-management.md) antes de criar).
- **`constants/`** — inclui as query keys da feature, se ela usa React Query (ver [`react-query.md`](../conventions/react-query.md)).
- **`types/`** — tipos da feature.

## 3. Criar o `index.ts`

A API pública da feature (ver [`module-boundaries.md`](../conventions/module-boundaries.md)) — exporta só o que o resto da aplicação precisa consumir (tipicamente a `Screen` e, quando fizer sentido, alguns tipos). Nada além disso deve ser importado de fora da feature.

## 4. Criar a página em `pages/`

Uma pasta por segmento de URL (ver [`folder-structure.md`](../conventions/folder-structure.md)), com um componente fino que só importa e renderiza a `Screen` da feature — sem lógica própria.

## 5. Registrar a rota

Em `app/router/`.

## 6. Registrar visibilidade por perfil (quando existir)

O sistema de permissões/roles ainda não foi documentado nesta reconstrução — quando existir, este passo vai cobrir onde e como restringir a visibilidade da rota/menu por perfil de usuário.

---

*Cada passo referencia a convenção correspondente — se alguma decisão aqui parecer errada ou incompleta, o lugar certo pra corrigir é o documento de `conventions/` ou `adr/` referenciado, não este guia.*
