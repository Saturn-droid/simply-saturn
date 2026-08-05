export const participantEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function oneHourAfterSelectedStart(start: Date): Date {
  return new Date(start.getTime() + 60 * 60 * 1000);
}

/**
 * Move an event's end time by the same offset as its start time. A valid
 * user-adjusted duration is always preferred; the one-hour default is only a
 * fallback for incomplete or invalid draft values.
 */
export function endValuePreservingDuration(previousStartValue: string, previousEndValue: string, nextStartValue: string): string {
  const previousStart = new Date(previousStartValue);
  const previousEnd = new Date(previousEndValue);
  const nextStart = new Date(nextStartValue);
  if (Number.isNaN(nextStart.getTime())) return previousEndValue;

  const currentDuration = previousEnd.getTime() - previousStart.getTime();
  const duration = Number.isFinite(currentDuration) && currentDuration > 0
    ? currentDuration
    : 60 * 60 * 1000;
  return toDateTimeLocalValue(new Date(nextStart.getTime() + duration));
}

export function isValidParticipantEmail(value: string): boolean {
  return participantEmailPattern.test(value.trim());
}

export function toDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function nextRoundedEventWindow(now = new Date()): { start: Date; end: Date } {
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  return { start, end: oneHourAfterSelectedStart(start) };
}
