import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { CreatePolicyEndorsementDrawer } from "./create-policy-endorsement-drawer";

const mutateMock = vi.fn();

const usuarioFake = { id: "u-seller-1", role: "seller", brokerage_id: "b1" };

const policyFake = {
  id: "p1",
  client_id: "c1",
  policy_number: "AP-2026-0001",
};

const vehicleFake = {
  id: "v1",
  client_id: "c1",
  plate: "ABC1234",
  brand: "Volvo",
  model: "FH",
};

vi.mock("@/features/auth", () => ({
  useAuthStore: (selector: (state: { usuario: typeof usuarioFake }) => unknown) =>
    selector({ usuario: usuarioFake }),
}));

vi.mock("@/features/policies", () => ({
  usePolicy: () => ({ data: policyFake }),
}));

vi.mock("@/features/vehicles", () => ({
  useVehicles: () => ({ data: [vehicleFake] }),
}));

vi.mock("../../hooks/use-policy-vehicles", () => ({
  usePolicyVehicles: () => ({ data: [] }),
}));

vi.mock("../../hooks/use-create-policy-endorsement", () => ({
  useCreatePolicyEndorsement: () => ({ mutate: mutateMock, isPending: false }),
}));

function renderDrawer() {
  return renderWithProviders(
    <Routes>
      <Route
        path="/policies/:policyId/endorsements/add"
        element={<CreatePolicyEndorsementDrawer />}
      />
    </Routes>,
    { route: "/policies/p1/endorsements/add" },
  );
}

describe("CreatePolicyEndorsementDrawer", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("vem com inclusão de veículo selecionada por padrão, mostrando veículo e cobertura", () => {
    renderDrawer();

    expect(screen.getByLabelText("Veículo do cliente")).toBeInTheDocument();
    expect(screen.getByLabelText("Valor de casco (R$)")).toBeInTheDocument();
  });

  it("envia o payload correto pro endosso de inclusão de veículo", async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.click(screen.getByLabelText("Veículo do cliente"));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText(/ABC1234/));

    fireEvent.change(screen.getByLabelText("Valor de casco (R$)"), { target: { value: "280000" } });
    fireEvent.click(screen.getByRole("button", { name: "Abrir endosso" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          brokerage_id: "b1",
          policy_id: "p1",
          endorsement_type: "vehicle_inclusion",
          seller_id: "u-seller-1",
          vehicle_id: "v1",
          casco_value: 280000,
        }),
        expect.any(Object),
      );
    });
  });

  it("ao trocar pro tipo cancelamento, esconde veículo/cobertura e exige motivo", async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.click(screen.getByLabelText("Tipo"));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("Cancelamento"));

    expect(screen.queryByLabelText("Veículo do cliente")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Valor de casco (R$)")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Descrição")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Abrir endosso" }));

    expect(await screen.findByText("Informe o motivo.")).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });
});
