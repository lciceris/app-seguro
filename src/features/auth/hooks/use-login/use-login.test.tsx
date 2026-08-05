import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "../../store/auth-store";
import { useLogin } from "./use-login";

vi.mock("../../api/login", () => ({ login: vi.fn() }));
vi.mock("../../api/get-session", () => ({ getSession: vi.fn() }));

const usuarioFake = {
  id: "1",
  brokerage_id: "b1",
  role: "seller" as const,
  status: "active" as const,
  full_name: "Teste",
  avatar_url: null,
  brokerage_name: "Corretora",
  primary_color: null,
  logo_url: null,
  brokerage_status: "active" as const,
};

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useLogin", () => {
  beforeEach(() => {
    useAuthStore.setState({ usuario: null });
    vi.clearAllMocks();
  });

  it("faz login e popula a auth store com o usuário retornado", async () => {
    const { login } = await import("../../api/login");
    const { getSession } = await import("../../api/get-session");
    vi.mocked(login).mockResolvedValue({} as never);
    vi.mocked(getSession).mockResolvedValue(usuarioFake);

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ email: "a@b.com", password: "123456" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(login).toHaveBeenCalledWith("a@b.com", "123456");
    expect(useAuthStore.getState().usuario).toEqual(usuarioFake);
  });
});
