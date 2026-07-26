# ADR 001 — Framework: SPA client-side com React Router v7 (modo library)

**Data:** 2026-07-23
**Status:** Aceito

**Contexto:** Ao reconstruir o `fleet-auth-gate` do zero, avaliamos se deveríamos manter uma SPA client-side (como o projeto original, que usava Vite + React Router v6) ou migrar para um framework full-stack com SSR nativo (Next.js App Router, React Router v7 em framework mode, ou TanStack Start).

**Decisão:** Manter uma SPA client-side, sem SSR, atualizando o roteador de React Router v6 para v7 em **modo library/declarativo** (não framework mode).

**Justificativa:**
- O app é um dashboard B2B inteiramente atrás de login — não há páginas públicas nem necessidade de SEO, que são os principais casos de uso onde SSR compensa.
- O Supabase já cumpre o papel de backend (Auth, PostgREST com RLS, Storage, Edge Functions para as operações que precisam de service role). Um framework full-stack (Next.js, TanStack Start) adicionaria uma camada de data-fetching no servidor e o modelo de server/client components sem ganho real, já que não há lógica de servidor além do que as Edge Functions já cobrem.
- React Router v6 está em modo manutenção; v7 é a linha ativa. Migrar v6→v7 em modo library é próximo de um drop-in (mesma API de `BrowserRouter`, hooks e componentes), sem custo de reescrever a arquitetura de dados.

**Alternativas consideradas:**
- *Next.js App Router* — mainstream, mas exigiria adaptar toda a busca de dados para RSC/server actions sem necessidade real, dado que o backend já é o Supabase.
- *TanStack Start / React Router v7 framework mode* — SSR nativo mais moderno, mas resolve um problema (SSR) que este produto não tem, e é mais imaturo/em evolução.

**Consequências:**
- Deploy continua como SPA estática no Vercel (rewrite `/(.*)` → `/index.html`), sem mudança de infraestrutura.
- Imports de roteamento seguem vindo de `react-router-dom` (v7 mantém esse pacote para uso client-side).
