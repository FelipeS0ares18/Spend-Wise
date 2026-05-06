import type { ImportedTransactionRow, OwnerId, TransactionType } from "../domain/types";
import { validateTransaction } from "../domain/validation";

type StatementImportRefs = {
  txCol: () => unknown;
};

type StatementImportFirestoreApi = {
  addDoc: (collectionRef: unknown, data: Record<string, unknown>) => Promise<unknown>;
};

type ParseOfxRowsOptions = {
  selMonth: number;
  selYear: number;
  owner: OwnerId;
  guessCategory: (desc: string, type: TransactionType) => string;
};

type StatementImportServiceConfig = {
  fs: StatementImportFirestoreApi;
  refs: StatementImportRefs;
};

function cleanOfxValue(value: unknown): string {
  return String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function ofxTag(block: string, tag: string): string {
  const re = new RegExp("<" + tag + ">\\s*([^<\\r\\n]+)", "i");
  const match = block.match(re);
  return match ? cleanOfxValue(match[1]) : "";
}

function ofxDate(value: unknown, { selMonth, selYear }: { selMonth: number; selYear: number }): string {
  const raw = String(value || "").replace(/[^0-9]/g, "");
  if (raw.length >= 8) return raw.slice(0, 4) + "-" + raw.slice(4, 6) + "-" + raw.slice(6, 8);
  return new Date(selYear, selMonth, new Date().getDate()).toISOString().split("T")[0];
}

function parseOfxRows(text: string, { selMonth, selYear, owner, guessCategory }: ParseOfxRowsOptions): ImportedTransactionRow[] {
  const rows: ImportedTransactionRow[] = [];
  const blocks =
    text.match(new RegExp("<STMTTRN>[\\s\\S]*?(?=<STMTTRN>|<\\/BANKTRANLIST>|<\\/CREDITCARDMSGSRSV1>|$)", "gi")) || [];

  blocks.forEach((block, idx) => {
    const rawAmount = ofxTag(block, "TRNAMT");
    const signed = parseFloat((rawAmount || "").replace(",", "."));
    if (!Number.isFinite(signed) || signed === 0) return;

    const name = ofxTag(block, "NAME");
    const memo = ofxTag(block, "MEMO");
    const payee = ofxTag(block, "PAYEE");
    const fitid = ofxTag(block, "FITID");
    const desc = (memo || name || payee || fitid || "Lancamento OFX").replace(/\s{2,}/g, " ").trim();
    const type: TransactionType = signed >= 0 ? "income" : "expense";

    rows.push({
      id: (fitid || idx) + "-" + Date.now(),
      date: ofxDate(ofxTag(block, "DTPOSTED") || ofxTag(block, "DTUSER"), { selMonth, selYear }),
      desc,
      amount: Math.abs(signed),
      type,
      category: guessCategory(desc, type),
      owner,
      paid: true,
      notesCount: 0
    });
  });

  return rows;
}

function createStatementImportService({ fs, refs }: StatementImportServiceConfig) {
  return {
    parseOfxRows,

    async saveImportedRows(rows: Array<Partial<ImportedTransactionRow> & { id?: string }>) {
      for (const row of rows) {
        const { id, ...data } = row;
        await fs.addDoc(refs.txCol(), validateTransaction(data));
      }
    }
  };
}

export { cleanOfxValue, createStatementImportService, ofxDate, ofxTag, parseOfxRows };
