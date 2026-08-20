# Requirements — policy-endorsements

## Introdução

Endosso é qualquer alteração formal numa apólice vigente, dentro do mesmo contrato — diferente de uma renovação (que é uma nova negociação, nova cotação, nova vigência). No modelo antigo (`fleet-auth-gate`) essa funcionalidade nunca existia; o roadmap só a citava como item futuro.

Esta spec nasce inteiramente nova, sobre a base já pronta da spec `policies`.

### Decisão central: endosso tem fluxo de negociação próprio, não é instantâneo

Discutido com o usuário: um endosso com impacto financeiro (inclusão de veículo, mudança de cobertura, etc.) segue, na prática, o mesmo tipo de fluxo de uma cotação — alguém abre, a seguradora responde com um valor, isso é repassado ao cliente, o cliente aceita, e só então é efetivado. **Todos os tipos de endosso** passam por esse fluxo (nenhum é instantâneo).

A estrutura é **própria** — uma tabela nova `policy_endorsements` com seu próprio enum de status —, deliberadamente **não** reaproveitando a tabela `quotations`, ainda que o padrão de responsabilidade por papel seja o mesmo já validado ali:

```
waiting → presented → client_accepted → effected
   ↓           ↓            ↓
                not_closed (recusado — seguradora ou cliente)
```

- **`waiting`**: `seller` (dono do cliente da apólice) abre o endosso — escolhe o tipo e preenche a mudança pretendida.
- **`waiting → presented`**: `analyst` (calculista) ou `supervisor`/`brokerage_admin`/`platform_admin` registra o retorno da seguradora (ajuste de prêmio negociado, notas) — essa transição já representa "recebi da seguradora e repassei pro vendedor apresentar ao cliente".
- **`presented → client_accepted` ou `not_closed`**: `seller` (dono) ou `supervisor`/`brokerage_admin`/`platform_admin` registra a resposta do cliente.
- **`client_accepted → effected`**: só `supervisor`/`brokerage_admin`/`platform_admin` — só aqui a mudança real é aplicada (nova versão de `policies`, ou cancelamento).
- **`client_accepted → not_closed`**: válvula de segurança, mesmo padrão já usado em `quotations` (o negócio pode cair depois do aceite verbal, antes da efetivação).

Diferente de `quotations`, não há "convidar seguradoras" (plural) nem "marcar vencedora" — o endosso é sempre negociado com a seguradora que já tem a apólice.

### Versionamento imutável — o número da apólice nunca muda

Confirmado com o usuário: um endosso efetivado **não troca de apólice, gera uma nova versão dela**. `policy_number` é sempre herdado da versão anterior (nunca gerado de novo, nunca editável como parte de um endosso comum) — no mundo real, uma apólice mantém o mesmo número durante toda sua vida; o que muda de versão pra versão são os itens dela (veículos, cobertura, valores). Da mesma forma, `client_id`, `insurer_id` e demais dados que não fazem parte do que o endosso mexe são sempre copiados da versão anterior — a apólice não tem "seller/analyst responsável" próprio (isso vive na cotação de origem); quem tocou o endosso fica registrado só no próprio `policy_endorsements`.

A versão anterior nunca muda de conteúdo, só transiciona de status (mesmo padrão já usado pra marcar uma apólice como `renewed`). A nova versão referencia a anterior via `previous_version_id` — conceito **diferente** de `renewed_from_policy_id` (renovação = nova vigência, nova cotação; endosso = mesma vigência, ajuste de conteúdo). A busca "qual é a versão mais nova" é reversa, mesmo padrão de `renewed_from_policy_id`/`get-renewed-by-policy` já implementado.

Todas as versões de uma mesma apólice (a cadeia inteira) compartilham um `root_policy_id` — aponta sempre pra primeira versão, preenchido automaticamente. Evita ter que andar recursivamente pela cadeia de `previous_version_id` toda vez que for preciso listar todos os endossos já aplicados a uma apólice, independente de qual versão está sendo vista.

