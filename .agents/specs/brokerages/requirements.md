# Requirements Document

## Introduction

Gestão das corretoras-cliente da plataforma. Depende da fundação de autenticação e multi-tenancy já implementada em `.agents/specs/auth/` (tabelas `brokerages`/`plans`/`users`, RLS base, `get_my_role()`/`get_my_brokerage_id()`) e da administração de usuários em `.agents/specs/users/` (o convite do primeiro admin de uma corretora nova reaproveita o mesmo mecanismo).

Diferente de todas as outras entidades operacionais do sistema, `brokerages` tem dois níveis de gestão bem distintos:
- **`platform_admin`** gerencia as corretoras-cliente como um todo (cria, lista, edita nome/plano/status, desativa/reativa) — é a única exceção ao isolamento multi-tenant padrão, e só se aplica à entidade `brokerages` em si, nunca aos dados operacionais (clientes, cotações etc.) de dentro de cada corretora.
- **`brokerage_admin`** (e o próprio `platform_admin`, quando dono da corretora especial da plataforma) edita os dados administrativos e de identidade visual do dia a dia da própria corretora — CNPJ, endereço, contatos, logo, cor.

`platform_admin` não pertence a nenhuma corretora-cliente normal — existe uma corretora especial, reservada pra quem opera a plataforma, que nunca aparece na listagem que `platform_admin` gerencia.

### Cadastro completo de empresa (adicionado após feedback de teste manual)

O cadastro original desta spec só pedia nome da corretora + nome/email do primeiro admin — um gap real: a tabela `clients` (spec já fechada) já tem um conjunto completo de dados de empresa (CNPJ, endereço, contato comercial, contato financeiro) que `brokerages` nunca ganhou, apesar do sistema antigo (`fleet-auth-gate`) já documentar esses mesmos campos pra corretora (`docs/database/schema.md` de lá). Requirements 2, 4 e 6 abaixo já refletem o cadastro completo — a divisão de responsabilidade decidida foi:
- **Cadastro (Requirement 2)**: `platform_admin` preenche tudo — inclusive os dados de empresa — no onboarding. Plano/status continuam de fora (Requirement 2.4, inalterado).
- **Dali em diante**: os dados de empresa (CNPJ, endereço, contatos) passam a ser responsabilidade do **`brokerage_admin`** (Requirement 6, ampliado) — a própria corretora mantém seus dados administrativos sem depender de suporte da plataforma. `platform_admin` continua vendo esses dados no detalhe (Requirement 4.1), mas não edita mais por ali (Requirement 4.2/4.3, ajustado) — só nome/plano/status.

### Representante = primeiro administrador (refinamento pós-implementação)

Teste manual apontou uma duplicação: o cadastro tinha uma seção "Representante" (dado de empresa, opcional) E uma seção "Primeiro administrador" (nome/e-mail, obrigatórios, usados pro convite) — na prática a mesma pessoa preenchida duas vezes. Requirement 2 (AC1/AC2) e o design foram ajustados pra eliminar a duplicação: **o representante é quem é convidado como primeiro `brokerage_admin`** — nome/e-mail do representante passam a ser obrigatórios na criação, e não existe mais um campo "admin" separado. `brokerage_admin`/`platform_admin` continuam podendo editar o representante depois (Requirement 6), sem essa obrigatoriedade (a pessoa já tem conta).

Nesse mesmo refinamento, o formulário de criação e o de edição pelo `brokerage_admin` (Requirement 6) passaram a replicar os placeholders, máscaras (CNPJ, telefone, CEP, UF maiúsculo) e o agrupamento de seções do formulário equivalente do sistema antigo (`fleet-auth-gate`, `src/features/admin/pages/admin.brokerages.tsx`) — inclusive consolidando "Representante" e "Financeiro" numa única seção "Representante e contato", como já era feito lá.

### platform_admin também edita dados de empresa (refinamento pós-implementação)

Segundo ajuste do mesmo feedback: a edição do `platform_admin` (Requirement 4) estava restrita a nome/plano/status/data de expiração — só a criação (Requirement 2) tinha os campos de empresa. Isso quebrava a simetria com o sistema antigo, onde o mesmo formulário (`BrokerageFormFields`) serve tanto pra criar quanto pra editar. Requirement 4 (AC2/AC3) foi ajustado: `platform_admin` agora edita o mesmo conjunto de campos de empresa que preenche na criação — só logo/cor continuam exclusivos do `brokerage_admin` (Requirement 6), já que fazem parte da identidade visual do dia a dia da corretora, não do cadastro administrativo.

