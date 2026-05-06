import { describe, expect, it } from "vitest";
import { CATS } from "./constants";
import { normalizeNaturalText, parseNaturalTransaction } from "./naturalParser";

describe("naturalParser", () => {
  it("normalizes pics to pix for voice recognition", () => {
    expect(normalizeNaturalText("recebi pics de 50")).toContain("pix");
  });

  it("extracts category from explicit natural text without adding it to the description", () => {
    const tx = parseNaturalTransaction("paguei 89,90 no mercado hoje categoria alimentação", { uid: "u1" });

    expect(tx.amount).toBe(89.9);
    expect(tx.type).toBe("expense");
    expect(tx.category).toBe(CATS[2]);
    expect(tx.desc.toLowerCase()).not.toContain("categoria");
    expect(tx.desc.toLowerCase()).not.toContain("aliment");
    expect(tx.paid).toBe(true);
  });
});
