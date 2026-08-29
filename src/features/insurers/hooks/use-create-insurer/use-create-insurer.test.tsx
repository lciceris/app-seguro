import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateInsurer } from "./use-create-insurer";

vi.mock("../../api/create-insurer", () => ({ createInsurer: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useCreateInsurer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de criação com os dados informados", async () => {
    const { createInsurer } = await import("../../api/create-insurer");
    vi.mocked(createInsurer).mockResolvedValue({ id: "i1" } as never);

    const { result } = renderHook(() => useCreateInsurer(), { wrapper: createWrapper() });

    const input = {
      name: "Seguradora Nova",
      cnpj: "12.345.678/0001-90",
      email: null,
      phone: null,
      website: null,
      contact_name: null,
      response_time_days: null,
      display_order: null,
      notes: null,
      logo_url: null,
    };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createInsurer).toHaveBeenCalledWith(input, expect.any(Object));
  });
});
