# Requirements — design-system

## Introdução

O usuário reportou que a UI do app-seguro está "muito feia, sem padrão", puxando especificamente cadastro, edição, visualização e a sidebar. Um levantamento real no código (não suposição) mostrou um quadro diferente do esperado: a maior parte do sistema **já é consistente** — wrapper de seção (`rounded-xl border border-border bg-card p-5`), título de seção, espaçamento de campo, erro inline, markup de tabela (copiado à mão mas idêntico em 7 telas de listagem), botões de ação em linha (`ghost`/`icon-sm`) e a sidebar (primitivo `Sidebar` do shadcn, sem overrides ad-hoc) — são idênticos em todas as features hoje.

O que o levantamento encontrou de real:
1. **Densidade de formulário divergente**: `brokerages` (feature mais recente) usa grid de 2 colunas (`grid grid-cols-2 gap-3`) nos campos; todas as outras 6 features empilham campo a campo em coluna única, full-width. É a divergência visual mais perceptível do sistema hoje.
2. **`DetailField` duplicado** em 6 arquivos diferentes (`client-detail-drawer.tsx`, `vehicle-detail-drawer.tsx`, `insurer-detail-drawer.tsx`, `policy-detail-drawer.tsx`, `brokerage-detail-drawer.tsx`, `policy-endorsement-detail-drawer.tsx`) — copy-paste, não um primitivo compartilhado, e um deles já **driftou**: `policy-endorsement-detail-drawer.tsx` esconde campos vazios (`if (!value) return null`) em vez de mostrar "Não informado" como todos os outros.
3. **Tabela sem primitivo compartilhado**: `src/shared/components/ui/table.tsx` não existe — 7 telas de listagem têm a mesma marcação colada à mão, sujeita a driftar silenciosamente a cada edição futura.
4. **Ação destrutiva sem tratamento visual**: desativar cliente/veículo/usuário/corretora usa o `AlertDialogAction` padrão — não existe sinalização visual (cor, ênfase) de que a ação é destrutiva.
5. **Nenhuma convenção documentada**: tudo isso é conhecimento tribal codificado só em JSX repetido — não existe um lugar (mesmo `docs/dev/ui-guidelines.md` é um stub vazio) que diga "é assim que se faz".
6. **Direção de densidade escolhida**: entre "limpo e espaçoso" (Linear/Vercel), "híbrido shadcn padrão" e "denso e técnico" (Supabase/Retool), o usuário escolheu **denso e técnico** — faz sentido pro perfil de usuário (calculista/corretora que vive o dia inteiro no sistema, precisa de mais informação por tela, não de uma landing page).

Divergências já mapeadas e **deliberadamente fora de escopo** (decisões de arquitetura já tomadas em specs anteriores, não bugs de estilo):
- Detalhe de cotação ser página cheia com abas em vez de drawer (`.agents/specs/quotations/design.md`).
- `own-brokerage-screen` ser tela embutida em vez de drawer (Requirement 6 da spec `brokerages` — tela de "configurações da própria conta", não um CRUD).

### Escopo

**Dentro:**
- Extensão do grid de 2 colunas (padrão `brokerages`) pra todos os formulários de cadastro/edição do sistema.
- Extração de `DetailField` como primitivo compartilhado, corrigindo o drift do policy-endorsement.
- Extração de um primitivo de tabela compartilhado (`src/shared/components/ui/data-table.tsx` ou equivalente), migrando as 7 telas de listagem pra ele.
- Tratamento visual de ação destrutiva (desativar/excluir).
- Revisão de densidade geral (padding de card, altura de linha de tabela, escala tipográfica) alinhada à direção "denso e técnico".
- Documentação viva das convenções em `docs/dev/ui-guidelines.md` (hoje stub).

**Fora:**
- Mudança de campos, validação ou lógica de negócio de qualquer feature.
- Detalhe de cotação virar drawer (mantém página com abas).
- `own-brokerage-screen` virar drawer.
- Gráficos/dashboards com visualização de dados (não existem hoje).
- Redesign específico de mobile além do que já existe.

## Requirements

### Requirement 1: Formulários de cadastro/edição em grid de 2 colunas

**User Story:** Como usuário que passa o dia usando o sistema, quero que os formulários de cadastro e edição sejam mais densos (2 colunas em vez de empilhado), para preencher mais rápido e ver mais contexto sem rolar tanto a tela.

#### Acceptance Criteria

