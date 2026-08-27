# Requirements — dynamic-primary-color

## Introdução

O usuário reportou: a cor definida em "Dados da corretora" não reflete na sidebar (nem em nenhum outro lugar). Investigação confirmou uma lacuna que já tinha sido documentada como "achado, fora de escopo" na spec `sidebar-light-redesign`: `--primary` nunca era setado em runtime a partir de `brokerage.primary_color` em lugar nenhum do app — só existia o valor fixo do `:root` (`#4F46E5`). Como sidebar (item ativo), badge de cargo no header e outros componentes recém-migrados já usam `bg-primary`/`text-primary` (não hex fixo), bastava ligar o fio que faltava.

## Escopo

**Dentro:**
- Aplicar `--primary` dinamicamente a partir de `usuario.primary_color` (auth store) sempre que o usuário autenticado estiver dentro do `AppShell`.
- Sincronizar o auth store imediatamente após salvar a cor em "Dados da corretora", pra refletir sem precisar de logout/login.
- Voltar pro valor padrão (`#4F46E5` do `:root`) quando a corretora não tem cor customizada (`primary_color` null) ou fora do `AppShell` (login, etc.).

**Fora:**
- Qualquer UI de preview de cor em tempo real dentro do próprio formulário antes de salvar (o `ColorPicker` já mostra a cor escolhida ali; não é sobre isso).
- Migrar os tokens órfãos `--primary-hover`/`--primary-light`/`--primary-text` (`globals.css`) — grep confirmou que não são usados em nenhum componente hoje; ficam de fora por não afetarem o bug relatado.

## Requirements

### Requirement 1: Cor reflete no app autenticado

**User Story:** Como corretora, quero que a cor que eu escolhi apareça de verdade nos elementos que usam a cor de destaque (sidebar, badges, botões primários).

#### Acceptance Criteria

1. Ao carregar o app autenticado, `--primary` SHALL ser setado no `document.documentElement` a partir de `usuario.primary_color`, quando existir.
2. Quando `usuario.primary_color` for `null`, `--primary` SHALL usar o padrão do `:root` (não um valor customizado antigo preso).
3. Fora do `AppShell` (ex.: tela de login), a cor SHALL permanecer a padrão da plataforma.

### Requirement 2: Reflete sem precisar de novo login

**User Story:** Como corretora, quero ver o resultado imediatamente depois de salvar uma nova cor, sem precisar sair e entrar de novo.

#### Acceptance Criteria

1. Depois de salvar com sucesso o formulário de "Dados da corretora", o auth store SHALL ser atualizado com os valores confirmados pelo banco (`name`, `primary_color`, `logo_url`), refletindo na sidebar/header na mesma sessão.
