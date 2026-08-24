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
    expect(await screen.findByText("Informe o nome do administrador")).toBeInTheDocument();
    expect(await screen.findByText("Informe o e-mail do administrador")).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("chama a mutation com os valores do formulário", async () => {
    renderWithProviders(<CreateBrokerageDrawer />);

    fireEvent.change(screen.getByLabelText("Razão social"), {
      target: { value: "Nova Corretora" },
    });
    fireEvent.change(screen.getByLabelText("Nome", { selector: "#admin_full_name" }), {
      target: { value: "Admin Novo" },
    });
    fireEvent.change(screen.getByLabelText("E-mail", { selector: "#admin_email" }), {
      target: { value: "admin@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        {
          brokerage_name: "Nova Corretora",
          admin_full_name: "Admin Novo",
          admin_email: "admin@example.com",
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
  });
});
