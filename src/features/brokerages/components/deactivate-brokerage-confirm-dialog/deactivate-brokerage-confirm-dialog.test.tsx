import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { DeactivateBrokerageConfirmDialog } from "./deactivate-brokerage-confirm-dialog";

const mutateMock = vi.fn();

vi.mock("../../hooks/use-deactivate-brokerage", () => ({
  useDeactivateBrokerage: () => ({ mutate: mutateMock, isPending: false }),
}));

describe("DeactivateBrokerageConfirmDialog", () => {
  it("não mostra o dialog quando brokerageId é null", () => {
    renderWithProviders(
      <DeactivateBrokerageConfirmDialog brokerageId={null} onOpenChange={vi.fn()} />,
    );

    expect(screen.queryByText("Desativar corretora")).not.toBeInTheDocument();
  });

  it("mostra o nome da corretora na confirmação", () => {
    renderWithProviders(
      <DeactivateBrokerageConfirmDialog
        brokerageId="b1"
        brokerageName="Corretora X"
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Desativar corretora")).toBeInTheDocument();
    expect(screen.getByText(/Corretora X perderá/)).toBeInTheDocument();
  });

  it("cancelar não chama a mutation", () => {
    renderWithProviders(
      <DeactivateBrokerageConfirmDialog
        brokerageId="b1"
        brokerageName="Corretora X"
        onOpenChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("confirmar chama a mutation com o id da corretora", () => {
    renderWithProviders(
      <DeactivateBrokerageConfirmDialog
        brokerageId="b1"
        brokerageName="Corretora X"
        onOpenChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Desativar" }));

    expect(mutateMock).toHaveBeenCalledWith("b1", expect.any(Object));
  });
});
