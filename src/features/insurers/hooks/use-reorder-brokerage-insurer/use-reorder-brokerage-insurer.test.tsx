import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useReorderBrokerageInsurer } from "./use-reorder-brokerage-insurer";

vi.mock("../../api/reorder-brokerage-insurer", () => ({ swapBrokerageInsurerOrder: vi.fn() }));

vi.mock("@/features/auth", () => ({
  useAuthStore: (selector: (state: { usuario: { brokerage_id: string } }) => unknown) =>
    selector({ usuario: { brokerage_id: "b1" } }),
}));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useReorderBrokerageInsurer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api com o brokerage_id da própria corretora e a troca de ordem informada", async () => {
    const { swapBrokerageInsurerOrder } = await import("../../api/reorder-brokerage-insurer");
    vi.mocked(swapBrokerageInsurerOrder).mockResolvedValue(undefined);

    const { result } = renderHook(() => useReorderBrokerageInsurer(), { wrapper: createWrapper() });

    const input = {
      first: { insurerId: "i1", display_order: 1 },
      second: { insurerId: "i2", display_order: 0 },
    };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(swapBrokerageInsurerOrder).toHaveBeenCalledWith({ brokerageId: "b1", ...input });
  });
});
