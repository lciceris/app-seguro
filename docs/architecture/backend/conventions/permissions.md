# Permissões — Matriz de Recursos × Perfis

> O que cada perfil pode fazer em cada recurso. A aplicação real desse limite é via RLS (ver [`rls.md`](rls.md)) — esta matriz é a referência de intenção, tanto para as policies quanto para a visibilidade no frontend.

| Recurso | `platform_admin` | `brokerage_admin` | `supervisor` | `seller` | `analyst` | `viewer` |
|---|---|---|---|---|---|---|
| Seguradoras (global) | CRUD | Leitura | Leitura | Leitura | Leitura | Leitura |
| Planos (global) | CRUD | Leitura | Leitura | — | — | — |
| Usuários (da própria corretora) | CRUD | CRUD | Leitura | — | — | — |
| Clientes | CRUD (só sua corretora) | CRUD | Leitura total da corretora | CRUD só os seus (via vínculo vendedor-cliente) | Leitura | Leitura |
| Veículos | CRUD (só sua corretora) | CRUD | Leitura total da corretora | CRUD nos seus clientes | Leitura | Leitura |
| Cotações | CRUD (só sua corretora) | CRUD | Leitura total da corretora | Cria e acompanha as suas | Assume, orça, negocia, apresenta | Leitura |
| Retorno de seguradoras por cotação | — | Gerencia | Leitura | Leitura (visão simplificada por status) | CRUD durante a negociação | Leitura |
| Apólices | CRUD (só sua corretora) | CRUD | Leitura total da corretora | Leitura das suas | Leitura | Leitura |

`platform_admin` nunca tem acesso cross-tenant — "só sua corretora" acima se refere à corretora âncora da própria plataforma, isolada como qualquer outra (ver [ADR 001](../adr/001-multitenancy.md)). O que muda para esse perfil é o acesso às tabelas **globais** (seguradoras, planos), não um bypass de RLS.