### `policy_vehicles`: peça nova, necessária pra inclusão/exclusão/cobertura

Hoje `policies` não sabe quais veículos estão cobertos — isso só existe em `quotation_vehicles`, da cotação de origem. Endossos que mexem em veículo (inclusão, exclusão, alteração de cobertura) precisam saber o conjunto de veículos de **cada versão** da apólice. Esta spec cria `policy_vehicles` (mesmos ~19 campos de cobertura de `quotation_vehicles`) e mexe de novo na spec `policies` já fechada: o trigger `create_policy_from_effected_quotation` passa a copiar `quotation_vehicles` → `policy_vehicles` ao criar a primeira versão.

### Status novo: `superseded`

`policy_status` ganha um quinto valor: `superseded` — a versão anterior de uma apólice, depois de substituída por um endosso de conteúdo. Diferente de `renewed` (substituída por uma apólice de uma cotação de renovação nova) e de `cancelled` (encerrada sem substituição).

### Atomicidade: função no banco na efetivação, não sequência de chamadas do frontend

Ao efetivar um endosso de conteúdo: nova linha em `policies`, cópia (com ajuste) de `policy_vehicles`, atualização de status da versão anterior, e atualização do próprio endosso — tudo ou nada. Mesmo padrão já usado entre `quotations` e `policies`: o frontend só faz um `UPDATE` simples de status (`client_accepted → effected`); um trigger `AFTER UPDATE OF status`, `SECURITY DEFINER`, aplica tudo atomicamente na mesma transação — não uma sequência de `.insert()`/`.update()` do frontend.

### Catálogo de tipos de endosso (v1)

| Tipo | O que muda quando efetivado | Gera nova versão? |
|---|---|---|
| `vehicle_inclusion` | Inclui um veículo (com cobertura) na apólice | Sim |
| `vehicle_exclusion` | Remove um veículo da apólice | Sim |
| `coverage_change` | Altera a cobertura de um veículo já incluído | Sim |
| `extension` | Prorroga a vigência (`coverage_end`) | Sim |
| `administrative_correction` | Ajuste administrativo — número da apólice, prêmio, valor da frota, vigência | Sim |
| `cancellation` | Encerra a apólice | Não — só muda o status da versão vigente |

### Fora de escopo desta spec

- **Sinistro** — domínio próprio, não um tipo de endosso.
- **Edição ou exclusão de um endosso já efetivado** — histórico permanente; corrigir é fazer outro endosso.
- **Envio automático do documento pro cliente/seguradora** — depende da spec futura de notificações.

## Requirements

### Requirement 1: Abrir endosso

**User Story:** Como `seller`, quero abrir um endosso numa apólice do meu cliente, para começar a formalizar uma mudança que o cliente pediu.

#### Acceptance Criteria

1. WHEN `seller` (dono do cliente da apólice) abre um endosso na versão vigente (status `active`) de uma apólice, escolhendo o tipo e preenchendo os dados da mudança pretendida (Requirements 5–10) THEN o sistema SHALL criar a linha em `policy_endorsements` com `status = 'waiting'`.
2. Endosso só SHALL poder ser aberto numa versão vigente (`active`) — nunca em `superseded`, `renewed` ou `cancelled`.
3. WHEN um perfil diferente de `seller`, `supervisor`, `brokerage_admin` ou `platform_admin` tenta abrir um endosso THEN o sistema SHALL negar.

### Requirement 2: Registrar retorno da seguradora

**User Story:** Como `analyst`, `supervisor`, `brokerage_admin` ou `platform_admin`, quero registrar o retorno da seguradora sobre um endosso, para repassar a condição negociada ao vendedor apresentar ao cliente.

#### Acceptance Criteria

