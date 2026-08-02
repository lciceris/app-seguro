import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useInviteUser } from "./use-invite-user";

vi.mock("../../api/invite-user", () => ({ inviteUser: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useInviteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de convite com os dados informados", async () => {
    const { inviteUser } = await import("../../api/invite-user");
    vi.mocked(inviteUser).mockResolvedValue({ success: true } as never);

    const { result } = renderHook(() => useInviteUser(), { wrapper: createWrapper() });

    const input = {
      full_name: "Novo Usuário",
      email: "novo@example.com",
      phone: null,
      role: "seller" as const,
      brokerage_id: "b1",
    };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(inviteUser).toHaveBeenCalledWith(input, expect.any(Object));
  });

  it("propaga o erro quando a api falha", async () => {
    const { inviteUser } = await import("../../api/invite-user");
    vi.mocked(inviteUser).mockRejectedValue(new Error("Limite de usuários do plano atingido."));

    const { result } = renderHook(() => useInviteUser(), { wrapper: createWrapper() });

    result.current.mutate({
      full_name: "Novo Usuário",
      email: "novo@example.com",
      phone: null,
      role: "seller",
      brokerage_id: "b1",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Limite de usuários do plano atingido.");
  });
});
