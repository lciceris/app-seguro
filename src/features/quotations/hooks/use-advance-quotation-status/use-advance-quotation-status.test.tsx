import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAdvanceQuotationStatus } from "./use-advance-quotation-status";

vi.mock("../../api/advance-quotation-status", () => ({ advanceQuotationStatus: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useAdvanceQuotationStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api com o status alvo", async () => {
    const { advanceQuotationStatus } = await import("../../api/advance-quotation-status");
    vi.mocked(advanceQuotationStatus).mockResolvedValue({
      id: "q1",
      status: "in_progress",
    } as never);

    const { result } = renderHook(() => useAdvanceQuotationStatus(), { wrapper: createWrapper() });

    result.current.mutate({ id: "q1", status: "in_progress" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(advanceQuotationStatus).toHaveBeenCalledWith(
      { id: "q1", status: "in_progress" },
      expect.any(Object),
    );
  });

  it("repassa o lost_reason quando fecha como não fechada", async () => {
    const { advanceQuotationStatus } = await import("../../api/advance-quotation-status");
    vi.mocked(advanceQuotationStatus).mockResolvedValue({
      id: "q1",
      status: "not_closed",
    } as never);

    const { result } = renderHook(() => useAdvanceQuotationStatus(), { wrapper: createWrapper() });

    result.current.mutate({ id: "q1", status: "not_closed", lost_reason: "Cliente desistiu" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(advanceQuotationStatus).toHaveBeenCalledWith(
      { id: "q1", status: "not_closed", lost_reason: "Cliente desistiu" },
      expect.any(Object),
    );
  });
});
