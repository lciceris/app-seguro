import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdatePolicy } from "./use-update-policy";

vi.mock("../../api/update-policy", () => ({ updatePolicy: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useUpdatePolicy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api com os campos editáveis da apólice", async () => {
    const { updatePolicy } = await import("../../api/update-policy");
    vi.mocked(updatePolicy).mockResolvedValue({ id: "p1" } as never);

    const { result } = renderHook(() => useUpdatePolicy(), { wrapper: createWrapper() });

    const input = {
      id: "p1",
      policy_number: "AP-2026-0001",
      coverage_start: "2026-01-01",
      coverage_end: "2026-12-01",
      premium_amount: 15000,
      total_fleet_value: 400000,
    };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updatePolicy).toHaveBeenCalledWith(input, expect.any(Object));
  });
});
