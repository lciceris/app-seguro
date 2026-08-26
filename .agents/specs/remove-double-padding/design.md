# Design Document — remove-double-padding

## Overview

Sweep mecânico em 10 arquivos: trocar `<div className="p-6">...</div>` por `<>...</>` no topo do `return` de cada screen. Sem outra mudança.

```diff
 return (
-  <div className="p-6">
+  <>
     ...
-  </div>
+  </>
 );
```

## Testing Strategy

- Nenhum teste de componente/comportamento afetado — é só uma troca de tag de agrupamento (`div` → Fragment), sem efeito em render/lógica.
- Verificação visual real (Playwright): medir o offset do painel/conteúdo em relação ao `<main>` mais interno (`app-shell.tsx`) e confirmar que bate com o `p-6` (24px) sozinho, sem duplicação. Atenção: `SidebarInset` (shadcn) também é um `<main>`, então existem dois `<main>` aninhados no DOM — a medição precisa mirar o `<main>` de `app-shell.tsx`, não o primeiro `<main>` do documento.