## Requirements

### Requirement 1: Corretora especial da plataforma

**User Story:** Como operador da plataforma, quero que usuários `platform_admin` pertençam a uma corretora própria da plataforma, para que a gestão de corretoras-cliente nunca se confunda com "a corretora de quem está gerenciando".

#### Acceptance Criteria

1. Existe uma corretora reservada (seed/migration, id conhecido) destinada exclusivamente a usuários `platform_admin`.
2. WHEN a listagem de corretoras-cliente (Requirement 3) é exibida THEN o sistema SHALL excluir essa corretora especial do resultado.
3. A corretora especial segue as mesmas regras de RLS de qualquer outra — não tem tratamento privilegiado de acesso a dados, só é excluída da listagem de gestão.

### Requirement 2: Criar corretora (com o representante como primeiro admin)

**User Story:** Como `platform_admin`, quero cadastrar uma nova corretora-cliente já com seu representante como primeiro administrador, para dar onboarding completo sem depender de scripts manuais nem duplicar o mesmo contato em dois lugares do formulário.

#### Acceptance Criteria

1. WHEN `platform_admin` submete os dados da nova corretora THEN o sistema SHALL criar a linha em `brokerages` E convidar o representante (nome/e-mail) como `brokerage_admin` dela, reaproveitando o mecanismo de convite da spec `users` (Edge Function, envio de email, fluxo de "definir senha") — não existe um "primeiro administrador" separado do representante, são a mesma pessoa/os mesmos dados.
2. Os dados da corretora que podem ser preenchidos na criação SHALL incluir: nome (razão social), nome fantasia, CNPJ, CNAE, inscrição estadual, e-mail comercial, telefone, endereço completo (CEP, logradouro, número, complemento, bairro, cidade, UF), nome/e-mail do contato financeiro — todos opcionais. Nome da corretora e nome/e-mail do representante SHALL ser obrigatórios, pois o representante também é convidado como primeiro `brokerage_admin`.
3. IF a criação do usuário administrador (a partir dos dados do representante) falhar (ex: email inválido) THEN o sistema SHALL desfazer a criação da corretora — nunca deixar uma corretora órfã sem nenhum administrador.
4. WHEN um perfil diferente de `platform_admin` tenta criar uma corretora THEN o sistema SHALL negar a ação.
5. A corretora nasce sem plano vinculado (`plan_id` nulo) e sem logo/cor primária — vincular um plano é uma ação de edição separada (Requirement 4); logo/cor são responsabilidade do `brokerage_admin` (Requirement 6), nunca preenchidos na criação.

### Requirement 3: Listar corretoras

**User Story:** Como `platform_admin`, quero ver a lista de todas as corretoras-cliente da plataforma, para ter visão geral de quem está usando o sistema.

#### Acceptance Criteria

1. WHEN `platform_admin` acessa a listagem THEN o sistema SHALL exibir todas as corretoras (nome, plano vinculado, status, data de criação), exceto a corretora especial da plataforma (Requirement 1).
2. WHEN um perfil diferente de `platform_admin` tenta acessar essa listagem THEN o sistema SHALL negar o acesso.

### Requirement 4: Ver detalhe e editar uma corretora (platform_admin)

**User Story:** Como `platform_admin`, quero ver o detalhe completo de qualquer corretora-cliente e editar tanto os dados administrativos (plano, status) quanto os dados de empresa, para poder corrigir cadastro ou dar suporte à corretora sem depender do `brokerage_admin` fazer isso.

#### Acceptance Criteria

1. WHEN `platform_admin` abre o detalhe de uma corretora THEN o sistema SHALL exibir todos os dados dela — nome, dados de empresa (nome fantasia, CNPJ, CNAE, inscrição estadual, e-mail comercial, telefone, endereço, representante, financeiro), plano vinculado, data de expiração do plano, status, logo e cor primária.
2. WHEN `platform_admin` edita uma corretora THEN o sistema SHALL permitir alterar nome, plano vinculado, data de expiração do plano, E todos os dados de empresa (nome fantasia, CNPJ, CNAE, inscrição estadual, e-mail comercial, telefone, endereço completo, representante, financeiro) — o mesmo conjunto de campos preenchível na criação (Requirement 2.2).
3. Logo e cor primária continuam fora da edição do `platform_admin` — são responsabilidade exclusiva do `brokerage_admin` da própria corretora (Requirement 6), a única exceção à simetria entre criação e edição por esta via.
4. WHEN um perfil diferente de `platform_admin` tenta ver o detalhe ou editar por essa via THEN o sistema SHALL negar a ação.

