// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TxRow } from "./transactions";

describe("TxRow", () => {
  it("renders transaction details and action callbacks", () => {
    const tx = {
      _id: "tx-1",
      desc: "Mercado",
      amount: 89.9,
      type: "expense",
      category: "Outros",
      owner: "casal",
      date: "2026-05-05",
      paid: false,
      notesCount: 2
    };
    const onToggle = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onChat = vi.fn();

    render(<TxRow t={tx} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} onChat={onChat} mobile={false} userName="Felipe" />);

    expect(screen.getByText("Mercado")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*89,90/)).toBeInTheDocument();
    fireEvent.click(screen.getByTitle(/Pendente|Vencido|Previsto/i));
    fireEvent.click(screen.getByRole("button", { name: /MSG 2/i }));
    fireEvent.click(screen.getByRole("button", { name: /✎|âœŽ/i }));
    fireEvent.click(screen.getByRole("button", { name: /✕|âœ•/i }));

    expect(onToggle).toHaveBeenCalledWith(tx);
    expect(onChat).toHaveBeenCalledWith(tx);
    expect(onEdit).toHaveBeenCalledWith(tx);
    expect(onDelete).toHaveBeenCalledWith(tx);
  });
});
