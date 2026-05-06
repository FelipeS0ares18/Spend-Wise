import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUserRepository } from "./userRepository";

function mockLocalStorage() {
  const store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(key => store.get(key) || null),
    setItem: vi.fn((key, value) => store.set(key, String(value))),
    removeItem: vi.fn(key => store.delete(key))
  });
}

describe("userRepository", () => {
  beforeEach(() => {
    mockLocalStorage();
  });

  it("saves profile in auth, Firestore and local storage", async () => {
    const fs = {
      doc: vi.fn((...parts) => parts.join("/")),
      setDoc: vi.fn(async () => {})
    };
    const authApi = { updateProfile: vi.fn(async () => {}) };
    const repo = createUserRepository({ db: "db", fs, authApi });
    const user = { uid: "u1", email: "u@test.com", displayName: "Old Name" };

    await repo.saveProfile(user, { name: "New Name", phone: "+5524999999999" });

    expect(authApi.updateProfile).toHaveBeenCalledWith(user, { displayName: "New Name" });
    expect(fs.setDoc).toHaveBeenCalledWith("db/users/u1", expect.objectContaining({ name: "New Name", phone: "+5524999999999" }), { merge: true });
    expect(localStorage.getItem("financas-profile-phone-u1")).toBe("+5524999999999");
  });
});
