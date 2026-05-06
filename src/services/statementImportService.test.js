import { describe, expect, it, vi } from "vitest";
import { CATS } from "../domain/constants";
import { createStatementImportService, parseOfxRows } from "./statementImportService";

describe("statementImportService", () => {
  it("parses OFX transactions into import rows", () => {
    const ofx = `
      <BANKTRANLIST>
        <STMTTRN>
          <TRNTYPE>DEBIT
          <DTPOSTED>20260503120000[-3:BRT]
          <TRNAMT>-89.90
          <FITID>abc123
          <MEMO>Mercado Central
        </STMTTRN>
      </BANKTRANLIST>
    `;

    const rows = parseOfxRows(ofx, {
      selMonth: 4,
      selYear: 2026,
      owner: "casal",
      guessCategory: () => CATS[2]
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      date: "2026-05-03",
      desc: "Mercado Central",
      amount: 89.9,
      type: "expense",
      category: CATS[2],
      owner: "casal",
      paid: true
    });
  });

  it("saves imported rows without the temporary import id", async () => {
    const fs = { addDoc: vi.fn(async () => ({ id: "tx-1" })) };
    const refs = { txCol: vi.fn(() => "transactionsRef") };
    const repo = createStatementImportService({ fs, refs });

    await repo.saveImportedRows([
      {
        id: "tmp-1",
        desc: "Mercado",
        amount: 10,
        type: "expense",
        category: "Outros",
        owner: "casal",
        date: "2026-05-05",
        paid: true
      }
    ]);

    expect(fs.addDoc).toHaveBeenCalledWith(
      "transactionsRef",
      expect.objectContaining({ desc: "Mercado", amount: 10, type: "expense", category: "Outros" })
    );
  });

  it("rejects incomplete imported rows before writing", async () => {
    const fs = { addDoc: vi.fn(async () => ({ id: "tx-1" })) };
    const refs = { txCol: vi.fn(() => "transactionsRef") };
    const repo = createStatementImportService({ fs, refs });

    await expect(repo.saveImportedRows([{ id: "tmp-1", desc: "Mercado", amount: 10 }])).rejects.toThrow("Tipo de transacao invalido");
    expect(fs.addDoc).not.toHaveBeenCalled();
  });
});
