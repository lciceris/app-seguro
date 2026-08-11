# Requirements Document

## Introduction

Cadastro das seguradoras da plataforma — tabela global (sem `brokerage_id`, diferente de todo o resto do schema operacional). É a base de catálogo que a futura spec de cotações vai usar para orçar em cada seguradora (`quotation_insurers`), mas essa spec cobre só o cadastro em si — nada do fluxo de cotação.

Os dados cadastrais e o controle de disponibilidade são responsabilidade de perfis diferentes:
- **`platform_admin`**: cadastra e edita os dados da seguradora (nome, CNPJ, contato etc.) — dono do catálogo, mas não decide quem usa o quê.
- **`brokerage_admin`**: decide, só pra própria corretora, quais seguradoras do catálogo global realmente aparecem nas cotações dela — ex: a plataforma disponibiliza 5 seguradoras, mas uma corretora só trabalha com 3, e desativa as outras 2 só pra si, sem afetar nenhuma outra corretora.

Não existe um `status` ativo/inativo na própria seguradora nem uma ação de "desativar globalmente" — a única forma de "desativar" é a preferência por corretora (Requirement 5).

## Requirements

### Requirement 1: Cadastrar seguradora

**User Story:** Como `platform_admin`, quero cadastrar uma nova seguradora, para disponibilizá-la como opção de negociação nas cotações.

#### Acceptance Criteria

1. WHEN `platform_admin` submete os dados de uma seguradora (nome obrigatório; CNPJ, e-mail, telefone comercial, website, contato comercial, prazo de resposta em dias, ordem de exibição e observações opcionais) THEN o sistema SHALL criar a linha em `insurers`.
2. A seguradora nasce sem nenhum vínculo com corretora — é um cadastro global, disponível por padrão para qualquer corretora até que ela mesma opte por não usá-la (Requirement 5).
3. WHEN um perfil diferente de `platform_admin` tenta cadastrar uma seguradora THEN o sistema SHALL negar a ação.

### Requirement 2: Listar seguradoras

**User Story:** Como `platform_admin`, quero ver a lista de todas as seguradoras cadastradas, para gerenciar o catálogo da plataforma.

#### Acceptance Criteria

1. WHEN `platform_admin` acessa a listagem THEN o sistema SHALL exibir todas as seguradoras (nome, CNPJ), ordenadas por `display_order` e depois por nome.
2. WHEN um perfil diferente de `platform_admin` tenta acessar essa listagem THEN o sistema SHALL negar o acesso.

### Requirement 3: Ver detalhe de uma seguradora

**User Story:** Como `platform_admin`, quero ver o detalhe completo de uma seguradora, para conferir todos os dados cadastrados antes de editar.

#### Acceptance Criteria

1. WHEN `platform_admin` abre o detalhe de uma seguradora THEN o sistema SHALL exibir todos os campos cadastrados (nome, CNPJ, e-mail, telefone comercial, website, contato comercial, prazo de resposta, ordem de exibição, observações).
2. WHEN um perfil diferente de `platform_admin` tenta acessar THEN o sistema SHALL negar.

### Requirement 4: Editar seguradora

**User Story:** Como `platform_admin`, quero editar os dados de uma seguradora, para corrigir ou atualizar informações cadastrais.

#### Acceptance Criteria

1. WHEN `platform_admin` edita qualquer campo cadastral de uma seguradora THEN o sistema SHALL atualizar a linha correspondente.
2. WHEN um perfil diferente de `platform_admin` tenta editar THEN o sistema SHALL negar a ação.

### Requirement 5: Habilitar/desabilitar seguradora por corretora

**User Story:** Como `brokerage_admin`, quero desabilitar, só pra minha corretora, uma seguradora que a plataforma disponibiliza mas que eu não uso, para que ela não apareça como opção nas minhas cotações.

#### Acceptance Criteria

1. WHEN `brokerage_admin` acessa a tela de seguradoras THEN o sistema SHALL exibir todas as seguradoras do catálogo, com um indicador de "habilitada"/"desabilitada" refletindo a preferência da própria corretora (habilitada por padrão, até que a corretora a desabilite explicitamente).
2. WHEN `brokerage_admin` desabilita uma seguradora THEN o sistema SHALL registrar essa preferência vinculada à própria corretora, sem afetar nenhuma outra corretora nem os dados cadastrais da seguradora.
3. WHEN `brokerage_admin` reabilita uma seguradora previamente desabilitada por ele THEN o sistema SHALL remover essa preferência (voltando ao padrão "habilitada").
4. `brokerage_admin` não pode editar nenhum dado cadastral da seguradora (nome, CNPJ etc.) nem cadastrar novas — só a própria preferência de habilitado/desabilitado (essas ações continuam exclusivas do `platform_admin`, Requirements 1 e 4).
5. WHEN um perfil diferente de `brokerage_admin` ou `platform_admin` tenta acessar essa tela THEN o sistema SHALL negar o acesso.
