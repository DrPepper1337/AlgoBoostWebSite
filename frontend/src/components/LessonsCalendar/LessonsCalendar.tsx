import { useEffect, useMemo, useState } from "react";
import { startOfWeek, addDays, isSameDay, differenceInMinutes, setHours, setMinutes } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { fetchPublicCalendarEvents } from "../../utils/fetchGcal";
import "./LessonsCalendar.css";

type HubEvent = {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
};

const LOCALE = enUS;
const FIRST_DAY = 1;          // 1 = Monday
const HOURS_START = 9;        // calendar visible window: 08:00–20:00
const HOURS_END = 20;

export default function LessonsCalendar() {
  const [events, setEvents] = useState<HubEvent[]>([]);
  const [anchor, setAnchor] = useState<Date>(new Date()); // current week anchor

  // keep your existing fetch logic
  useEffect(() => {
    (async () => {
      try {
        const evs = await fetchPublicCalendarEvents({
          calendarId: import.meta.env.VITE_GCAL_ID,
          apiKey: import.meta.env.VITE_GCAL_API_KEY,
        });
        // ensure Dates
        const normalized = evs.map((e: any) => ({
          id: e.id,
          title: e.title ?? e.summary ?? "Untitled",
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        setEvents(normalized);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const weekStart = useMemo(
    () => startOfWeek(anchor, { weekStartsOn: FIRST_DAY as 0 | 1 | 2 | 3 | 4 | 5 | 6, locale: LOCALE }),
    [anchor]
  );
  const days = useMemo(() => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)), [weekStart]); // Mon–Fri

  // visible time window
  const windowStart = setMinutes(setHours(weekStart, HOURS_START), 0);
  const windowEnd = setMinutes(setHours(weekStart, HOURS_END), 0);
  // total minutes in the visible window (e.g., 08:00–20:00)
  const windowMinutes = (HOURS_END - HOURS_START) * 60;

  const laidOut = useMemo(() => {
    return events
      .filter((e) => days.some((d) => isSameDay(new Date(e.start), d)))
      .map((e) => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        const dayIndex = days.findIndex((d) => isSameDay(d, start)); // 0..4

        // clamp to visible window
        const startClamped = new Date(start);
        if (startClamped.getHours() < HOURS_START)
          startClamped.setHours(HOURS_START, 0, 0, 0);
        const endClamped = new Date(end);
        if (endClamped.getHours() > HOURS_END)
          endClamped.setHours(HOURS_END, 0, 0, 0);

        // minutes from window start
        const startMin =
          (startClamped.getHours() - HOURS_START) * 60 + startClamped.getMinutes();
        const durMin = Math.max(
          30, // min height for visibility
          (endClamped.getTime() - startClamped.getTime()) / 60000
        );

        const topPct = (startMin / windowMinutes) * 100;
        const heightPct = (durMin / windowMinutes) * 100;

        return { ...e, dayIndex, topPct, heightPct };
      });
  }, [events, days]);

  // hour rows (place each line by percentage)
  const hourStops = Array.from({ length: HOURS_END - HOURS_START + 1 }, (_, i) => {
    const topPct = (i / (HOURS_END - HOURS_START)) * 100;
    const label = `${String(HOURS_START + i).padStart(2, "0")}:00`;
    return { topPct, label, key: i };
  });

  return (
    <div className="schedule-card custom-cal">
      <div className="cal-header">
        <h2>Our schedule</h2>
        <div className="cal-controls">
          <button onClick={() => setAnchor((d) => addDays(d, -7))}>&larr; Prev</button>
          <button onClick={() => setAnchor(new Date())}>Today</button>
          <button onClick={() => setAnchor((d) => addDays(d, 7))}>Next &rarr;</button>
        </div>
      </div>

      <div className="cal-shell">
        {/* Day labels */}
        <div className="cal-days">
          {days.map((d) => (
            <div key={d.toISOString()} className="cal-day-label">
              {d.toLocaleDateString("en-GB", { weekday: "short" })}{" "}
              <span className="muted">{d.getDate()}</span>
            </div>
          ))}
        </div>

        {/* Grid + events */}
        <div className="cal-grid">
          {/* background columns */}
          {days.map((_, i) => (
            <div className="col-bg" key={`bg-${i}`} style={{ gridColumn: i + 1 }} />
          ))}

          {/* hour grid lines */}
          {hourStops.map(({ key, topPct, label }) => (
            <div className="row-line" key={`row-${key}`} style={{ top: `${topPct}%` }}>
              <span className="gutter">{label}</span>
            </div>
          ))}

          {/* events */}
          {laidOut.map((ev) => (
            <div
              key={ev.id}
              className="cal-event"
              style={{
                gridColumn: ev.dayIndex + 1,
                top: `${ev.topPct}%`,
                height: `${ev.heightPct}%`,
              }}
              title={ev.title}
            >
              <span className="pill">{ev.title}</span>
            </div>
          ))}

          {/* today indicator */}
          {(() => {
            const idx = days.findIndex((d) => isSameDay(d, new Date()));
            return idx >= 0 ? <div className="today-col" style={{ gridColumn: idx + 1 }} /> : null;
          })()}
        </div>
      </div>
    </div>
  );
}