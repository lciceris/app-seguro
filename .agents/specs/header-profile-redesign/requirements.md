# Requirements — header-profile-redesign

## Introdução

Sequência da spec `sidebar-light-redesign`: a sidebar não tem mais rodapé de usuário — perfil/logout migram pro header. O usuário validou a opção "Perfil rico" entre 5 propostas (gatilho com nome+cargo, dropdown com avatar grande e badge de cargo), com 3 ajustes: sem título de página no header, ícone de notificações e ícone de troca de tema já visíveis (ambos sem ação por enquanto).

## Escopo

**Dentro:**
- `app-header.tsx`: remove qualquer título; adiciona ícone de tema e ícone de notificações (decorativos, sem `onClick`) entre o trigger e o menu de usuário.
- `user-menu.tsx`: gatilho passa a mostrar nome + cargo empilhados (não só nome) + chevron; dropdown vira um mini cartão de perfil (avatar maior, nome, e-mail, cargo em badge), com ícones nos itens "Meu perfil" e "Sair".

**Fora:**
- Implementar dark/light mode de verdade (o ícone fica pronto pro clique, mas sem lógica — spec futura).
- Sistema de notificações real (o ícone fica decorativo).
- Indicador de "não lidas" no sino — evitar sinalizar algo que não existe de fato.

## Requirements

### Requirement 1: Header sem título

**User Story:** Como usuário, quero um header limpo, sem duplicar informação que já está no menu ativo da sidebar.

#### Acceptance Criteria

1. O header NÃO SHALL exibir título de página, breadcrumb ou qualquer texto entre o trigger e os ícones da direita.

### Requirement 2: Ícones de tema e notificações (decorativos)

**User Story:** Como usuário, quero já ver onde a troca de tema e as notificações vão morar, mesmo antes delas funcionarem.

#### Acceptance Criteria

1. O header SHALL exibir um botão de ícone pra troca de tema (lua/sol) à esquerda do menu de usuário.
2. O header SHALL exibir um botão de ícone de notificações (sino) à esquerda do menu de usuário.
3. Nenhum dos dois botões SHALL ter `onClick` ou indicar estado (ex.: contador/bolinha de não lida) — eles não têm função ainda.

### Requirement 3: Menu de usuário rico

**User Story:** Como usuário, quero ver meu nome e cargo direto no header, e um dropdown com mais identidade visual que um menu de sistema genérico.

#### Acceptance Criteria

1. O gatilho do menu SHALL mostrar avatar, nome completo e cargo (rótulo de `ROLE_LABELS`) empilhados, mais um chevron.
2. O dropdown, ao abrir, SHALL mostrar um cartão de perfil no topo: avatar maior, nome, e-mail e o cargo como badge (não como linha de texto simples).
3. Os itens "Meu perfil" (desabilitado) e "Sair" SHALL manter um ícone à esquerda do texto.
4. O comportamento de "Sair" (chama `useLogout`) SHALL continuar idêntico ao atual.
