function useImportActions({
  guessCategory,
  householdId,
  importRows,
  setImportFileName,
  setImportRows,
  setImportSaving,
  setImportText,
  setSync,
  selMonth,
  selYear,
  statementImportService,
  resetImport,
  user
}) {
  const parseOfxRows = text =>
    statementImportService.parseOfxRows(text, {
      selMonth,
      selYear,
      owner: householdId ? "casal" : user.uid,
      guessCategory
    });

  function parseStatement(importText) {
    const rows = parseOfxRows(importText);
    setImportRows(rows);
    if (!rows.length) alert("Nao encontrei lancamentos OFX nesse arquivo.");
  }

  async function handleOfxFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setImportRows([]);
    try {
      const text = await file.text();
      setImportText(text);
      const rows = parseOfxRows(text);
      setImportRows(rows);
      if (!rows.length) alert("Nao encontrei lancamentos OFX nesse arquivo.");
    } catch (err) {
      alert("Erro ao ler o arquivo OFX: " + err.message);
    }
  }

  async function saveImportedRows() {
    if (!importRows.length) return;
    setImportSaving(true);
    setSync("saving");
    try {
      await statementImportService.saveImportedRows(importRows);
      resetImport();
      setSync("ok");
      alert("Extrato importado.");
    } catch (e) {
      setSync("err");
      alert("Erro ao importar extrato: " + e.message);
    }
    setImportSaving(false);
  }

  return { handleOfxFile, parseStatement, saveImportedRows };
}

export { useImportActions };
