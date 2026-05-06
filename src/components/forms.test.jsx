// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuickEntryForm, TxForm } from "./forms";

vi.mock("../services/firebase", () => ({
  auth: { currentUser: { uid: "u1", displayName: "Felipe" } }
}));

describe("transaction forms", () => {
  afterEach(() => cleanup());

  it("validates manual transaction fields", () => {
    const onSave = vi.fn();
    render(<TxForm onSave={onSave} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /Adicionar/i }));

    expect(screen.getByText(/Informe a descri/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves a manual transaction with normalized amount and selected paid state", () => {
    const onSave = vi.fn();
    render(<TxForm onSave={onSave} onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Ex: Supermercado"), { target: { value: "Mercado" } });
    fireEvent.change(screen.getByPlaceholderText("0,00"), { target: { value: "89.90" } });
    fireEvent.click(screen.getByText(/J/i));
    fireEvent.click(screen.getByRole("button", { name: /Adicionar/i }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ desc: "Mercado", amount: 89.9, paid: true }));
  });

  it("parses and saves a natural quick entry", () => {
    const onSave = vi.fn();
    render(<QuickEntryForm onSave={onSave} onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/paguei 89,90/i), {
      target: { value: "paguei 89,90 no mercado ontem categoria Outros" }
    });
    fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ amount: 89.9, category: "Outros" }));
  });

  it("lets users adjust the parsed quick entry before saving", () => {
    const onSave = vi.fn();
    render(<QuickEntryForm onSave={onSave} onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/paguei 89,90/i), {
      target: { value: "recebi 300 de pix hoje categoria Salario" }
    });
    fireEvent.change(screen.getByDisplayValue("300"), { target: { value: "350" } });
    fireEvent.change(within(screen.getByText("Tipo").parentElement).getByRole("combobox"), { target: { value: "income" } });
    fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ amount: 350, type: "income" }));
  });
});
