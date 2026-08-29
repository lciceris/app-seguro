# Requirements — client-form-redesign

## Contexto

Ajustes nos formulários de cliente (criar/editar) e na listagem, pedidos pelo usuário. Ao investigar o Requirement 6 (remover segmento), foi descoberto um acoplamento oculto: `clients` não tem coluna `status` própria — `segment = 'inactive'`/`'active'` é o único mecanismo de ativar/desativar cliente hoje (`deactivate-client.ts`/`reactivate-client.ts`, toggle da listagem). Remover `segment` sem substituir isso quebraria a inativação de clientes.

**Resolução adotada** (mesmo padrão já usado em `brokerages`/`users`, ver `20260803004711_add_status_to_brokerages.sql`): antes de remover `segment`/`lead_source`, criar `client_status` enum (`active`/`inactive`) + coluna `status` em `clients`, migrar `deactivate-client`/`reactivate-client`/listagem para usar `status`, só então remover `segment`, `lead_source` e o enum `client_segment`.

## Requirement 1: Toggle PF/PJ

1. WHEN o usuário abre o formulário de criar/editar cliente THEN o sistema SHALL exibir um controle de dois botões (Pessoa física / Pessoa jurídica) no lugar do Select de tipo, substituindo diretamente o valor de `client_type`.
2. WHEN o usuário alterna entre Pessoa física e Pessoa jurídica THEN o sistema SHALL mostrar somente os campos aplicáveis ao tipo selecionado (PF: Data de nascimento; PJ: Nome fantasia, CNAE, Setor, Inscrição estadual) sem perder os valores já digitados nos campos comuns.

## Requirement 2: CNPJ como primeiro campo + busca

1. WHEN o tipo selecionado é Pessoa jurídica THEN o sistema SHALL exibir o campo CPF/CNPJ (rotulado "CNPJ") como o primeiro campo da seção Identificação, com botão "Buscar" ao lado.
2. WHEN o usuário clica em "Buscar" com um CNPJ preenchido THEN o sistema SHALL consultar a BrasilAPI (`fetchCnpjData`, já usado em corretoras) e preencher razão social/nome fantasia/CNAE/endereço automaticamente, mantendo o padrão de loading "Buscando..." e toast de erro em falha.
3. WHEN o tipo selecionado é Pessoa física THEN o sistema SHALL exibir o campo CPF como primeiro campo, sem botão de busca (não há API pública de consulta de CPF).

## Requirement 3: Máscaras de CPF/CNPJ

1. WHEN o tipo é Pessoa jurídica THEN o campo de documento SHALL aplicar máscara de CNPJ (`00.000.000/0000-00`) via `formatCnpj`.
2. WHEN o tipo é Pessoa física THEN o campo de documento SHALL aplicar máscara de CPF (`000.000.000-00`) via uma nova função `formatCpf` em `src/shared/lib/masks.ts`.

## Requirement 4: Busca de CEP

1. WHEN o usuário clica em "Buscar" ao lado do campo CEP THEN o sistema SHALL consultar o ViaCEP (`fetchCepData`, já usado em corretoras) e preencher logradouro/bairro/cidade/UF.
2. WHEN o usuário digita no campo CEP THEN o sistema SHALL aplicar máscara `00000-000` via `formatCep`.

## Requirement 5: Asteriscos em campos obrigatórios

1. WHEN um campo é obrigatório (Tipo, Razão social/Nome) THEN o label SHALL terminar em " *", convenção geral do projeto.

## Requirement 6: Remover segmento e origem do lead; introduzir status próprio

1. WHEN a migration é aplicada THEN o sistema SHALL criar `client_status` enum (`active`, `inactive`) e coluna `clients.status` (`not null default 'active'`), preenchendo os clientes hoje `segment = 'inactive'` como `status = 'inactive'` e os demais como `'active'`.
2. WHEN `supervisor`, `brokerage_admin` ou `platform_admin` inativa um cliente THEN o sistema SHALL alterar `status` para `inactive` (em vez de `segment`).
3. WHEN reativa um cliente THEN o sistema SHALL alterar `status` para `active`.
4. WHEN a listagem exibe um cliente THEN a coluna antes chamada "Segmento" SHALL virar "Status", como Badge (`Ativo`/`Inativo`), mesmo padrão visual de `brokerages`/`users`.
5. WHEN a migration de limpeza é aplicada THEN o sistema SHALL remover as colunas `segment`/`lead_source` de `clients` e o enum `client_segment`, e o código SHALL remover toda referência a eles (schemas, formulários, drawer de detalhe, constantes de label).
