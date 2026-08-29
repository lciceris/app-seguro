import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { EditInsurerDrawer } from "./edit-insurer-drawer";

const mutateMock = vi.fn();

const insurerFake = {
  id: "i1",
  name: "Seguradora Original",
  cnpj: "12.345.678/0001-90",
  email: "contato@seguradora.com",
  phone: null,
  website: null,
  contact_name: null,
  response_time_days: 5,
  display_order: null,
  notes: null,
  logo_url: null,
  created_at: "",
  updated_at: "",
};

vi.mock("../../hooks/use-update-insurer", () => ({
  useUpdateInsurer: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock("../../hooks/use-insurer", () => ({
  useInsurer: () => ({
    data: insurerFake,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

function renderDrawer() {
  return renderWithProviders(
    <Routes>
      <Route path="/admin/insurers/:insurerId/edit" element={<EditInsurerDrawer />} />
    </Routes>,
    { route: "/admin/insurers/i1/edit" },
  );
}

describe("EditInsurerDrawer", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("vem pré-preenchido com os dados atuais da seguradora", () => {
    renderDrawer();

    expect(screen.getByLabelText("Nome *")).toHaveValue("Seguradora Original");
    expect(screen.getByLabelText("CNPJ *")).toHaveValue("12.345.678/0001-90");
    expect(screen.getByLabelText("E-mail")).toHaveValue("contato@seguradora.com");
    expect(screen.getByLabelText("Prazo de resposta (dias)")).toHaveValue(5);
  });

  it("chama a mutation com os valores editados", async () => {
    renderDrawer();

    fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: "Nome Editado" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        {
          id: "i1",
          name: "Nome Editado",
          cnpj: "12345678000190",
          email: "contato@seguradora.com",
          phone: null,
          website: null,
          contact_name: null,
          response_time_days: 5,
          display_order: null,
          notes: null,
          logo_url: null,
        },
        expect.any(Object),
      );
    });
  });
});
