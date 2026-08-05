import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeactivateBrokerage } from "./use-deactivate-brokerage";

vi.mock("../../api/deactivate-brokerage", () => ({ deactivateBrokerage: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useDeactivateBrokerage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de desativação com o id da corretora", async () => {
    const { deactivateBrokerage } = await import("../../api/deactivate-brokerage");
    vi.mocked(deactivateBrokerage).mockResolvedValue({ id: "b1", status: "inactive" } as never);

    const { result } = renderHook(() => useDeactivateBrokerage(), { wrapper: createWrapper() });

    result.current.mutate("b1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deactivateBrokerage).toHaveBeenCalledWith("b1", expect.any(Object));
  });
});
