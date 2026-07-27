# ADR 001 — Multitenancy: banco compartilhado com isolamento por `brokerage_id`

**Data:** 2026-07-27
**Status:** Aceito

**Contexto:** Cada corretora de seguros de frotas que usa a plataforma é um tenant. Múltiplas corretoras coexistem no mesmo sistema, cada uma só deve ver seus próprios clientes, veículos, cotações e apólices.

**Problema:** Como isolar os dados entre corretoras de forma confiável, mantendo a plataforma simples de operar e barata de escalar (a adição de uma corretora nova não pode exigir provisionar infraestrutura dedicada)?

**Decisão:** Banco de dados único, schema único, isolamento em nível de linha (row-level) via coluna `brokerage_id` presente em toda tabela operacional, reforçado por Row Level Security do Postgres — não por filtro manual em cada query do frontend/backend.

**Justificativa:**
- Simplicidade operacional: uma única instância Supabase, uma migration aplicada a todos os tenants de uma vez, sem infraestrutura por cliente.
- RLS aplica o isolamento no nível do banco — não depende de toda query lembrar de filtrar por `brokerage_id` manualmente. Uma query sem o filtro não vaza dado: a policy simplesmente não retorna as linhas de outra corretora.
- Custo de infraestrutura não cresce linearmente com o número de corretoras — uma corretora nova é uma linha na tabela `brokerages`, não um banco ou schema novo.

**Alternativas consideradas:**
- *Schema-per-tenant* (um schema Postgres por corretora) — isola melhor, mas exige aplicar migrations N vezes (uma por schema), dificulta queries agregadas entre tenants (necessárias para o `platform_admin`), e não escala bem além de algumas dezenas de tenants sem tooling adicional.
- *Database-per-tenant* — isolamento ainda mais forte, mas custo de infraestrutura cresce linearmente com o número de clientes — inviável para o modelo de negócio (corretoras pequenas/médias, plano de entrada barato).
- *Filtro em nível de aplicação* (sem RLS — cada query filtra manualmente por `brokerage_id`) — mais simples de implementar à primeira vista, mas uma única query/endpoint esquecido sem o filtro vaza dado entre corretoras. Falha de forma insegura (mostra dado errado silenciosamente) em vez de falhar de forma segura (RLS não retorna nada).

**Consequências:**
- Toda tabela operacional nova precisa de `brokerage_id uuid not null references brokerages(id)`, RLS habilitado e policies seguindo o padrão base — ver documento de RLS (a ser escrito).
- `brokerage_id` nunca vem do formulário/frontend — sempre da sessão do usuário autenticado, nunca como campo editável.
- Tabelas verdadeiramente globais, que não pertencem a nenhuma corretora (ex. seguradoras, planos), não têm `brokerage_id` — são geridas globalmente pelo `platform_admin`, não pelo dono de uma corretora específica.
- O perfil `platform_admin` precisa existir dentro do mesmo modelo de isolamento (sem bypass cross-tenant) — como isso é modelado exatamente fica para quando o schema for desenhado, não é parte desta decisão.
