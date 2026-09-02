import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { PolicyDetailScreen } from "./policy-detail-screen";

const policyFake = {
  id: "p1",
  brokerage_id: "b1",
  client_id: "c1",
  insurer_id: "i1",
  quotation_id: "q1",
  renewed_from_policy_id: null,
  policy_number: "AP-2026-0001",
  premium_amount: 15000,
  total_fleet_value: 400000,
  coverage_start: "2026-01-01",
  coverage_end: "2026-12-01",
  status: "active" as const,
  created_at: "",
  updated_at: "",
  clients: { id: "c1", legal_name: "Cliente Um" },
  insurers: { id: "i1", name: "Seguradora Um" },
  quotations: { id: "q1", number: "QT-2026-0001" },
};

let usuarioMock: { role: string } = { role: "supervisor" };
let renewedFromMock: { id: string; policy_number: string | null } | null = null;
let renewedByMock: { id: string; policy_number: string | null } | null = null;

vi.mock("@/features/auth", () => ({
  useAuthStore: (selector: (state: { usuario: typeof usuarioMock }) => unknown) =>
    selector({ usuario: usuarioMock }),
}));

vi.mock("../../hooks/use-policy", () => ({
  usePolicy: () => ({ data: policyFake, isLoading: false, isError: false, refetch: vi.fn() }),
}));

vi.mock("../../hooks/use-renewed-by-policy", () => ({
  useRenewedByPolicy: () => ({ data: renewedByMock }),
}));

vi.mock("../../hooks/use-renewed-from-policy", () => ({
  useRenewedFromPolicy: () => ({ data: renewedFromMock }),
}));

// Isola do componente de anexos (tem seus próprios hooks, testado à parte).
vi.mock("./policy-attachments-section", () => ({
  PolicyAttachmentsSection: () => null,
}));

// Isola do componente de veículos (tem seus próprios hooks, testado à parte).
vi.mock("./policy-vehicles-section", () => ({
  PolicyVehiclesSection: () => null,
}));

// Isola do componente de endossos (tem seus próprios hooks, testado à parte).
vi.mock("./policy-endorsements-section", () => ({
  PolicyEndorsementsSection: () => null,
}));

function renderScreen() {
  return renderWithProviders(
    <Routes>
      <Route path="/policies/:policyId" element={<PolicyDetailScreen />} />
    </Routes>,
    { route: "/policies/p1" },
  );
}

describe("PolicyDetailScreen", () => {
  beforeEach(() => {
    usuarioMock = { role: "supervisor" };
    renewedFromMock = null;
    renewedByMock = null;
  });

  it("mostra os dados gerais e o link pra cotação de origem", () => {
    renderScreen();

    expect(screen.getByRole("heading", { name: "AP-2026-0001" })).toBeInTheDocument();
    expect(screen.getByText("Vigente")).toBeInTheDocument();
    expect(screen.getByText("Cliente Um")).toBeInTheDocument();
    expect(screen.getByText("Seguradora Um")).toBeInTheDocument();
    expect(screen.getByText("R$ 15.000,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 400.000,00")).toBeInTheDocument();

    const quotationLink = screen.getByRole("link", { name: "QT-2026-0001" });
    expect(quotationLink).toHaveAttribute("href", "/quotations/q1");
  });

  it("mostra o vínculo de renovação nos dois sentidos quando existe", () => {
    renewedFromMock = { id: "p0", policy_number: "AP-2025-0009" };
    renewedByMock = { id: "p2", policy_number: "AP-2027-0002" };
    renderScreen();

    expect(screen.getByRole("link", { name: "AP-2025-0009" })).toHaveAttribute(
      "href",
      "/policies/p0",
    );
    expect(screen.getByRole("link", { name: "AP-2027-0002" })).toHaveAttribute(
      "href",
      "/policies/p2",
    );
  });

  it("não mostra seção de renovação quando não há vínculo em nenhum sentido", () => {
    renderScreen();

    expect(screen.queryByText("Renova a apólice")).not.toBeInTheDocument();
    expect(screen.queryByText("Renovada pela apólice")).not.toBeInTheDocument();
  });
});
