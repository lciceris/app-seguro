import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateClient } from "./use-update-client";

vi.mock("../../api/update-client", () => ({ updateClient: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useUpdateClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de atualização com os dados informados", async () => {
    const { updateClient } = await import("../../api/update-client");
    vi.mocked(updateClient).mockResolvedValue({ id: "c1" } as never);

    const { result } = renderHook(() => useUpdateClient(), { wrapper: createWrapper() });

    const input = {
      id: "c1",
      client_type: "company" as const,
      legal_name: "Cliente Editado",
      trade_name: null,
      tax_id: null,
      birth_date: null,
      business_code: null,
      industry: null,
      state_registration: null,
      zip_code: null,
      street: null,
      street_number: null,
      complement: null,
      neighborhood: null,
      city: null,
      state: null,
      contact_name: null,
      contact_role: null,
      contact_email: null,
      contact_phone: null,
      financial_name: null,
      financial_email: null,
      status: "active" as const,
      notes: null,
    };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateClient).toHaveBeenCalledWith(input, expect.any(Object));
  });
});
