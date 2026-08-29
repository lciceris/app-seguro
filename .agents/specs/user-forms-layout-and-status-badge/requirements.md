# Requirements — user-forms-layout-and-status-badge

## Introdução

Três ajustes pontuais na área de usuários: reposicionar o campo "Perfil" ao lado de "Telefone" nos formulários de convidar/editar, marcar campos obrigatórios com `*`, e trocar o texto colorido de status por `Badge` no drawer de detalhe (igual à listagem).

## Escopo

**Dentro:**
- `invite-user-drawer.tsx`/`edit-user-drawer.tsx`: "Perfil" fica ao lado de "Telefone" no grid.
- Label com `" *"` nos campos obrigatórios (`Nome`, `E-mail` quando existir, `Perfil`) nos dois formulários.
- `user-detail-drawer.tsx`: campo "Status" vira `Badge`, mesma classe/lógica de `users-list-screen.tsx`.

**Fora:**
- Reescrever `user-detail-drawer.tsx` pro padrão `DetailField`/grid usado em corretoras/seguradoras — não foi pedido, só o status muda.

## Requirements

### Requirement 1: Perfil ao lado de Telefone

**User Story:** Como usuário, quero que "Perfil" fique ao lado de "Telefone" no formulário, não numa linha própria.

#### Acceptance Criteria

1. Em `invite-user-drawer.tsx` (Nome, E-mail, Telefone, Perfil), o campo Perfil SHALL perder o `col-span-2` e cair na mesma linha de Telefone (grid de 2 colunas já ordena isso ao remover o span).
2. Em `edit-user-drawer.tsx` (Nome, Telefone, Perfil), Nome SHALL ocupar a linha inteira (`col-span-2`) e Telefone/Perfil SHALL dividir a linha seguinte.

### Requirement 2: Asterisco em campo obrigatório

**User Story:** Como usuário, quero saber visualmente quais campos são obrigatórios antes de submeter.

#### Acceptance Criteria

1. Em `invite-user-drawer.tsx`: labels de Nome, E-mail e Perfil SHALL terminar em `" *"` (Telefone é opcional, sem asterisco).
2. Em `edit-user-drawer.tsx`: labels de Nome e Perfil SHALL terminar em `" *"` (Telefone é opcional, sem asterisco).

### Requirement 3: Status como badge no detalhe

**User Story:** Como usuário, quero ver o status do usuário no detalhe com a mesma cara da listagem.

#### Acceptance Criteria

1. `user-detail-drawer.tsx` SHALL trocar o texto colorido do campo Status por um `Badge` com exatamente a mesma classe condicional (`bg-success-bg text-success-text` / `bg-neutral-bg text-neutral-text`) usada em `users-list-screen.tsx`.
