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
      admin_full_name: "Admin Novo",
      admin_email: "admin@example.com",
    };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createBrokerage).toHaveBeenCalledWith(input, expect.any(Object));
  });
});
