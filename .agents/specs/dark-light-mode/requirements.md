# Requirements — dark-light-mode

## Introdução

O header já tem um ícone de lua reservado ("Tema (em breve)", sem ação — spec `header-profile-redesign`) e `globals.css` já declara `@custom-variant dark (&:is(.dark *));`, sem nunca ter sido usado. Esta spec liga esse fio: alterna entre claro e escuro de verdade, persistindo a escolha.

## Escopo

**Dentro:**
- Alternância claro/escuro via o ícone de lua do header (2 estados — sem opção "seguir o sistema" por agora).
- Persistência local (não é preferência de usuário no banco — decisão abaixo).
- Valor escuro pra todo token semântico já existente em `globals.css` (superfícies, sidebar, badges de status/ativo-inativo).
- Auditoria e correção de cor "hardcoded" (fora do sistema de tokens) que quebraria no escuro, em código de feature (fora de `shared/components/ui`, que já vem com suporte a `dark:` do próprio shadcn).

**Fora:**
- Preferência por usuário salva no banco (`users` não ganha coluna nova) — fica em `localStorage`, decisão registrada abaixo com o porquê.
- Opção "seguir o sistema operacional" — só claro/escuro manual por enquanto (pode virar uma 3ª opção depois).
- Ajuste fino de contraste pixel-a-pixel em cada tela — o objetivo é "nada quebra/fica ilegível no escuro", não uma segunda rodada de design visual por tela.

## Decisões já tomadas (e o porquê)

1. **Mecanismo: classe `.dark` no `<html>`**, não `prefers-color-scheme` sozinho — `@custom-variant dark (&:is(.dark *))` já é exatamente esse mecanismo, declarado desde a spec `design-system` e nunca usado. Ligar nele evita reescrever tokens.
2. **Persistência: `localStorage`**, não coluna no banco — é preferência de navegador/dispositivo, não um dado de negócio da corretora; evita migration + roundtrip de rede só pra isso. Um script inline no `index.html` lê antes do React montar, pra não piscar o tema errado no primeiro paint (FOUC).
3. **Sem "seguir o sistema"** por enquanto — reduz a superfície de decisão pro V1 (2 estados, não 3); dá pra adicionar depois sem quebrar nada.

## Requirements

### Requirement 1: Alternância funcional

**User Story:** Como usuário, quero clicar no ícone de tema no header e ver o app inteiro mudar entre claro e escuro.

#### Acceptance Criteria

1. Clicar no ícone de tema no header SHALL alternar entre claro e escuro imediatamente (sem reload).
2. O ícone SHALL refletir o estado atual (lua quando está claro/pra ir pro escuro, sol quando está escuro/pra ir pro claro — ou equivalente).
3. A escolha SHALL persistir entre sessões (fechar e reabrir o navegador mantém o tema escolhido).
4. Ao carregar a página, o tema salvo SHALL ser aplicado antes da primeira pintura (sem flash do tema errado).
5. Sem escolha salva, o app SHALL abrir no modo claro (padrão atual, comportamento inalterado pra quem nunca tocou no botão).

### Requirement 2: Tokens de superfície no escuro

**User Story:** Como usuário, quero que sidebar, cards, tabelas, drawers e textos continuem legíveis e com a mesma hierarquia visual no modo escuro.

#### Acceptance Criteria

1. Todo token semântico em `:root` (`--background`, `--card`, `--popover`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`) SHALL ter um valor escuro correspondente sob `.dark`.
2. Os tokens de `--sidebar-*` SHALL ter valores escuros — reaproveitando o par já desenhado na spec `sidebar-light-redesign` (claro `#FFFFFF` ↔ escuro `#020617`, mesma leitura usada nos protótipos anteriores).
3. `--primary`/`--primary-foreground` (cor dinâmica da corretora) NÃO SHALL mudar entre temas — é a mesma cor de marca nos dois.

### Requirement 3: Badges e status legíveis no escuro

**User Story:** Como usuário, quero que os badges de status (cotação, ativo/inativo, alerta) continuem legíveis no escuro, não pastéis claros demais num fundo escuro.

#### Acceptance Criteria

1. `--success`/`--success-bg`/`--success-text`, `--warning`/`-bg`/`-text`, `--neutral-bg`/`-text` e todos os `--status-*` (waiting/progress/negotiation/presented/effect/effected/notclosed) SHALL ter pares escuros com fundo escurecido e texto claro o suficiente pra manter contraste — não os mesmos valores pastel do claro.

### Requirement 4: Nada quebra por cor hardcoded

**User Story:** Como usuário, quero que nenhuma tela fique com um quadrado claro ilegível (texto claro sobre fundo claro) quando eu ligo o escuro.

#### Acceptance Criteria

1. Toda cor de código de feature (fora de `shared/components/ui`) que hoje usa uma classe Tailwind de cor fixa (`bg-slate-*`, `text-gray-*`, `bg-white`, hex arbitrário) em vez de um token semântico SHALL ser migrada pro token equivalente, ou ganhar um par `dark:` explícito, quando afetar uma superfície visível nas telas principais do app (listagens, drawers, sidebar, header).
