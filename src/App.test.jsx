// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

const { user } = vi.hoisted(() => ({
  user: { uid: "u1", email: "felipe@test.com", displayName: "Felipe" }
}));

vi.mock("./services/firebase", () => {
  const emptySnapshot = { docs: [] };
  return {
    auth: { currentUser: user },
    db: {},
    authApi: {
      onAuthStateChanged: vi.fn((_auth, cb) => {
        cb(user);
        return vi.fn();
      }),
      signOut: vi.fn(async () => {}),
      updateProfile: vi.fn(async () => {}),
      createUserWithEmailAndPassword: vi.fn(async () => ({ user })),
      signInWithEmailAndPassword: vi.fn(async () => ({ user }))
    },
    fs: {
      addDoc: vi.fn(async () => ({ id: "new-id" })),
      arrayUnion: vi.fn(value => value),
      collection: vi.fn((_db, ...segments) => segments.join("/")),
      deleteDoc: vi.fn(async () => {}),
      doc: vi.fn((_db, ...segments) => segments.join("/")),
      getDoc: vi.fn(async () => ({ exists: () => false, data: () => ({}) })),
      getDocs: vi.fn(async () => emptySnapshot),
      onSnapshot: vi.fn((ref, next) => {
        if (typeof ref === "string" && /^users\/[^/]+$/.test(ref)) next({ exists: () => false, data: () => ({}) });
        else next(emptySnapshot);
        return vi.fn();
      }),
      query: vi.fn((ref, ...parts) => ({ ref, parts })),
      setDoc: vi.fn(async () => {}),
      updateDoc: vi.fn(async () => {}),
      where: vi.fn((field, op, value) => ({ field, op, value }))
    }
  };
});

describe("App smoke", () => {
  it("renders the authenticated shell without initialization errors", async () => {
    render(<App />);

    await waitFor(() => expect(screen.getByText("Spend Wise")).toBeInTheDocument());
    expect(screen.queryByText(/Erro ao abrir o Spend Wise/i)).not.toBeInTheDocument();
  });
});