### Requirement 5: Desativar e reativar uma corretora

**User Story:** Como `platform_admin`, quero poder desativar uma corretora-cliente, para bloquear o acesso de todos os usuários dela (ex: inadimplência, encerramento de contrato) sem perder o histórico de dados.

#### Acceptance Criteria

1. WHEN `platform_admin` desativa uma corretora THEN o sistema SHALL atualizar seu `status` para inativo — a linha nunca é deletada, e todo dado historicamente vinculado a ela permanece intacto.
2. WHEN uma corretora está com `status` inativo THEN as funções `get_my_role()`/`get_my_brokerage_id()` SHALL considerar **todos** os usuários dela sem role/corretora válidos, independentemente do `status` individual de cada usuário — a RLS bloqueia toda leitura/escrita.
3. WHEN um usuário de uma corretora inativa autentica com sucesso (credenciais ainda válidas) THEN o frontend SHALL detectar isso logo após o login, encerrar a sessão e exibir uma mensagem de acesso bloqueado — mesmo mecanismo já usado para usuário individual desativado (`.agents/specs/users/requirements.md`, Requirement 3), adaptado para deixar claro que o bloqueio é da corretora, não da conta da pessoa.
4. WHEN `platform_admin` reativa uma corretora previamente desativada THEN o sistema SHALL atualizar seu `status` de volta para ativo, restaurando o acesso de todos os usuários que já estavam ativos individualmente — sem exigir novo convite.
5. WHEN um perfil diferente de `platform_admin` tenta desativar ou reativar uma corretora THEN o sistema SHALL negar a ação.

### Requirement 6: Editar a própria corretora (brokerage_admin)

**User Story:** Como `brokerage_admin`, quero editar os dados administrativos e de identidade visual da minha corretora (nome, CNPJ, endereço, contatos, logo, cor primária), para manter o cadastro atualizado e personalizar a operação sem depender de suporte da plataforma.

#### Acceptance Criteria

1. WHEN `brokerage_admin` edita a própria corretora THEN o sistema SHALL permitir alterar: nome, nome fantasia, CNPJ, CNAE, inscrição estadual, e-mail comercial, telefone, endereço completo, representante (nome/e-mail), contato financeiro (nome/e-mail), logo e cor primária.
2. `brokerage_admin` NÃO pode alterar o plano vinculado nem o `status` da própria corretora — essas ações são exclusivas de `platform_admin` (Requirements 4 e 5).
3. WHEN um perfil diferente de `brokerage_admin`/`platform_admin` tenta editar a corretora THEN o sistema SHALL negar a ação.
4. `platform_admin`, quando autenticado sob a corretora especial da plataforma (Requirement 1), também pode editar os próprios dados por esta mesma via.

### Requirement 7: Busca automática de CNPJ e CEP

**User Story:** Como `platform_admin` ou `brokerage_admin` preenchendo os dados de uma corretora, quero buscar os dados pelo CNPJ ou CEP, para não digitar informação que já existe publicamente.

#### Acceptance Criteria

1. WHEN o usuário informa um CNPJ e aciona a busca THEN o sistema SHALL consultar a BrasilAPI e preencher automaticamente nome (razão social), nome fantasia, CNAE, e-mail comercial, telefone e endereço completo — inscrição estadual, representante e financeiro continuam manuais (não fazem parte do retorno da Receita Federal).
2. WHEN o usuário informa um CEP e aciona a busca THEN o sistema SHALL consultar a ViaCEP e preencher automaticamente logradouro, bairro, cidade e UF.
3. IF a busca falhar (CNPJ/CEP inválido ou API fora do ar) THEN o sistema SHALL avisar o usuário sem bloquear o preenchimento manual dos campos.
4. Essa busca está disponível tanto na criação (Requirement 2, `platform_admin`) quanto na edição pelo `brokerage_admin` (Requirement 6).
