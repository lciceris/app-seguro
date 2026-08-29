# Requirements — insurer-catalog-and-ordering

## Introdução

Duas frentes na área de seguradoras: (1) `insurer-catalog-screen.tsx` ("Minhas seguradoras", `/my-insurers`) já habilita/desabilita seguradora por corretora de ponta a ponta (`Switch`, RLS restringindo a `brokerage_admin`), mas nunca foi atualizada pro padrão visual do resto do app — ainda usa `<table>` cru, sem painel/busca/contador. (2) O campo `display_order` do catálogo (`insurers-list-screen.tsx`, platform_admin) só é editável digitando um número no formulário — usuário pediu reordenar direto na tabela.

## Escopo

**Dentro:**
- `insurer-catalog-screen.tsx`: mesmo padrão visual das outras listagens (painel branco, `Table` compartilhada, busca por nome/CNPJ, contador). Lógica de habilitar/desabilitar (`Switch`, badge read-only pra platform_admin) idêntica.
- `insurers-list-screen.tsx`: setas de mover pra cima/baixo por linha, alterando `display_order`. Decidido setas em vez de drag-and-drop (lista curta, menos dependência/complexidade, acessível por teclado de graça).
- Campo manual "Ordem de exibição" no formulário continua existindo — as setas são um jeito a mais de editar o mesmo dado, não um substituto.

**Fora:**
- Ordenação própria por corretora (não existe esse conceito no schema — `display_order` é global do catálogo, só platform_admin edita).
- Setas/reordenação em `insurer-catalog-screen.tsx` — essa tela só exibe na ordem que o catálogo já definiu (a query já faz `order by display_order`), não edita.
- Drag-and-drop (decidido contra, ver conversa).

## Requirements

### Requirement 1: `insurer-catalog-screen.tsx` no padrão visual atual

**User Story:** Como usuário (brokerage_admin ou platform_admin), quero que "Minhas seguradoras" pareça com o resto do app.

#### Acceptance Criteria

1. A tela SHALL usar painel branco (`rounded-2xl border border-border bg-card p-5 shadow-sm`), título + contador, campo de busca por nome/CNPJ, e a `Table` compartilhada (`TableHeader`/`TableRow`/`TableCell`/`TableSkeletonRow`/`TableEmptyState`/`TableErrorState`).
2. O comportamento de habilitar/desabilitar (switch interativo pra `brokerage_admin`, badge read-only pra `platform_admin`) SHALL continuar idêntico ao de hoje.

### Requirement 2: Reordenar seguradoras por setas

**User Story:** Como platform_admin, quero reordenar seguradoras na própria listagem, sem precisar abrir cada uma pra digitar um número.

#### Acceptance Criteria

1. Cada linha da tabela de seguradoras (`insurers-list-screen.tsx`) SHALL ter um controle de mover pra cima e mover pra baixo.
2. Mover uma linha SHALL trocar o `display_order` dela com o da linha adjacente (na ordem exibida), persistindo os dois valores.
3. A primeira linha NÃO SHALL ter controle de mover pra cima habilitado; a última NÃO SHALL ter mover pra baixo habilitado.
4. Seguradoras sem `display_order` definido (`null`) SHALL ser tratadas pela posição atual na lista (ordem já é `nullsFirst: false` + nome) — o primeiro clique em mover já resolve um valor numérico pra ambas as linhas envolvidas na troca.
5. As setas SHALL ficar desabilitadas enquanto uma busca estiver ativa (reordenar exige a lista completa, não um subconjunto filtrado).