1. Todo formulário de cadastro/edição do sistema (clients, vehicles, quotations, insurers, policies, policy-endorsements, users, e os já existentes em brokerages) SHALL usar o mesmo padrão de grid 2 colunas já estabelecido em `create-brokerage-drawer.tsx` (`grid grid-cols-2 gap-3`, com campos de largura total em `col-span-2` quando fizer sentido — ex: campos de texto longo, ou um campo seguido de botão "Buscar").
2. Campos que hoje são um `Select`/`Textarea`/lista de itens (ex: vendedores responsáveis em clients) SHALL ocupar `col-span-2` — só campos curtos (texto curto, número, data, telefone, CEP, UF) ficam lado a lado.
3. Em telas menores que o breakpoint do drawer, o grid SHALL colapsar pra 1 coluna (comportamento responsivo já nativo do Tailwind grid, sem necessidade de lógica JS).
4. Nenhuma mudança de campo, validação, ordem de preenchimento ou comportamento de submit — só o layout visual.

### Requirement 2: `DetailField` como primitivo compartilhado

**User Story:** Como usuário, quero que todo campo somente-leitura nas telas de detalhe se comporte e pareça igual em qualquer entidade, para não ter uma experiência diferente ao ver um cliente vs. uma cotação vs. uma corretora.

#### Acceptance Criteria

1. SHALL existir um componente `DetailField` compartilhado (ex: `src/shared/components/ui/detail-field.tsx`), substituindo as 6 cópias locais hoje existentes.
2. O componente compartilhado SHALL sempre mostrar "Não informado" pra valor nulo/vazio — nunca esconder o campo, corrigindo o comportamento hoje divergente de `policy-endorsement-detail-drawer.tsx`.
3. Todas as 6 telas de detalhe SHALL migrar pro componente compartilhado, sem mudança de quais campos são exibidos ou seus valores.

### Requirement 3: Tabela como primitivo compartilhado

**User Story:** Como desenvolvedor futuro (humano ou IA) implementando uma nova listagem, quero um primitivo de tabela pronto pra usar, para não copiar markup manualmente e arriscar inconsistência.

#### Acceptance Criteria

1. SHALL existir um primitivo de tabela compartilhado em `src/shared/components/ui/` cobrindo o padrão já usado hoje (wrapper `rounded-xl border border-border bg-card overflow-hidden`, header `bg-muted`, linhas com hover, células com padding consistente, skeleton de loading, estado vazio "Nenhum X encontrado/cadastrado").
2. As 7 telas de listagem existentes SHALL migrar pro primitivo compartilhado, preservando exatamente as colunas, dados e ações de cada uma.
3. A densidade (altura de linha, padding de célula) SHALL refletir a direção "denso e técnico" escolhida — mais compacta que o padrão atual, se a revisão do Requirement 5 concluir que o padrão atual está espaçado demais.

### Requirement 4: Tratamento visual de ação destrutiva

**User Story:** Como usuário, quero que ações destrutivas (desativar, excluir) sejam visualmente diferentes de ações normais, para não confirmar por engano algo que não posso desfazer facilmente.

#### Acceptance Criteria

1. Diálogos de confirmação de desativação/exclusão (clientes, veículos, usuários, corretoras, e quaisquer outros hoje existentes) SHALL usar tratamento visual de destrutivo no botão de confirmação (`variant="destructive"` ou equivalente), não o estilo padrão de botão primário.
2. O texto do diálogo SHALL deixar claro a consequência da ação (já é o caso hoje na maioria — validar e ajustar onde não for).

### Requirement 5: Revisão de densidade geral

**User Story:** Como usuário que escolheu a direção "denso e técnico" (referência: Supabase, Retool), quero que cards, tabelas e tipografia reflitam isso de forma consistente, para o sistema parecer feito pra uso profissional intenso, não uma landing page.

#### Acceptance Criteria

1. SHALL ser feita uma revisão dos tokens de espaçamento/tipografia atualmente em uso (padding de card, tamanho de fonte de título de seção/corpo/dado de tabela, altura de linha de tabela) e proposta uma versão mais compacta, documentada em `design.md`.
2. A revisão SHALL ser aplicada de forma consistente em cards de formulário (Requirement 1), tabelas (Requirement 3) e telas de detalhe (Requirement 2) — não uma mudança isolada num componente só.
3. A cor dinâmica por corretora (`--primary`) e o tema claro já estabelecidos SHALL ser preservados — essa revisão é de densidade/espaçamento, não de paleta de cor.

### Requirement 6: Convenções documentadas

**User Story:** Como desenvolvedor futuro (humano ou IA), quero uma referência escrita das convenções de UI do projeto, para implementar novas features consistentes sem precisar arqueologar o código de outras features pra descobrir o padrão.

#### Acceptance Criteria

1. `docs/dev/ui-guidelines.md` (hoje stub) SHALL ser preenchido com as convenções decididas nesta spec: grid de formulário, `DetailField`, tabela compartilhada, hierarquia de botão (incluindo destrutivo), tokens de espaçamento/tipografia.
2. O documento SHALL incluir exemplos de código curtos (snippet de uso de cada primitivo), não só descrição em prosa.
