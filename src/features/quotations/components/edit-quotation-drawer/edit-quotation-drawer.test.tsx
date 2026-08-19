import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { EditQuotationDrawer } from "./edit-quotation-drawer";

const mutateMock = vi.fn();

const usersFake = [
  { id: "u-seller-1", full_name: "Vendedor Um", role: "seller" },
  { id: "u-seller-2", full_name: "Vendedor Dois", role: "seller" },
];

const quotationFake = {
  id: "q1",
  brokerage_id: "b1",
  client_id: "c1",
  seller_id: "u-seller-1",
  analyst_id: null,
  number: "QT-2026-0001",
  status: "waiting" as const,
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
  clients: { id: "c1", legal_name: "Cliente Um" },
  seller: { id: "u-seller-1", full_name: "Vendedor Um" },
};

let usuarioMock: { role: string } = { role: "supervisor" };

vi.mock("@/features/auth", () => ({
  useAuthStore: (selector: (state: { usuario: typeof usuarioMock }) => unknown) =>
    selector({ usuario: usuarioMock }),
}));

vi.mock("@/features/users", () => ({
  useUsers: () => ({ data: usersFake, isLoading: false }),
}));

vi.mock("../../hooks/use-update-quotation", () => ({
  useUpdateQuotation: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock("../../hooks/use-quotation", () => ({
  useQuotation: () => ({
    data: quotationFake,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

function renderDrawer() {
  return renderWithProviders(
    <Routes>
      <Route path="/quotations/:quotationId/edit" element={<EditQuotationDrawer />} />
    </Routes>,
    { route: "/quotations/q1/edit" },
  );
}

describe("EditQuotationDrawer", () => {
  beforeEach(() => {
    mutateMock.mockClear();
    usuarioMock = { role: "supervisor" };
  });

  it("vem pré-preenchido com os dados atuais da cotação", () => {
    renderDrawer();

    expect(screen.getAllByRole("combobox")[0]).toHaveTextContent("Vendedor Um");
  });

  it("não mostra o campo de cliente — não é editável", () => {
    renderDrawer();

    expect(screen.queryByText("Cliente")).not.toBeInTheDocument();
  });

  it("supervisor reatribui o vendedor responsável e salva", async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.click(screen.getAllByRole("combobox")[0]);
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("Vendedor Dois"));

    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({ id: "q1", seller_id: "u-seller-2" }),
        expect.any(Object),
      );
    });
  });

  it("seller não vê o campo de vendedor responsável", () => {
    usuarioMock = { role: "seller" };
    renderDrawer();

    expect(screen.queryByText("Vendedor responsável")).not.toBeInTheDocument();
  });
});
