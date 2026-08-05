export const MONTH_VISIBLE_EVENT_ROWS = 2;

type MonthEventLike = { startsAt: Date | string; endsAt: Date | string };

function asDate(value: Date | string) { return new Date(value); }

export function startOfLocalDay(value: Date | string) {
  const date = asDate(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function dayKey(value: Date | string) {
  const date = startOfLocalDay(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function isAllDayCalendarEvent(event: MonthEventLike) {
  const start = asDate(event.startsAt); const end = asDate(event.endsAt);
  const beginsAtMidnight = start.getHours() === 0 && start.getMinutes() === 0;
  return beginsAtMidnight && end.getTime() - start.getTime() >= 23 * 60 * 60 * 1000;
}

export function isMultiDayCalendarEvent(event: MonthEventLike) {
  const start = startOfLocalDay(event.startsAt); const end = startOfLocalDay(event.endsAt);
  return end.getTime() > start.getTime();
}

export function occursOnCalendarDay(event: MonthEventLike, day: Date) {
  const starts = startOfLocalDay(event.startsAt);
  const rawEnd = asDate(event.endsAt);
  const end = new Date(rawEnd);
  if (isAllDayCalendarEvent(event) && rawEnd.getHours() === 0 && rawEnd.getMinutes() === 0) end.setMinutes(end.getMinutes() - 1);
  const ends = startOfLocalDay(end);
  const normalizedDay = startOfLocalDay(day);
  return starts.getTime() <= normalizedDay.getTime() && ends.getTime() >= normalizedDay.getTime();
}

export function monthGridDays(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = new Date(first); gridStart.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart); day.setDate(gridStart.getDate() + index); return day;
  });
}

export function monthDayEntries<T extends MonthEventLike>(events: T[], day: Date) {
  const entries = events.filter((event) => occursOnCalendarDay(event, day));
  return {
    allDay: entries.filter(isAllDayCalendarEvent),
    visible: entries.filter((event) => !isAllDayCalendarEvent(event)).slice(0, MONTH_VISIBLE_EVENT_ROWS),
    hidden: Math.max(0, entries.filter((event) => !isAllDayCalendarEvent(event)).length - MONTH_VISIBLE_EVENT_ROWS),
    all: entries,
  };
}
