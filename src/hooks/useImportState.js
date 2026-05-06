import { useState } from "react";

function useImportState() {
  const [importText, setImportText] = useState("");
  const [importRows, setImportRows] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [importSaving, setImportSaving] = useState(false);

  const updateImportRow = (id, patch) =>
    setImportRows(rows => rows.map(row => (row.id === id ? { ...row, ...patch } : row)));

  const removeImportRow = id => setImportRows(rows => rows.filter(row => row.id !== id));

  const resetImport = () => {
    setImportText("");
    setImportRows([]);
    setImportFileName("");
  };

  return {
    importText,
    setImportText,
    importRows,
    setImportRows,
    importFileName,
    setImportFileName,
    importSaving,
    setImportSaving,
    updateImportRow,
    removeImportRow,
    resetImport
  };
}

export { useImportState };
