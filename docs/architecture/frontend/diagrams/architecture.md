# Diagrama — Camadas e Direção de Dependência

> Apenas o diagrama. Para as regras por extenso (quem pode importar quem, o que é proibido), ver [`conventions/module-boundaries.md`](../conventions/module-boundaries.md).

```
app/
  ↓  compõe e inicializa (providers, router, query, config, theme)
pages/
  ↓  renderiza a screen pública da feature
features/
  ↓  usa código compartilhado
shared/  (components, hooks, utils, services, constants, types)
  ↓  usa wrappers de biblioteca
shared/lib/
```

A seta representa a única direção de dependência permitida — uma camada só importa da(s) camada(s) abaixo dela, nunca das de cima.
