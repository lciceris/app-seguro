import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { CreateQuotationDrawer } from "./create-quotation-drawer";

const mutateMock = vi.fn();

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
  useCreateQuotation: () => ({ mutate: mutateMock, isPending: false }),
}));

describe("CreateQuotationDrawer", () => {
  beforeEach(() => {
    mutateMock.mockClear();
    usuarioMock = { id: "u-supervisor", role: "supervisor" };
  });

  it("mostra erro de validação ao submeter sem cliente", async () => {
    renderWithProviders(<CreateQuotationDrawer />);

    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    expect(await screen.findByText("Selecione um cliente")).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("supervisor vê o seletor de vendedor e escolhe um responsável", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateQuotationDrawer />);

    const comboboxes = screen.getAllByRole("combobox");
    await user.click(comboboxes[0]); // client_id
    let listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("Cliente Um"));

    await user.click(comboboxes[1]); // seller_id
    listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("Vendedor Dois"));

    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({ client_id: "c1", seller_id: "u-seller-2" }),
        expect.any(Object),
      );
    });
  });

  it("seller não vê o seletor de vendedor e a cotação sai com o próprio seller_id", async () => {
    usuarioMock = { id: "u-seller-1", role: "seller" };
    const user = userEvent.setup();
    renderWithProviders(<CreateQuotationDrawer />);

    expect(screen.queryByText("Vendedor responsável")).not.toBeInTheDocument();

    const comboboxes = screen.getAllByRole("combobox");
    await user.click(comboboxes[0]); // client_id — único combobox antes de quotation_type
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("Cliente Dois"));

    fireEvent.click(screen.getByRole("button", { name: "Criar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({ client_id: "c2", seller_id: "u-seller-1" }),
        expect.any(Object),
      );
    });
  });
});
