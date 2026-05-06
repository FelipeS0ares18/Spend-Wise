// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MobileBottomNav, MobileDrawer } from "./layout";

const theme = {
  border: "rgba(255,255,255,.1)",
  drawer: "#0A0F1A",
  nav: "#94a3b8",
  panel: "#111827",
  soft: "rgba(255,255,255,.05)",
  text: "#e2e8f0"
};

const navItems = [
  { id: "dashboard", l: "Dashboard", i: "D" },
  { id: "transactions", l: "Transacoes", i: "T" },
  { id: "search", l: "Busca", i: "B" }
];

describe("mobile navigation", () => {
  afterEach(() => cleanup());

  it("opens the menu and navigates from the bottom bar", () => {
    const setMobileMenuOpen = vi.fn();
    const goView = vi.fn();

    render(<MobileBottomNav light={false} mobileNavItems={navItems.slice(0, 2)} setMobileMenuOpen={setMobileMenuOpen} goView={goView} view="dashboard" />);

    fireEvent.click(screen.getByRole("button", { name: /Menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /Transacoes/i }));

    expect(setMobileMenuOpen).toHaveBeenCalledWith(true);
    expect(goView).toHaveBeenCalledWith("transactions");
  });

  it("renders drawer actions and closes when choosing settings", () => {
    const goView = vi.fn();
    const setMobileMenuOpen = vi.fn();
    const setShowMobileNavSettings = vi.fn();

    render(
      <MobileDrawer
        goView={goView}
        light={false}
        navItems={navItems}
        setMobileMenuOpen={setMobileMenuOpen}
        setShowMobileNavSettings={setShowMobileNavSettings}
        sync="ok"
        syncColor="#6EE7B7"
        theme={theme}
        toggleTheme={vi.fn()}
        user={{ email: "felipe@test.com" }}
        userName="Felipe"
        view="dashboard"
      />
    );

    const drawer = screen.getByText("felipe@test.com").closest("aside");
    fireEvent.click(within(drawer).getByRole("button", { name: /Busca/i }));
    fireEvent.click(screen.getByRole("button", { name: /Personalizar barra/i }));

    expect(goView).toHaveBeenCalledWith("search");
    expect(setShowMobileNavSettings).toHaveBeenCalledWith(true);
    expect(setMobileMenuOpen).toHaveBeenCalledWith(false);
  });
});
