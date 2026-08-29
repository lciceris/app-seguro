import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { ClientDetailDrawer } from "./client-detail-drawer";

const setPrimaryMutateMock = vi.fn();
const removeMutateMock = vi.fn();
const addMutateMock = vi.fn();

let roleMock: "seller" | "supervisor" = "supervisor";

const clientFake = {
  id: "c1",
  brokerage_id: "b1",
  client_type: "company" as const,
  legal_name: "Cliente Detalhe",
  trade_name: null,
  tax_id: "12.345.678/0001-90",
  birth_date: null,
  business_code: null,
  industry: null,
  state_registration: null,
  zip_code: null,
  street: null,
  street_number: null,
  complement: null,
  neighborhood: null,
  city: null,
  state: null,
  contact_name: null,
  contact_role: null,
  contact_email: null,
  contact_phone: null,
  financial_name: null,
  financial_email: null,
  status: "active" as const,
  notes: null,
  created_at: "",
  updated_at: "",
};

const clientSellersFake = [
  {
    id: "cs1",
    client_id: "c1",
    seller_id: "s1",
    is_primary: true,
    created_at: "",
    users: { id: "s1", full_name: "Vendedor Um" },
  },
  {
    id: "cs2",
    client_id: "c1",
    seller_id: "s2",
    is_primary: false,
    created_at: "",
    users: { id: "s2", full_name: "Vendedor Dois" },
  },
];

vi.mock("@/features/auth", () => ({
  useAuthStore: (selector: (state: { usuario: { role: string } }) => unknown) =>
    selector({ usuario: { role: roleMock } }),
}));

vi.mock("@/features/users", () => ({
  useUsers: () => ({
    data: [
      { id: "s1", full_name: "Vendedor Um", role: "seller" },
      { id: "s2", full_name: "Vendedor Dois", role: "seller" },
      { id: "s3", full_name: "Vendedor Três", role: "seller" },
    ],
  }),
}));

vi.mock("../../hooks/use-client", () => ({
  useClient: () => ({ data: clientFake, isLoading: false, isError: false, refetch: vi.fn() }),
}));

vi.mock("../../hooks/use-client-sellers", () => ({
  useClientSellers: () => ({ data: clientSellersFake, isLoading: false }),
}));

vi.mock("../../hooks/use-set-primary-client-seller", () => ({
  useSetPrimaryClientSeller: () => ({ mutate: setPrimaryMutateMock }),
}));

vi.mock("../../hooks/use-remove-client-seller", () => ({
  useRemoveClientSeller: () => ({ mutate: removeMutateMock, isPending: false }),
}));

vi.mock("../../hooks/use-add-client-seller", () => ({
  useAddClientSeller: () => ({ mutate: addMutateMock, isPending: false }),
}));

function renderDrawer() {
  return renderWithProviders(
    <Routes>
      <Route path="/clients/:clientId" element={<ClientDetailDrawer />} />
    </Routes>,
    { route: "/clients/c1" },
  );
}

describe("ClientDetailDrawer", () => {
  beforeEach(() => {
    setPrimaryMutateMock.mockClear();
    removeMutateMock.mockClear();
    addMutateMock.mockClear();
    roleMock = "supervisor";
  });

  async function openSellersTab(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("tab", { name: "Vendedores" }));
    return screen.getByRole("tabpanel");
  }

  it("supervisor vê os controles de gestão de vendedores", async () => {
    const user = userEvent.setup();
    renderDrawer();
    const panel = await openSellersTab(user);

    expect(within(panel).getByText("Vendedor Um")).toBeInTheDocument();
    expect(within(panel).getByText("Principal")).toBeInTheDocument();
    expect(within(panel).getAllByTitle("Remover")).toHaveLength(2);
  });

  it("seller não vê nenhum controle de gestão de vendedores", async () => {
    const user = userEvent.setup();
    roleMock = "seller";
    renderDrawer();
    const panel = await openSellersTab(user);

    expect(within(panel).getByText("Vendedor Um")).toBeInTheDocument();
    expect(within(panel).queryByTitle("Remover")).not.toBeInTheDocument();
    expect(within(panel).queryByText("Adicionar vendedor")).not.toBeInTheDocument();
  });

  it("remove diretamente um vendedor não-principal", async () => {
    const user = userEvent.setup();
    renderDrawer();
    const panel = await openSellersTab(user);

    const rowDois = within(panel).getByText("Vendedor Dois").closest("div")!.parentElement!;
    fireEvent.click(within(rowDois).getByTitle("Remover"));

    expect(removeMutateMock).toHaveBeenCalledWith(
      { clientSellerId: "cs2", clientId: "c1" },
      expect.any(Object),
    );
  });

  it("exige escolher um substituto ao remover o vendedor principal com outros restantes", async () => {
    const user = userEvent.setup();
    renderDrawer();
    const panel = await openSellersTab(user);

    const rowUm = within(panel).getByText("Vendedor Um").closest("div")!.parentElement!;
    fireEvent.click(within(rowUm).getByTitle("Remover"));

    const replacementBox = within(panel)
      .getByText("Escolha o novo vendedor principal antes de remover Vendedor Um.")
      .closest("div")!;
    expect(removeMutateMock).not.toHaveBeenCalled();

    const confirmButton = within(replacementBox).getByRole("button", { name: "Confirmar remoção" });
    expect(confirmButton).toBeDisabled();

    await user.click(within(replacementBox).getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("Vendedor Dois"));

    await user.click(confirmButton);

    expect(removeMutateMock).toHaveBeenCalledWith(
      { clientSellerId: "cs1", clientId: "c1", newPrimaryId: "cs2" },
      expect.any(Object),
    );
  });

  it("marca um vendedor diferente como principal", async () => {
    const user = userEvent.setup();
    renderDrawer();
    const panel = await openSellersTab(user);

    fireEvent.click(within(panel).getByTitle("Tornar principal"));

    expect(setPrimaryMutateMock).toHaveBeenCalledWith(
      { id: "cs2", clientId: "c1" },
      expect.any(Object),
    );
  });

  it("adiciona um novo vendedor disponível", async () => {
    const user = userEvent.setup();
    renderDrawer();
    const panel = await openSellersTab(user);

    await user.click(within(panel).getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("Vendedor Três"));
    await user.click(within(panel).getByRole("button", { name: "Adicionar" }));

    expect(addMutateMock).toHaveBeenCalledWith(
      { clientId: "c1", sellerId: "s3", isPrimary: false },
      expect.any(Object),
    );
  });
});
