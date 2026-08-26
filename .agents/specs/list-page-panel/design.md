# Design Document — list-page-panel

## Overview

Duas mudanças independentes: (1) 2 classes no primitivo `Table` (1 arquivo, afeta as 7 telas de uma vez); (2) 1 `<div>` novo envolvendo o conteúdo de cada uma das 7 telas de listagem (sweep mecânico, mesmo modelo das specs anteriores).

## Components and Interfaces

### 1. `table.tsx`

```diff
 function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
-  return <thead data-slot="table-header" className={cn("bg-muted", className)} {...props} />;
+  return <thead data-slot="table-header" className={cn("bg-[#E9EDF2]", className)} {...props} />;
 }
```

```diff
 function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
   return (
     <tr
       data-slot="table-row"
-      className={cn("border-b border-border last:border-0 hover:bg-muted/50", className)}
+      className={cn("border-b border-border last:border-0 hover:bg-background/30", className)}
       {...props}
     />
   );
 }
```

`bg-[#E9EDF2]` é valor arbitrário — a cor foi validada visualmente com o usuário via protótipo (2 rodadas de ajuste), não corresponde a nenhum token/tom Tailwind existente. `hover:bg-background/30` reaproveita o token `--background` (`#F1F5F9`) já existente via opacidade, sem criar token novo.

### 2. As 7 telas de listagem

Sweep mecânico: envolver o conteúdo (cabeçalho + busca/filtro + `Table`) num `<div>` novo, entre o `<div className="p-6">` externo e o `<Outlet />`/diálogos:

```diff
 <div className="p-6">
+  <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
     <div className="mb-4 flex items-center justify-between">
       {/* título + contador + botão */}
     </div>

     <div className="mb-4 relative max-w-sm">
       {/* busca */}
     </div>

     <Table>...</Table>
+  </div>

   <Outlet />
   <DeactivateConfirmDialog ... />
 </div>
```

Nas telas com filtro adicional (`Select` de status em `quotations`/`policies`), o `Select` fica no mesmo `<div className="mb-4 flex items-center gap-3">` da busca, já dentro do novo painel — sem mudança de estrutura interna desse bloco.

## Testing Strategy

- Nenhum teste de componente novo — mudança de classe CSS e um wrapper `<div>`, sem alteração de comportamento, texto ou dado exibido.
- Rodar a suíte completa (`vitest run`) — nenhum teste deveria depender de classe CSS ou da ausência do novo wrapper.
- Verificação visual real (Playwright efêmero): screenshot de Corretoras (tela de validação) comparando com o mix aprovado no artifact, mais 1-2 outras listagens pra confirmar o sweep.
