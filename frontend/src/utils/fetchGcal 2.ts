export async function fetchPublicCalendarEvents({
  calendarId,
  apiKey,
  timeMin = new Date(),
  timeMax, // optional
  maxResults = 2500,
}: {
  calendarId: string;
  apiKey: string;
  timeMin?: Date;
  timeMax?: Date;
  maxResults?: number;
}) {
  const until = timeMax ?? new Date(timeMin.getTime() + 60 * 24 * 60 * 60 * 1000); // +60 days
  const params = new URLSearchParams({
    key: apiKey,
    timeMin: timeMin.toISOString(),
    timeMax: until.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: String(maxResults),
  });
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Calendar error: ${res.status}`);
  const data = await res.json();
  return (data.items ?? []).map((it: any) => ({
    id: it.id,
    title: it.summary || "(untitled)",
    start: new Date(it.start.dateTime ?? it.start.date),
    end: new Date(it.end.dateTime ?? it.end.date),
    allDay: Boolean(it.start.date),
    location: it.location,
    description: it.description,
  }));
}