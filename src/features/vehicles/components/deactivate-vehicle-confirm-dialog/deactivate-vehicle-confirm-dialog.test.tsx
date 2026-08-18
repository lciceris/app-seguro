import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { DeactivateVehicleConfirmDialog } from "./deactivate-vehicle-confirm-dialog";

const mutateMock = vi.fn();

vi.mock("../../hooks/use-deactivate-vehicle", () => ({
  useDeactivateVehicle: () => ({ mutate: mutateMock, isPending: false }),
}));

describe("DeactivateVehicleConfirmDialog", () => {
  it("não mostra o dialog quando vehicleId é null", () => {
    renderWithProviders(<DeactivateVehicleConfirmDialog vehicleId={null} onOpenChange={vi.fn()} />);

    expect(screen.queryByText("Inativar veículo")).not.toBeInTheDocument();
  });

  it("mostra a placa do veículo na confirmação", () => {
    renderWithProviders(
      <DeactivateVehicleConfirmDialog
        vehicleId="v1"
        vehiclePlate="ABC1D23"
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Inativar veículo")).toBeInTheDocument();
    expect(screen.getByText(/O veículo ABC1D23 deixa/)).toBeInTheDocument();
  });

  it("cancelar não chama a mutation", () => {
    renderWithProviders(
      <DeactivateVehicleConfirmDialog
        vehicleId="v1"
        vehiclePlate="ABC1D23"
        onOpenChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("confirmar chama a mutation com o id do veículo", () => {
    renderWithProviders(
      <DeactivateVehicleConfirmDialog
        vehicleId="v1"
        vehiclePlate="ABC1D23"
        onOpenChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Inativar" }));

    expect(mutateMock).toHaveBeenCalledWith("v1", expect.any(Object));
  });
});
