import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { UserMenu } from "./user-menu";

const logoutMutateMock = vi.fn();

const usuarioFake = {
  full_name: "Sofia Supervisor",
  email: "sofia@appseguro.dev",
  role: "supervisor",
  avatar_url: null,
};

vi.mock("@/features/auth", () => ({
  useAuthStore: (selector: (state: { usuario: typeof usuarioFake }) => unknown) =>
    selector({ usuario: usuarioFake }),
  useLogout: () => ({ mutate: logoutMutateMock, isPending: false }),
}));

describe("UserMenu", () => {
  beforeEach(() => {
    logoutMutateMock.mockClear();
  });

  it("mostra nome, e-mail e perfil no dropdown", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserMenu />);

    await user.click(screen.getByRole("button", { name: /Sofia Supervisor/ }));

    const menu = within(screen.getByRole("menu"));
    expect(menu.getByText("sofia@appseguro.dev")).toBeInTheDocument();
    expect(menu.getByText("Supervisor")).toBeInTheDocument();
  });

  it("'Meu perfil' está desabilitado", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserMenu />);

    await user.click(screen.getByRole("button", { name: /Sofia Supervisor/ }));

    expect(screen.getByText("Meu perfil")).toHaveAttribute("data-disabled");
  });

  it("'Sair' aciona o logout", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserMenu />);

    await user.click(screen.getByRole("button", { name: /Sofia Supervisor/ }));
    fireEvent.click(screen.getByText("Sair"));

    expect(logoutMutateMock).toHaveBeenCalled();
  });
});
