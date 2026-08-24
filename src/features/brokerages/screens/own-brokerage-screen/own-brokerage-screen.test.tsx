import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { OwnBrokerageScreen } from "./own-brokerage-screen";

const mutateMock = vi.fn();
const refetchMock = vi.fn();

const brokerageFake = {
  id: "b1",
  name: "Minha Corretora",
  logo_url: null,
  primary_color: null,
  plan_id: null,
  plan_expires_at: null,
  status: "active" as const,
  trade_name: null,
  tax_id: null,
  business_code: null,
  state_registration: null,
  email: null,
  phone: null,
  zip_code: null,
  street: null,
  street_number: null,
  complement: null,
  neighborhood: null,
  city: null,
  state: null,
  representative_name: null,
  representative_email: null,
  financial_name: null,
  financial_email: null,
  created_at: "",
  updated_at: "",
};

vi.mock("../../hooks/use-own-brokerage", () => ({
  useOwnBrokerage: () => ({
    data: brokerageFake,
    isLoading: false,
    isError: false,
    refetch: refetchMock,
  }),
}));

vi.mock("../../hooks/use-update-own-brokerage", () => ({
  useUpdateOwnBrokerage: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock("@/shared/lib/via-cep", () => ({
  fetchCepData: vi.fn(),
}));

describe("OwnBrokerageScreen", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("vem pré-preenchido com os dados atuais", () => {
    renderWithProviders(<OwnBrokerageScreen />);

    expect(screen.getByLabelText("Razão social")).toHaveValue("Minha Corretora");
  });

  it("chama a mutation com os valores editados", async () => {
    renderWithProviders(<OwnBrokerageScreen />);

    fireEvent.change(screen.getByLabelText("Razão social"), { target: { value: "Nome Novo" } });
    fireEvent.change(screen.getByLabelText("URL do logo"), {
      target: { value: "https://exemplo.com/logo.png" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        {
          id: "b1",
          name: "Nome Novo",
          logo_url: "https://exemplo.com/logo.png",
          primary_color: null,
          trade_name: null,
          tax_id: null,
          business_code: null,
          state_registration: null,
          email: null,
          phone: null,
          zip_code: null,
          street: null,
          street_number: null,
          complement: null,
          neighborhood: null,
          city: null,
          state: null,
          representative_name: null,
          representative_email: null,
          financial_name: null,
          financial_email: null,
        },
        expect.any(Object),
      );
    });
  });

  it("busca dados do CEP e preenche endereço", async () => {
    const { fetchCepData } = await import("@/shared/lib/via-cep");
    vi.mocked(fetchCepData).mockResolvedValue({
      street: "Av. Paulista",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    });

    renderWithProviders(<OwnBrokerageScreen />);

    fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "01310100" } });
    // "Buscar" aparece 2x (CNPJ e CEP) — o de CEP vem depois no DOM.
    fireEvent.click(screen.getAllByRole("button", { name: "Buscar" })[1]);

    expect(await screen.findByDisplayValue("Av. Paulista")).toBeInTheDocument();
  });
});
