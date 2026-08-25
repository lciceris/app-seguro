# Requirements — list-screens-density

## Introdução

Depois de completar a spec `design-system` (grid, `DetailField`, primitivo de tabela, tokens, botão destrutivo), o usuário reportou que a tela de Corretoras "está tudo como antes". Comparando o protótipo aprovado (`app-seguro Denso`, artifact publicado durante a spec `design-system`) com o código real, a causa raiz não é bug — é **lacuna de escopo**: `requirements.md`/`tasks.md` da spec `design-system` cobriram só infraestrutura genérica (o *como* — grid, primitivo, tokens), nunca o *conteúdo* de cada listagem (quais colunas, se tem busca, se tem contador). O protótipo aprovado mostrava uma tabela de Corretoras com 7 colunas (incluindo CNPJ em mono, data de criação, contagem de usuários), busca, filtros e contador no cabeçalho — nada disso foi pedido nas specs anteriores, por isso a densidade *estrutural* mudou (padding, fonte) mas a densidade *informacional* não.

Um levantamento real (código, não suposição) das 7 telas de listagem já migradas pro primitivo `Table` mostrou:

| Tela | Colunas hoje | Busca | Filtro | Contador no header |
|---|---|---|---|---|
| Clientes | 6 | sim | não | não |
| Veículos | 6 | sim | não | não |
| Cotações | 6 | sim | sim (status) | não |
| Seguradoras | 3 | não | não | não |
| Apólices | 7 | sim | sim (status) | não |
| Usuários | 5 | não | não | não |
| Corretoras | 4 | não | não | não |

Nenhuma das 7 tem contador ("N cadastrados") no cabeçalho. Seguradoras, Usuários e Corretoras não têm busca nem filtro algum. Corretoras e Seguradoras são as mais "rasas" em colunas, apesar de terem dados relevantes disponíveis (CNPJ, contato, data de criação) já buscados do banco mas nunca exibidos.

### Escopo

**Dentro:**
- Adicionar contador ("N itens cadastrados/encontrados") no cabeçalho das 7 telas de listagem.
- Adicionar busca (`Input`) nas 3 telas que não têm hoje: Seguradoras, Usuários, Corretoras.
- Adicionar colunas de informação relevante já disponível nos dados retornados pelo hook de cada tela, priorizando as telas mais rasas (Corretoras, Seguradoras), usando `font-mono-data` para dado técnico (CNPJ, data, valores).
- Reaproveitar o embed de `quotations(number)` já buscado (e hoje descartado) em `policies-list-screen.tsx`, exibindo como coluna ou removendo o embed se não fizer sentido exibir.

**Fora:**
- Mudança de campos, validação ou lógica de negócio de qualquer feature.
- Filtros novos além dos explicitamente listados nesta spec (ex: não adicionar filtro de segmento em Clientes só porque existe o campo — só filtros já usados como referência no protótipo ou pedidos explicitamente).
- Contagem de registros relacionados que exija nova query agregada/RPC (ex: "nº de usuários" por corretora) — fica como nota de follow-up, não faz parte desta spec, pra não misturar mudança de UI com mudança de camada de dados.
- Trocar o estilo de badge Ativo/Inativo de pill (`Badge` com fundo) pra "dot + texto" (estilo usado no protótipo especificamente pra esse estado binário) — é uma divergência real entre o protótipo e o que foi documentado em `docs/dev/ui-guidelines.md`, mas é uma decisão de estilo separada da lacuna de informação; fica pra discussão futura, não bloqueia esta spec.

## Requirements

### Requirement 1: Contador no cabeçalho de todas as listagens

**User Story:** Como usuário, quero ver quantos itens existem numa listagem sem precisar contar as linhas, para ter noção de escala (4 corretoras vs. 400) assim que a tela carrega.

#### Acceptance Criteria

1. As 7 telas de listagem (Clientes, Veículos, Cotações, Seguradoras, Apólices, Usuários, Corretoras) SHALL exibir um subtítulo abaixo do `<h1>` no formato "N itens cadastrados" (ex: "4 corretoras cadastradas"), usando o nome do item no plural/gênero correto de cada entidade.
2. Quando a lista estiver filtrada por busca/filtro e o resultado for menor que o total, o subtítulo SHALL refletir a contagem filtrada (ex: "2 de 4 corretoras"), não o total bruto.
3. Durante o carregamento (`isLoading`), o subtítulo SHALL ficar oculto ou mostrar um skeleton curto — nunca "0 itens" antes do fetch resolver.

### Requirement 2: Busca nas telas que não têm hoje

**User Story:** Como usuário de uma corretora com muitos usuários/seguradoras/corretoras cadastradas, quero buscar por nome, para não precisar rolar a lista inteira.

#### Acceptance Criteria

1. Seguradoras, Usuários e Corretoras SHALL ganhar um `Input` de busca acima da tabela, seguindo o mesmo padrão visual e de posicionamento já usado em Clientes/Veículos/Cotações/Apólices.
2. A busca SHALL filtrar client-side (mesmo padrão das 4 telas que já têm busca hoje — sem nova query ao Supabase), por nome e, quando fizer sentido, pelo campo técnico principal (CNPJ em Seguradoras/Corretoras, e-mail em Usuários).
3. Sem resultado de busca, a tabela SHALL mostrar o `TableEmptyState` com mensagem "Nenhum X encontrado pra essa busca" (mesmo padrão já usado nas telas existentes), distinta da mensagem de lista vazia.

### Requirement 3: Colunas de informação adicionais grounded nos dados já buscados

**User Story:** Como usuário (platform_admin vendo Corretoras, ou qualquer perfil vendo Seguradoras), quero ver informação relevante direto na listagem, para não precisar abrir o detalhe de cada linha só pra ver o CNPJ ou a data de cadastro.

#### Acceptance Criteria

1. **Corretoras** SHALL ganhar coluna CNPJ (`tax_id`, formatado, `font-mono-data`) e coluna "Criada em" (`created_at`, formatada `dd/MM/yyyy`, `font-mono-data`).
2. **Seguradoras** SHALL ganhar coluna de contato (`contact_name` e/ou `phone`/`email` — usar o que estiver preenchido com fallback pro próximo, mesmo padrão de fallback já usado em `client.trade_name`).
3. **Apólices** SHALL exibir o número da cotação de origem (`quotations.number`, já buscado via embed em `list-policies.ts` mas hoje descartado) como sub-informação da coluna Número (mesmo padrão de sub-cell já usado em Clientes: nome principal + linha menor abaixo) — ou, se não fizer sentido pro fluxo, o embed SHALL ser removido da query pra não buscar dado morto. Decisão fica pro `design.md`.
4. Nenhuma coluna nova SHALL exigir uma nova query ao Supabase além da já existente (`select("*")` mais o embed já usado) — dado que já chega ao componente, só não é exibido.
5. Novas colunas técnicas (CNPJ, datas, valores) SHALL usar `font-mono-data`, seguindo a convenção já documentada em `docs/dev/ui-guidelines.md`.

### Requirement 4: Convenções atualizadas

**User Story:** Como desenvolvedor futuro, quero que o guia de UI reflita o padrão de "toda listagem tem contador e busca", para não repetir a lacuna que motivou esta spec na próxima feature nova.

#### Acceptance Criteria

1. `docs/dev/ui-guidelines.md` SHALL ganhar uma seção curta "Listagens — contador e busca" com o padrão esperado (contador sempre, busca sempre que a lista puder crescer além de ~10-15 itens), com snippet de código.
