# Design — drawer-pattern

## Overview

Mudança concentrada quase inteiramente em um arquivo: `src/shared/components/ui/sheet.tsx`. Os 23 drawers existentes recebem um ajuste mecânico de uma linha cada (troca de `className` por uma prop `size`, ou remoção do `className`) — nenhuma mudança de lógica, campo ou comportamento de negócio em nenhum deles.

Sem migration, sem RLS — spec puramente de frontend/design system, igual `app-shell`.

## `SheetContent` — mudanças no primitivo

### Default de `side` muda de `"right"` pra `"bottom"`

Nenhum dos 23 drawers passa `side` explicitamente hoje (todos usam o default) — só um outro consumidor do `Sheet` existe no projeto: o `Sidebar` (spec `app-shell`), na versão mobile, que passa `side="left"` **explicitamente** (vem da própria prop `side` do `Sidebar`, não do default do `SheetContent`). Trocar o default não afeta esse caso.

### Nova prop `size` — largura do container interno

```ts
const SHEET_CONTENT_SIZES = {
  md: "max-w-[720px]", // cadastro/edição — mesma largura de hoje
  lg: "max-w-[1000px]", // visualização — mesma largura de hoje
} as const;
```

`size` default `"md"` (720px — a maioria dos 23 drawers já usa esse valor hoje). Preserva exatamente a distinição já existente; essa spec não reavalia se algum drawer "deveria" ser `md` ou `lg` — só migra o valor que já está em cada um hoje pro novo mecanismo.

### Estrutura interna: container centralizado só quando `side === "bottom"`

O container centralizado (`mx-auto`, largura máxima, `flex h-full flex-col`) só entra quando a folha abre por baixo — é o caso de todo drawer de verdade (formulário/detalhe). Pra qualquer outro `side` (hoje, só o uso interno do `Sidebar` mobile, com `side="left"`), o comportamento continua sendo exatamente o de hoje: filhos direto dentro do `SheetPrimitive.Content`, sem container, `className` aplicado no elemento externo como sempre foi.

O botão de fechar (X) entra **dentro** do container centralizado quando `side === "bottom"` — assim ele alinha com a borda direita do conteúdo, não com a borda física da tela (que em telas grandes ficaria bem longe do conteúdo).

```tsx
"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { XIcon } from "lucide-react";

const SHEET_CONTENT_SIZES = {
  md: "max-w-[720px]",
  lg: "max-w-[1000px]",
} as const;

// ... Sheet, SheetTrigger, SheetClose, SheetPortal, SheetOverlay sem mudança ...

function SheetContent({
  className,
  children,
  side = "bottom",
  size = "md",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
  size?: keyof typeof SHEET_CONTENT_SIZES;
  showCloseButton?: boolean;
}) {
  const closeButton = showCloseButton && (
    <SheetPrimitive.Close data-slot="sheet-close" asChild>
      <Button variant="ghost" className="absolute top-3 right-3" size="icon-sm">
        <XIcon />
        <span className="sr-only">Close</span>
      </Button>
    </SheetPrimitive.Close>
  );

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out",
          "data-[side=bottom]:inset-x-0 data-[side=bottom]:top-4 data-[side=bottom]:bottom-0 data-[side=bottom]:rounded-t-2xl data-[side=bottom]:border-t sm:data-[side=bottom]:top-10",
          "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:sm:max-w-sm",
          "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:sm:max-w-sm",
          "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b",
          "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          "data-[side=bottom]:data-open:slide-in-from-bottom-full data-[side=bottom]:data-closed:slide-out-to-bottom-full",
          "data-[side=left]:data-open:slide-in-from-left-10 data-[side=left]:data-closed:slide-out-to-left-10",
          "data-[side=right]:data-open:slide-in-from-right-10 data-[side=right]:data-closed:slide-out-to-right-10",
          "data-[side=top]:data-open:slide-in-from-top-10 data-[side=top]:data-closed:slide-out-to-top-10",
          side !== "bottom" && className,
        )}
        {...props}
      >
        {side === "bottom" ? (
          <div
            className={cn(
              "relative mx-auto flex h-full min-h-0 w-full flex-1 flex-col gap-4",
              SHEET_CONTENT_SIZES[size],
              className,
            )}
          >
            {children}
            {closeButton}
          </div>
        ) : (
          <>
            {children}
            {closeButton}
          </>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}
```

