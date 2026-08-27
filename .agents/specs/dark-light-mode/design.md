# Design Document — dark-light-mode

## 1. Mecanismo e persistência

`@custom-variant dark (&:is(.dark *));` (já em `globals.css`) faz qualquer utility `dark:*` ativar quando um ancestral tem a classe `dark`. Plano:

- `index.html` ganha um `<script>` inline no `<head>`, antes de qualquer CSS/JS do app, que lê `localStorage` e já aplica a classe — evita flash do tema errado no primeiro paint:

```html
<script>
  (function () {
    if (localStorage.getItem("app-seguro-theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
  })();
</script>
```

- `src/shared/store/theme-store.ts` (zustand, mesmo padrão de `auth-store.ts`) — fonte única de verdade em runtime:

```ts
import { create } from "zustand";

export type Theme = "light" | "dark";

const STORAGE_KEY = "app-seguro-theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light",
  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    set({ theme: next });
  },
}));
```

O estado inicial só *lê* o que o script inline já aplicou (mesma chave) — não reaplica a classe no mount, evitando um segundo write redundante no DOM.

- `app-header.tsx`: o botão de tema (hoje decorativo, `aria-label="Tema (em breve)"`) ganha `onClick={toggleTheme}` e troca o ícone (`Moon` no claro → vai escurecer; `Sun` no escuro → vai clarear):

```tsx
const theme = useThemeStore((state) => state.theme);
const toggleTheme = useThemeStore((state) => state.toggleTheme);

<Button variant="ghost" size="icon-sm" aria-label="Alternar tema" onClick={toggleTheme}>
  {theme === "dark" ? <Sun /> : <Moon />}
</Button>
```

## 2. Tokens escuros (`globals.css`)

Novo bloco `.dark { ... }` logo após o `:root { ... }` atual, redefinindo os mesmos nomes de variável (Tailwind já resolve `bg-background` etc. pro valor certo conforme a classe `.dark` estar presente ou não — nenhum componente muda).

| Token | Claro (atual) | Escuro (novo) |
|---|---|---|
| `--background` | `#F1F5F9` | `#020617` |
| `--foreground` | `#0F172A` | `#F1F5F9` |
| `--card` / `--popover` | `#FFFFFF` | `#0F172A` |
| `--card-foreground` / `--popover-foreground` | `#0F172A` | `#F1F5F9` |
| `--primary` / `--primary-foreground` | `#4F46E5` / `#FFFFFF` | **inalterado** (Requirement 2.3) |
| `--secondary` / `--accent` / `--muted` | `#F1F5F9` / `#F8FAFC` / `#F8FAFC` | `#1E293B` (todos) |
| `--secondary-foreground` / `--accent-foreground` | `#0F172A` | `#F1F5F9` |
| `--muted-foreground` | `#64748B` | `#94A3B8` |
| `--destructive` | `#EF4444` | `#F87171` |
| `--destructive-foreground` | `#FFFFFF` | `#FFFFFF` |
| `--border` / `--input` | `#E2E8F0` | `#1E293B` |
| `--ring` | `#4F46E5` | **inalterado** |
| `--sidebar` | `#FFFFFF` | `#020617` |
| `--sidebar-foreground` | `#475569` | `#94A3B8` |
| `--sidebar-primary` / `--sidebar-accent` | `#F8FAFC` | `#1E293B` |
| `--sidebar-primary-foreground` / `--sidebar-accent-foreground` | `#0F172A` | `#F1F5F9` |
| `--sidebar-border` | `#E2E8F0` | `#1E293B` |
| `--sidebar-ring` | `#4F46E5` | **inalterado** |

`--sidebar`/`--sidebar-border` escuro reaproveita exatamente o par "Branco puro ↔ Slate-950" já desenhado (e nunca implementado) na exploração de cor de fundo da spec `sidebar-light-redesign` — não é um valor novo.

### Badges (Requirement 3) — inverte fundo pastel claro / texto saturado escuro para fundo saturado escuro / texto pastel claro

