# Requirements — brokerage-users-count

## Introdução

No drawer de detalhe de corretora, o usuário (platform_admin) quer saber se a corretora está perto de estourar o limite de usuários do plano contratado — motivado pelo print do sistema antigo, que tinha um bloco "Uso do Plano" e uma lista de usuários vinculados.

Levantamento de segurança feito antes de implementar: `platform_admin` **não tem bypass cross-tenant por padrão** — é isolado como qualquer corretora (ver `docs/architecture/backend/conventions/rls.md`). A única exceção hoje é a tabela `brokerages` (`brokerages_select_all_platform_admin`), documentada como "vale só pra essa tabela — nunca se estende a dados operacionais de dentro de cada corretora". Expor a lista completa de usuários de outra corretora (nome, e-mail, perfil) via uma policy de RLS ampliada em `users` criaria uma segunda exceção desse tipo, mais sensível (nomes e e-mails de pessoas físicas de todas as corretoras).

Discutido com o usuário: o objetivo real é só saber "está perto de usar todos os usuários disponíveis?" — não precisa ver quem são. Decisão: **expor só a contagem** (um número), via função `SECURITY DEFINER` (mesmo padrão de `can_add_user()`, que já compara usuários ativos vs. limite do plano mas só devolve um booleano) — nenhuma RLS nova em `users`, nenhum dado pessoal exposto.

A comparação com o limite do plano (`plans.max_users`) e qualquer UI de "gestão de plano" (upgrade, edição de limite) ficam **fora** desta spec — registradas como item de backlog em `docs/product/roadmap.md`, pra quando a feature de planos for atacada de verdade.

### Escopo

**Dentro:**
- Função SQL `count_active_users(p_brokerage_id uuid) returns integer`, `SECURITY DEFINER`, com checagem de autorização própria (platform_admin vê qualquer corretora; qualquer outro role só a própria).
- Card "Usuários ativos" no `brokerage-detail-drawer.tsx` mostrando só o número.
- Entrada de backlog em `docs/product/roadmap.md` pro KPI completo ("X de Y usuários, conforme o plano") e qualquer gestão de plano.

**Fora:**
- Lista de usuários vinculados (nome/e-mail/perfil) — decisão explícita de não expor, ver acima.
- Comparação com `plans.max_users` / barra de progresso — fica no backlog.
- Qualquer policy de RLS nova em `users`.

## Requirements

### Requirement 1: Contagem de usuários ativos via função segura

**User Story:** Como platform_admin, quero saber quantos usuários ativos uma corretora tem, sem precisar ver quem são, para avaliar o uso da conta sem acessar dado pessoal desnecessário.

#### Acceptance Criteria

1. SHALL existir uma função `count_active_users(p_brokerage_id uuid) returns integer`, `security definer`, `set search_path = ''`, seguindo o padrão de `can_add_user()`.
2. A função SHALL contar `users` com `brokerage_id = p_brokerage_id` e `status = 'active'`.
3. A função SHALL negar (raise exception) a chamada se `get_my_role() <> 'platform_admin'` e `p_brokerage_id <> get_my_brokerage_id()` — evita que qualquer usuário autenticado consulte a contagem de uma corretora que não é a sua, mesmo sendo só um número.

### Requirement 2: Card "Usuários ativos" no detalhe da corretora

**User Story:** Como platform_admin, quero ver a contagem de usuários ativos ao abrir o detalhe de uma corretora, sem precisar navegar pra outro lugar.

#### Acceptance Criteria

1. `brokerage-detail-drawer.tsx` SHALL ganhar um card "Usuários ativos" mostrando só o número (`N usuários ativos`), sem nome/e-mail/perfil de ninguém.
2. O card SHALL ter seu próprio estado de loading (skeleton) e erro, independente do restante dos dados da corretora.

### Requirement 3: Backlog documentado pra KPI completo de plano

**User Story:** Como usuário do sistema, quero que a ideia de "uso do plano" (contagem vs. limite) não se perca, mesmo sem implementar agora.

#### Acceptance Criteria

1. `docs/product/roadmap.md` SHALL ganhar uma entrada descrevendo o KPI "X de Y usuários (conforme o plano)" com barra de progresso, referenciando esta spec e o protótipo aprovado (opção 4 do artifact `Detalhe Corretora`), a ser feito junto da feature de planos.
