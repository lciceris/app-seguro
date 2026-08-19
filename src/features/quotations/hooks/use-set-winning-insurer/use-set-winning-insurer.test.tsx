import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSetWinningInsurer } from "./use-set-winning-insurer";

vi.mock("../../api/set-winning-insurer", () => ({ setWinningInsurer: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useSetWinningInsurer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api com o id da linha de quotation_insurers marcada como vencedora", async () => {
    const { setWinningInsurer } = await import("../../api/set-winning-insurer");
    vi.mocked(setWinningInsurer).mockResolvedValue(undefined as never);

    const { result } = renderHook(() => useSetWinningInsurer("q1"), { wrapper: createWrapper() });

    result.current.mutate("qi1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(setWinningInsurer).toHaveBeenCalledWith("qi1");
  });
});
