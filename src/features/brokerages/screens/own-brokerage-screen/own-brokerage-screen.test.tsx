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
  status: "active" as const,
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

describe("OwnBrokerageScreen", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("vem pré-preenchido com os dados atuais", () => {
    renderWithProviders(<OwnBrokerageScreen />);

    expect(screen.getByLabelText("Nome")).toHaveValue("Minha Corretora");
  });

  it("chama a mutation com os valores editados", async () => {
    renderWithProviders(<OwnBrokerageScreen />);

    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Nome Novo" } });
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
        },
        expect.any(Object),
      );
    });
  });
});
