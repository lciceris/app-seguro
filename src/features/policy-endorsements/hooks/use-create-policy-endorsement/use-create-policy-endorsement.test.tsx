import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCreatePolicyEndorsement } from "./use-create-policy-endorsement";

vi.mock("../../api/create-policy-endorsement", () => ({ createPolicyEndorsement: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useCreatePolicyEndorsement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api com os dados do endosso", async () => {
    const { createPolicyEndorsement } = await import("../../api/create-policy-endorsement");
    vi.mocked(createPolicyEndorsement).mockResolvedValue({
      id: "pe1",
      policy_id: "p1",
    } as never);

    const { result } = renderHook(() => useCreatePolicyEndorsement(), { wrapper: createWrapper() });

    const input = {
      brokerage_id: "b1",
      policy_id: "p1",
      endorsement_type: "vehicle_inclusion" as const,
      seller_id: "u1",
      description: null,
      vehicle_id: "v1",
    };
    result.current.mutate(input as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createPolicyEndorsement).toHaveBeenCalledWith(input, expect.any(Object));
  });
});
