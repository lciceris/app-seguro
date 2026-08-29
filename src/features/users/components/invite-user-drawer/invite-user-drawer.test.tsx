import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@/features/auth";
import { renderWithProviders } from "@/shared/lib/test-utils";

import { InviteUserDrawer } from "./invite-user-drawer";

const mutateMock = vi.fn();

vi.mock("../../hooks/use-invite-user", () => ({
  useInviteUser: () => ({ mutate: mutateMock, isPending: false }),
}));

describe("InviteUserDrawer", () => {
  beforeEach(() => {
    useAuthStore.setState({
      usuario: {
        id: "admin-1",
        brokerage_id: "b1",
        role: "brokerage_admin",
        status: "active",
        full_name: "Admin Teste",
        email: "admin-teste@appseguro.dev",
        avatar_url: null,
        brokerage_name: "Corretora",
        primary_color: null,
        logo_url: null,
        brokerage_status: "active",
      },
    });
    mutateMock.mockClear();
  });

  it("mostra erros de validação ao submeter vazio", async () => {
    renderWithProviders(<InviteUserDrawer />);

    fireEvent.click(screen.getByRole("button", { name: "Convidar" }));

    expect(await screen.findByText("Informe o nome")).toBeInTheDocument();
    expect(await screen.findByText("Informe o e-mail")).toBeInTheDocument();
    expect(await screen.findByText("Selecione um perfil", { selector: "p" })).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("chama a mutation com o brokerage_id do usuário logado", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InviteUserDrawer />);

    fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: "Novo Usuário" } });
    fireEvent.change(screen.getByLabelText("E-mail *"), { target: { value: "novo@example.com" } });

    await user.click(screen.getByRole("combobox", { name: "Perfil *" }));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("Vendedor"));

    fireEvent.click(screen.getByRole("button", { name: "Convidar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        {
          full_name: "Novo Usuário",
          email: "novo@example.com",
          phone: null,
          role: "seller",
          brokerage_id: "b1",
        },
        expect.any(Object),
      );
    });
  });
});
