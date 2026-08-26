# Requirements — sidebar-light-redesign

## Introdução

A sidebar atual (navy `#0F172A`, herdada do boilerplate shadcn) não segue mais os padrões visuais que o resto do app já adotou nesta fase (cards brancos, header claro, painéis com `border-slate-200`). O usuário validou 3 rodadas de protótipo (ver `.agents/specs/sidebar-light-redesign/` histórico de conversa — não versionado em arquivo por ser exploração, só o resultado final aqui): mix do header centralizado com o item ativo arredondado, sem rodapé de usuário (isso vai pro header numa spec futura), e por fim decidiu pela sidebar **clara branca** pensando já num futuro dark/light mode.

## Escopo

**Dentro:**
- Sidebar com fundo branco (`#FFFFFF`), borda direita `slate-200`, texto `slate-600`, hover `slate-50`.
- Header centralizado: logo com borda de 2px na cor dinâmica da corretora (`var(--primary)`) + nome da corretora abaixo, sem subtítulo de plano.
- Item ativo: bloco arredondado com fundo `primary/10` e texto `primary` (cor dinâmica da corretora, não um valor fixo) — sem barra lateral.
- Só o modo claro é implementado agora. Os tokens usados devem ser os `--sidebar-*` semânticos já existentes no shadcn (não classes hardcoded), para que adicionar o modo escuro depois seja só redefinir esses tokens sob `.dark`, sem tocar em `app-sidebar.tsx`.

**Fora:**
- Modo escuro em si (fica pra quando a spec de dark/light mode for atacada — só a base de tokens fica pronta pra receber).
- Rodapé de usuário na sidebar (usuário/logout vão pro header, spec futura).
- Mudanças no header (`app-header.tsx`) além do necessário pra não quebrar com a nova sidebar.

## Requirements

### Requirement 1: Fundo e superfície claros

**User Story:** Como usuário, quero que a sidebar tenha a mesma temperatura de cor do resto do app (branco/slate-200), não mais o navy escuro que destoava.

#### Acceptance Criteria

1. A sidebar SHALL usar fundo branco (`--sidebar: #FFFFFF`) com borda direita `slate-200` (`--sidebar-border: #E2E8F0`).
2. O texto padrão dos itens de menu SHALL ser `slate-600` (`--sidebar-foreground: #475569`).
3. O hover de um item não-ativo SHALL usar um cinza claro (`--sidebar-accent: #F8FAFC`, `--sidebar-accent-foreground: #0F172A`).

### Requirement 2: Header centralizado, sem subtítulo

**User Story:** Como usuário, quero ver a identidade da corretora (logo + nome) centralizada no topo da sidebar, sem informação de plano.

#### Acceptance Criteria

1. O cabeçalho SHALL centralizar logo (ou iniciais) e nome da corretora, empilhados verticalmente, com uma borda inferior separando do menu.
2. A logo/iniciais SHALL ter uma borda de 2px na cor dinâmica da corretora (`var(--primary)`).
3. Nenhum subtítulo de plano ou texto adicional SHALL aparecer abaixo do nome.

### Requirement 3: Item ativo com cor dinâmica

**User Story:** Como usuário, quero que o item de menu ativo se destaque usando a cor que a própria corretora personalizou, não uma cor fixa do sistema.

#### Acceptance Criteria

1. O item ativo SHALL ter fundo `primary` a ~10% de opacidade e texto na cor `primary`, computados a partir da variável dinâmica `--primary` (não um hex fixo), tanto em repouso quanto no hover.
2. O item ativo NÃO SHALL ter barra lateral ou indicador adicional além do bloco de fundo.
3. Os grupos de menu (`Operação`, `Minha corretora`, `Plataforma`) SHALL manter rótulos em uppercase, com leve tracking, num tom mais claro que o texto dos itens.

### Requirement 4: Pronta para modo escuro futuro

**User Story:** Como desenvolvedor, quero que a implementação de hoje não precise ser refeita quando o dark mode for implementado.

#### Acceptance Criteria

1. Toda cor de superfície/texto da sidebar SHALL vir dos tokens semânticos `--sidebar`, `--sidebar-foreground`, `--sidebar-border`, `--sidebar-accent`, `--sidebar-accent-foreground` (já existentes em `globals.css`) — nenhuma classe Tailwind com hex hardcoded (`bg-[#FFFFFF]` etc.) no componente.
2. O item ativo SHALL usar `bg-primary/10`/`text-primary` (utilitários Tailwind já registrados via `@theme inline`), não uma cor fixa nova.
