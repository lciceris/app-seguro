# Design Document — drawer-layout-refinements

## Overview

O truque de "furar" o container centralizado (`relative left-1/2 w-screen -translate-x-1/2`) continua existindo em `SheetHeader`/`SheetFooter` — ele já funciona independente da largura do pai, então não precisa mudar. O que muda: (1) o container centralizado do `SheetContent` deixa de ter `max-w` (vira largura total — o corpo, que não fura, herda essa largura total naturalmente); (2) `SheetHeader`/`SheetFooter` ganham um wrapper interno `mx-auto max-w-[...]` por dentro do furo, pra recentralizar só o *conteúdo*; (3) cada um dos 25 drawers ganha o mesmo wrapper interno ao redor dos campos, dentro do elemento que rola.

Precisa de acesso ao `size` (`md`/`lg`) dentro de `SheetHeader`/`SheetFooter` — hoje só existe um contexto booleano (`SheetIsCenteredBodyContext`). Vira um contexto com o valor de `size`.

## Components and Interfaces

### `sheet.tsx`

```tsx
const SheetCenteredBodyContext = React.createContext<keyof typeof SHEET_CONTENT_SIZES | null>(null);
```

`SheetContent` (side="bottom"): wrapper perde `mx-auto` e `SHEET_CONTENT_SIZES[size]`, provider passa `size` em vez de `true`:

```tsx
<SheetCenteredBodyContext.Provider value={size}>
  <div className={cn("relative flex h-full min-h-0 w-full flex-1 flex-col gap-4", className)}>
    {children}
  </div>
  {closeButton}
</SheetCenteredBodyContext.Provider>
```

`SheetHeader`:

```tsx
function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  const size = React.useContext(SheetCenteredBodyContext);
  const header = (
    <div data-slot="sheet-header" className={cn("flex flex-col gap-0.5 p-4", className)} {...props} />
  );
  if (size === null) return header;
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 border-b border-border bg-card">
      <div className={cn("mx-auto w-full", SHEET_CONTENT_SIZES[size])}>{header}</div>
    </div>
  );
}
```

(Adiciona `border-b border-border bg-card` na barra — hoje o header não tem fundo/borda próprios, fica "pendurado" sobre o corpo; com o corpo ganhando `bg-background`, o header precisa de um fundo explícito pra continuar branco/destacado. Confirmar visualmente no screenshot da Task de verificação.)

`SheetFooter`:

```tsx
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  const size = React.useContext(SheetCenteredBodyContext);
  if (size === null) {
    return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
  }
  return (
    <div className="relative left-1/2 mt-auto w-screen -translate-x-1/2 border-t border-border bg-card">
      <div className={cn("mx-auto flex w-full flex-col gap-2 p-4", SHEET_CONTENT_SIZES[size], className)} {...props} />
    </div>
  );
}
```

`border-t border-border bg-card` sai do `className` de cada um dos 25 call-sites (agora embutido) — os 25 arquivos passam a passar só o alinhamento (`flex-row justify-end` ou `flex-row items-center justify-between`).

### Os 25 drawers — corpo

Padrão antes (ex. `create-brokerage-drawer.tsx`):

```tsx
<form
  id="create-brokerage-form"
  onSubmit={handleSubmit(onSubmit)}
  className="flex flex-1 flex-col gap-4 overflow-y-auto p-5"
>
  <div className="... seção 1 ...">...</div>
  <div className="... seção 2 ...">...</div>
</form>
```

Depois:

```tsx
<form
  id="create-brokerage-form"
  onSubmit={handleSubmit(onSubmit)}
  className="flex-1 min-h-0 overflow-y-auto bg-background"
>
  <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-5">
    <div className="... seção 1 ...">...</div>
    <div className="... seção 2 ...">...</div>
  </div>
</form>
```

`max-w-[720px]` nos 22 drawers de cadastro/edição (`size` padrão, `md`); `max-w-[1000px]` nos drawers de detalhe que usam `size="lg"` (`brokerage-detail-drawer`, `client-detail-drawer`, `insurer-detail-drawer`, `policy-detail-drawer`, `user-detail-drawer`, `vehicle-detail-drawer`, `policy-endorsement-detail-drawer` — confirmar cada um via grep de `size="lg"` antes de editar).

Arquivos com 2 ocorrências do wrapper de corpo (loading-skeleton + form real, ex. `edit-brokerage-drawer.tsx`) recebem o wrapper interno nas duas.

## Testing Strategy

- Mesma abordagem das specs anteriores: nenhum teste novo (mudança de estrutura visual, não de comportamento); rodar a suíte completa; screenshot real de 1 drawer md e 1 lg confirmando o alinhamento.
- Atenção especial ao `id`/`form` attribute dos botões de submit no rodapé — como o `<form>` continua sendo o mesmo elemento (só muda className/filhos), o `form="create-brokerage-form"` no botão do `SheetFooter` continua funcionando sem mudança.
