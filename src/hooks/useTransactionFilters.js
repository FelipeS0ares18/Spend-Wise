import { useState } from "react";

function useTransactionFilters(monthTxs) {
  const [fOwner, setFOwner] = useState("all");
  const [fType, setFType] = useState("all");

  const filtTxs = monthTxs
    .filter(t => {
      if (fOwner !== "all") {
        if (fOwner === "casal" && t.owner !== "casal") return false;
        if (fOwner === "me" && t.owner === "casal") return false;
      }
      if (fType !== "all" && t.type !== fType) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return { fOwner, setFOwner, fType, setFType, filtTxs };
}

export { useTransactionFilters };
