import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAddClientSeller } from "./use-add-client-seller";

vi.mock("../../api/add-client-seller", () => ({ addClientSeller: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useAddClientSeller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de adicionar vendedor com os dados informados", async () => {
    const { addClientSeller } = await import("../../api/add-client-seller");
    vi.mocked(addClientSeller).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAddClientSeller(), { wrapper: createWrapper() });

    const input = { clientId: "c1", sellerId: "s1", isPrimary: false };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(addClientSeller).toHaveBeenCalledWith(input, expect.any(Object));
  });
});
