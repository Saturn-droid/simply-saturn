import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { dayKey, isAllDayCalendarEvent, isMultiDayCalendarEvent, monthDayEntries, monthGridDays } from "@/lib/calendarMonthUtils";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import React, { useMemo } from "react";

type CalendarEvent = {
  id: number;
  title: string;
  startsAt: Date | string;
  endsAt: Date | string;
  location?: string | null;
};

type MonthCalendarGridProps = {
  events: CalendarEvent[];
  isLoading: boolean;
  monthCursor: Date;
  onMonthChange: (month: Date) => void;
  onEditEvent: (event: CalendarEvent) => void;
};

function eventRowLabel(event: CalendarEvent, day: Date) {
  const starts = new Date(event.startsAt);
  if (isMultiDayCalendarEvent(event) && dayKey(starts) !== dayKey(day)) return "Continues";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(starts);
}

export function MonthCalendarGrid({ events, isLoading, monthCursor, onMonthChange, onEditEvent }: MonthCalendarGridProps) {
  const days = useMemo(() => monthGridDays(monthCursor), [monthCursor]);
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(monthCursor);
  const todayKey = dayKey(new Date());

  return <section className="mt-7 overflow-hidden rounded-[1.35rem] border border-[#171b39]/9 bg-white shadow-[0_16px_45px_rgba(26,30,59,.06)]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#171b39]/8 px-5 py-4">
      <div><p className="font-sans text-[0.62rem] font-extrabold uppercase tracking-[.13em] text-[#8a6c45]">Month calendar</p><h2 className="mt-1 text-2xl text-[#282d50]">{monthLabel}</h2></div>
      <div className="flex items-center gap-2"><button type="button" aria-label="Previous month" onClick={() => onMonthChange(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-[#171b39]/10 text-[#4d5880] transition hover:bg-[#f1f2f7]"><ChevronLeft size={17} /></button><button type="button" onClick={() => onMonthChange(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} className="rounded-lg px-3 py-2 text-xs font-extrabold text-[#4d5880] transition hover:bg-[#f1f2f7]">Today</button><button type="button" aria-label="Next month" onClick={() => onMonthChange(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-[#171b39]/10 text-[#4d5880] transition hover:bg-[#f1f2f7]"><ChevronRight size={17} /></button></div>
    </div>
    {isLoading ? <p className="px-5 py-12 text-center text-sm font-bold text-[#74798d]">Loading your calendar…</p> : <div className="overflow-x-auto"><div className="min-w-[50rem]"><div className="grid grid-cols-7 border-b border-[#171b39]/8 bg-[#f8f7f2]">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => <div key={weekday} className="px-2 py-2 text-center font-sans text-[0.58rem] font-extrabold uppercase tracking-[.12em] text-[#767c90]">{weekday}</div>)}</div><div className="grid grid-cols-7">{days.map((day) => {
      const entries = monthDayEntries(events, day); const key = dayKey(day); const dateLabel = new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric" }).format(day); const inCurrentMonth = day.getMonth() === monthCursor.getMonth();
      return <article key={key} className={cn("h-[10.5rem] overflow-hidden border-b border-r border-[#171b39]/8 p-2", inCurrentMonth ? "bg-white" : "bg-[#fbfaf7] text-[#a1a4b0]")} aria-label={`${dateLabel} calendar events`}><div className="flex h-6 items-center justify-between gap-1"><time dateTime={key} className={cn("grid h-6 min-w-6 place-items-center rounded-full text-xs font-extrabold", key === todayKey ? "bg-[#22294e] text-white" : "text-[#3e4567]")}>{day.getDate()}</time><span className={cn("h-5 truncate rounded-md px-1.5 py-0.5 text-[0.55rem] font-extrabold uppercase tracking-[.06em]", entries.allDay.length ? "bg-[#ece8df] text-[#6e5c40]" : "text-transparent")}>{entries.allDay.length ? `All day · ${entries.allDay.length}` : "All day"}</span></div><div className="mt-1 space-y-1">{entries.visible.map((event) => <button key={`${event.id}-${key}`} type="button" onClick={() => onEditEvent(event)} className="flex w-full items-center gap-1 rounded-md bg-[#eef1f8] px-1.5 py-1 text-left text-[0.62rem] font-bold text-[#394c72] transition hover:bg-[#e1e7f3]"><span className="shrink-0 text-[0.55rem] text-[#7280a0]">{eventRowLabel(event, day)}</span><span className="truncate">{event.title}</span></button>)}{entries.hidden > 0 ? <Popover><PopoverTrigger asChild><button type="button" className="w-full rounded-md px-1.5 py-1 text-left text-[0.62rem] font-extrabold text-[#655083] transition hover:bg-[#f1eef7]" aria-label={`See ${entries.hidden} more events on ${dateLabel}`}>+{entries.hidden} See more</button></PopoverTrigger><PopoverContent align="start" side="bottom" className="w-80 border-[#171b39]/12 bg-[#fffdf9] p-4 shadow-[0_18px_48px_rgba(22,26,53,.2)]"><p className="font-sans text-[0.58rem] font-extrabold uppercase tracking-[.13em] text-[#8a6c45]">All events</p><h3 className="mt-1 text-lg text-[#2d3255]">{dateLabel}</h3><div className="mt-3 max-h-64 space-y-2 overflow-y-auto">{entries.all.map((event) => <button key={event.id} type="button" onClick={() => onEditEvent(event)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#171b39]/9 bg-white px-3 py-2.5 text-left transition hover:bg-[#f7f7fa]"><span className="min-w-0"><strong className="block truncate text-sm text-[#303657]">{event.title}</strong><small className="mt-0.5 block text-xs text-[#74798d]">{isAllDayCalendarEvent(event) ? "All day" : eventRowLabel(event, day)} · {event.location || "No location"}</small></span><Pencil size={14} className="shrink-0 text-[#657194]" /></button>)}</div></PopoverContent></Popover> : null}</div></article>;
    })}</div></div></div>}
  </section>;
}
