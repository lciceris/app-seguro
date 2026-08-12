import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { InsurerCatalogScreen } from "./insurer-catalog-screen";

const disableMutateMock = vi.fn();
const enableMutateMock = vi.fn();

const catalogFake = [
  {
    id: "i1",
    name: "Seguradora Habilitada",
    cnpj: "11.111.111/0001-11",
    email: null,
    phone: null,
    website: null,
    contact_name: null,
    response_time_days: null,
    display_order: null,
    notes: null,
    created_at: "",
    updated_at: "",
    brokerage_disabled_insurers: [],
  },
  {
    id: "i2",
    name: "Seguradora Desabilitada",
    cnpj: "22.222.222/0001-22",
    email: null,
    phone: null,
    website: null,
    contact_name: null,
    response_time_days: null,
    display_order: null,
    notes: null,
    created_at: "",
    updated_at: "",
    brokerage_disabled_insurers: [{ brokerage_id: "b1" }],
  },
];

let roleMock: "brokerage_admin" | "platform_admin" = "brokerage_admin";

vi.mock("@/features/auth", () => ({
  useAuthStore: (selector: (state: { usuario: { role: string } }) => unknown) =>
    selector({ usuario: { role: roleMock } }),
}));

vi.mock("../../hooks/use-insurer-catalog", () => ({
  useInsurerCatalog: () => ({
    data: catalogFake,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../hooks/use-disable-insurer", () => ({
  useDisableInsurer: () => ({ mutate: disableMutateMock, isPending: false }),
}));

vi.mock("../../hooks/use-enable-insurer", () => ({
  useEnableInsurer: () => ({ mutate: enableMutateMock, isPending: false }),
}));

describe("InsurerCatalogScreen", () => {
  beforeEach(() => {
    disableMutateMock.mockClear();
    enableMutateMock.mockClear();
    roleMock = "brokerage_admin";
  });

  it("brokerage_admin vê switches interativos refletindo a preferência da própria corretora", () => {
    renderWithProviders(<InsurerCatalogScreen />);

    const switches = screen.getAllByRole("switch");
    expect(switches[0]).toBeChecked();
    expect(switches[1]).not.toBeChecked();
  });

  it("brokerage_admin desabilita uma seguradora habilitada", () => {
    renderWithProviders(<InsurerCatalogScreen />);

    const switches = screen.getAllByRole("switch");
    fireEvent.click(switches[0]);

    expect(disableMutateMock).toHaveBeenCalledWith("i1", expect.any(Object));
    expect(enableMutateMock).not.toHaveBeenCalled();
  });

  it("brokerage_admin reabilita uma seguradora desabilitada", () => {
    renderWithProviders(<InsurerCatalogScreen />);

    const switches = screen.getAllByRole("switch");
    fireEvent.click(switches[1]);

    expect(enableMutateMock).toHaveBeenCalledWith("i2", expect.any(Object));
    expect(disableMutateMock).not.toHaveBeenCalled();
  });

  it("platform_admin vê o estado em modo leitura, sem switch clicável", () => {
    roleMock = "platform_admin";
    renderWithProviders(<InsurerCatalogScreen />);

    expect(screen.queryAllByRole("switch")).toHaveLength(0);
    const rows = screen.getAllByRole("row").slice(1); // ignora a linha de cabeçalho
    expect(within(rows[0]).getByText("Habilitada")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Desabilitada")).toBeInTheDocument();
  });
});
