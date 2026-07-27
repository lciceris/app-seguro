# ADR 002 — Funções SECURITY DEFINER para evitar recursão em RLS

**Data:** 2026-07-27
**Status:** Aceito

**Contexto:** As policies de RLS (ver [ADR 001](001-multitenancy.md)) precisam saber o `brokerage_id` e o `role` do usuário autenticado para decidir o que ele pode ver. Esse dado mora na própria tabela `users` — que também tem RLS habilitado.

**Problema:** Se uma policy de RLS resolve "qual é o meu `brokerage_id`?" fazendo uma subquery direta em `users`, essa subquery também é avaliada sob a RLS de `users` — que por sua vez pode precisar checar o próprio `users` de novo para decidir o que aquele usuário pode ver ali. O Postgres detecta essa recursão e falha.

**Decisão:** Toda leitura de "meu role" / "meu `brokerage_id`" dentro de uma policy passa por uma função SQL `SECURITY DEFINER` (`get_my_role()`, `get_my_brokerage_id()`) — nunca por uma subquery direta em `users` dentro da policy. `SECURITY DEFINER` faz a função rodar com o privilégio de quem a criou, não do usuário que a chamou, o que faz a leitura interna em `users` ignorar a RLS e quebrar a cadeia de recursão.

**Justificativa:**
- É o padrão estabelecido pelo próprio Postgres/Supabase para esse problema — não é uma solução improvisada.
- Mantém RLS como o único mecanismo de isolamento (ver ADR 001) — não exige desabilitar RLS em `users` nem duplicar a checagem de tenant na aplicação.
- Centraliza a lógica de "quem sou eu" em um único lugar (as funções), em vez de repetir a mesma subquery em toda policy de toda tabela.

**Alternativas consideradas:**
- *Subquery direta em `users` dentro de cada policy* — é exatamente o que causa a recursão descrita acima; inviável.
- *Claims customizadas no JWT* (role/brokerage_id embutidos no token via auth hook, sem consultar a tabela) — evita a recursão por completo, mas o dado fica desatualizado até o token ser renovado (ex. mudança de role não reflete até o próximo refresh), e exige configurar hooks de auth adicionais. Não foi o padrão usado no projeto original, e a atualização em tempo real (troca de role/corretora refletir imediatamente) pesa mais aqui do que a simplicidade de não ter as funções.
- *Desabilitar RLS em `users` e checar tenant na aplicação* — reabre exatamente o risco que a ADR 001 buscou eliminar (uma query esquecida vaza dado).

**Consequências:**
- As funções (`get_my_role()`, `get_my_brokerage_id()`, e outras que surgirem no mesmo padrão) precisam ter o `search_path` fixado explicitamente na definição — uma função `SECURITY DEFINER` sem isso é vulnerável a um ataque de search path injection.
- O padrão de policy e o checklist de tabela nova (que dependem dessas funções) ficam em [`conventions/rls.md`](../conventions/rls.md).
- As definições SQL reais dessas funções são implementação — vão para uma migration em `supabase/migrations/` e para `docs/database/functions.md` quando o schema for desenhado, não fazem parte desta decisão.
