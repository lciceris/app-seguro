# Requirements — sidebar-flat-nav

## Introdução

Sequência da `sidebar-light-redesign`: o usuário não gostou do espaçamento/separação por categoria (rótulos "Operação", "Minha corretora", "Plataforma") nem do tamanho de fonte dos itens. Depois de comparar opções via protótipo, decidiu por uma lista única sem nenhuma categoria/divisor, com o texto em Plus Jakarta Sans (já é a fonte padrão do app via `font-sans`, então é só ajustar tamanho/peso) a 14.5px/500 (700 no item ativo).

## Escopo

**Dentro:**
- Remove os rótulos de grupo (`SidebarGroupLabel`) e qualquer separação visual entre os blocos de navegação — todos os itens (já filtrados por `allowedRoles`) viram uma lista única e contínua, na mesma ordem em que já estavam em `NAV_GROUPS`.
- Tamanho de fonte dos itens: 14.5px, peso 500 (700 quando ativo).

**Fora:**
- Mudar a fonte pro resto do projeto agora — o usuário pediu pra ver o tamanho/família só na sidebar primeiro; aplicar em outro lugar é uma spec futura.
- Mudar `NAV_GROUPS`/`nav-items.ts` em si (a estrutura de grupos continua existindo no arquivo, só não é mais renderizada com separação visual — mantém o array como está porque `allowedRolesFor()` e outros consumidores dependem dele).

## Requirements

### Requirement 1: Lista única, sem categoria

**User Story:** Como usuário, quero ver todos os itens de navegação numa lista só, sem cabeçalhos de seção nem linhas divisórias entre eles.

#### Acceptance Criteria

1. A sidebar NÃO SHALL exibir nenhum rótulo de grupo ("Operação", "Minha corretora", "Plataforma").
2. A sidebar NÃO SHALL exibir nenhuma linha divisória ou espaçamento extra entre os blocos — os itens SHALL se comportar como uma lista única e contínua.
3. A ordem e o filtro por `allowedRoles` (papel do usuário) SHALL continuar idênticos ao comportamento atual.

### Requirement 2: Tamanho de fonte

**User Story:** Como usuário, quero um texto de menu num tamanho mais confortável de ler.

#### Acceptance Criteria

1. O texto dos itens de menu SHALL ter 14.5px, peso 500 em repouso.
2. O item ativo SHALL ter peso 700 (mantendo fundo/texto na cor `primary`, já definidos na spec anterior).
