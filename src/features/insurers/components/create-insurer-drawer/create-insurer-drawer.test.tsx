import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { CreateInsurerDrawer } from "./create-insurer-drawer";

const mutateMock = vi.fn();

vi.mock("../../hooks/use-create-insurer", () => ({
  useCreateInsurer: () => ({ mutate: mutateMock, isPending: false }),
}));

describe("CreateInsurerDrawer", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("mostra erro de validação ao submeter sem nome", async () => {
    renderWithProviders(<CreateInsurerDrawer />);

    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    expect(await screen.findByText("Informe o nome")).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("mostra erro de validação para e-mail inválido", async () => {
    renderWithProviders(<CreateInsurerDrawer />);

    fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: "Seguradora X" } });
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "invalido@semdominio" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    expect(await screen.findByText("E-mail inválido")).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("chama a mutation convertendo campos vazios em null e numéricos em number", async () => {
    renderWithProviders(<CreateInsurerDrawer />);

    fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: "Seguradora X" } });
    fireEvent.change(screen.getByLabelText("CNPJ *"), {
      target: { value: "12.345.678/0001-90" },
    });
    fireEvent.change(screen.getByLabelText("Prazo de resposta (dias)"), {
      target: { value: "5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        {
          name: "Seguradora X",
          cnpj: "12.345.678/0001-90",
          email: null,
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
