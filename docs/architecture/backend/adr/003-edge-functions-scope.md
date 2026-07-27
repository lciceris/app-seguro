# ADR 003 — Edge Functions apenas para operações que exigem service role

**Data:** 2026-07-27
**Status:** Aceito

**Contexto:** A maioria das operações da aplicação passa direto do cliente para o PostgREST, protegida por RLS (ver [ADR 001](001-multitenancy.md)). Algumas operações, porém — criar um usuário no Supabase Auth, deletar um usuário, resetar a senha de outro usuário — exigem privilégios da API Admin do Supabase, que não estão disponíveis para um usuário autenticado comum e não são cobertos por RLS (RLS controla acesso a linhas de tabela, não operações do serviço de Auth em si).

**Problema:** Onde rodar essas operações privilegiadas sem expor a chave de service role no cliente?

**Decisão:** Edge Functions são usadas exclusivamente para operações que exigem a service role key / API Admin do Supabase. Toda outra lógica de negócio permanece como chamada direta do cliente ao Supabase, protegida por RLS — não criamos uma Edge Function como atalho de conveniência para algo que RLS já resolve.

**Justificativa:**
- A service role key nunca pode ser exposta no frontend — ela bypassa toda RLS. A única forma segura de usá-la é num ambiente server-side controlado, que é exatamente o que uma Edge Function é.
- Criar uma Edge Function para toda operação, mesmo as que RLS já cobre, adicionaria latência (cold start, uma chamada de rede a mais) e um servidor implícito para manter — contradizendo a decisão de não ter um backend customizado (ver [ADR 001 do frontend](../../frontend/adr/001-spa-react-router-v7.md)).

**Alternativas consideradas:**
- *Backend customizado (Node/Express)* — reintroduziria exatamente a infraestrutura que a arquitetura SPA + Supabase evita.
- *Expor a service role key no frontend* — bypassa toda RLS; um bug ou vazamento de código comprometeria o isolamento entre todas as corretoras de uma vez. Descartado sem ressalva.
- *Reset de senha/delete de usuário via API client-side comum* — não é possível; essas operações exigem privilégio de Admin que só a service role tem.

**Consequências:**
- Toda nova Edge Function precisa justificar por que a operação não pode ser feita via RLS antes de ser criada.
- O inventário real das funções existentes e a convenção de invocação ficam em [`conventions/edge-functions.md`](../conventions/edge-functions.md).
