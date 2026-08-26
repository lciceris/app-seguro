# Design Document — drawer-size-table-font

## Overview

Duas mudanças mecânicas, sem impacto estrutural: trocar/adicionar/remover o prop `size` em 6 `<SheetContent>`, e trocar uma classe Tailwind em `table.tsx`.

## Components and Interfaces

### 1. `size` do `SheetContent`

```diff
# quotation-insurer-drawer.tsx / quotation-vehicle-coverage-drawer.tsx
- <SheetContent>
+ <SheetContent size="lg">
```

```diff
# brokerage-detail-drawer.tsx / user-detail-drawer.tsx / insurer-detail-drawer.tsx / vehicle-detail-drawer.tsx
- <SheetContent size="lg">
+ <SheetContent>
```

`client-detail-drawer.tsx` e `policy-detail-drawer.tsx` não mudam (já são `size="lg"`).

### 2. `table.tsx`

```diff
 function Table({ className, ...props }: React.ComponentProps<"table">) {
   return (
     ...
         className={cn("w-full text-[12.5px] text-foreground", className)}
```
vira
```diff
         className={cn("w-full text-sm text-foreground", className)}
```

`TableHead` mantém `text-[10.5px]` — categoria visual distinta (rótulo, não dado).

## Testing Strategy

- Nenhum teste de componente novo — mudança de prop/classe, sem alteração de comportamento.
- Rodar suíte completa (`vitest run`).
- Verificação visual real (Playwright efêmero): 1 screenshot de um drawer que ficou maior (`quotation-insurer-drawer`), 1 que ficou menor (`brokerage-detail-drawer`), 1 listagem confirmando a fonte maior na tabela.
