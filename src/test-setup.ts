import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import "@testing-library/jest-dom/vitest";

// Sem `globals: true` (ver conventions/testing.md — imports explícitos, sem globais
// implícitos), então o auto-cleanup do Testing Library precisa ser registrado aqui.
afterEach(() => {
  cleanup();
});
