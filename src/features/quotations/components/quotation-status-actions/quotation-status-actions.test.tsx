import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { QuotationStatusActions } from "./quotation-status-actions";

const mutateMock = vi.fn();

const baseQuotation = {
  id: "q1",
  brokerage_id: "b1",
  client_id: "c1",
  seller_id: "u-seller-1",
  analyst_id: null,
  number: "QT-2026-0001",
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

let usuarioMock: { id: string; role: string } | null = { id: "u-analyst-1", role: "analyst" };

vi.mock("@/features/auth", () => ({
  useAuthStore: (selector: (state: { usuario: typeof usuarioMock }) => unknown) =>
    selector({ usuario: usuarioMock }),
}));

vi.mock("../../hooks/use-advance-quotation-status", () => ({
  useAdvanceQuotationStatus: () => ({ mutate: mutateMock, isPending: false }),
}));

describe("QuotationStatusActions", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("analyst vê e aciona a transição waiting → in_progress", () => {
    usuarioMock = { id: "u-analyst-1", role: "analyst" };
    renderWithProviders(
      <QuotationStatusActions quotation={{ ...baseQuotation, status: "waiting" }} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Iniciar cotação" }));

    expect(mutateMock).toHaveBeenCalledWith(
      { id: "q1", status: "in_progress" },
      expect.any(Object),
    );
  });

  it("seller não vê nenhuma ação em waiting", () => {
    usuarioMock = { id: "u-seller-1", role: "seller" };
    renderWithProviders(
      <QuotationStatusActions quotation={{ ...baseQuotation, status: "waiting" }} />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("seller dono da cotação vê 'Enviar ao cliente' em presented, mas não outro seller", () => {
    usuarioMock = { id: "u-seller-1", role: "seller" };
    const { rerender } = renderWithProviders(
      <QuotationStatusActions quotation={{ ...baseQuotation, status: "presented" }} />,
    );
    expect(screen.getByRole("button", { name: "Enviar ao cliente" })).toBeInTheDocument();

    usuarioMock = { id: "u-seller-2", role: "seller" };
    rerender(<QuotationStatusActions quotation={{ ...baseQuotation, status: "presented" }} />);
    expect(screen.queryByRole("button", { name: "Enviar ao cliente" })).not.toBeInTheDocument();
  });

  it("client_accepted só mostra ações pra supervisor/brokerage_admin/platform_admin", () => {
    usuarioMock = { id: "u-seller-1", role: "seller" };
    const { rerender } = renderWithProviders(
      <QuotationStatusActions quotation={{ ...baseQuotation, status: "client_accepted" }} />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    usuarioMock = { id: "u-supervisor", role: "supervisor" };
    rerender(
      <QuotationStatusActions quotation={{ ...baseQuotation, status: "client_accepted" }} />,
    );
    expect(screen.getByRole("button", { name: "Efetivar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Não fechada" })).toBeInTheDocument();
  });

  it("clicar 'Não fechada' abre o diálogo em vez de chamar a mutation direto", () => {
    usuarioMock = { id: "u-supervisor", role: "supervisor" };
    renderWithProviders(
      <QuotationStatusActions quotation={{ ...baseQuotation, status: "client_accepted" }} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Não fechada" }));

    expect(mutateMock).not.toHaveBeenCalled();
    expect(screen.getByText("Marcar como não fechada")).toBeInTheDocument();
  });

  it("estado terminal (effected) não mostra nenhuma ação", () => {
    usuarioMock = { id: "u-supervisor", role: "supervisor" };
    renderWithProviders(
      <QuotationStatusActions quotation={{ ...baseQuotation, status: "effected" }} />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
