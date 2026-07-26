# Regras de Importação

## Sem barrel exports globais

Não existem arquivos como `shared/components/index.ts` ou `shared/hooks/index.ts` agregando tudo. Cada módulo é importado diretamente da sua própria pasta. Isso reduz acoplamento e deixa explícito de qual módulo cada import vem.

✔ `import { Button } from "@/shared/components/button";`
✖ `import { Button } from "@/shared/components";`

(Exceção conceitual: o `index.ts` de uma **feature**, ex. `features/quotations/index.ts`, não é um barrel global — é a API pública curada daquela feature. Ver [`module-boundaries.md`](module-boundaries.md).)

## Importar sempre pela pasta do módulo

Nunca importar o arquivo interno diretamente:

```ts
// ✔ Correto
import { Button } from "@/shared/components/button";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { formatDate } from "@/shared/utils/format-date";
import { QuotationForm } from "@/features/quotations/components/quotation-form";

// ✖ Nunca
import { Button } from "@/shared/components/button/button";
import { formatDate } from "@/shared/utils/format-date/format-date";
```
