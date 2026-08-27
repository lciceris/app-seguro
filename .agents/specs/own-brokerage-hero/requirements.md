# Requirements — own-brokerage-hero

## Introdução

O usuário achou a tela "Minha corretora" genérica demais — logo e cor primária viviam num card "Identidade visual" igual a qualquer outro. Depois de comparar 5 protótipos, escolheu a opção 1: um cartão-perfil horizontal no topo, com o avatar/logo grande (borda na cor primária, tipo avatar de perfil) e a cor primária em destaque, deixando os cards de dados (Empresa, Endereço, Representante e contato) exatamente como já eram.

## Escopo

**Dentro:**
- Remove o card "Identidade visual".
- Novo card no topo do formulário: avatar grande (upload/remoção de logo continuam funcionando, agora clicando no próprio avatar — like editor de foto de perfil), nome/CNPJ da corretora ao lado (só exibição, refletindo os campos reais ao vivo enquanto o usuário digita), e o `ColorPicker` de cor primária (mesmo componente, só reposicionado/redimensionado).
- Nenhuma mudança de validação/payload/API — é reposicionamento visual dos mesmos campos (`logo_url`, `primary_color`) que já existiam.

**Fora:**
- Mudar como CNPJ/Razão social são editados — continuam como inputs normais dentro do card "Empresa", só ganham uma prévia de leitura no hero.
- Drag-and-drop de logo (não foi pedido).

## Requirements

### Requirement 1: Avatar grande como upload de logo

**User Story:** Como admin de corretora, quero trocar o logo clicando diretamente num avatar grande, como numa foto de perfil.

#### Acceptance Criteria

1. O hero SHALL exibir um avatar de ~80px com borda de 2px na cor `primary`.
2. Quando não houver logo, o avatar SHALL mostrar a inicial do nome fantasia (ou razão social, se não houver nome fantasia).
3. Clicar no avatar (com ou sem logo) SHALL abrir o seletor de arquivo, reaproveitando exatamente a validação/preview/upload já existentes (`handleLogoFile`, `uploadBrokerageLogo`).
4. Quando houver logo (enviado ou já salvo), um botão de remover (ícone "x") SHALL aparecer sobreposto ao avatar, reaproveitando `handleLogoRemove`.

### Requirement 2: Identidade em destaque

**User Story:** Como admin de corretora, quero ver o nome e o CNPJ da minha corretora junto do avatar, como um cabeçalho de perfil.

#### Acceptance Criteria

1. Ao lado do avatar, o hero SHALL exibir a razão social (`name`) em destaque e o CNPJ formatado abaixo, ambos refletindo o valor atual do formulário (ao vivo, sem precisar salvar) — não são campos editáveis ali, só exibição.
2. O `ColorPicker` de cor primária SHALL continuar funcional (mesmo componente), reposicionado dentro do hero.

### Requirement 3: Resto da página inalterado

**User Story:** Como admin de corretora, quero que só a parte de identidade visual mude — o resto dos meus dados continua onde eu já esperava.

#### Acceptance Criteria

1. Os cards "Empresa", "Endereço" e "Representante e contato" SHALL permanecer com os mesmos campos, layout e comportamento de hoje.
2. O botão "Salvar" e o fluxo de submit (`onSubmit`, payload, toasts) SHALL permanecer idênticos.
