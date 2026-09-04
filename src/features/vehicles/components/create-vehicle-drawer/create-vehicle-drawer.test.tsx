import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { CreateVehicleDrawer } from "./create-vehicle-drawer";

const mutateMock = vi.fn();

const clientsFake = [
  { id: "c1", legal_name: "Cliente Um" },
  { id: "c2", legal_name: "Cliente Dois" },
];

vi.mock("@/features/clients", () => ({
  useClients: () => ({ data: clientsFake }),
}));

vi.mock("../../hooks/use-create-vehicle", () => ({
  useCreateVehicle: () => ({ mutate: mutateMock, isPending: false }),
}));

describe("CreateVehicleDrawer", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("mostra erros de validação ao submeter vazio", async () => {
    renderWithProviders(<CreateVehicleDrawer />);

    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    expect(await screen.findByText("Selecione um cliente")).toBeInTheDocument();
    expect(screen.getByText("Informe a placa")).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("chama a mutation com os dados do formulário", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateVehicleDrawer />);

    await user.click(screen.getAllByRole("combobox")[0]);
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("Cliente Um"));

    fireEvent.change(screen.getByLabelText("Placa *"), { target: { value: "ABC1D23" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({ client_id: "c1", plate: "ABC1D23", vehicle_type: null }),
        expect.any(Object),
      );
    });
  });
});
