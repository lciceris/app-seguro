import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DetailField } from "./detail-field";

describe("DetailField", () => {
  it("mostra o valor quando informado", () => {
    render(<DetailField label="Nome" value="Fulano" />);

    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("Fulano")).toBeInTheDocument();
  });

  it("mostra 'Não informado' pra valor nulo", () => {
    render(<DetailField label="Nome" value={null} />);

    expect(screen.getByText("Não informado")).toBeInTheDocument();
  });

  it("mostra valores numéricos", () => {
    render(<DetailField label="Ordem" value={3} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
