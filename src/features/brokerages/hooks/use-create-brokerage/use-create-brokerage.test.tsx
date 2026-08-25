import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateBrokerage } from "./use-create-brokerage";

vi.mock("../../api/create-brokerage", () => ({ createBrokerage: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useCreateBrokerage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de criação com os dados informados", async () => {
    const { createBrokerage } = await import("../../api/create-brokerage");
    vi.mocked(createBrokerage).mockResolvedValue({ brokerage: { id: "b1" } } as never);

    const { result } = renderHook(() => useCreateBrokerage(), { wrapper: createWrapper() });

    const input = {
      brokerage_name: "Nova Corretora",
      representative_name: "Representante Novo",
      representative_email: "representante@example.com",
      plan_id: null,
      plan_expires_at: null,
      primary_color: null,
      trade_name: null,
      tax_id: null,
      business_code: null,
      state_registration: null,
      email: null,
      phone: null,
      zip_code: null,
      street: null,
      street_number: null,
      complement: null,
      neighborhood: null,
      city: null,
      state: null,
      financial_name: null,
      financial_email: null,
    };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createBrokerage).toHaveBeenCalledWith(input, expect.any(Object));
  });
});
