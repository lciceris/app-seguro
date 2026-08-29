import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { EditClientDrawer } from "./edit-client-drawer";

const mutateMock = vi.fn();

const clientFake = {
  id: "c1",
  brokerage_id: "b1",
  client_type: "individual" as const,
  legal_name: "Cliente Original",
  trade_name: null,
  tax_id: "111.111.111-11",
  birth_date: null,
  business_code: null,
  industry: null,
  state_registration: null,
  zip_code: null,
  street: null,
  street_number: null,
  complement: null,
  neighborhood: null,
  city: null,
  state: null,
  contact_name: null,
  contact_role: null,
  contact_email: null,
  contact_phone: null,
  financial_name: null,
  financial_email: null,
  status: "active" as const,
  notes: null,
  created_at: "",
  updated_at: "",
};

vi.mock("../../hooks/use-update-client", () => ({
  useUpdateClient: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock("../../hooks/use-client", () => ({
  useClient: () => ({ data: clientFake, isLoading: false, isError: false, refetch: vi.fn() }),
}));

function renderDrawer() {
  return renderWithProviders(
    <Routes>
      <Route path="/clients/:clientId/edit" element={<EditClientDrawer />} />
    </Routes>,
    { route: "/clients/c1/edit" },
  );
}

describe("EditClientDrawer", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("vem pré-preenchido com os dados atuais do cliente", () => {
    renderDrawer();

    expect(screen.getByLabelText("Nome completo *")).toHaveValue("Cliente Original");
    expect(screen.getByLabelText("CPF")).toHaveValue("111.111.111-11");
  });

  it("chama a mutation com os valores editados", async () => {
    renderDrawer();

    fireEvent.change(screen.getByLabelText("Nome completo *"), {
      target: { value: "Cliente Editado" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({ id: "c1", legal_name: "Cliente Editado" }),
        expect.any(Object),
      );
    });
  });
});
