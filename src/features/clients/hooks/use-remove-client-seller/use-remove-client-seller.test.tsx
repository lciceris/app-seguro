import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRemoveClientSeller } from "./use-remove-client-seller";

vi.mock("../../api/remove-client-seller", () => ({ removeClientSeller: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useRemoveClientSeller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de remover vendedor com os dados informados", async () => {
    const { removeClientSeller } = await import("../../api/remove-client-seller");
    vi.mocked(removeClientSeller).mockResolvedValue(undefined);

    const { result } = renderHook(() => useRemoveClientSeller(), { wrapper: createWrapper() });

    const input = { clientSellerId: "cs1", clientId: "c1", newPrimaryId: "cs2" };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(removeClientSeller).toHaveBeenCalledWith(input, expect.any(Object));
  });

  it("propaga o erro quando é preciso escolher um substituto", async () => {
    const { removeClientSeller } = await import("../../api/remove-client-seller");
    vi.mocked(removeClientSeller).mockRejectedValue(
      new Error("Escolha um novo vendedor principal antes de remover o vendedor principal atual."),
    );

    const { result } = renderHook(() => useRemoveClientSeller(), { wrapper: createWrapper() });

    result.current.mutate({ clientSellerId: "cs1", clientId: "c1" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe(
      "Escolha um novo vendedor principal antes de remover o vendedor principal atual.",
    );
  });
});
