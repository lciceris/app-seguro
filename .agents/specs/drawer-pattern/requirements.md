# Requirements — drawer-pattern

## Introdução

Hoje todo drawer do app-seguro usa o primitivo `Sheet` (shadcn) com `side="right"` (padrão) e uma largura fixa via `className`: `sm:max-w-[720px]` pra cadastro/edição, `sm:max-w-[1000px]` pra visualização — em telas menores que `sm`, o drawer já é `w-full`. Levantamento nos 23 drawers existentes confirma que esse padrão é 100% consistente hoje (nenhum outlier).

O usuário testou o app e pediu um padrão diferente, inspirado no que o Google usa: o drawer abre de baixo pra cima (não pela lateral direita), ocupa toda a largura da tela, e o conteúdo fica centralizado dentro de um container por dentro dele — em vez de a própria "folha" ser estreita e colada na direita.

Essa spec é de **design system**, não de domínio de negócio: a mudança central acontece uma vez no primitivo compartilhado `src/shared/components/ui/sheet.tsx`, e depois os 23 drawers existentes são ajustados (sweep mecânico — troca de classe de largura, sem tocar em lógica de negócio, campos ou comportamento de nenhum deles).

### Escopo

**Dentro:**
- O primitivo `Sheet`/`SheetContent` passa a abrir de baixo pra cima, ocupando toda a largura, em qualquer tamanho de tela (não só mobile — hoje o comportamento já muda por breakpoint; a proposta unifica num único comportamento consistente).
- Um container interno centralizado (com as mesmas duas larguras já usadas hoje — 720px cadastro/edição, 1000px visualização) envolve o conteúdo (header, corpo, footer).
- Os 23 drawers existentes são migrados pro novo padrão.

**Fora:**
- Qualquer mudança de campo, validação ou lógica de negócio dentro de qualquer drawer.
- Mudança em `Dialog`/`AlertDialog` (usados pra confirmações, não pra formulários/detalhe — CLAUDE.md regra "nunca modal dentro de drawer" continua valendo do jeito que já é).

## Requirements

### Requirement 1: Sheet abre de baixo pra cima

**User Story:** Como usuário, quero que os drawers abram subindo da parte de baixo da tela, para ter uma experiência mais parecida com o que já estou acostumado (Google).

#### Acceptance Criteria

1. WHEN qualquer drawer é aberto THEN a folha SHALL deslizar de baixo pra cima (não mais da direita).
2. Esse comportamento SHALL ser o mesmo em qualquer tamanho de tela — sem depender de breakpoint pra mudar de lado/largura.
3. Fechar (clique fora, Escape, botão X) SHALL continuar funcionando exatamente como hoje.

### Requirement 2: Folha ocupa toda a largura da tela

**User Story:** Como usuário, quero que o drawer ocupe a largura inteira da tela, para que ele se sinta como uma camada de verdade sobre o conteúdo, não uma faixa lateral estreita.

#### Acceptance Criteria

1. A folha do drawer (`SheetContent`) SHALL ocupar 100% da largura da viewport, em qualquer tamanho de tela — sem o `sm:max-w-[...]` de hoje no elemento externo.
2. A folha SHALL ter altura suficiente pra mostrar conteúdo real sem exigir scroll excessivo, mas SHALL deixar claro que é uma camada sobreposta (não uma navegação de página cheia) — altura exata e cantos arredondados a definir em design.md.

### Requirement 3: Conteúdo centralizado num container interno

**User Story:** Como usuário, quero que o conteúdo do drawer (formulário ou detalhe) fique num container centralizado e legível, mesmo com a folha ocupando a tela inteira, para não ter que ler texto esticado de ponta a ponta em telas grandes.

#### Acceptance Criteria

1. O conteúdo (header, corpo, footer) SHALL ficar dentro de um container centralizado horizontalmente, com largura máxima — preservando a distinção já existente hoje entre cadastro/edição (720px) e visualização (1000px).
2. Em telas menores que a largura máxima do container, o conteúdo SHALL ocupar a largura disponível (mesmo comportamento mobile de hoje).

### Requirement 4: Todos os drawers existentes migrados

**User Story:** Como usuário, quero que essa mudança valha pra todo drawer do sistema de uma vez, para ter uma experiência consistente em qualquer tela.

#### Acceptance Criteria

1. Os 23 drawers existentes (cadastro, edição e visualização, em todas as features) SHALL ser migrados pro novo padrão.
2. Nenhum drawer migrado SHALL ter mudança de campo, validação, dado exibido ou comportamento de negócio — só layout/estilo.
3. Drawers novos, criados depois dessa spec, SHALL seguir o novo padrão automaticamente por herdarem do primitivo `SheetContent` — sem precisar de opt-in manual em cada um.
