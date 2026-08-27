import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/shared/lib/test-utils";
import { SidebarProvider } from "@/shared/components/ui/sidebar";

import { AppSidebar } from "./app-sidebar";

interface UsuarioFake {
  role: string;
  brokerage_name: string | null;
  logo_url: string | null;
}

let usuarioMock: UsuarioFake = {
  role: "supervisor",
  brokerage_name: "Corretora Teste",
  logo_url: null,
};

vi.mock("@/features/auth", () => ({
  useAuthStore: (selector: (state: { usuario: UsuarioFake }) => unknown) =>
    selector({ usuario: usuarioMock }),
}));

function renderSidebar(route = "/") {
  return renderWithProviders(
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>,
    { route },
  );
}

describe("AppSidebar", () => {
  beforeEach(() => {
    usuarioMock = { role: "supervisor", brokerage_name: "Corretora Teste", logo_url: null };
  });

  it("supervisor vê Operação e Minha corretora, mas não o grupo Plataforma", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: "Cotações" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Veículos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Usuários" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Corretoras" })).not.toBeInTheDocument();
  });

  it("viewer não vê Veículos nem Usuários", () => {
    usuarioMock = { role: "viewer", brokerage_name: "Corretora Teste", logo_url: null };
    renderSidebar();

    expect(screen.getByRole("link", { name: "Clientes" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Veículos" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
  });

  it("só platform_admin vê o grupo Plataforma", () => {
    usuarioMock = { role: "platform_admin", brokerage_name: "Corretora Teste", logo_url: null };
    renderSidebar();

    expect(screen.getByRole("link", { name: "Corretoras" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Seguradoras (catálogo)" })).toBeInTheDocument();
  });

  it("marca o item da rota atual como ativo", () => {
    renderSidebar("/clients");

    const activeLink = screen.getByRole("link", { name: "Clientes" });
    expect(activeLink.closest('[data-sidebar="menu-button"]')).toHaveAttribute(
      "data-active",
      "true",
    );

    const inactiveLink = screen.getByRole("link", { name: "Cotações" });
    expect(inactiveLink.closest('[data-sidebar="menu-button"]')).toHaveAttribute(
      "data-active",
      "false",
    );
  });
});
