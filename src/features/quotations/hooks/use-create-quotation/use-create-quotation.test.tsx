import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateQuotation } from "./use-create-quotation";

vi.mock("../../api/create-quotation", () => ({ createQuotation: vi.fn() }));

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

describe("useCreateQuotation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de criação com o brokerage_id da própria corretora", async () => {
    const { createQuotation } = await import("../../api/create-quotation");
    vi.mocked(createQuotation).mockResolvedValue({ id: "q1" } as never);

    const { result } = renderHook(() => useCreateQuotation(), { wrapper: createWrapper() });

    const input = {
      client_id: "c1",
      seller_id: null,
      quotation_type: null,
      coverage_start: null,
      coverage_end: null,
      coverages: null,
      deductible_pref: null,
      due_date: null,
      seller_notes: null,
    };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createQuotation).toHaveBeenCalledWith({ ...input, brokerage_id: "b1" });
  });
});
