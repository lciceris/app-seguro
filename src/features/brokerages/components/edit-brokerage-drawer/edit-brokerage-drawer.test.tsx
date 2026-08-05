import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { EditBrokerageDrawer } from "./edit-brokerage-drawer";

const mutateMock = vi.fn();

const brokerageFake = {
  id: "b1",
  name: "Corretora Original",
  plan_id: null,
  status: "active" as const,
  logo_url: null,
  primary_color: null,
  created_at: "",
  updated_at: "",
  plans: null,
};

const plansFake = [{ id: "p1", name: "Plano Pro" }];

vi.mock("../../hooks/use-update-brokerage", () => ({
  useUpdateBrokerage: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock("../../hooks/use-brokerage", () => ({
  useBrokerage: () => ({
    data: brokerageFake,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../hooks/use-plans", () => ({
  usePlans: () => ({ data: plansFake }),
}));

function renderDrawer() {
  return renderWithProviders(
    <Routes>
      <Route path="/brokerages/:brokerageId/edit" element={<EditBrokerageDrawer />} />
    </Routes>,
    { route: "/brokerages/b1/edit" },
  );
}

describe("EditBrokerageDrawer", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("vem pré-preenchido com os dados atuais da corretora", () => {
    renderDrawer();

    expect(screen.getByLabelText("Nome")).toHaveValue("Corretora Original");
  });

  it("chama a mutation com os valores editados", async () => {
    const user = userEvent.setup();
    renderDrawer();

    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Nome Editado" } });

    await user.click(screen.getByRole("combobox", { name: "Plano" }));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("Plano Pro"));

    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        {
          id: "b1",
          name: "Nome Editado",
          plan_id: "p1",
        },
        expect.any(Object),
      );
    });
  });
});
