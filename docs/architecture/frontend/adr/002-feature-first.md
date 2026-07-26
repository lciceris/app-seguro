# ADR 002 — Arquitetura de pastas: Feature-First

**Data:** 2026-07-25
**Status:** Aceito

**Decisão:** Organizar `src/` por domínio (feature-first), com uma camada `shared/` restrita a código realmente reutilizado por 2+ features, um `app/` só para inicialização (sem regra de negócio), e `pages/` como camada fina de rotas que apenas renderiza a tela exportada pela feature correspondente.

**Justificativa:**
- **Organização por domínio.** A aplicação é organizada por features. Cada feature encapsula sua própria lógica, componentes, hooks, serviços e demais artefatos — isso mantém o código relacionado a um mesmo domínio de negócio junto, em vez de espalhado por pastas organizadas por tipo técnico (`components/`, `hooks/`, `services/` genéricos para tudo).
- **`shared/` apenas para código realmente compartilhado.** Um código só vai para `shared/` quando é reutilizado por duas ou mais features. Evitar mover código para lá por antecipação — isso é o que mantém `shared/` pequeno e evita que vire uma pasta genérica de despejo que acopla features entre si indiretamente.

**Consequências:**
- A forma exata como cada pasta (`app/`, `shared/`, `features/`, `pages/`) é organizada por dentro está detalhada em [`conventions/folder-structure.md`](../conventions/folder-structure.md).
- Esta decisão exige limites claros entre features (uma feature não pode acessar o interno de outra) — ver [`conventions/module-boundaries.md`](../conventions/module-boundaries.md).
