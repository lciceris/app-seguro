import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useReorderInsurer } from "./use-reorder-insurer";

vi.mock("../../api/reorder-insurer", () => ({ swapInsurerOrder: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useReorderInsurer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api trocando o display_order das duas seguradoras informadas", async () => {
    const { swapInsurerOrder } = await import("../../api/reorder-insurer");
    vi.mocked(swapInsurerOrder).mockResolvedValue(undefined);

    const { result } = renderHook(() => useReorderInsurer(), { wrapper: createWrapper() });

    const input = {
      first: { id: "i1", display_order: 1 },
      second: { id: "i2", display_order: 0 },
    };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(swapInsurerOrder).toHaveBeenCalledWith(input, expect.any(Object));
  });
});
