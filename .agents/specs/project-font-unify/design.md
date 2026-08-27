# Design Document — project-font-unify

## Sidebar — gap entre itens

`SidebarMenu` (primitivo shadcn) tem `gap-0` fixo no seu variant base. `app-sidebar.tsx` passa `className="gap-1.5"` na instância — `cn()` do componente faz o merge e o `gap-1.5` (6px) substitui o `gap-0` (mesmo grupo de utilitário, twMerge resolve sozinho):

```diff
-<SidebarMenu>
+<SidebarMenu className="gap-1.5">
```

## Fonte única — `globals.css`

Remove o import do Inter, o token `--font-data` e a regra `table { font-family: var(--font-data) }` — sem essa regra, `<table>` volta a herdar `font-sans` (Plus Jakarta Sans) de `html`, igual a todo o resto do app. `grep` confirmou que `--font-data`/`font-data` não era usado como classe em nenhum componente, só nessa regra — nada mais pra ajustar.

```diff
 @import "@fontsource-variable/plus-jakarta-sans";
-@import "@fontsource-variable/inter";
 @import "@fontsource/ibm-plex-mono/400.css";
```

```diff
 --font-sans: 'Plus Jakarta Sans Variable', system-ui, -apple-system, sans-serif;
-  --font-data: 'Inter Variable', system-ui, sans-serif;
 --font-mono-data: 'IBM Plex Mono', ui-monospace, 'SF Mono', monospace;
```

```diff
-  /* Tabelas e dados numéricos usam Inter */
-  table {
-    font-family: var(--font-data);
-  }
-
   button {
```

`@fontsource-variable/inter` removido via `npm uninstall` (deixaria de ser usado por completo).

`font-mono-data` (IBM Plex Mono) não muda — é usado deliberadamente via `className="font-mono-data"` em células de dado técnico, convenção separada da fonte de UI geral.

`docs/dev/ui-guidelines.md` atualizado pra refletir a fonte única, com nota histórica de que o corpo/tabela usava Inter antes dessa spec.

## Testing Strategy

- `tsc`/`eslint`/`vitest run` completos.
- Verificação visual via Playwright: gap real (>0) entre itens da sidebar via `boundingBox`; uma tela com tabela (ex. Corretoras) confirmando `font-family` computado = Plus Jakarta Sans, não mais Inter.
