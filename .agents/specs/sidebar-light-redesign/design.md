# Design Document — sidebar-light-redesign

## Overview

Duas frentes: (1) tokens `--sidebar-*` em `globals.css` viram claros; (2) `app-sidebar.tsx` ganha header centralizado e override do item ativo pra usar `primary` dinâmico em vez do `--sidebar-accent` compartilhado com o hover.

## 1. Tokens (`src/styles/globals.css`)

```diff
-    --sidebar: #0F172A;
-    --sidebar-foreground: #94A3B8;
-    --sidebar-primary: #1E293B;
-    --sidebar-primary-foreground: #F8FAFC;
-    --sidebar-accent: #1E293B;
-    --sidebar-accent-foreground: #F8FAFC;
-    --sidebar-border: #1E293B;
+    --sidebar: #FFFFFF;
+    --sidebar-foreground: #475569;
+    --sidebar-primary: #F8FAFC;
+    --sidebar-primary-foreground: #0F172A;
+    --sidebar-accent: #F8FAFC;
+    --sidebar-accent-foreground: #0F172A;
+    --sidebar-border: #E2E8F0;
     --sidebar-ring: #4F46E5;
```

`--sidebar-primary`/`--sidebar-primary-foreground` não são usados por nenhum componente hoje (grep confirmou — só declarados), mas ficam coerentes com o resto pra não deixar um valor órfão escuro perdido no meio dos tokens claros.

## 2. Por que o item ativo não pode só herdar `--sidebar-accent`

`sidebar.tsx` (`sidebarMenuButtonVariants`) usa a **mesma** variável pro hover e pro estado ativo:

```
hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-active:font-medium
```

Como a Requirement 3 pede que o ativo use a cor dinâmica da corretora (`primary`) e o hover normal continue neutro (`slate-50`), as duas cores precisam ser diferentes — não dá pra resolver só trocando o valor do token compartilhado.

Fizemos o teste de sobrescrever via `className` (`data-active:bg-primary/10`): funciona só se o Tailwind Merge remover a classe conflitante do variant base, o que depende de `data-active:` gerar o mesmo "grupo" de merge — funcionou nos testes manuais, mas para não depender da sutileza de precedência entre `data-active:` e `hover:` (podem ter especificidade CSS igual e a ordem no stylesheet gerado não é garantida pela ordem do JSX), usamos utilitários `!important` do Tailwind v4 (prefixo `!`) só no item ativo — `!important` sempre vence independente de ordem/especificidade, e é exatamente o caso de uso recomendado pra essa sobreposição pontual de um variant de terceiro (o componente `Sidebar` é primitivo shadcn, não deve ser reescrito por causa de 1 tela).

```tsx
const active = isItemActive(location.pathname, item.to);

<SidebarMenuButton asChild isActive={active} className={active ? "!bg-primary/10 !text-primary" : undefined}>
```

`bg-primary/10`/`text-primary` já existem como utilitários Tailwind (`--color-primary: var(--primary)` registrado em `@theme inline`) — computam a partir da variável `--primary` setada em runtime pela cor da corretora, atendendo a Requirement 3.1 sem hex fixo.

## 3. Header (`SidebarHeader`)

```diff
-      <SidebarHeader className="px-2 py-3">
-        <div className="flex items-center gap-2 px-2">
+      <SidebarHeader className="border-b border-sidebar-border px-3 pt-5 pb-4">
+        <div className="flex flex-col items-center gap-2 text-center">
           {usuario.logo_url ? (
             <img
               src={usuario.logo_url}
               alt={usuario.brokerage_name ?? "Corretora"}
-              className="h-7 w-7 rounded-md object-cover"
+              className="h-9 w-9 rounded-lg border-2 border-primary object-cover"
             />
           ) : (
-            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
+            <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-primary bg-sidebar-accent text-sm font-bold text-foreground">
               {(usuario.brokerage_name ?? "C").charAt(0).toUpperCase()}
             </div>
           )}
-          <span className="truncate text-sm font-semibold text-sidebar-foreground">
+          <span className="max-w-full truncate text-sm font-semibold text-foreground">
             {usuario.brokerage_name ?? "Corretora"}
           </span>
         </div>
       </SidebarHeader>
```

Nome da corretora usa `text-foreground` (não `text-sidebar-foreground`, que agora é o cinza mais claro dos itens) pra ficar com contraste de título (`slate-900`), igual ao resto do app.

## 4. Grupos (`SidebarGroupLabel`)

```diff
-{group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
+{group.label && (
+  <SidebarGroupLabel className="mt-4 mb-0.5 h-auto px-3 py-1.5 text-[10.5px] font-bold tracking-wider text-sidebar-foreground/60 uppercase">
+    {group.label}
+  </SidebarGroupLabel>
+)}
```

## Testing Strategy

- `tsc`/`eslint`/`vitest` completos.
- Verificação visual via Playwright (usuário real): fundo branco, borda direita, hover neutro no item não-ativo, header centralizado com logo/borda.
- **Achado no processo:** `--primary` hoje nunca é setado em runtime a partir de `brokerage.primary_color` (grep confirmou — só `brokerage-detail-drawer.tsx` lê o campo, via `style={{ borderColor: ... }}` local, não como CSS var global). É uma lacuna pré-existente em todo o app — `Button`/`Badge` já usam `bg-primary` do mesmo jeito estático hoje. Por isso a verificação confirma que o item ativo lê de `var(--primary)` (não um hex fixo, via `bg-primary/10`/`text-primary`), mas não há como testar cores diferentes por corretora até essa outra spec (fora de escopo aqui) existir.
