import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";
import { fetchCnpjData } from "@/shared/lib/brasil-api";

import { CreateBrokerageDrawer } from "./create-brokerage-drawer";

const mutateMock = vi.fn();

vi.mock("../../hooks/use-create-brokerage", () => ({
  useCreateBrokerage: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock("@/shared/lib/brasil-api", () => ({
  fetchCnpjData: vi.fn(),
}));

describe("CreateBrokerageDrawer", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("mostra erros de validação ao submeter vazio", async () => {
    renderWithProviders(<CreateBrokerageDrawer />);

    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    expect(await screen.findByText("Informe o nome da corretora")).toBeInTheDocument();
    expect(await screen.findByText("Informe o nome do representante")).toBeInTheDocument();
    expect(await screen.findByText("Informe o e-mail do representante")).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("aplica a máscara de CNPJ e telefone durante a digitação", async () => {
    renderWithProviders(<CreateBrokerageDrawer />);

    fireEvent.change(screen.getByLabelText("CNPJ"), { target: { value: "11222333000181" } });
    expect(screen.getByLabelText("CNPJ")).toHaveValue("11.222.333/0001-81");

    fireEvent.change(screen.getByLabelText("Telefone"), { target: { value: "11987654321" } });
    expect(screen.getByLabelText("Telefone")).toHaveValue("(11) 98765-4321");

    fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "01310100" } });
    expect(screen.getByLabelText("CEP")).toHaveValue("01310-100");

    fireEvent.change(screen.getByLabelText("UF"), { target: { value: "sp" } });
    expect(screen.getByLabelText("UF")).toHaveValue("SP");
  });

  it("chama a mutation com os valores do formulário (representante = primeiro admin)", async () => {
    renderWithProviders(<CreateBrokerageDrawer />);

    fireEvent.change(screen.getByLabelText("Razão social"), {
      target: { value: "Nova Corretora" },
    });
    fireEvent.change(screen.getByLabelText("Nome do representante"), {
      target: { value: "Representante Novo" },
    });
    fireEvent.change(screen.getByLabelText("E-mail do representante"), {
      target: { value: "representante@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        {
          brokerage_name: "Nova Corretora",
          representative_name: "Representante Novo",
          representative_email: "representante@example.com",
          plan_id: null,
          plan_expires_at: null,
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
          financial_name: null,
          financial_email: null,
        },
        expect.any(Object),
      );
    });
  });

  it("busca dados do CNPJ e preenche os campos correspondentes", async () => {
    vi.mocked(fetchCnpjData).mockResolvedValue({
      name: "Empresa Buscada LTDA",
      trade_name: "Empresa Buscada",
      business_code: "6622-3/00 - Corretores de seguros",
      email: "contato@empresabuscada.com",
      phone: "1140028922",
      zip_code: "01310100",
      street: "Av. Paulista",
      street_number: "1000",
      complement: null,
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    });

    renderWithProviders(<CreateBrokerageDrawer />);

    fireEvent.change(screen.getByLabelText("CNPJ"), { target: { value: "11222333000181" } });
    // "Buscar" aparece 2x (CNPJ e CEP) — o de CNPJ vem primeiro no DOM.
    fireEvent.click(screen.getAllByRole("button", { name: "Buscar" })[0]);

    expect(await screen.findByDisplayValue("Empresa Buscada LTDA")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Empresa Buscada")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Av. Paulista")).toBeInTheDocument();
    // Telefone/CEP retornados como dígitos crus pela API — devem chegar
    // formatados na tela (mesma máscara da digitação manual).
    expect(screen.getByDisplayValue("(11) 4002-8922")).toBeInTheDocument();
    expect(screen.getByDisplayValue("01310-100")).toBeInTheDocument();
  });
});