1. WHEN um desses perfis avança um endosso de `waiting` para `presented`, preenchendo o ajuste de prêmio negociado (pode ser positivo, negativo ou zero) e notas do retorno da seguradora THEN o sistema SHALL registrar e avançar o status.
2. WHEN esses perfis avançam um endosso de `waiting` para `not_closed` (seguradora recusou) informando o motivo THEN o sistema SHALL permitir.

### Requirement 3: Resposta do cliente

**User Story:** Como `seller` (dono do cliente) ou gestão, quero registrar se o cliente aceitou a condição do endosso, para dar sequência ou encerrar.

#### Acceptance Criteria

1. WHEN `seller` (dono da apólice) ou `supervisor`/`brokerage_admin`/`platform_admin` avança um endosso de `presented` para `client_accepted` THEN o sistema SHALL registrar.
2. WHEN esses mesmos perfis avançam de `presented` para `not_closed`, informando o motivo, THEN o sistema SHALL permitir.

### Requirement 4: Efetivar endosso

**User Story:** Como `supervisor`, `brokerage_admin` ou `platform_admin`, quero efetivar um endosso já aceito pelo cliente, para aplicar a mudança de verdade na apólice.

#### Acceptance Criteria

1. WHEN um desses perfis avança um endosso de `client_accepted` para `effected` THEN o sistema SHALL aplicar a mudança correspondente ao tipo do endosso (Requirements 5–10), atomicamente.
2. WHEN o tipo do endosso não é `cancellation` THEN a efetivação SHALL criar uma nova versão de `policies` — `policy_number`, `client_id`, `insurer_id`, `brokerage_id`, `quotation_id` e `renewed_from_policy_id` SHALL ser sempre copiados da versão anterior (nunca alterados por um endosso), `root_policy_id` SHALL apontar pra primeira versão da cadeia, `previous_version_id` SHALL apontar pra versão que está sendo substituída, e essa versão anterior SHALL ter seu `status` atualizado para `superseded`.
3. WHEN o tipo do endosso é `cancellation` THEN a efetivação SHALL apenas atualizar o `status` da versão vigente para `cancelled` — sem criar nova linha.
4. WHEN `seller`, `analyst` ou `viewer` tenta efetivar um endosso THEN o sistema SHALL negar.
5. `client_accepted → not_closed` (válvula de segurança) SHALL exigir motivo e SHALL estar disponível só para `supervisor`/`brokerage_admin`/`platform_admin`.

### Requirement 5: Endosso de inclusão de veículo

**User Story:** Como corretora, quero incluir um veículo numa apólice vigente via endosso, para que a frota segurada reflita a frota real do cliente sem esperar a renovação.

#### Acceptance Criteria

1. Um endosso `vehicle_inclusion` SHALL exigir a escolha de um veículo do cliente (ainda não coberto pela versão vigente) e os dados de cobertura dele (mesmos campos de `quotation_vehicles`).
2. WHEN efetivado THEN a nova versão SHALL herdar todos os veículos da versão anterior em `policy_vehicles`, mais o veículo incluído, com `total_fleet_value` recalculado (soma de `casco_value`).

### Requirement 6: Endosso de exclusão de veículo

**User Story:** Como corretora, quero excluir um veículo de uma apólice vigente via endosso (venda, perda total), para manter a cobertura fiel à frota atual.

#### Acceptance Criteria

1. Um endosso `vehicle_exclusion` SHALL exigir a escolha de um veículo já coberto pela versão vigente.
2. WHEN efetivado THEN a nova versão SHALL herdar os veículos da versão anterior em `policy_vehicles`, exceto o excluído, com `total_fleet_value` recalculado.

### Requirement 7: Endosso de alteração de cobertura

**User Story:** Como corretora, quero ajustar a cobertura de um veículo específico via endosso, para refletir uma renegociação pontual sem esperar a renovação inteira.

#### Acceptance Criteria

