import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { CreateQuotationWizard } from "./create-quotation-wizard";

const createMutateMock = vi.fn();
const updateMutateMock = vi.fn();

const quotationFake = {
  id: "q1",
  client_id: "c1",
  seller_id: null,
  quotation_type: null,
  coverage_start: null,
  coverage_end: null,
  coverages: null,
  deductible_pref: null,
  due_date: null,
  seller_notes: null,
  status: "waiting",
};

const clientsFake = [
  { id: "c1", legal_name: "Cliente Um" },
  { id: "c2", legal_name: "Cliente Dois" },
];

const usersFake = [
  { id: "u-seller-1", full_name: "Vendedor Um", role: "seller" },
  { id: "u-seller-2", full_name: "Vendedor Dois", role: "seller" },
];

let usuarioMock: { id: string; role: string } = { id: "u-supervisor", role: "supervisor" };

vi.mock("@/features/auth", () => ({
  useAuthStore: (selector: (state: { usuario: typeof usuarioMock }) => unknown) =>
    selector({ usuario: usuarioMock }),
}));

vi.mock("@/features/clients", () => ({
  useClients: () => ({ data: clientsFake }),
}));

vi.mock("@/features/users", () => ({
  useUsers: () => ({ data: usersFake }),
}));

vi.mock("../../hooks/use-create-quotation", () => ({
  useCreateQuotation: () => ({
    mutate: createMutateMock,
    isPending: false,
  }),
}));

vi.mock("../../hooks/use-update-quotation", () => ({
  useUpdateQuotation: () => ({
    mutate: updateMutateMock,
    isPending: false,
  }),
}));

// Isolados: cada um já tem seus próprios testes, aqui só verificamos que o
// passo certo renderiza o componente certo com as props certas.
vi.mock("../quotation-qar-tab", () => ({
  QuotationQarTab: ({ quotationId, clientId }: { quotationId: string; clientId: string }) => (
    <div data-testid="qar-mock">
      QAR mock — {quotationId} / {clientId}
    </div>
  ),
}));

vi.mock("../quotation-vehicles-tab", () => ({
  QuotationVehiclesTab: ({ quotation }: { quotation: { id: string } }) => (
    <div data-testid="vehicles-mock">Vehicles mock — {quotation.id}</div>
  ),
}));

async function selectClientAndAdvance(user: ReturnType<typeof userEvent.setup>) {
  const comboboxes = screen.getAllByRole("combobox");
  await user.click(comboboxes[0]);
  const listbox = await screen.findByRole("listbox");
  await user.click(within(listbox).getByText("Cliente Um"));

  await user.click(screen.getByRole("button", { name: "Próximo" }));
}

describe("CreateQuotationWizard", () => {
  beforeEach(() => {
    createMutateMock.mockClear();
    updateMutateMock.mockClear();
    usuarioMock = { id: "u-supervisor", role: "supervisor" };

    createMutateMock.mockImplementation((_input, { onSuccess }) => {
      onSuccess(quotationFake);
    });
    updateMutateMock.mockImplementation((_input, { onSuccess }) => {
      onSuccess(quotationFake);
    });
  });

  it("mostra erro de validação ao tentar avançar sem cliente", async () => {
    renderWithProviders(<CreateQuotationWizard />);

    fireEvent.click(screen.getByRole("button", { name: "Próximo" }));

    expect(await screen.findByText("Selecione um cliente")).toBeInTheDocument();
    expect(createMutateMock).not.toHaveBeenCalled();
  });

  it("supervisor vê o seletor de vendedor no passo 1", () => {
    renderWithProviders(<CreateQuotationWizard />);

    expect(screen.getByText("Vendedor responsável")).toBeInTheDocument();
  });

  it("seller não vê o seletor de vendedor e a cotação sai com o próprio seller_id", async () => {
    usuarioMock = { id: "u-seller-1", role: "seller" };
    const user = userEvent.setup();
    renderWithProviders(<CreateQuotationWizard />);

    expect(screen.queryByText("Vendedor responsável")).not.toBeInTheDocument();

    await selectClientAndAdvance(user);

    expect(createMutateMock).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "c1", seller_id: "u-seller-1" }),
      expect.any(Object),
    );
  });

  it("cria a cotação ao avançar do passo 1 e mostra o QAR no passo 2, sem botão Voltar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateQuotationWizard />);

    await selectClientAndAdvance(user);

    expect(screen.getByText("Passo 2 de 4 — QAR")).toBeInTheDocument();
    expect(screen.getByTestId("qar-mock")).toHaveTextContent("q1 / c1");
    expect(screen.queryByRole("button", { name: "Voltar" })).not.toBeInTheDocument();
  });

  it("avança do QAR pros Veículos e mostra o botão Voltar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateQuotationWizard />);

    await selectClientAndAdvance(user);
    fireEvent.click(screen.getByRole("button", { name: "Próximo" }));

    expect(screen.getByText("Passo 3 de 4 — Veículos")).toBeInTheDocument();
    expect(screen.getByTestId("vehicles-mock")).toHaveTextContent("q1");
    expect(screen.getByRole("button", { name: "Voltar" })).toBeInTheDocument();
  });

  it("chega no Fechamento e conclui a cotação", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateQuotationWizard />);

    await selectClientAndAdvance(user);
    fireEvent.click(screen.getByRole("button", { name: "Próximo" })); // -> veículos
    fireEvent.click(screen.getByRole("button", { name: "Próximo" })); // -> fechamento

    expect(screen.getByText("Passo 4 de 4 — Fechamento")).toBeInTheDocument();
    expect(screen.getByText("Cobertura pretendida")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Concluir" }));

    expect(updateMutateMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "q1" }),
      expect.any(Object),
    );
  });
});
