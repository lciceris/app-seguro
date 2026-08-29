# Design Document — insurer-detail-drawer-header

Espelha `brokerage-detail-drawer.tsx` linha por linha, trocando `borderColor: brokerage.primary_color` (inline, dinâmico por corretora) por `border-primary` (classe, token do tema — seguradora não tem cor própria).

```tsx
<SheetHeader>
  <div className="flex items-center gap-3">
    {!isLoading && insurer && (
      <>
        {insurer.logo_url ? (
          <img
            src={insurer.logo_url}
            alt={insurer.name}
            className="h-10 w-10 shrink-0 rounded-full border-[3px] border-primary object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-primary bg-muted text-sm font-semibold text-muted-foreground">
            {insurer.name.charAt(0).toUpperCase()}
          </div>
        )}
      </>
    )}
    <div className="flex flex-col gap-0.5">
      <SheetTitle>
        {isLoading ? <Skeleton className="h-6 w-40" /> : (insurer?.name ?? "Detalhe da seguradora")}
      </SheetTitle>
      {!isLoading && insurer && <p className="text-xs text-muted-foreground">Detalhe da seguradora</p>}
    </div>
  </div>
</SheetHeader>
```

Cards do corpo: cada `<div className="flex flex-col gap-4 ...">` interno vira um `grid grid-cols-2 gap-x-6 gap-y-4` (igual `brokerage-detail-drawer`), com `Website`/`Observações`/`Nome do contato` em `col-span-2` quando fizer sentido (texto potencialmente longo). Card "Identificação" perde o `<img>` solto (Requirement 1.2) — o logo já está no header.

## Testing Strategy

- `tsc`/`eslint`/`vitest run` completos (sem teste de componente pra essa tela hoje, nada a ajustar).
- Verificação visual via Playwright: avatar aparece no header (logo e fallback de inicial), campos organizados em 2 colunas, nada quebra em loading/erro.
