import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { EditPolicyDrawer } from "./edit-policy-drawer";

const mutateMock = vi.fn();

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

vi.mock("../../hooks/use-policy", () => ({
  usePolicy: () => ({
    data: policyFake,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../hooks/use-update-policy", () => ({
  useUpdatePolicy: () => ({ mutate: mutateMock, isPending: false }),
}));

function renderDrawer() {
  return renderWithProviders(
    <Routes>
      <Route path="/policies/:policyId/edit" element={<EditPolicyDrawer />} />
    </Routes>,
    { route: "/policies/p1/edit" },
  );
}

describe("EditPolicyDrawer", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("vem pré-preenchido com os dados atuais da apólice", () => {
    renderDrawer();

    expect(screen.getByLabelText("Número da apólice")).toHaveValue("AP-2026-0001");
    expect(screen.getByLabelText("Prêmio (R$)")).toHaveValue(15000);
    expect(screen.getByLabelText("Valor total da frota (R$)")).toHaveValue(400000);
  });

  it("salva os valores editados", async () => {
    renderDrawer();

    fireEvent.change(screen.getByLabelText("Número da apólice"), {
      target: { value: "AP-2026-0002" },
    });
    fireEvent.change(screen.getByLabelText("Prêmio (R$)"), { target: { value: "18000" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({ id: "p1", policy_number: "AP-2026-0002", premium_amount: 18000 }),
        expect.any(Object),
      );
    });
  });
});
