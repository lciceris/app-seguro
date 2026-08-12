import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateInsurer } from "./use-update-insurer";

vi.mock("../../api/update-insurer", () => ({ updateInsurer: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useUpdateInsurer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de atualização com os dados informados", async () => {
    const { updateInsurer } = await import("../../api/update-insurer");
    vi.mocked(updateInsurer).mockResolvedValue({ id: "i1" } as never);

    const { result } = renderHook(() => useUpdateInsurer(), { wrapper: createWrapper() });

    const input = {
      id: "i1",
      name: "Seguradora Editada",
      cnpj: null,
      email: null,
      phone: null,
      website: null,
      contact_name: null,
      response_time_days: null,
      display_order: null,
      notes: null,
    };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateInsurer).toHaveBeenCalledWith(input, expect.any(Object));
  });
});
