# Requirements — project-font-unify

## Introdução

Sequência da `sidebar-flat-nav`: o usuário achou os itens da sidebar muito grudados e decidiu levar a fonte escolhida (Plus Jakarta Sans) pro projeto inteiro, não só pra sidebar.

## Escopo

**Dentro:**
- Mais respiro vertical entre os itens da sidebar.
- Plus Jakarta Sans vira a única fonte de UI do projeto — remove o Inter (`font-data`), que hoje só era aplicado em `<table>`.

**Fora:**
- `font-mono-data` (IBM Plex Mono) — é uma escolha deliberada de alinhamento tabular pra dado técnico (CNPJ, telefone, datas), não uma fonte de UI geral, continua como está.
- Tamanho de fonte fora da sidebar (14.5px continua só nos itens do menu — não foi pedido em outro lugar).

## Requirements

### Requirement 1: Respiro entre itens da sidebar

**User Story:** Como usuário, quero que os itens do menu não pareçam grudados um no outro.

#### Acceptance Criteria

1. A sidebar SHALL ter um espaçamento vertical perceptível entre itens consecutivos (não mais 0px de gap).

### Requirement 2: Fonte única no projeto

**User Story:** Como usuário, quero uma única família de fonte de UI em todo o app, não uma mistura de duas.

#### Acceptance Criteria

1. Nenhum elemento SHALL usar Inter (`font-data`) — a regra que aplicava Inter em `<table>` é removida, e `<table>` passa a herdar `font-sans` (Plus Jakarta Sans) como o resto do app.
2. O pacote `@fontsource-variable/inter` SHALL ser removido das dependências, já que fica sem nenhum uso depois da Requirement 2.1.
3. `font-mono-data` (IBM Plex Mono) SHALL continuar intacto — fora de escopo.
