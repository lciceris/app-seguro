import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { EditVehicleDrawer } from "./edit-vehicle-drawer";

const mutateMock = vi.fn();

const clientsFake = [
  { id: "c1", legal_name: "Cliente Um" },
  { id: "c2", legal_name: "Cliente Dois" },
];

const vehicleFake = {
  id: "v1",
  brokerage_id: "b1",
  client_id: "c1",
  plate: "ABC1D23",
  chassis: null,
  identification_code: null,
  renavam: null,
  brand: "Volvo",
  model: "FH",
  manufacture_year: 2020,
  model_year: 2021,
  vehicle_type: "heavy_truck" as const,
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
  is_active: true,
  created_at: "",
  updated_at: "",
};

vi.mock("@/features/clients", () => ({
  useClients: () => ({ data: clientsFake, isLoading: false }),
}));

vi.mock("../../hooks/use-update-vehicle", () => ({
  useUpdateVehicle: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock("../../hooks/use-vehicle", () => ({
  useVehicle: () => ({
    data: vehicleFake,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

function renderDrawer() {
  return renderWithProviders(
    <Routes>
      <Route path="/vehicles/:vehicleId/edit" element={<EditVehicleDrawer />} />
    </Routes>,
    { route: "/vehicles/v1/edit" },
  );
}

describe("EditVehicleDrawer", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("vem pré-preenchido com os dados atuais do veículo", () => {
    renderDrawer();

    expect(screen.getByLabelText("Placa")).toHaveValue("ABC1D23");
    expect(screen.getByLabelText("Marca")).toHaveValue("Volvo");
    expect(screen.getAllByRole("combobox")[0]).toHaveTextContent("Cliente Um");
  });

  it("chama a mutation com os valores editados", async () => {
    renderDrawer();

    fireEvent.change(screen.getByLabelText("Placa"), { target: { value: "XYZ9Z99" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({ id: "v1", plate: "XYZ9Z99", client_id: "c1" }),
        expect.any(Object),
      );
    });
  });
});
