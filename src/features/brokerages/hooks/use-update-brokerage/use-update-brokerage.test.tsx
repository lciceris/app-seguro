import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateBrokerage } from "./use-update-brokerage";

vi.mock("../../api/update-brokerage", () => ({ updateBrokerage: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useUpdateBrokerage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de atualização com os dados informados", async () => {
    const { updateBrokerage } = await import("../../api/update-brokerage");
    const updatedBrokerage = { id: "b1", name: "Editada", plan_id: null };
    vi.mocked(updateBrokerage).mockResolvedValue(updatedBrokerage as never);

    const { result } = renderHook(() => useUpdateBrokerage(), { wrapper: createWrapper() });

    const input = { id: "b1", name: "Editada", plan_id: null };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateBrokerage).toHaveBeenCalledWith(input, expect.any(Object));
  });
});