Notas de implementação:
- `top-4`/`sm:top-10`: gap no topo em vez de altura fixa (`h-[Xvh]`) — evita os problemas de `vh` em mobile Safari (barra de endereço dinâmica) e garante altura sempre correta (`bottom-0` + `top-4` = "quase a tela toda, com uma folga no topo pra deixar claro que é uma camada por cima", ajustável depois de ver rodando).
- `rounded-t-2xl`: cantos arredondados no topo, característico de bottom sheet.
- `slide-in-from-bottom-full`/`slide-out-to-bottom-full`: desliza a partir de completamente fora da tela (distância "10" de hoje era pensada pra uma folha pequena colada na lateral — pequena demais pra uma folha que agora ocupa quase a tela toda).
- `gap-4` sai do wrapper externo (não faz sentido lá — só um filho direto hoje, o container ou o fragment) e entra no container centralizado (onde `SheetHeader`/corpo/`SheetFooter` realmente precisam de espaçamento entre si).
- Uso não-`bottom` (o `Sidebar` mobile) mantém `className` no elemento externo, exatamente como hoje — nada muda pra esse caso.

## Migração dos 23 drawers existentes

Levantamento confirma que **todos** seguem exatamente um de dois padrões, sem variação:

```tsx
<SheetContent className="flex w-full flex-col sm:max-w-[720px]">   // 17 arquivos
<SheetContent className="flex w-full flex-col sm:max-w-[1000px]">  // 6 arquivos
```

Migração mecânica, sem tocar em mais nada do arquivo:

```tsx
<SheetContent>                {/* size default "md" = 720px */}
<SheetContent size="lg">      {/* 1000px */}
```

**Arquivos com `sm:max-w-[720px]` → `<SheetContent>` sem className (17):**
`clients/create-client-drawer`, `clients/edit-client-drawer`, `brokerages/edit-brokerage-drawer`, `brokerages/create-brokerage-drawer`, `policy-endorsements/create-policy-endorsement-drawer`, `policy-endorsements/policy-endorsement-detail-drawer`, `policies/edit-policy-drawer`, `users/edit-user-drawer`, `users/invite-user-drawer`, `insurers/create-insurer-drawer`, `insurers/edit-insurer-drawer`, `vehicles/create-vehicle-drawer`, `vehicles/edit-vehicle-drawer`, `quotations/create-quotation-drawer`, `quotations/edit-quotation-drawer`, `quotations/quotation-vehicles-tab/quotation-vehicle-coverage-drawer`, `quotations/quotation-insurers-tab/quotation-insurer-drawer`.

**Arquivos com `sm:max-w-[1000px]` → `<SheetContent size="lg">` (6):**
`clients/client-detail-drawer`, `brokerages/brokerage-detail-drawer`, `policies/policy-detail-drawer`, `users/user-detail-drawer`, `insurers/insurer-detail-drawer`, `vehicles/vehicle-detail-drawer`.

(`policy-endorsement-detail-drawer`, apesar do nome, já usa 720 hoje — mantido como está; essa spec não reavalia esse valor.)

## Testes

Sem teste novo dedicado — essa é uma mudança de layout/CSS, não de comportamento. A rede de segurança é a suíte já existente:
- Os testes de componente de cada drawer (ex. `edit-policy-drawer.test.tsx`) continuam validando campo/valor/submit — nenhum deles depende da largura ou do lado que a folha abre, então continuam passando sem alteração se a migração não mexer em nada além do `className`/prop de `SheetContent`.
- As specs E2E que abrem drawers (praticamente todas) continuam validando o fluxo de ponta a ponta.
- Verificação manual em navegador real (Task 1, no primitivo) — like sempre nessa spec, confirmar visualmente antes de seguir pra migração dos 23 arquivos.
