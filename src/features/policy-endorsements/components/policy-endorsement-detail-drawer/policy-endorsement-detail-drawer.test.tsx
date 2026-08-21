import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import type { PolicyEndorsementWithVehicle } from "../../types/policy-endorsement";
import { PolicyEndorsementDetailDrawer } from "./policy-endorsement-detail-drawer";

const advanceMutateMock = vi.fn();

let usuarioMock: { id: string; role: string } = { id: "u-analyst-1", role: "analyst" };

const waitingEndorsementFake: PolicyEndorsementWithVehicle = {
  id: "pe1",
  policy_id: "p1",
  brokerage_id: "b1",
  endorsement_type: "administrative_correction" as const,
  status: "waiting" as const,
  seller_id: "u-seller-1",
  description: "Ajuste de vigência",
  vehicle_id: null,
  vehicles: null,
  coverage_type: null,
  casco_percentage: null,
  casco_value: null,
  franchise_type: null,
  bonus: null,
  claims_count: null,
  rcf_dm: null,
  rcf_dc: null,
  rcf_dmo: null,
  app_death: null,
  app_disability: null,
  assistance: null,
  glass_coverage: null,
  reserve_car: null,
  bodywork_value: null,
  bodywork_type: null,
  equipment_value: null,
  equipment_type: null,
  armoring_value: null,
  premium_adjustment: null,
  insurer_response_notes: null,
  responded_at: null,
  responded_by: null,
  client_response_notes: null,
  client_responded_at: null,
  client_responded_by: null,
  not_closed_reason: null,
  new_policy_id: null,
  new_policy_number: null,
  new_premium_amount: null,
  new_total_fleet_value: null,
  new_coverage_start: null,
  new_coverage_end: null,
  effected_at: null,
  effected_by: null,
  created_at: "",
  updated_at: "",
};

let endorsementMock: PolicyEndorsementWithVehicle = waitingEndorsementFake;

vi.mock("@/features/auth", () => ({
  useAuthStore: (selector: (state: { usuario: typeof usuarioMock }) => unknown) =>
    selector({ usuario: usuarioMock }),
}));

vi.mock("../../hooks/use-policy-endorsement", () => ({
  usePolicyEndorsement: () => ({
    data: endorsementMock,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../hooks/use-advance-policy-endorsement-status", () => ({
  useAdvancePolicyEndorsementStatus: () => ({ mutate: advanceMutateMock, isPending: false }),
}));

// Isola do botão de PDF (tem seus próprios hooks, fora do escopo deste teste).
vi.mock("../policy-endorsement-document", () => ({
  PolicyEndorsementPdfActions: () => null,
}));

function renderDrawer() {
  return renderWithProviders(
    <Routes>
      <Route
        path="/policies/:policyId/endorsements/:endorsementId"
        element={<PolicyEndorsementDetailDrawer />}
      />
    </Routes>,
    { route: "/policies/p1/endorsements/pe1" },
  );
}

describe("PolicyEndorsementDetailDrawer", () => {
  beforeEach(() => {
    advanceMutateMock.mockClear();
    usuarioMock = { id: "u-analyst-1", role: "analyst" };
    endorsementMock = waitingEndorsementFake;
  });

  it("mostra os dados gerais e o badge de status", () => {
    renderDrawer();

    expect(screen.getByRole("heading", { name: /Correção administrativa/ })).toBeInTheDocument();
    expect(screen.getByText("Aguardando seguradora")).toBeInTheDocument();
    expect(screen.getByText("Ajuste de vigência")).toBeInTheDocument();
  });

  it("analyst registra o retorno da seguradora via navegação interna (sem modal)", async () => {
    renderDrawer();

    fireEvent.click(screen.getByRole("button", { name: "Registrar retorno da seguradora" }));

    expect(screen.getByText("Voltar")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Ajuste de prêmio (R$)"), { target: { value: "500" } });
    fireEvent.change(screen.getByLabelText("Notas do retorno"), {
      target: { value: "Seguradora aprovou" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar e apresentar ao cliente" }));

    await vi.waitFor(() => {
      expect(advanceMutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "pe1",
          status: "presented",
          premium_adjustment: 500,
          insurer_response_notes: "Seguradora aprovou",
        }),
        expect.any(Object),
      );
    });
  });

  it("seller não vê 'Registrar retorno da seguradora' num endosso aguardando seguradora", () => {
    usuarioMock = { id: "u-seller-1", role: "seller" };
    renderDrawer();

    expect(
      screen.queryByRole("button", { name: "Registrar retorno da seguradora" }),
    ).not.toBeInTheDocument();
  });

  it("endosso efetivado não mostra mais ações de transição", () => {
    endorsementMock = {
      ...waitingEndorsementFake,
      status: "effected",
      effected_at: "2026-08-20T12:00:00Z",
      new_policy_id: "p2",
    };
    usuarioMock = { id: "u-supervisor-1", role: "supervisor" };
    renderDrawer();

    expect(screen.getByText("Efetivação")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Efetivar" })).not.toBeInTheDocument();
  });
});
