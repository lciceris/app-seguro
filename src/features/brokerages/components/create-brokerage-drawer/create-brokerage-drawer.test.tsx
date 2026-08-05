import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { CreateBrokerageDrawer } from "./create-brokerage-drawer";

const mutateMock = vi.fn();

vi.mock("../../hooks/use-create-brokerage", () => ({
  useCreateBrokerage: () => ({ mutate: mutateMock, isPending: false }),
}));

describe("CreateBrokerageDrawer", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("mostra erros de validação ao submeter vazio", async () => {
    renderWithProviders(<CreateBrokerageDrawer />);

    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    expect(await screen.findByText("Informe o nome da corretora")).toBeInTheDocument();
    expect(await screen.findByText("Informe o nome do administrador")).toBeInTheDocument();
    expect(await screen.findByText("Informe o e-mail do administrador")).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("chama a mutation com os valores do formulário", async () => {
    renderWithProviders(<CreateBrokerageDrawer />);

    fireEvent.change(screen.getByLabelText("Nome da corretora"), {
      target: { value: "Nova Corretora" },
    });
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Admin Novo" } });
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "admin@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        {
          brokerage_name: "Nova Corretora",
          admin_full_name: "Admin Novo",
          admin_email: "admin@example.com",
        },
        expect.any(Object),
      );
    });
  });
});
