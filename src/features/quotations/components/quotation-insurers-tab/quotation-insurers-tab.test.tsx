import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { QuotationInsurersTab } from "./quotation-insurers-tab";

const inviteMutateMock = vi.fn();

const quotationFake = {
  id: "q1",
  brokerage_id: "b1",
  client_id: "c1",
  seller_id: "u-seller-1",
  analyst_id: "u-analyst-1",
  number: "QT-2026-0001",
  status: "in_progress" as const,
  quotation_type: null,
  coverage_start: null,
  coverage_end: null,
  coverages: null,
  deductible_pref: null,
  due_date: null,
  seller_notes: null,
  lost_reason: null,
  created_at: "",
  updated_at: "",
};

const quotationInsurersFake = [
  {
    id: "qi1",
    quotation_id: "q1",
    insurer_id: "i1",
    brokerage_id: "b1",
    response_status: "accepted" as const,
    premium_amount: 12000,
    deductible_amount: null,
    commission_rate: null,
    installments_count: null,
    insurer_quotation_number: null,
    approved_coverages: null,
    analyst_notes: null,
    is_winner: true,
    responded_at: null,
    created_at: "",
    insurers: { id: "i1", name: "Seguradora Alfa" },
  },
];

const catalogFake = [
  { id: "i1", name: "Seguradora Alfa", brokerage_disabled_insurers: [] },
  { id: "i2", name: "Seguradora Nova", brokerage_disabled_insurers: [] },
];

let usuarioMock: { role: string } = { role: "analyst" };

vi.mock("@/features/auth", () => ({
  useAuthStore: (selector: (state: { usuario: typeof usuarioMock }) => unknown) =>
    selector({ usuario: usuarioMock }),
}));

vi.mock("@/features/insurers", () => ({
  useInsurerCatalog: () => ({ data: catalogFake, isLoading: false }),
}));

vi.mock("../../hooks/use-quotation-insurers", () => ({
  useQuotationInsurers: () => ({
    data: quotationInsurersFake,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../hooks/use-invite-quotation-insurer", () => ({
  useInviteQuotationInsurer: () => ({ mutate: inviteMutateMock, isPending: false }),
}));

// Isola o teste da lista do drawer de retorno/timeline (testado à parte).
vi.mock("./quotation-insurer-drawer", () => ({
  QuotationInsurerDrawer: () => null,
}));

describe("QuotationInsurersTab", () => {
  beforeEach(() => {
    inviteMutateMock.mockClear();
    usuarioMock = { role: "analyst" };
  });

  it("analyst convida uma seguradora nova do catálogo", async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuotationInsurersTab quotation={quotationFake} />);

    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("Seguradora Nova"));

    fireEvent.click(screen.getByRole("button", { name: "Convidar seguradora" }));

    expect(inviteMutateMock).toHaveBeenCalledWith(
      { quotation_id: "q1", insurer_id: "i2" },
      expect.any(Object),
    );
  });

  it("já convidada some da lista de seleção — só a seguradora nova aparece", async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuotationInsurersTab quotation={quotationFake} />);

    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    expect(within(listbox).queryByText("Seguradora Alfa")).not.toBeInTheDocument();
    expect(within(listbox).getByText("Seguradora Nova")).toBeInTheDocument();
  });

  it("mostra a seguradora como coluna, com o status e o badge de vencedora", () => {
    renderWithProviders(<QuotationInsurersTab quotation={quotationFake} />);

    const headerRow = screen.getByRole("row", { name: /Seguradora Alfa/ });
    expect(within(headerRow).getByText("Vencedora")).toBeInTheDocument();

    const statusRow = screen.getByRole("row", { name: /Status/ });
    expect(within(statusRow).getByText("Aceita")).toBeInTheDocument();
  });

  it("seller não vê o seletor de convidar e o botão de linha é 'Ver', não 'Editar'", () => {
    usuarioMock = { role: "seller" };
    renderWithProviders(<QuotationInsurersTab quotation={quotationFake} />);

    expect(screen.queryByRole("button", { name: "Convidar seguradora" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver" })).toBeInTheDocument();
  });
});