| Grupo | bg claro → escuro | text claro → escuro |
|---|---|---|
| `--success` | `#D1FAE5` → `#064E3B` | `#047857` → `#6EE7B7` |
| `--neutral` | `#F1F5F9` → `#334155` | `#64748B` → `#CBD5E1` |
| `--warning` | `#FFFBEB` → `#451A03` | `#B45309` → `#FCD34D` |
| `--status-waiting` | `#F1F5F9` → `#334155` | `#475569` → `#CBD5E1` |
| `--status-progress` | `#EFF6FF` → `#1E3A8A` | `#1D4ED8` → `#93C5FD` |
| `--status-negotiation` | `#F5F3FF` → `#4C1D95` | `#6D28D9` → `#C4B5FD` |
| `--status-presented` | `#EFF6FF` → `#1E3A8A` | `#1E40AF` → `#93C5FD` |
| `--status-effect` | `#FFFBEB` → `#451A03` | `#92400E` → `#FCD34D` |
| `--status-effected` | `#F0FDF4` → `#14532D` | `#166534` → `#86EFAC` |
| `--status-notclosed` | `#FEF2F2` → `#7F1D1D` | `#991B1B` → `#FCA5A5` |

`--success`/`--warning` (o "dot"/ícone sólido, não o par bg/text) ficam inalterados — já são cores vivas o bastante pra funcionar nos dois fundos.

`--chart-*`, `--primary-hover`/`-light`/`-text`, `--text-secondary`/`--text-muted` ganham par escuro por completude (evitar token órfão sem contraparte), mas **não são usados em nenhum componente hoje** (confirmado por grep antes desta spec) — baixa prioridade, sem verificação visual dedicada.

## 3. Componentes shadcn (`src/shared/components/ui/*`)

Não precisam de mudança — já vêm do gerador shadcn com classes `dark:` prontas (`dark:bg-input/30`, `dark:aria-invalid:*` etc. em `button.tsx`, `input.tsx`, `checkbox.tsx`, `calendar.tsx`, `dropdown-menu.tsx`, `select.tsx`, `switch.tsx`, `tabs.tsx`, `textarea.tsx`, `avatar.tsx`, `badge.tsx`), só dormentes até a classe `.dark` existir de verdade. Confirmado por grep antes desta spec.

## 4. Código de feature com cor hardcoded (Requirement 4)

Auditoria (agente Explore) confirmou que o grosso do app já usa tokens — achados reais, pequenos e concentrados:

**Corrigir (viram token):**
- `table.tsx:27` — `bg-[#E9EDF2]` (header da tabela) é hex arbitrário, não reage a `.dark`. Vira um token novo `--table-header` (`#E9EDF2` claro / `#1E293B` escuro, mesmo valor das outras superfícies "um degrau acima do card").
- 5 pontos usando `amber-*` cru em vez do token `--warning` já existente: `client-detail-drawer.tsx` (estrela de vendedor principal), `create-client-drawer.tsx` (mesma estrela), `policy-endorsements-section.tsx` (banner de aviso de endosso pendente), `quotation-insurer-drawer.tsx` e `quotation-insurers-tab.tsx` (badge de status de seguradora) — todos semanticamente "aviso/destaque", só nunca foram ligados ao token. Viram `text-warning`/`fill-warning` (ícone sólido) ou `bg-warning-bg`/`text-warning-text` (badge/banner), conforme o caso.

**Não mexer (achado, mas não é bug):**
- `bg-black/10` (`alert-dialog.tsx`, `dialog.tsx`) e `bg-black/35` (`sheet.tsx`) — overlay/scrim de modal. Um scrim preto por trás do modal é o padrão certo nos dois temas (escurece o que tem atrás, claro ou escuro) — não deve virar `bg-foreground/X`, porque no escuro `--foreground` é quase branco e o overlay clarearia o fundo em vez de escurecer.
- `bg-black/0` → `group-hover:bg-black/40` no hover do avatar de logo (`own-brokerage-screen.tsx`) — overlay sobre uma imagem raster (foto/logo), mesmo raciocínio: preto/branco é o padrão de affordance de upload de foto em qualquer tema.
- PDFs (`policy-endorsement-document.tsx`, `quotation-proposal-document.tsx`) — `StyleSheet` do `@react-pdf/renderer` renderiza fora do DOM, `.dark` nunca alcança. Documento exportado/impresso continua claro de propósito.

## Testing Strategy

- `tsc`/`eslint`/`vitest run` completos a cada task.
- Verificação visual via Playwright: alternar o tema em 3-4 telas representativas (listagem com badges, drawer, sidebar+header, formulário) e tirar screenshot de cada uma no escuro, checando visualmente que nada fica ilegível; conferir que o `localStorage` persiste entre reloads; conferir que recarregar com tema escuro salvo não pisca claro primeiro (script inline).
