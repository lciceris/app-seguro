# Design Document — user-forms-layout-and-status-badge

## `invite-user-drawer.tsx`

Ordem de campos já é Nome, E-mail, Telefone, Perfil — só remove `col-span-2 ` da div do Perfil. Grid de 2 colunas naturalmente encaixa: linha 1 = [Nome, E-mail], linha 2 = [Telefone, Perfil]. Labels: `Nome *`, `E-mail *`, `Perfil *` (Telefone sem asterisco).

## `edit-user-drawer.tsx`

Só 3 campos (sem E-mail, que não é editável). Reordena pra Nome ocupar a linha inteira e Telefone/Perfil dividirem a seguinte:

```diff
-<div className="flex flex-col gap-1.5">Nome</div>
-<div className="flex flex-col gap-1.5">Telefone</div>
-<div className="col-span-2 flex flex-col gap-1.5">Perfil</div>
+<div className="col-span-2 flex flex-col gap-1.5">Nome *</div>
+<div className="flex flex-col gap-1.5">Telefone</div>
+<div className="flex flex-col gap-1.5">Perfil *</div>
```

## `user-detail-drawer.tsx`

```diff
-<span className={user.status === "active" ? "text-sm font-medium text-success-text" : "text-sm font-medium text-neutral-text"}>
-  {user.status === "active" ? "Ativo" : "Inativo"}
-</span>
+<Badge
+  variant="outline"
+  className={user.status === "active" ? "border-transparent bg-success-bg text-success-text" : "border-transparent bg-neutral-bg text-neutral-text"}
+>
+  {user.status === "active" ? "Ativo" : "Inativo"}
+</Badge>
```

Mesma classe condicional de `users-list-screen.tsx` linha por linha — não é uma cor nova.

## Testing Strategy

- `tsc`/`eslint`/`vitest run` completos; `edit-user-drawer.test.tsx`/`invite-user-drawer.test.tsx` ajustam `getByLabelText("Nome")`/`("E-mail")` pra `"Nome *"`/`"E-mail *"`.
- Verificação visual via Playwright: Perfil ao lado de Telefone nos dois formulários, asteriscos nos labels certos, badge de status no detalhe com a mesma cor da listagem (ativo e inativo).
