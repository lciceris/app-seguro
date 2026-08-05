import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { useAuthStore } from "../../store/auth-store";
import { SetPasswordScreen } from "./set-password-screen";

const mutateMock = vi.fn();

vi.mock("../../hooks/use-set-password", () => ({
  useSetPassword: () => ({ mutate: mutateMock, isPending: false }),
}));

describe("SetPasswordScreen", () => {
  beforeEach(() => {
    useAuthStore.setState({
      usuario: {
        id: "1",
        brokerage_id: "b1",
        role: "seller",
        status: "active",
        full_name: "Teste",
        avatar_url: null,
        brokerage_name: "Corretora",
        primary_color: null,
        logo_url: null,
        brokerage_status: "active",
      },
    });
    mutateMock.mockClear();
  });

  it("mostra erro quando as senhas não coincidem", async () => {
    renderWithProviders(<SetPasswordScreen />);

    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: "diferente" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar senha" }));

    expect(await screen.findByText("As senhas não coincidem")).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("chama a mutation quando as senhas coincidem", async () => {
    renderWithProviders(<SetPasswordScreen />);

    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar senha" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith("12345678", expect.any(Object));
    });
  });
});
