import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateVehicle } from "./use-update-vehicle";

vi.mock("../../api/update-vehicle", () => ({ updateVehicle: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useUpdateVehicle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama a api de atualização com os dados informados", async () => {
    const { updateVehicle } = await import("../../api/update-vehicle");
    vi.mocked(updateVehicle).mockResolvedValue({ id: "v1" } as never);

    const { result } = renderHook(() => useUpdateVehicle(), { wrapper: createWrapper() });

    const input = {
      id: "v1",
      client_id: "c1",
      plate: "XYZ9Z99",
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
    expect(updateVehicle).toHaveBeenCalledWith(input, expect.any(Object));
  });
});
