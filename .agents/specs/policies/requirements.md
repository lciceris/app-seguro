# Requirements — policies

## Introdução

Apólices emitidas a partir de cotações efetivadas. É o contrato de seguro vigente — nasce automaticamente quando uma cotação chega em `effected` (spec `quotations`, já implementada) e é a base sobre a qual a spec futura `policy-endorsements` vai atuar (cancelamento, inclusão/exclusão de veículo, alteração de cobertura — sempre gerando uma nova versão, nunca apagando a anterior).

O modelo antigo (`fleet-auth-gate`) tinha uma tabela `policies` simples: `client_id`, `insurer_id`, `quotation_id` (nullable), `policy_number`, `premium_amount`, `total_fleet_value`, `coverage_start/end`, `status` (só `active`/`cancelled` persistidos — `expiring_soon`/`expired` eram calculados no frontend por `daysUntil(coverage_end)`, nunca armazenados). Essa base é sólida e é reaproveitada quase inteira.

### Mudanças em relação ao modelo antigo

1. **Criação automática, não manual.** No modelo antigo não havia registro de como a apólice nascia (nenhuma automação documentada). Aqui, um trigger `AFTER UPDATE OF status ON quotations` cria a linha em `policies` no instante em que o status vira `effected`, herdando dados da cotação e da seguradora vencedora. Ninguém preenche isso manualmente.
2. **`quotation_id` passa a ser `NOT NULL`.** No modelo antigo era nullable (permitia apólice cadastrada solta, sem cotação de origem). Como agora toda apólice nasce do trigger de efetivação, esse caso não existe mais — reforça a garantia de que toda apólice é rastreável até a cotação e a negociação que a originou.
3. **Status ganha um terceiro valor persistido: `renewed`.** Além de `active`/`cancelled` (o `cancelled` só passa a ser alcançável de verdade na spec `policy-endorsements` — aqui o valor existe no enum, mas nenhuma ação desta spec o produz), quando uma cotação de renovação vinculada a uma apólice anterior (via `quotation_qar.renewed_policy_id`) é efetivada, o trigger marca a apólice anterior como `renewed` automaticamente. `expiring_soon`/`expired` continuam sendo calculados no frontend a partir de `coverage_end`, nunca persistidos — mantém a mesma lógica que já funcionava.
4. **`quotation_qar.renewed_policy_id` é adicionado agora.** A spec `quotations` deixou essa coluna de fora de propósito (documentado em `quotations/design.md`) justamente para ser adicionada aqui via `ALTER TABLE`, quando a tabela `policies` já existe — mantém a dependência numa via só (`policies` depende de `quotations`, nunca o inverso).
5. **Documento oficial e número da apólice chegam depois, não bloqueiam nada.** Já decidido durante o planejamento da spec `quotations`: a seguradora emite o documento oficial (com o número da apólice) alguns dias depois da efetivação. A linha em `policies` nasce sem `policy_number` e sem anexo — alguém completa isso depois, sem travar nenhuma outra ação.
6. **`total_fleet_value` é calculado, não digitado.** Soma de `quotation_vehicles.casco_value` de todos os veículos da cotação de origem, no momento da criação da apólice — não é um campo de formulário.

### Fora de escopo desta spec

- **Cancelar apólice** — vira um tipo de endosso (`policy-endorsements`), não uma ação direta desta spec. O valor `cancelled` existe no enum de status porque o schema precisa prever o estado final, mas nenhum fluxo desta spec o produz.
- **Inclusão/exclusão de veículo ou alteração de cobertura numa apólice vigente** — endosso, spec futura.
- **Geração automática de nova cotação de renovação perto do vencimento** — mencionado no roadmap antigo (`pg_cron` verificando `coverage_end`), fica para uma spec futura de automação/notificações.
- **Notificações de vencimento por e-mail** — mesma observação já registrada em `quotations/requirements.md`: importante, mas depende de uma spec de notificações que ainda não existe.
- **Dashboards agregados (apólices vencendo em 7/30/60 dias, cards de métricas)** — a lógica de status derivado (`expiring_soon`/`expired`) nasce aqui como utilitário reaproveitável, mas montar os painéis fica para a etapa de "Dashboards por perfil" do roadmap geral do projeto.

## Requirements

### Requirement 1: Criação automática da apólice ao efetivar a cotação

**User Story:** Como corretora, quero que a apólice nasça automaticamente assim que a cotação é efetivada, para que nenhuma apólice fique esquecida por falta de um passo manual.

#### Acceptance Criteria

