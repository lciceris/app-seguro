import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateUserPassword } from "./use-update-user-password";

vi.mock("../../api/update-user-password", () => ({ updateUserPassword: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useUpdateUserPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de reset de senha com os dados informados", async () => {
    const { updateUserPassword } = await import("../../api/update-user-password");
    vi.mocked(updateUserPassword).mockResolvedValue({ success: true } as never);

    const { result } = renderHook(() => useUpdateUserPassword(), { wrapper: createWrapper() });

    const input = { user_id: "u1", new_password: "SenhaNova123!" };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateUserPassword).toHaveBeenCalledWith(input, expect.any(Object));
  });
});
