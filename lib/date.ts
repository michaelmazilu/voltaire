const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function resolveRelativeDate(query: string, now = new Date()): string | undefined {
  const q = query.toLowerCase();
  const nextMatch = q.match(/next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/);
  if (!nextMatch) return undefined;

  const target = WEEKDAYS.indexOf(nextMatch[1]);
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let days = (target - base.getDay() + 7) % 7;
  if (days === 0) days = 7;
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export function formatDateTime(iso?: string, join = " at "): string {
  if (!iso) return "";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  );
  return `${parts.month} ${parts.day}, ${parts.year}${join}${parts.hour}:${parts.minute} ${parts.dayPeriod}`;
}
