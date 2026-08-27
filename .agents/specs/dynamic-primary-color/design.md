# Design Document — dynamic-primary-color

## `app-shell.tsx` — aplica a cor

```tsx
const primaryColor = useAuthStore((state) => state.usuario?.primary_color);

useEffect(() => {
  if (primaryColor) {
    document.documentElement.style.setProperty("--primary", primaryColor);
  } else {
    document.documentElement.style.removeProperty("--primary");
  }
}, [primaryColor]);
```

`AppShell` só renderiza autenticado (comentário já existente no arquivo confirma isso), então login/set-password nunca ficam sob o efeito — atende Requirement 1.3 de graça, sem lógica extra. `removeProperty` (não um `setProperty` com o hex fixo) garante que, sem cor customizada, o app volta pro valor do `:root` — atende 1.2.

Nenhum outro componente precisa mudar: sidebar (item ativo), badge de cargo do `user-menu`, `Button`/`Badge` primários — todos já leem `bg-primary`/`text-primary`, que resolvem de `var(--primary)`.

## `use-update-own-brokerage.ts` — sincroniza o store

```diff
+import { useAuthStore } from "@/features/auth";
+
 export function useUpdateOwnBrokerage() {
   const queryClient = useQueryClient();
+  const usuario = useAuthStore((state) => state.usuario);
+  const setUsuario = useAuthStore((state) => state.setUsuario);

   return useMutation({
     mutationFn: updateOwnBrokerage,
-    onSuccess: () => {
+    onSuccess: (data) => {
       queryClient.invalidateQueries({ queryKey: brokerageKeys.own() });
+      if (usuario) {
+        setUsuario({ ...usuario, brokerage_name: data.name, primary_color: data.primary_color, logo_url: data.logo_url });
+      }
     },
   });
 }
```

`data` é a linha completa retornada por `updateOwnBrokerage` (`.select().single()` já existente) — usa o valor confirmado pelo banco, não o valor otimista do formulário. Precedente de import cross-feature já existe em `use-own-brokerage.ts` (mesma pasta), que também importa `useAuthStore` de `@/features/auth`.

## Testing Strategy

- `tsc`/`eslint`/`vitest run` completos.
- Verificação visual via Playwright, ponta a ponta: logar, checar `--primary` = padrão; ir em "Dados da corretora", salvar uma cor nova via `ColorPicker`; sem reload, checar que a sidebar (item ativo) e o badge de cargo do header já usam a cor nova (computed style); confirmar que sai `getPropertyValue("--primary")` do `documentElement` bate com o hex salvo.
