import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "../../store/auth-store";
import { useSession } from "./use-session";

vi.mock("../../api/get-session", () => ({ getSession: vi.fn() }));

const usuarioFake = {
  id: "1",
  brokerage_id: "b1",
  role: "seller" as const,
  status: "active" as const,
  full_name: "Teste",
  email: "teste@appseguro.dev",
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

describe("useSession", () => {
  beforeEach(() => {
    useAuthStore.setState({ usuario: null });
    vi.clearAllMocks();
  });

  it("restaura a sessão e popula a auth store", async () => {
    const { getSession } = await import("../../api/get-session");
    vi.mocked(getSession).mockResolvedValue(usuarioFake);

    const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().usuario).toEqual(usuarioFake);
  });

  it("mantém a auth store nula quando não há sessão", async () => {
    const { getSession } = await import("../../api/get-session");
    vi.mocked(getSession).mockResolvedValue(null);

    const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().usuario).toBeNull();
  });
});