1. Um endosso `coverage_change` SHALL exigir a escolha de um veículo já coberto e os novos dados de cobertura dele.
2. WHEN efetivado THEN a nova versão SHALL herdar os veículos da versão anterior em `policy_vehicles` com os dados desse veículo atualizados, com `total_fleet_value` recalculado.

### Requirement 8: Endosso de prorrogação de vigência

**User Story:** Como corretora, quero prorrogar a vigência de uma apólice via endosso, para cobrir um período adicional sem depender de renovação completa.

#### Acceptance Criteria

1. Um endosso `extension` SHALL exigir uma nova data de fim de vigência, posterior à atual.
2. WHEN efetivado THEN a nova versão SHALL ter `coverage_end` atualizado; `policy_vehicles` SHALL ser copiado sem alteração.

### Requirement 9: Endosso de correção administrativa

**User Story:** Como corretora, quero corrigir dados administrativos de uma apólice via endosso (número, prêmio, valor da frota, vigência), para manter o registro fiel.

#### Acceptance Criteria

1. Um endosso `administrative_correction` SHALL permitir informar novos valores para `policy_number`, `premium_amount`, `total_fleet_value`, `coverage_start` e/ou `coverage_end`, e SHALL exigir uma descrição do motivo.
2. WHEN efetivado THEN a nova versão SHALL ter os campos informados atualizados e os demais copiados; `policy_vehicles` SHALL ser copiado sem alteração.

### Requirement 10: Endosso de cancelamento

**User Story:** Como corretora, quero cancelar uma apólice vigente via endosso, para encerrar a cobertura quando o cliente rescinde o contrato.

#### Acceptance Criteria

1. Um endosso `cancellation` SHALL exigir uma descrição do motivo.
2. WHEN efetivado THEN o sistema SHALL atualizar o `status` da versão vigente para `cancelled`, sem criar nova linha.
3. Uma apólice `cancelled` SHALL ser um estado terminal — nenhum outro endosso SHALL poder ser aberto nela.

### Requirement 11: Documento do endosso

**User Story:** Como usuário envolvido no endosso, quero baixar um documento formal dele depois de efetivado, para ter o registro pronto pra enviar ao cliente ou à seguradora.

#### Acceptance Criteria

1. WHEN um endosso chega em `effected` THEN o sistema SHALL disponibilizar a geração de um PDF — número da apólice, tipo do endosso em português, data de efetivação, motivo/descrição, ajuste de prêmio negociado, e um resumo do que mudou.
2. O PDF SHALL ser gerado inteiramente no navegador, mesma abordagem já usada em `quotations` (Requirement 9) — sem Edge Function.
3. WHEN o usuário clica em "Baixar PDF" THEN o sistema SHALL gerar o arquivo e iniciar o download diretamente.

### Requirement 12: Histórico de versões e endossos no detalhe da apólice

**User Story:** Como usuário com acesso à apólice, quero ver o histórico completo de versões e endossos, para entender como ela chegou ao estado atual.

#### Acceptance Criteria

1. O detalhe de uma apólice SHALL mostrar a lista de veículos cobertos pela versão sendo visualizada (`policy_vehicles`), com resumo de cobertura de cada um.
2. O detalhe SHALL mostrar a lista de endossos dessa "linha lógica" de apólice (via `root_policy_id`), cada um com tipo, status, data, e link pro PDF quando efetivado.
3. WHEN a versão sendo visualizada não é a mais recente (foi substituída por um endosso) THEN o sistema SHALL indicar isso claramente e linkar pra versão atual.
4. `platform_admin`, `brokerage_admin`, `supervisor`, `analyst` e `viewer` SHALL ver esse histórico; `seller` (dono do cliente), também, em modo leitura — mesma visibilidade já usada pra apólices.
5. Endossos com status `waiting`, `presented` ou `client_accepted` (ainda não efetivados) SHALL também aparecer nessa lista, com ação pra avançar o status disponível pra quem tem permissão (Requirements 1–4).
