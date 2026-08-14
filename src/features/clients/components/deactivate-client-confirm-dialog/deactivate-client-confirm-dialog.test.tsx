import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { DeactivateClientConfirmDialog } from "./deactivate-client-confirm-dialog";

const mutateMock = vi.fn();

vi.mock("../../hooks/use-deactivate-client", () => ({
  useDeactivateClient: () => ({ mutate: mutateMock, isPending: false }),
}));

describe("DeactivateClientConfirmDialog", () => {
  it("não mostra o dialog quando clientId é null", () => {
    renderWithProviders(<DeactivateClientConfirmDialog clientId={null} onOpenChange={vi.fn()} />);

    expect(screen.queryByText("Inativar cliente")).not.toBeInTheDocument();
  });

  it("mostra o nome do cliente na confirmação", () => {
    renderWithProviders(
      <DeactivateClientConfirmDialog clientId="c1" clientName="Cliente X" onOpenChange={vi.fn()} />,
    );

    expect(screen.getByText("Inativar cliente")).toBeInTheDocument();
    expect(screen.getByText(/Cliente X deixa/)).toBeInTheDocument();
  });

  it("cancelar não chama a mutation", () => {
    renderWithProviders(
      <DeactivateClientConfirmDialog clientId="c1" clientName="Cliente X" onOpenChange={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("confirmar chama a mutation com o id do cliente", () => {
    renderWithProviders(
      <DeactivateClientConfirmDialog clientId="c1" clientName="Cliente X" onOpenChange={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Inativar" }));

    expect(mutateMock).toHaveBeenCalledWith("c1", expect.any(Object));
  });
});
