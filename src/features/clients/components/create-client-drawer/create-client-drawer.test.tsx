import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { CreateClientDrawer } from "./create-client-drawer";

const createMutateMock = vi.fn();
const addSellerMutateAsyncMock = vi.fn();

let roleMock: "seller" | "supervisor" = "supervisor";

const sellersFake = [
  { id: "s1", full_name: "Vendedor Um", role: "seller" },
  { id: "s2", full_name: "Vendedor Dois", role: "seller" },
];

vi.mock("@/features/auth", () => ({
  useAuthStore: (selector: (state: { usuario: { role: string } }) => unknown) =>
    selector({ usuario: { role: roleMock } }),
}));

vi.mock("@/features/users", () => ({
  useUsers: () => ({ data: sellersFake }),
}));

vi.mock("../../hooks/use-create-client", () => ({
  useCreateClient: () => ({ mutate: createMutateMock, isPending: false }),
}));

vi.mock("../../hooks/use-add-client-seller", () => ({
  useAddClientSeller: () => ({ mutateAsync: addSellerMutateAsyncMock }),
}));

describe("CreateClientDrawer", () => {
  beforeEach(() => {
    createMutateMock.mockClear();
    addSellerMutateAsyncMock.mockClear();
    roleMock = "supervisor";
  });

  it("seller não vê a seção de vendedores responsáveis", () => {
    roleMock = "seller";
    renderWithProviders(<CreateClientDrawer />);

    expect(screen.queryByText("Vendedores responsáveis")).not.toBeInTheDocument();
  });

  it("supervisor vê a seção de vendedores responsáveis", () => {
    renderWithProviders(<CreateClientDrawer />);

    expect(screen.getByText("Vendedores responsáveis")).toBeInTheDocument();
    expect(screen.getByText("Vendedor Um")).toBeInTheDocument();
  });

  it("mostra erro de validação ao submeter sem nome", async () => {
    renderWithProviders(<CreateClientDrawer />);

    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    expect(await screen.findByText("Informe o nome")).toBeInTheDocument();
    expect(createMutateMock).not.toHaveBeenCalled();
  });

  it("chama a mutation com os dados do formulário", async () => {
    renderWithProviders(<CreateClientDrawer />);

    fireEvent.change(screen.getByLabelText("Razão social *"), {
      target: { value: "Cliente Teste" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    await waitFor(() => {
      expect(createMutateMock).toHaveBeenCalledWith(
        expect.objectContaining({ legal_name: "Cliente Teste", client_type: "company" }),
        expect.any(Object),
      );
    });
  });

  it("vincula os vendedores selecionados após criar o cliente com sucesso", async () => {
    createMutateMock.mockImplementation((_input, { onSuccess }) => {
      onSuccess({ id: "new-client-id" });
    });
    addSellerMutateAsyncMock.mockResolvedValue(undefined);

    renderWithProviders(<CreateClientDrawer />);

    fireEvent.change(screen.getByLabelText("Razão social *"), {
      target: { value: "Cliente Teste" },
    });
    fireEvent.click(screen.getByLabelText("Vendedor Um"));
    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    await waitFor(() => {
      expect(addSellerMutateAsyncMock).toHaveBeenCalledWith({
        clientId: "new-client-id",
        sellerId: "s1",
        isPrimary: true,
      });
    });
  });
});
