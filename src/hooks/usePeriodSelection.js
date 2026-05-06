import { useState } from "react";

function usePeriodSelection(txs, now = new Date()) {
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [selYear, setSelYear] = useState(now.getFullYear());

  const months = [
    ...new Set(
      txs
        .map(t => {
          const d = new Date(t.date + "T12:00:00");
          return d.getFullYear() + "-" + d.getMonth();
        })
        .concat([now.getFullYear() + "-" + now.getMonth()])
    )
  ]
    .map(k => {
      const [y, m] = k.split("-").map(Number);
      return { y, m };
    })
    .sort((a, b) => (a.y !== b.y ? b.y - a.y : b.m - a.m));

  function goMonth(delta) {
    const i = months.findIndex(x => x.m === selMonth && x.y === selYear);
    const next = months[i + delta];
    if (next) {
      setSelMonth(next.m);
      setSelYear(next.y);
    }
  }

  const monthTxs = txs.filter(t => {
    const d = new Date(t.date + "T12:00:00");
    return d.getMonth() === selMonth && d.getFullYear() === selYear;
  });

  return { selMonth, setSelMonth, selYear, setSelYear, months, goMonth, monthTxs };
}

export { usePeriodSelection };
