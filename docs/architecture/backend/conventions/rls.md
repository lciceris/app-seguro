# RLS — Padrão de Policy

> Como escrever as policies de RLS. Para o porquê de usar funções `SECURITY DEFINER`, ver [ADR 002](../adr/002-security-definer-rls.md). Para a estratégia geral de isolamento, ver [ADR 001](../adr/001-multitenancy.md).

## Padrão base

Toda tabela operacional segue a mesma regra, sem exceção por perfil:

```
brokerage_id = get_my_brokerage_id()
```

`platform_admin` **não** tem bypass cross-tenant — é isolado como qualquer outra corretora (a corretora "Plataforma"). Não há exceção por role no padrão base.

## Exceções ao padrão

- **Tabelas globais** (não pertencem a nenhuma corretora — ex. seguradoras, planos) não têm `brokerage_id` e não seguem este padrão; são geridas globalmente.
- **Auto-acesso** — a tabela de usuários permite que cada usuário veja/edite a própria linha, além da regra de `brokerage_id`.
- **Acesso via tabela de junção** — quando o acesso de um perfil a um recurso passa por uma relação N:N (ex. um vendedor só vê os clientes associados a ele), a policy verifica a junção, não só o `brokerage_id`.

## Checklist ao criar uma tabela nova

1. `brokerage_id uuid not null references brokerages(id)` (a menos que seja uma tabela global — ver acima).
2. `ALTER TABLE nome ENABLE ROW LEVEL SECURITY`.
3. Policies de SELECT, INSERT, UPDATE seguindo o padrão base (ou a exceção aplicável).
4. Índice em `brokerage_id`.
5. Trigger `set_updated_at`.

## Comportamento: linha negada é invisível, não é erro

Uma query bloqueada pela RLS não lança erro — simplesmente não retorna a linha. Isso significa que "não existe" e "existe mas não tenho acesso" são indistinguíveis do ponto de vista da query. O frontend deve tratar os dois casos da mesma forma (ex. tela de "não encontrado"), nunca assumir que ausência de erro significa que o dado não existe.

## O que RLS garante vs. o que o frontend garante

- **RLS garante o isolamento de dados** — é a fronteira de segurança real, aplicada no banco, que não pode ser contornada por um bug no frontend.
- **O frontend só garante experiência de uso** — esconder um botão ou item de menu para um perfil sem permissão é UX, não segurança. Uma ação que o frontend não deveria permitir, mas que o usuário force via devtools/API direta, ainda precisa ser bloqueada pela RLS — nunca depender só da UI para impedir uma ação não autorizada.
