import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateVehicle } from "./use-create-vehicle";

vi.mock("../../api/create-vehicle", () => ({ createVehicle: vi.fn() }));

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

describe("useCreateVehicle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de criação com o brokerage_id da própria corretora", async () => {
    const { createVehicle } = await import("../../api/create-vehicle");
    vi.mocked(createVehicle).mockResolvedValue({ id: "v1" } as never);

    const { result } = renderHook(() => useCreateVehicle(), { wrapper: createWrapper() });

    const input = {
      client_id: "c1",
      plate: "ABC1D23",
      chassis: null,
      identification_code: null,
      renavam: null,
      brand: null,
      model: null,
      manufacture_year: null,
      model_year: null,
      vehicle_type: null,
      vehicle_usage: null,
      fuel_type: null,
      fipe_code: null,
      fipe_value: null,
      declared_value: null,
      overnight_zip_code: null,
      main_state: null,
      has_tracker: false,
      tracker_model: null,
      accessories: null,
      main_driver: null,
      has_claim_history: false,
      notes: null,
    };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createVehicle).toHaveBeenCalledWith({ ...input, brokerage_id: "b1" });
  });
});
