# Backend — Documentação de Arquitetura

Documentação de arquitetura do backend, escrita antes da implementação (SDD), seguindo o mesmo modelo do [`../frontend/`](../frontend/README.md):

- **`adr/`** — decisões arquiteturais (contexto, decisão, justificativa, alternativas, consequências). Sem exemplos de código, checklist ou tutorial.
- **`conventions/`** — regras permanentes (padrão de policy RLS, convenção de Edge Function, estrutura de storage).
- **`guides/`** — documentos operacionais (ex. como criar uma tabela nova com RLS, como criar uma Edge Function).
- **`diagrams/`** — fluxos visuais (auth/JWT, request flow).

Esta pasta absorve o conteúdo que hoje está espalhado em `docs/architecture/multitenancy.md`, `permissions.md` e `security.md` (stubs vazios) — esses arquivos serão marcados como deprecated conforme cada assunto for formalizado aqui, não todos de uma vez.

## Existente

| Documento | Conteúdo |
|---|---|
| [`adr/001-multitenancy.md`](adr/001-multitenancy.md) | Banco compartilhado + RLS por `brokerage_id`, vs. schema/DB-per-tenant e filtro em aplicação |
| [`adr/002-security-definer-rls.md`](adr/002-security-definer-rls.md) | Por que `SECURITY DEFINER` evita recursão em RLS, vs. claims no JWT e desabilitar RLS |
| [`conventions/rls.md`](conventions/rls.md) | Padrão de policy, exceções, checklist de tabela nova, RLS-nega-é-invisível, RLS vs. frontend |
| [`conventions/permissions.md`](conventions/permissions.md) | Matriz de recursos × perfis (o que cada `role` pode fazer) |
| [`diagrams/auth-flow.md`](diagrams/auth-flow.md) | Login, requisição autenticada, refresh, logout |
| [`adr/003-edge-functions-scope.md`](adr/003-edge-functions-scope.md) | Por que Edge Functions só para operações que exigem service role |
| [`conventions/edge-functions.md`](conventions/edge-functions.md) | Inventário real (`invite-user`, `delete-user`, `update-user-password`) + invocação/resposta |
| [`conventions/storage.md`](conventions/storage.md) | 3 buckets, público vs. privado, convenção de path |
| [`conventions/external-integrations.md`](conventions/external-integrations.md) | BrasilAPI, ViaCEP, SMTP/Resend, variáveis de ambiente |

## Sequência proposta — concluída ✅

1. ~~Multitenancy~~ (`adr/001-multitenancy.md`)
2. ~~RLS — padrão e SECURITY DEFINER~~ (`adr/002-security-definer-rls.md` + `conventions/rls.md`)
3. ~~Permissões~~ (`conventions/permissions.md`)
4. ~~Auth flow~~ (`diagrams/auth-flow.md`)
5. ~~Edge Functions~~ (`adr/003-edge-functions-scope.md` + `conventions/edge-functions.md`)
6. ~~Storage~~ (`conventions/storage.md`)
7. ~~Integrações externas e config~~ (`conventions/external-integrations.md`)

`docs/dev/setup.md` **não** foi deprecado — seu escopo (configurar o ambiente de dev local) é mais amplo do que a configuração de infra coberta aqui, ainda tem conteúdo próprio a escrever quando chegar a vez.

`docs/dev/edge-functions.md` já marcado como deprecated. `docs/dev/setup.md` provavelmente fica redundante quando chegarmos no item 7 — aviso quando chegar lá. O guia operacional de criar/deployar uma função (`backend/guides/`) fica para quando surgir necessidade concreta, mesmo critério usado no frontend.
