import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDisableInsurer } from "./use-disable-insurer";

vi.mock("../../api/disable-insurer", () => ({ disableInsurer: vi.fn() }));

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

describe("useDisableInsurer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de desabilitar com o brokerage_id da própria corretora e o insurerId informado", async () => {
    const { disableInsurer } = await import("../../api/disable-insurer");
    vi.mocked(disableInsurer).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDisableInsurer(), { wrapper: createWrapper() });

    result.current.mutate("i1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(disableInsurer).toHaveBeenCalledWith({ brokerageId: "b1", insurerId: "i1" });
  });
});