1. WHEN uma cotação transiciona para `effected` (trigger já existente `enforce_quotation_status_transition`, spec `quotations`) THEN o sistema SHALL criar uma linha em `policies` com `client_id` e `brokerage_id` da cotação, `insurer_id` e `premium_amount` da `quotation_insurers` marcada como vencedora (`is_winner = true`), `quotation_id` da própria cotação, `coverage_start`/`coverage_end` da cotação, `total_fleet_value` calculado como a soma de `quotation_vehicles.casco_value` daquela cotação, `policy_number = null`, `status = 'active'`.
2. A criação SHALL acontecer num trigger `AFTER UPDATE OF status ON quotations` — nenhuma ação do frontend cria a linha diretamente.
3. WHEN a cotação de origem não tem `coverage_start`/`coverage_end` preenchidos (campos opcionais em `quotations`) THEN a apólice SHALL nascer com esses campos `null` — completáveis depois, sem bloquear a criação.
4. Uma cotação SHALL gerar no máximo uma apólice (`UNIQUE(quotation_id)`) — a transição de status já é irreversível (estado terminal), então não há caminho para o trigger disparar duas vezes para a mesma cotação.

### Requirement 2: Completar dados da apólice após a emissão oficial

**User Story:** Como `supervisor`, `brokerage_admin` ou `platform_admin`, quero preencher o número da apólice e ajustar a vigência quando a seguradora emite o documento oficial, para manter o registro fiel ao contrato real.

#### Acceptance Criteria

1. WHEN um desses perfis edita `policy_number`, `coverage_start`, `coverage_end`, `premium_amount` ou `total_fleet_value` de uma apólice THEN o sistema SHALL atualizar a linha em `policies`.
2. `seller`, `analyst` e `viewer` SHALL ter acesso somente leitura à apólice — não editam nenhum campo.
3. A edição SHALL estar disponível em qualquer status da apólice (`active` ou `renewed`) — não há trava adicional por status nesta spec.

### Requirement 3: Anexar o documento oficial da apólice

**User Story:** Como `supervisor`, `brokerage_admin` ou `platform_admin`, quero anexar o PDF da apólice (e documentos relacionados, como boleto ou condições gerais) assim que a seguradora emitir, para centralizar tudo num único lugar.

#### Acceptance Criteria

1. WHEN um desses perfis anexa um arquivo a uma apólice THEN o sistema SHALL fazer upload para o bucket `policy-documents` (privado) e criar a linha em `policy_attachments`.
2. A listagem de anexos SHALL ser visível a qualquer perfil com acesso à apólice (Requirement 5), incluindo `seller` e `viewer` — mesma lógica de leitura ampla já usada em `quotation_qar_attachments`.
3. Uma apólice SHALL aceitar múltiplos anexos (documento oficial, condições gerais, boleto, etc.) — não é um campo único de "documento da apólice", é uma lista.

### Requirement 4: Vínculo de renovação

**User Story:** Como corretora, quero que uma apólice renovada fique rastreável até a anterior, para nunca perder o histórico de uma frota que já era cliente.

#### Acceptance Criteria

1. `quotation_qar` SHALL ganhar a coluna `renewed_policy_id` (nullable, FK para `policies.id`) — vínculo manual opcional feito por quem preenche o QAR, indicando que essa cotação é renovação de uma apólice já emitida pela própria plataforma.
2. WHEN a cotação vinculada a um `renewed_policy_id` é efetivada (Requirement 1) THEN a nova linha de `policies` SHALL ser criada com `renewed_from_policy_id` apontando para a apólice anterior, E a apólice anterior SHALL ter seu `status` atualizado para `renewed` automaticamente, no mesmo trigger.
3. WHEN a cotação não tem `renewed_policy_id` preenchido no QAR (cotação nova, ou renovação de apólice de outra corretora/fora da plataforma) THEN a apólice nasce com `renewed_from_policy_id = null` — sem vínculo, sem afetar nenhuma outra apólice.

### Requirement 5: Listar e ver detalhe de apólices

**User Story:** Como usuário com acesso à carteira, quero ver a lista e o detalhe de cada apólice, para acompanhar vigências e valores.

#### Acceptance Criteria

1. WHEN `platform_admin`, `brokerage_admin` ou `supervisor` acessa a listagem THEN o sistema SHALL mostrar todas as apólices da própria corretora.
2. WHEN `seller` acessa a listagem THEN o sistema SHALL mostrar só as apólices de clientes vinculados a ele (mesma regra de `is_my_client`, já usada em `vehicles`/`quotations`).
3. WHEN `analyst` ou `viewer` acessa a listagem THEN o sistema SHALL mostrar todas as apólices da corretora, em modo leitura.
4. A listagem SHALL exibir um status derivado calculado a partir de `coverage_end` — `Vigente`, `Vencendo em breve` (≤30 dias), `Vencida` — sobreposto ao `status` persistido (`active`/`cancelled`/`renewed`); uma apólice `cancelled` ou `renewed` SHALL mostrar esse status persistido em vez do derivado, independente da data.
5. A listagem SHALL permitir busca por número da apólice/nome do cliente e filtro por status derivado.
6. O detalhe SHALL mostrar os dados da apólice, o link para a cotação de origem, o vínculo de renovação (para qual apólice essa renova, e se já foi renovada por outra), e a lista de anexos.
