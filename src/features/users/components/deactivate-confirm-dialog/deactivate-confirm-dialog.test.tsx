import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { DeactivateConfirmDialog } from "./deactivate-confirm-dialog";

const mutateMock = vi.fn();

vi.mock("../../hooks/use-deactivate-user", () => ({
  useDeactivateUser: () => ({ mutate: mutateMock, isPending: false }),
}));

describe("DeactivateConfirmDialog", () => {
  it("não mostra o dialog quando userId é null", () => {
    renderWithProviders(<DeactivateConfirmDialog userId={null} onOpenChange={vi.fn()} />);

    expect(screen.queryByText("Desativar usuário")).not.toBeInTheDocument();
  });

  it("mostra o nome do usuário na confirmação", () => {
    renderWithProviders(
      <DeactivateConfirmDialog userId="u1" userName="Fulano" onOpenChange={vi.fn()} />,
    );

    expect(screen.getByText("Desativar usuário")).toBeInTheDocument();
    expect(screen.getByText(/Fulano perderá/)).toBeInTheDocument();
  });

  it("cancelar não chama a mutation", () => {
    const onOpenChange = vi.fn();
    renderWithProviders(
      <DeactivateConfirmDialog userId="u1" userName="Fulano" onOpenChange={onOpenChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("confirmar chama a mutation com o id do usuário", () => {
    renderWithProviders(
      <DeactivateConfirmDialog userId="u1" userName="Fulano" onOpenChange={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Desativar" }));

    expect(mutateMock).toHaveBeenCalledWith("u1", expect.any(Object));
  });
});
