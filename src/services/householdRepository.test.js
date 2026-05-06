import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHouseholdRepository } from "./householdRepository";

function mockLocalStorage() {
  const store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(key => store.get(key) || null),
    setItem: vi.fn((key, value) => store.set(key, String(value))),
    removeItem: vi.fn(key => store.delete(key))
  });
}

describe("householdRepository", () => {
  beforeEach(() => {
    mockLocalStorage();
  });

  it("migrates individual user data to a household without seeded docs", async () => {
    const fs = {
      collection: vi.fn((...parts) => parts.join("/")),
      doc: vi.fn((...parts) => parts.join("/")),
      getDocs: vi.fn(async collectionPath => ({
        docs: collectionPath.endsWith("transactions")
          ? [
              { id: "tx-1", data: () => ({ desc: "Mercado" }) },
              { id: "seed", data: () => ({ seeded: true }) }
            ]
          : []
      })),
      setDoc: vi.fn(async () => {})
    };
    const repo = createHouseholdRepository({ db: "db", fs, userRepo: { saveActiveHousehold: vi.fn() } });

    const total = await repo.migrateIndividualDataToHousehold({ uid: "u1" }, "household-u1", { force: true });

    expect(total).toBe(1);
    expect(fs.setDoc).toHaveBeenCalledWith(
      "db/households/household-u1/transactions/tx-1",
      expect.objectContaining({ desc: "Mercado", migratedFrom: "u1" }),
      { merge: true }
    );
  });
});
