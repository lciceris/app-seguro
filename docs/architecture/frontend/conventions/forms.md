# Forms

> Padrão de formulários: React Hook Form + Zod + integração com mutations do React Query. Para queries/mutations em si, ver [`react-query.md`](react-query.md).

## Onde vivem as peças

- **`features/<feature>/validations/`** — os schemas Zod da feature.
- **`features/<feature>/components/`** — o componente de formulário em si (ex. `quotation-form/`), incluindo drawers de criar/editar (ver [`folder-structure.md`](folder-structure.md)).
- **`features/<feature>/hooks/`** — os hooks de mutation que o formulário consome (`use-create-quotation`, `use-update-quotation` — ver [`react-query.md`](react-query.md)).

## Schema e integração com React Hook Form

```ts
// features/quotations/validations/quotation-schema.ts
import { z } from "zod";

export const quotationSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  vehicleValue: z.number().nullable(),
  // ...
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;
```

```tsx
// features/quotations/components/quotation-form/quotation-form.tsx
const form = useForm<QuotationFormValues>({
  resolver: zodResolver(quotationSchema),
  defaultValues: FORM_VAZIO,
});
```

## Sanitização antes de enviar ao Supabase

Campo opcional vazio vira `null`, nunca string vazia — regra herdada do `fleet-auth-gate` original. Isso acontece numa função de conversão entre o formulário validado e o payload da mutation (convenção `paraPayload()`), não dentro do schema Zod:

```ts
function paraPayload(values: QuotationFormValues) {
  return {
    ...values,
    vehicleValue: values.vehicleValue ?? null,
  };
}
```

## Componentes de campo

Sempre os componentes shadcn — nunca elementos nativos do HTML:
- Datepicker → sempre `Calendar` + `Popover` do shadcn, nunca `input type="date"`.
- Select → sempre o componente `Select` do shadcn, nunca `<select>` nativo.

## Integração com mutations

O `onSubmit` do formulário chama a mutation da feature, passando o payload já sanitizado:

```tsx
const createQuotation = useCreateQuotation();

function onSubmit(values: QuotationFormValues) {
  createQuotation.mutate(paraPayload(values));
}
```

## Tratamento de sucesso e erro

- **Sucesso** — toast (`sonner`) + fechar o drawer/navegar de volta. A invalidação da query já é responsabilidade do hook de mutation (ver [`react-query.md`](react-query.md)), não do formulário.
- **Erro de validação (client-side)** — inline por campo, via `formState.errors` do React Hook Form. Não usa toast.
- **Erro de servidor** (constraint violation, RLS, etc.) — no `onError` da mutation: se o erro for atribuível a um campo específico, usar `form.setError` para mostrá-lo inline; caso contrário, toast genérico de erro.
- **Estado de submitting** — desabilitar o botão de submit enquanto `mutation.isPending`. O padrão visual de loading em botões/telas de forma mais ampla fica em UI Patterns (ainda não escrito — ver roadmap no [`README.md`](../README.md)).
