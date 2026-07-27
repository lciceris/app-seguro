# Edge Functions

> Quando criar uma Edge Function, ver [ADR 003](../adr/003-edge-functions-scope.md). Aqui: o inventário real e a convenção de invocação/resposta.

## Inventário

| Função | Ação | Payload |
|---|---|---|
| `invite-user` | Cria usuário no Supabase Auth + insere em `users` + envia convite por email | `{ full_name, email, phone, role, brokerage_id, password }` |
| `delete-user` | Remove um usuário (Auth + limpeza da linha em `users`) | `{ user_id }` |
| `update-user-password` | Reseta a senha de outro usuário | `{ user_id, new_password }` |

Uma versão antiga da documentação do `fleet-auth-gate` (`CLAUDE.md`) descrevia uma função única `manage-user` com um parâmetro `action` (`update_password` \| `delete_user`) — isso nunca existiu de verdade; são 2 funções separadas (`delete-user` e `update-user-password`). Mantemos como 2 funções distintas aqui.

## Convenção de invocação

```ts
const { data, error } = await supabase.functions.invoke("invite-user", {
  body: { full_name, email, phone, role, brokerage_id, password },
});
```

## Convenção de resposta

- **Sucesso** — retorna o dado relevante (ex. o usuário criado) ou `{ success: true }` quando não há dado a retornar.
- **Erro** — a função retorna um erro tratável; o frontend usa um helper compartilhado (`shared/utils` — ver `folder-structure.md` do frontend) para extrair uma mensagem legível do erro do Supabase Functions, em vez de mostrar o erro bruto ao usuário.
