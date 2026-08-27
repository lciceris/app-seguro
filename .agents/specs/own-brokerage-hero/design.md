# Design Document — own-brokerage-hero

## Estrutura

Remove o card "Identidade visual" (linhas 393-452 do arquivo original). No lugar, um novo card entra **antes** do card "Empresa":

```tsx
<div className="flex items-center gap-5 rounded-xl border border-border bg-card p-5">
  <label className="group relative shrink-0 cursor-pointer">
    {logoPreviewUrl || getValues("logo_url") ? (
      <img
        src={logoPreviewUrl || getValues("logo_url")}
        alt="Logo"
        className="size-20 rounded-2xl border-2 border-primary bg-card object-contain p-1.5"
      />
    ) : (
      <div className="flex size-20 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 text-2xl font-bold text-primary">
        {(watch("trade_name") || watch("name") || "C").charAt(0).toUpperCase()}
      </div>
    )}
    <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
      <Upload className="size-5" />
    </span>
    <input
      ref={fileInputRef}
      type="file"
      accept="image/png,image/jpeg,image/svg+xml"
      className="hidden"
      onChange={handleLogoFile}
    />
  </label>
  {(logoPreviewUrl || getValues("logo_url")) && (
    <button
      type="button"
      onClick={handleLogoRemove}
      className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-destructive"
    >
      <X className="size-3" />
    </button>
  )}

  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
    <h2 className="truncate text-lg font-bold text-foreground">{watch("name") || "Nova corretora"}</h2>
    <p className="truncate text-sm text-muted-foreground">
      {watch("tax_id") ? `CNPJ ${watch("tax_id")}` : "CNPJ não informado"}
    </p>
  </div>

  <div className="flex shrink-0 flex-col gap-1.5">
    <Label htmlFor="primary_color" className="text-xs">Cor primária</Label>
    <Controller
      name="primary_color"
      control={control}
      render={({ field }) => (
        <ColorPicker id="primary_color" value={field.value ?? ""} onChange={field.onChange} />
      )}
    />
  </div>
</div>
```

Notas de implementação:
- `watch` precisa ser adicionado ao destructuring de `useForm` (hoje só `register, handleSubmit, control, getValues, setValue, formState`) — usado só pra exibição ao vivo (Requirement 2.1), não substitui `getValues`/`register` nos campos reais do card Empresa.
- O botão de remover fica posicionado relativo ao `label` (que vira `position: relative` via a classe `group relative`), não ao avatar sozinho, pra não quebrar o hit-target do upload.
- Ícone `Upload` (já importado) reaproveitado no overlay de hover — não precisa de ícone novo.
- `handleLogoFile`/`handleLogoRemove`/`fileInputRef`/`uploadBrokerageLogo` continuam exatamente iguais — só a marcação ao redor muda.
- Cards "Empresa"/"Endereço"/"Representante e contato" e o botão "Salvar" não mudam uma linha.

## Addendum — usar a largura da tela

Depois de aprovado, o usuário notou que a página inteira ficava presa num `max-w-2xl` (672px), sobrando muito espaço vazio à direita numa tela larga. Ajuste:

- `max-w-2xl` → `max-w-5xl` no `<form>` e nos estados de loading/erro (evita "pulo" de largura ao carregar).
- Cards "Empresa" e "Endereço" entram num `<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">` — lado a lado a partir de `lg` (1024px), empilhados abaixo disso.
- "Representante e contato" continua full-width, fora do grid (é o único bloco sem par).
- Hero não muda — ao ficar mais largo, o espaço extra vai naturalmente entre o texto (nome/CNPJ, `flex-1`) e o `ColorPicker` (`shrink-0`), sem precisar de CSS novo.

## Testing Strategy

- `tsc`/`eslint`/`vitest run` completos — não deve haver teste de componente pra essa tela hoje (grep confirma), então sem teste pra ajustar.
- Verificação visual via Playwright: sem logo (mostra inicial), clicar no avatar abre o input de arquivo (evento de click no `label`), enviar uma imagem mostra preview + botão remover, digitar no campo "Razão social" do card Empresa atualiza o nome no hero ao vivo, trocar a cor no `ColorPicker` do hero e salvar funciona igual a antes (reaproveita o fluxo já testado na spec `dynamic-primary-color`).
