import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { QuotationInsurerDrawer } from "./quotation-insurer-drawer";

const updateMutateMock = vi.fn();
const setWinningMutateMock = vi.fn();

const pendingInsurerFake = {
  id: "qi1",
  quotation_id: "q1",
  insurer_id: "i1",
  brokerage_id: "b1",
  response_status: "pending" as const,
  premium_amount: null,
  deductible_amount: null,
  commission_rate: null,
  installments_count: null,
  insurer_quotation_number: null,
  approved_coverages: null,
  analyst_notes: null,
  is_winner: false,
  responded_at: null,
  created_at: "",
  insurers: { id: "i1", name: "Seguradora Alfa" },
};

const acceptedInsurerFake = { ...pendingInsurerFake, response_status: "accepted" as const };

vi.mock("../../hooks/use-update-quotation-insurer", () => ({
  useUpdateQuotationInsurer: () => ({ mutate: updateMutateMock, isPending: false }),
}));

vi.mock("../../hooks/use-set-winning-insurer", () => ({
  useSetWinningInsurer: () => ({ mutate: setWinningMutateMock, isPending: false }),
}));

// Isola do componente de timeline/comentários (tem seus próprios hooks e é
// testado à parte, se necessário).
vi.mock("./quotation-insurer-events-timeline", () => ({
  QuotationInsurerEventsTimeline: () => null,
}));

describe("QuotationInsurerDrawer", () => {
  beforeEach(() => {
    updateMutateMock.mockClear();
    setWinningMutateMock.mockClear();
  });

  it("edita o retorno e salva", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <QuotationInsurerDrawer
        quotationId="q1"
        quotationInsurer={pendingInsurerFake}
        canEdit
        canMarkWinner
        onOpenChange={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText("Status da resposta"));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("Aceita"));

    fireEvent.change(screen.getByLabelText("Prêmio proposto (R$)"), {
      target: { value: "15000" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Salvar retorno" }));

    await vi.waitFor(() => {
      expect(updateMutateMock).toHaveBeenCalledWith(
        expect.objectContaining({ id: "qi1", response_status: "accepted", premium_amount: 15000 }),
        expect.any(Object),
      );
    });
  });

  it("mostra 'Marcar como vencedora' só quando aceita, ainda não vencedora e pode marcar", () => {
    renderWithProviders(
      <QuotationInsurerDrawer
        quotationId="q1"
        quotationInsurer={acceptedInsurerFake}
        canEdit
        canMarkWinner
        onOpenChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Marcar como vencedora" }));
    expect(setWinningMutateMock).toHaveBeenCalledWith("qi1", expect.any(Object));
  });

  it("não mostra 'Marcar como vencedora' quando ainda pendente", () => {
    renderWithProviders(
      <QuotationInsurerDrawer
        quotationId="q1"
        quotationInsurer={pendingInsurerFake}
        canEdit
        canMarkWinner
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Marcar como vencedora" })).not.toBeInTheDocument();
  });

  it("não mostra 'Marcar como vencedora' quando canMarkWinner é falso (status já travado)", () => {
    renderWithProviders(
      <QuotationInsurerDrawer
        quotationId="q1"
        quotationInsurer={acceptedInsurerFake}
        canEdit
        canMarkWinner={false}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Marcar como vencedora" })).not.toBeInTheDocument();
  });

  it("seller (canEdit=false) vê os campos desabilitados e sem botão de salvar", () => {
    renderWithProviders(
      <QuotationInsurerDrawer
        quotationId="q1"
        quotationInsurer={acceptedInsurerFake}
        canEdit={false}
        canMarkWinner={false}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Status da resposta")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Salvar retorno" })).not.toBeInTheDocument();
  });
});
