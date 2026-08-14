import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import "@testing-library/jest-dom/vitest";

// Sem `globals: true` (ver conventions/testing.md — imports explícitos, sem globais
// implícitos), então o auto-cleanup do Testing Library precisa ser registrado aqui.
afterEach(() => {
  cleanup();
});

// jsdom não implementa scrollIntoView nem a Pointer Events API completa — o Radix
// Select (usado em invite-user-drawer, edit-user-drawer) depende de ambos ao abrir,
// quebrando o teste sem esses stubs.
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();

// jsdom também não implementa ResizeObserver — usado internamente pelo Popover
// (date-picker, e qualquer Select dentro de um Popover) pra medir o conteúdo.
class ResizeObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = ResizeObserverStub;
