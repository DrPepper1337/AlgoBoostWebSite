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
  location?: string;
  description?: string;
};

const LOCALE = enUS;
const FIRST_DAY = 1;
const HOURS_START = 12;
const HOURS_END = 20;

export default function LessonsCalendar() {
  const [events, setEvents] = useState<HubEvent[]>([]);
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [activeEvent, setActiveEvent] = useState<null | {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    location?: string;
    description?: string;
  }>(null);
  const [isClosing, setIsClosing] = useState(false);

  function openEvent(ev: any) {
    setIsClosing(false);
    setActiveEvent({
      id: String(ev.id),
      title: ev.title,
      start: new Date(ev.start),
      end: new Date(ev.end),
      allDay: ev.allDay,
      location: ev.location,
      description: ev.description,
    });
  }

  function closeEvent() {
    setIsClosing(true);
    setTimeout(() => {
      setActiveEvent(null);
      setIsClosing(false);
    }, 400);
  }

  function subscribeToCalendar() {
    const calendarId = import.meta.env.VITE_GCAL_ID;
    if (!calendarId) {
      console.error('Calendar ID not found');
      return;
    }

    const subscriptionUrl = `https://calendar.google.com/calendar/u/0?cid=${encodeURIComponent(calendarId)}`;
    window.open(subscriptionUrl, '_blank');
  }

  useEffect(() => {
    (async () => {
      try {
        // past events up to 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const evs = await fetchPublicCalendarEvents({
          calendarId: import.meta.env.VITE_GCAL_ID,
          apiKey: import.meta.env.VITE_GCAL_API_KEY,
          timeMin: thirtyDaysAgo,
        });
        const normalized = evs.map((e: any) => ({
          id: e.id,
          title: e.title ?? e.summary ?? "Untitled",
          start: new Date(e.start),
          end: new Date(e.end),
          location: e.location,
          description: e.description,
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

  const windowMinutes = (HOURS_END - HOURS_START) * 60;
  const gridMinuteHeight = 1;
  const gridHeight = windowMinutes * gridMinuteHeight;

  const laidOut = useMemo(() => {
    return events
      .filter(e => {
        const s = new Date(e.start), t0 = new Date(s);
        t0.setHours(HOURS_START, 0, 0, 0);
        const dayIdx = days.findIndex(d => isSameDay(d, s));
        if (dayIdx < 0) return false;
        const dStart = new Date(days[dayIdx]);
        const dEnd = new Date(dStart); dEnd.setDate(dEnd.getDate() + 1);
        const start = new Date(e.start);
        const end = new Date(e.end);
        return start < dEnd && end > dStart;
      })
      .map((e) => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        const dayIndex = days.findIndex(d => isSameDay(d, start));

        const startClamped = new Date(start);
        if (startClamped.getHours() < HOURS_START) startClamped.setHours(HOURS_START, 0, 0, 0);
        const endClamped = new Date(end);
        if (endClamped.getHours() > HOURS_END) endClamped.setHours(HOURS_END, 0, 0, 0);

        const startMin = (startClamped.getHours() - HOURS_START) * 60 + startClamped.getMinutes();
        const durMin = Math.max(30, (endClamped.getTime() - startClamped.getTime()) / 60000);

        const topPx = startMin * gridMinuteHeight;
        const heightPx = durMin * gridMinuteHeight;

        const isPast = end < new Date();

        return { ...e, dayIndex, topPx, heightPx, isPast };
      });
  }, [events, days]);

  const hourStops = Array.from(
    { length: HOURS_END - HOURS_START + 1 },
    (_, i) => {
      const top = i * 60 * gridMinuteHeight;
      const label = `${String(HOURS_START + i).padStart(2, "0")}:00`;
      return { top, label, key: i };
    }
  );

  const currentTime = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour >= HOURS_START && currentHour < HOURS_END) {
      const minutesFromStart = (currentHour - HOURS_START) * 60 + currentMinute;
      const topPx = minutesFromStart * gridMinuteHeight;

      const todayIndex = days.findIndex((d) => isSameDay(d, now));

      return {
        show: true,
        top: topPx,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dayIndex: todayIndex
      };
    }
    return { show: false, top: 0, time: '', dayIndex: -1 };
  }, [days]);

  return (
    <div className="schedule-card custom-cal">
      <div className="cal-header">
        <h2>Our schedule</h2>
        <div className="cal-controls">
          <button onClick={() => setAnchor((d) => addDays(d, -7))}>&larr;</button>
          <button onClick={() => setAnchor(new Date())}>Today</button>
          <button onClick={() => setAnchor((d) => addDays(d, 7))}>&rarr;</button>
          <button
            className="subscribe-btn"
            onClick={subscribeToCalendar}
            title="Subscribe to calendar"
          >
            Add
          </button>
        </div>
      </div>

      <div className="cal-shell">
        <div className="cal-grid-wrapper">
        <div className="cal-days">
          {days.map((d) => (
            <div key={d.toISOString()} className="cal-day-label">
              {d.toLocaleDateString("en-GB", { weekday: "short" })}{" "}
              <span className="muted">{d.getDate()}</span>
            </div>
          ))}
        </div>

        <div className="cal-grid" style={{ height: gridHeight }}>
          {days.map((_, i) => (
            <div className="col-bg" key={`bg-${i}`} style={{ gridColumn: i + 1, height: gridHeight }} />
          ))}
          {hourStops.map(({ key, top, label }) => (
            <div className="row-line" key={key} style={{ top }}>
              <span className="gutter">{label}</span>
              <span className="line" />
            </div>
          ))}

          {/* Current time line */}
          {currentTime.show && currentTime.dayIndex >= 0 && (
            <div
              className="current-time-line"
              style={{
                top: currentTime.top,
                gridColumn: currentTime.dayIndex + 1,
                left: '9px',
                right: '9px'
              }}
            >
              <div className="current-time-triangle" />
              <span className="current-time-indicator" />
            </div>
          )}

          {laidOut.map(ev => (
            <div
              key={ev.id}
              className={`cal-event ${ev.isPast ? 'past-event' : ''}`}
              style={{
                gridColumn: ev.dayIndex + 1,
                top: `${ev.topPx + 15}px`,
                height: `${ev.heightPx - 15}px`,
                width: "clamp(5rem, 7vw, 6rem)",
              }}
              title={ev.title}
              onClick={() => openEvent(ev)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openEvent(ev)}
              role="button"
              tabIndex={0}
            >
              <span className="pill">{ev.title}</span>
            </div>
          ))}

          {(() => {
            const idx = days.findIndex((d) => isSameDay(d, new Date()));
            return idx >= 0 ? <div className="today-col" style={{ gridColumn: idx + 1 }} /> : null;
          })()}
        </div>
      </div>

      {activeEvent && (
        <div className={`event-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={closeEvent}>
          <div className={`event-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="event-modal-header">
              <h4>{activeEvent.title}</h4>
              <button className="close-btn" onClick={closeEvent}>×</button>
            </div>
            <div className="event-modal-content">
              <div className="event-detail">
                <strong>Duration:</strong> {activeEvent.start.toLocaleString([], { hour: '2-digit', minute: '2-digit' })} - {activeEvent.end.toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              {activeEvent.location && (
                <div className="event-detail">
                  <strong>Location:</strong> {activeEvent.location}
                </div>
              )}
              {activeEvent.description && (
                <div className="event-detail">
                  <strong>Topic:</strong> {activeEvent.description}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}