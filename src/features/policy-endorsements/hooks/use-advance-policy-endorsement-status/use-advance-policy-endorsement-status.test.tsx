import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAdvancePolicyEndorsementStatus } from "./use-advance-policy-endorsement-status";

vi.mock("../../api/advance-policy-endorsement-status", () => ({
  advancePolicyEndorsementStatus: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useAdvancePolicyEndorsementStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api com o novo status", async () => {
    const { advancePolicyEndorsementStatus } =
      await import("../../api/advance-policy-endorsement-status");
    vi.mocked(advancePolicyEndorsementStatus).mockResolvedValue({
      id: "pe1",
      policy_id: "p1",
      new_policy_id: null,
    } as never);

    const { result } = renderHook(() => useAdvancePolicyEndorsementStatus(), {
      wrapper: createWrapper(),
    });

    const input = { id: "pe1", status: "presented" as const, premium_adjustment: 500 };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(advancePolicyEndorsementStatus).toHaveBeenCalledWith(input, expect.any(Object));
  });
});
