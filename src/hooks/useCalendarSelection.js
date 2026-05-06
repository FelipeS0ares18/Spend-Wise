import { useState } from "react";

function useCalendarSelection({ selMonth, selYear, monthTxs, recurring }) {
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
  const calendarDays = new Date(selYear, selMonth + 1, 0).getDate();
  const calendarStart = new Date(selYear, selMonth, 1).getDay();
  const calendarCells = [...Array(calendarStart).fill(null), ...Array(calendarDays).keys()].map(v => (v === null ? null : v + 1));
  const selectedCalendarTxs = selectedCalendarDay ? monthTxs.filter(t => new Date(t.date + "T12:00:00").getDate() === selectedCalendarDay) : [];
  const selectedCalendarRecurring = selectedCalendarDay ? recurring.filter(r => r.active !== false && Number(r.day) === selectedCalendarDay) : [];

  return {
    selectedCalendarDay,
    setSelectedCalendarDay,
    calendarCells,
    selectedCalendarTxs,
    selectedCalendarRecurring
  };
}

export { useCalendarSelection };
