import { fmt, MONTHS, txStatus } from "../components/appPrimitives";

export function CalendarView({ ctx }) {
  const {
    mobile,
    theme,
    light,
    selMonth,
    selYear,
    monthTxs,
    recurring,
    calendarCells,
    MonthPicker,
    setSelectedCalendarDay
  } = ctx;

  return (
    <div className="fade">
      <div
        style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: mobile ? 16 : 24
        }}
      >
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>
            Calendario financeiro
          </h1>
          <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>
            {MONTHS[selMonth]} {selYear}
          </p>
        </div>
        <MonthPicker />
      </div>

      <div className="card" style={{ padding: mobile ? 10 : 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 8 }}>
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map(d => (
            <div
              key={d}
              style={{ fontSize: 11, color: light ? "#334155" : "#64748b", textAlign: "center", fontWeight: 700 }}
            >
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
          {calendarCells.map((day, i) => {
            const dayTxs = day ? monthTxs.filter(t => new Date(t.date + "T12:00:00").getDate() === day) : [];
            const dayRec = day ? recurring.filter(r => r.active !== false && Number(r.day) === day) : [];
            const total = dayTxs.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);

            return (
              <div
                key={i}
                onClick={() => day && setSelectedCalendarDay(day)}
                title={day ? "Ver detalhes" : ""}
                style={{
                  minHeight: mobile ? 76 : 96,
                  border: "1px solid " + theme.border,
                  borderRadius: 10,
                  padding: 8,
                  background: day ? theme.soft : "transparent",
                  overflow: "hidden",
                  cursor: day ? "pointer" : "default"
                }}
              >
                {day && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: theme.text,
                        fontWeight: 700,
                        marginBottom: 5
                      }}
                    >
                      <span>{day}</span>
                      {total !== 0 && (
                        <span
                          style={{
                            color: total >= 0 ? "#059669" : "#dc2626",
                            fontFamily: "'DM Mono',monospace",
                            fontSize: 10
                          }}
                        >
                          {fmt(total)}
                        </span>
                      )}
                    </div>

                    {dayTxs.slice(0, 2).map(t => {
                      const st = txStatus(t);
                      return (
                        <div
                          key={t._id}
                          style={{
                            fontSize: 10,
                            color: st.color,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {t.paid ? "✓ " : ""}
                          {t.desc}
                        </div>
                      );
                    })}

                    {dayRec.slice(0, 2).map(r => (
                      <div
                        key={r._id}
                        style={{
                          fontSize: 10,
                          color: "#FCD34D",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        ↻ {r.desc}
                      </div>
                    ))}

                    {dayTxs.length + dayRec.length > 4 && (
                      <div style={{ fontSize: 10, color: light ? "#334155" : "#64748b" }}>
                        +{dayTxs.length + dayRec.length - 4}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
