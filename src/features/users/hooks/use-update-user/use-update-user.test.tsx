import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateUser } from "./use-update-user";

vi.mock("../../api/update-user", () => ({ updateUser: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useUpdateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de atualização com os dados informados", async () => {
    const { updateUser } = await import("../../api/update-user");
    const updatedUser = { id: "u1", full_name: "Editado", phone: null, role: "analyst" };
    vi.mocked(updateUser).mockResolvedValue(updatedUser as never);

    const { result } = renderHook(() => useUpdateUser(), { wrapper: createWrapper() });

    const input = { id: "u1", full_name: "Editado", phone: null, role: "analyst" as const };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateUser).toHaveBeenCalledWith(input, expect.any(Object));
  });
});
