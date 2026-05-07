// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthScreen } from "./AuthScreen";

const { authApi } = vi.hoisted(() => ({
  authApi: {
    confirmPasswordReset: vi.fn(async () => {}),
    createUserWithEmailAndPassword: vi.fn(async () => ({ user: {} })),
    sendPasswordResetEmail: vi.fn(async () => {}),
    signInWithEmailAndPassword: vi.fn(async () => ({})),
    updateProfile: vi.fn(async () => {}),
    verifyPasswordResetCode: vi.fn(async () => "felipe@test.com")
  }
}));

vi.mock("../services/firebase", () => ({
  auth: {},
  authApi
}));

describe("AuthScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/");
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

  it("sends a password reset email from the login screen", async () => {
    render(<AuthScreen />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { value: "felipe@test.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Esqueci minha senha/i }));

    await waitFor(() =>
      expect(authApi.sendPasswordResetEmail).toHaveBeenCalledWith(
        {},
        "felipe@test.com",
        expect.objectContaining({ handleCodeInApp: false })
      )
    );
    expect(screen.getByText(/Se existir uma conta/i)).toBeInTheDocument();
  });

  it("requires email before sending password reset", () => {
    render(<AuthScreen />);

    fireEvent.click(screen.getByRole("button", { name: /Esqueci minha senha/i }));

    expect(screen.getByText(/Informe seu email para recuperar a senha/i)).toBeInTheDocument();
    expect(authApi.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("renders a custom password reset screen and confirms a new password", async () => {
    window.history.replaceState({}, "", "/?mode=resetPassword&oobCode=abc123");
    render(<AuthScreen />);

    expect(await screen.findByText(/Conta: felipe@test.com/i)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("minimo 6 caracteres"), { target: { value: "nova123" } });
    fireEvent.change(screen.getByPlaceholderText("repita a nova senha"), { target: { value: "nova123" } });
    fireEvent.click(screen.getByRole("button", { name: /Redefinir senha/i }));

    await waitFor(() => expect(authApi.confirmPasswordReset).toHaveBeenCalledWith({}, "abc123", "nova123"));
    expect(screen.getByText(/Senha redefinida com sucesso/i)).toBeInTheDocument();
  });

  it("shows an error for expired password reset links", async () => {
    authApi.verifyPasswordResetCode.mockRejectedValueOnce(new Error("expired"));
    window.history.replaceState({}, "", "/?mode=resetPassword&oobCode=expired");
    render(<AuthScreen />);

    expect(await screen.findByText(/Link invalido ou expirado/i)).toBeInTheDocument();
  });
});
