import { describe, expect, it } from "vitest";
import { MONTH_VISIBLE_EVENT_ROWS, monthDayEntries, occursOnCalendarDay } from "./calendarMonthUtils";

describe("month calendar overflow utilities", () => {
  const day = new Date(2026, 7, 12);
  const timed = Array.from({ length: 3 }, (_, index) => ({ startsAt: new Date(2026, 7, 12, 9 + index), endsAt: new Date(2026, 7, 12, 10 + index) }));
  const allDay = { startsAt: new Date(2026, 7, 12, 0), endsAt: new Date(2026, 7, 13, 0) };
  const multiDay = { startsAt: new Date(2026, 7, 11, 15), endsAt: new Date(2026, 7, 14, 11) };
  it("separates all-day entries and caps timed plus multi-day rows", () => {
    const entries = monthDayEntries([...timed, allDay, multiDay], day);
    expect(entries.allDay).toHaveLength(1); expect(entries.visible).toHaveLength(MONTH_VISIBLE_EVENT_ROWS); expect(entries.hidden).toBe(2);
  });
  it("includes multi-day events on each covered day and treats midnight all-day ends as exclusive", () => {
    expect(occursOnCalendarDay(multiDay, new Date(2026, 7, 13))).toBe(true);
    expect(occursOnCalendarDay(allDay, new Date(2026, 7, 13))).toBe(false);
  });
});
