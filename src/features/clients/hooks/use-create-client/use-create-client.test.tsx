import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateClient } from "./use-create-client";

vi.mock("../../api/create-client", () => ({ createClient: vi.fn() }));

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

describe("useCreateClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de criação com o brokerage_id da própria corretora", async () => {
    const { createClient } = await import("../../api/create-client");
    vi.mocked(createClient).mockResolvedValue({ id: "c1" } as never);

    const { result } = renderHook(() => useCreateClient(), { wrapper: createWrapper() });

    const input = {
      client_type: "company" as const,
      legal_name: "Cliente Novo",
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
      segment: "lead" as const,
      lead_source: null,
      notes: null,
    };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createClient).toHaveBeenCalledWith({ ...input, brokerage_id: "b1" });
  });
});
