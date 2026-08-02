import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";

import { renderWithProviders } from "@/shared/lib/test-utils";

import { EditUserDrawer } from "./edit-user-drawer";

const mutateMock = vi.fn();
const refetchMock = vi.fn();

const userFake = {
  id: "u1",
  full_name: "Usuário Original",
  phone: "11988887777",
  role: "seller" as const,
  status: "active" as const,
  email: "usuario@example.com",
};

vi.mock("../../hooks/use-update-user", () => ({
  useUpdateUser: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock("../../hooks/use-user", () => ({
  useUser: () => ({ data: userFake, isLoading: false, isError: false, refetch: refetchMock }),
}));

function renderDrawer() {
  return renderWithProviders(
    <Routes>
      <Route path="/users/:userId/edit" element={<EditUserDrawer />} />
    </Routes>,
    { route: "/users/u1/edit" },
  );
}

describe("EditUserDrawer", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("vem pré-preenchido com os dados atuais do usuário", () => {
    renderDrawer();

    expect(screen.getByLabelText("Nome")).toHaveValue("Usuário Original");
    expect(screen.getByLabelText("Telefone")).toHaveValue("11988887777");
  });

  it("chama a mutation com os valores editados", async () => {
    renderDrawer();

    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Nome Editado" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await vi.waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        {
          id: "u1",
          full_name: "Nome Editado",
          phone: "11988887777",
          role: "seller",
        },
        expect.any(Object),
      );
    });
  });
});
