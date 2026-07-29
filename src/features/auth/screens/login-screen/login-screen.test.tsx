import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { LoginScreen } from "./login-screen";

const mutateMock = vi.fn();

vi.mock("../../hooks/use-login", () => ({
  useLogin: () => ({ mutate: mutateMock, isPending: false }),
}));

describe("LoginScreen", () => {
  it("mostra erros de validação ao submeter vazio", async () => {
    renderWithProviders(<LoginScreen />);

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Informe o e-mail")).toBeInTheDocument();
    expect(await screen.findByText("Informe a senha")).toBeInTheDocument();
  });

  it("chama a mutation de login com os valores do formulário", async () => {
    renderWithProviders(<LoginScreen />);

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        { email: "a@b.com", password: "123456" },
        expect.any(Object),
      );
    });
  });
});
