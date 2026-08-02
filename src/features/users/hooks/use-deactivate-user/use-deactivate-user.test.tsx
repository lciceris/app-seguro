import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeactivateUser } from "./use-deactivate-user";

vi.mock("../../api/deactivate-user", () => ({ deactivateUser: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useDeactivateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de desativação com o id do usuário", async () => {
    const { deactivateUser } = await import("../../api/deactivate-user");
    vi.mocked(deactivateUser).mockResolvedValue({ id: "u1", status: "inactive" } as never);

    const { result } = renderHook(() => useDeactivateUser(), { wrapper: createWrapper() });

    result.current.mutate("u1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deactivateUser).toHaveBeenCalledWith("u1", expect.any(Object));
  });
});
