// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthScreen } from "./AuthScreen";

const { authApi } = vi.hoisted(() => ({
  authApi: {
    createUserWithEmailAndPassword: vi.fn(async () => ({ user: {} })),
    signInWithEmailAndPassword: vi.fn(async () => ({})),
    updateProfile: vi.fn(async () => {})
  }
}));

vi.mock("../services/firebase", () => ({
  auth: {},
  authApi
}));

describe("AuthScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders login and submits credentials", async () => {
    render(<AuthScreen />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { value: "felipe@test.com" } });
    fireEvent.change(screen.getByPlaceholderText(/6 caracteres/i), { target: { value: "123456" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Entrar" }).at(-1));

    await waitFor(() => expect(authApi.signInWithEmailAndPassword).toHaveBeenCalledWith({}, "felipe@test.com", "123456"));
  });

  it("requires a name before signup", async () => {
    render(<AuthScreen />);

    fireEvent.click(screen.getAllByRole("button", { name: "Criar conta" })[0]);
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { value: "felipe@test.com" } });
    fireEvent.change(screen.getByPlaceholderText(/6 caracteres/i), { target: { value: "123456" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Criar conta" }).at(-1));

    expect(await screen.findByText(/Informe seu nome/i)).toBeInTheDocument();
    expect(authApi.createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("creates an account and updates the display name", async () => {
    const createdUser = { uid: "u1" };
    authApi.createUserWithEmailAndPassword.mockResolvedValueOnce({ user: createdUser });
    render(<AuthScreen />);

    fireEvent.click(screen.getAllByRole("button", { name: "Criar conta" })[0]);
    fireEvent.change(screen.getByPlaceholderText("Ex: Vinicius"), { target: { value: "Felipe Soares" } });
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { value: "felipe@test.com" } });
    fireEvent.change(screen.getByPlaceholderText(/6 caracteres/i), { target: { value: "123456" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Criar conta" }).at(-1));

    await waitFor(() => expect(authApi.createUserWithEmailAndPassword).toHaveBeenCalledWith({}, "felipe@test.com", "123456"));
    expect(authApi.updateProfile).toHaveBeenCalledWith(createdUser, { displayName: "Felipe Soares" });
  });
});
