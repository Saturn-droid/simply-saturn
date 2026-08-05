export const participantEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function oneHourAfterSelectedStart(start: Date): Date {
  return new Date(start.getTime() + 60 * 60 * 1000);
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
