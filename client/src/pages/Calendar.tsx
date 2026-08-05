import DashboardLayout from "@/components/DashboardLayout";
import { Seo } from "@/components/Seo";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { isValidParticipantEmail, nextRoundedEventWindow, oneHourAfterSelectedStart, toDateTimeLocalValue } from "@/lib/calendarEventUtils";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { CalendarDays, CalendarPlus, CheckCircle2, Clock3, Mail, MapPin, Plus, UserRound, UsersRound, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

type ParticipantKind = "team" | "contact" | "external";

type SelectedParticipant = {
  key: string;
  kind: ParticipantKind;
  displayName: string;
  email: string;
  userId?: number;
};

type EventDraft = {
  title: string;
  start: string;
  end: string;
  location: string;
  notes: string;
};

function newEventDraft(): EventDraft {
  const window = nextRoundedEventWindow();
  return {
    title: "",
    start: toDateTimeLocalValue(window.start),
    end: toDateTimeLocalValue(window.end),
    location: "",
    notes: "",
  };
}

function eventDateLabel(value: Date) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export default function Calendar() {
  const { isAuthenticated, user } = useAuth();
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<EventDraft>(newEventDraft);
  const [endWasEdited, setEndWasEdited] = useState(false);
  const [participantInput, setParticipantInput] = useState("");
  const [participantPickerOpen, setParticipantPickerOpen] = useState(false);
  const [participants, setParticipants] = useState<SelectedParticipant[]>([]);
  const [teamMemberEmail, setTeamMemberEmail] = useState("");

  const suggestionInput = useMemo(() => ({ query: participantInput.trim() }), [participantInput]);
  const eventsQuery = trpc.calendar.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const teamDirectoryQuery = trpc.calendar.teamDirectory.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const suggestionsQuery = trpc.calendar.participantSuggestions.useQuery(suggestionInput, {
    enabled: isAuthenticated && participantPickerOpen,
    retry: false,
  });
  const createMutation = trpc.calendar.create.useMutation({
    onSuccess: async () => {
      toast.success("Event created and participants saved.");
      setDialogOpen(false);
      await Promise.all([utils.calendar.list.invalidate(), utils.calendar.participantSuggestions.invalidate()]);
    },
    onError: (error) => toast.error(error.message),
  });
  const addTeamMemberMutation = trpc.calendar.addTeamMember.useMutation({
    onSuccess: async (member) => {
      toast.success(`${member.displayName} is now available for calendar events.`);
      setTeamMemberEmail("");
      await Promise.all([utils.calendar.teamDirectory.invalidate(), utils.calendar.participantSuggestions.invalidate()]);
    },
    onError: (error) => toast.error(error.message),
  });

  const openNewEvent = () => {
    setDraft(newEventDraft());
    setParticipants([]);
    setParticipantInput("");
    setEndWasEdited(false);
    setDialogOpen(true);
  };

  const updateStart = (value: string) => {
    setDraft((current) => {
      const selectedStart = new Date(value);
      const defaultEnd = Number.isNaN(selectedStart.getTime()) ? current.end : toDateTimeLocalValue(oneHourAfterSelectedStart(selectedStart));
      return { ...current, start: value, end: endWasEdited ? current.end : defaultEnd };
    });
  };

  const addParticipant = (participant: Omit<SelectedParticipant, "key">) => {
    const email = participant.email.trim().toLocaleLowerCase();
    if (participants.some((entry) => entry.email.toLocaleLowerCase() === email)) {
      toast.message("That participant is already on this event.");
      return;
    }
    setParticipants((current) => [...current, { ...participant, key: `${participant.kind}-${email}` }]);
    setParticipantInput("");
    setParticipantPickerOpen(false);
  };

  const addExternalEmail = () => {
    const email = participantInput.trim().toLocaleLowerCase();
    if (!isValidParticipantEmail(email)) {
      toast.error("Enter a complete email address for an external participant.");
      return;
    }
    addParticipant({ kind: "external", displayName: email, email });
  };

  const submitTeamMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = teamMemberEmail.trim().toLocaleLowerCase();
    if (!isValidParticipantEmail(email)) {
      toast.error("Enter a complete email address for a registered teammate.");
      return;
    }
    addTeamMemberMutation.mutate({ email });
  };

  const submitEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const startsAt = new Date(draft.start);
    const endsAt = new Date(draft.end);
    if (!draft.title.trim()) {
      toast.error("Add an event title before creating it.");
      return;
    }
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
      toast.error("Choose an end time that is later than the selected start time.");
      return;
    }
    if (participants.some((participant) => participant.kind === "team" && !participant.userId)) {
      toast.error("Choose that team member again before creating the event.");
      return;
    }
    const calendarParticipants = participants.map((participant) => {
      if (participant.kind === "team") {
        return { kind: "team" as const, displayName: participant.displayName, email: participant.email, userId: participant.userId! };
      }
      if (participant.kind === "contact") {
        return { kind: "contact" as const, displayName: participant.displayName, email: participant.email };
      }
      return { kind: "external" as const, displayName: participant.displayName, email: participant.email };
    });
    createMutation.mutate({
      clientEventId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      title: draft.title.trim(),
      startsAt,
      endsAt,
      location: draft.location.trim() || undefined,
      notes: draft.notes.trim() || undefined,
      participants: calendarParticipants,
    });
  };

  const teamMembers = suggestionsQuery.data?.teamMembers ?? [];
  const contacts = suggestionsQuery.data?.contacts ?? [];
  const canAddExternalEmail = isValidParticipantEmail(participantInput);
  const events = eventsQuery.data ?? [];
  const teamDirectory = teamDirectoryQuery.data ?? [];
  const canManageTeam = user?.role === "admin";

  return (
    <DashboardLayout>
      <Seo title="Calendar" description="Create and coordinate real estate team events in Simply Saturn." />
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-sans text-xs font-extrabold uppercase tracking-[.14em] text-[#8a6c45]">Team calendar</p>
          <h1 className="mt-2 text-4xl leading-tight text-[#202547] sm:text-5xl">Keep the next commitment clear.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#697087]">Create appointments with an intentional time window, existing people from your workspace, or any external email address.</p>
        </div>
        <button type="button" onClick={openNewEvent} className="ss-button-primary self-start sm:self-auto"><Plus size={16} />New event</button>
      </section>

      <section className="mt-5 rounded-[1.2rem] border border-[#171b39]/8 bg-white px-5 py-4 shadow-[0_12px_32px_rgba(26,30,59,.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="font-sans text-[0.62rem] font-extrabold uppercase tracking-[.13em] text-[#8a6c45]">Workspace team directory</p><h2 className="mt-1 text-xl text-[#303657]">Make real teammates available in event suggestions.</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-[#74798d]">{canManageTeam ? "Add a teammate who has already signed in to Simply Saturn. They will then appear under Team members when you create an event." : "Your workspace leaders maintain this directory. Available teammates appear under Team members when you create an event."}</p></div>
          {canManageTeam ? <form onSubmit={submitTeamMember} className="flex w-full max-w-md gap-2"><input type="email" value={teamMemberEmail} onChange={(event) => setTeamMemberEmail(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="team@email.com" aria-label="Registered teammate email" /><button type="submit" disabled={addTeamMemberMutation.isPending} className="ss-button-secondary shrink-0 disabled:cursor-not-allowed disabled:opacity-50">{addTeamMemberMutation.isPending ? "Adding…" : "Add teammate"}</button></form> : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Available workspace team members">{teamDirectoryQuery.isLoading ? <span className="text-xs text-[#74798d]">Loading team directory…</span> : teamDirectory.map((member) => <span key={member.userId} className="inline-flex items-center gap-1.5 rounded-full bg-[#e8edf7] px-2.5 py-1 text-xs font-bold text-[#42567f]"><UserRound size={12} />{member.displayName}{member.isOwner ? " · owner" : ""}</span>)}</div>
      </section>

      <section className="mt-7 grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="overflow-hidden rounded-[1.35rem] border border-[#171b39]/9 bg-white shadow-[0_16px_45px_rgba(26,30,59,.06)]">
          <div className="flex items-center justify-between border-b border-[#171b39]/8 px-5 py-4"><div><p className="font-sans text-[0.62rem] font-extrabold uppercase tracking-[.13em] text-[#8a6c45]">Upcoming events</p><h2 className="mt-1 text-2xl text-[#282d50]">A shared view of what matters next.</h2></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ece8df] text-[#5c4e7a]"><CalendarDays size={18} /></span></div>
          {eventsQuery.isLoading ? <p className="px-5 py-12 text-center text-sm font-bold text-[#74798d]">Loading your calendar…</p> : null}
          {!eventsQuery.isLoading && events.length === 0 ? <div className="grid min-h-80 place-items-center px-5 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#ece8df] text-[#5c4e7a]"><CalendarPlus size={22} /></span><h3 className="mt-4 text-2xl text-[#303657]">Create the first commitment.</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#74798d]">Every new event begins with a one-hour default so you can refine the timing and people without starting from an empty form.</p><button type="button" onClick={openNewEvent} className="ss-button-primary mt-5"><Plus size={16} />New event</button></div></div> : null}
          {events.length > 0 ? <div className="divide-y divide-[#171b39]/8">{events.map((event) => <article key={event.id} className="grid gap-4 px-5 py-5 sm:grid-cols-[4.7rem_minmax(0,1fr)_auto] sm:items-center"><div className="rounded-xl bg-[#eef0f6] px-3 py-2 text-center text-[#394c72]"><p className="text-[0.62rem] font-extrabold uppercase tracking-[.1em]">{new Intl.DateTimeFormat(undefined, { month: "short" }).format(new Date(event.startsAt))}</p><p className="mt-0.5 text-2xl font-bold">{new Date(event.startsAt).getDate()}</p></div><div><h3 className="text-lg font-extrabold text-[#303657]">{event.title}</h3><p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#73798f]"><span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{eventDateLabel(event.startsAt)} – {new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(event.endsAt))}</span>{event.location ? <span className="inline-flex items-center gap-1.5"><MapPin size={13} />{event.location}</span> : null}</p></div><span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#edf4eb] px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-[.08em] text-[#557450] sm:self-auto"><UsersRound size={12} />{event.participants.length} {event.participants.length === 1 ? "participant" : "participants"}</span></article>)}</div> : null}
        </div>
        <aside className="rounded-[1.35rem] bg-[#22294e] p-6 text-white shadow-[0_20px_50px_rgba(26,30,59,.18)]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/8 text-[#dfcda9]"><CheckCircle2 size={19} /></span><p className="mt-7 font-sans text-[0.62rem] font-extrabold uppercase tracking-[.13em] text-[#d1a467]">Event rule</p><h2 className="mt-2 text-3xl leading-tight">A useful default, not a constraint.</h2><p className="mt-3 text-sm leading-6 text-[#c8c7d4]">New event end times begin one hour after the chosen start. You can revise the end time before creating the event.</p><div className="mt-7 rounded-xl border border-white/10 bg-white/6 p-3 text-xs leading-5 text-[#dedde7]"><strong className="block text-[#f0e5cc]">Participant choices</strong><span className="mt-1.5 block">Use matching team members or saved contacts, or enter a complete external email address.</span></div></aside>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[#171b39]/10 bg-[#fffdf9] text-[#303657] shadow-[0_24px_80px_rgba(22,26,53,.2)] sm:max-w-2xl">
          <DialogHeader>
            <p className="font-sans text-[0.65rem] font-extrabold uppercase tracking-[.14em] text-[#8a6c45]">New calendar event</p>
            <DialogTitle className="font-serif text-3xl text-[#252c53]">Create a clear commitment.</DialogTitle>
            <DialogDescription className="leading-6 text-[#697087]">The end time starts one hour after the chosen start time. Change it any time before you create the event.</DialogDescription>
          </DialogHeader>
          <form className="mt-2 space-y-5" onSubmit={submitEvent}>
            <label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Event title</span><input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} maxLength={240} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="Listing review, client call, or team handoff" autoFocus required /></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Start time</span><input type="datetime-local" value={draft.start} onChange={(event) => updateStart(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" required /></label><label className="block"><span className="flex items-center justify-between text-xs font-extrabold text-[#4c5270]">End time <span className="font-medium text-[#8c90a1]">Defaults to +1 hour</span></span><input type="datetime-local" value={draft.end} onChange={(event) => { setEndWasEdited(true); setDraft((current) => ({ ...current, end: event.target.value })); }} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" required /></label></div>
            <label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Location <span className="font-medium text-[#8c90a1]">(optional)</span></span><div className="relative mt-1.5"><MapPin size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b90a2]" /><input value={draft.location} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} maxLength={320} className="w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] py-2.5 pl-9 pr-3 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="Office, property address, or video link" /></div></label>
            <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setParticipantPickerOpen(false); }}><div className="flex items-center justify-between"><label htmlFor="calendar-participant" className="text-xs font-extrabold text-[#4c5270]">Participants</label><span className="text-[0.68rem] text-[#7d8194]">Team, contacts, or any email</span></div><div className="mt-1.5 rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] p-2 focus-within:border-[#6a5889] focus-within:ring-2 focus-within:ring-[#6a5889]/12"><div className="flex flex-wrap gap-1.5">{participants.map((participant) => <span key={participant.key} className={cn("inline-flex max-w-full items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold", participant.kind === "team" ? "bg-[#e8edf7] text-[#42567f]" : participant.kind === "contact" ? "bg-[#edf4eb] text-[#557450]" : "bg-[#f6eee4] text-[#805d35]")}><span className="truncate">{participant.displayName}</span><button type="button" onClick={() => setParticipants((current) => current.filter((entry) => entry.key !== participant.key))} className="rounded p-0.5 hover:bg-black/8" aria-label={`Remove ${participant.displayName}`}><X size={12} /></button></span>)}</div><div className="relative flex items-center gap-2"><Mail size={15} className="ml-1 shrink-0 text-[#8b90a2]" /><input id="calendar-participant" value={participantInput} onFocus={() => setParticipantPickerOpen(true)} onChange={(event) => { setParticipantInput(event.target.value); setParticipantPickerOpen(true); }} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === ",") && canAddExternalEmail) { event.preventDefault(); addExternalEmail(); } }} className="min-w-44 flex-1 bg-transparent py-1.5 text-sm text-[#303657] outline-none placeholder:text-[#969aac]" placeholder={participants.length ? "Add another participant" : "Search name or enter an email"} aria-autocomplete="list" aria-controls="calendar-participant-suggestions" aria-expanded={participantPickerOpen} /></div></div>{participantPickerOpen ? <div id="calendar-participant-suggestions" role="listbox" className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[#171b39]/10 bg-white p-2 shadow-[0_18px_45px_rgba(26,30,59,.16)]"><p className="px-2 pb-1 pt-1 font-sans text-[0.58rem] font-extrabold uppercase tracking-[.12em] text-[#8a6c45]">Team members</p>{teamMembers.length > 0 ? teamMembers.map((member) => <button key={`team-${member.id}`} type="button" role="option" onMouseDown={(event) => event.preventDefault()} onClick={() => addParticipant({ kind: "team", displayName: member.displayName, email: member.email, userId: member.userId })} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-[#f3f4f8]"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e8edf7] text-[#46608d]"><UserRound size={14} /></span><span className="min-w-0"><strong className="block truncate text-xs text-[#303657]">{member.displayName}</strong><small className="block truncate text-[0.68rem] text-[#767c90]">{member.email}</small></span></button>) : <p className="px-2 py-2 text-xs text-[#7d8194]">No matching team members yet.</p>}<p className="mt-1 border-t border-[#171b39]/8 px-2 pb-1 pt-3 font-sans text-[0.58rem] font-extrabold uppercase tracking-[.12em] text-[#8a6c45]">Contacts</p>{contacts.length > 0 ? contacts.map((contact) => <button key={`contact-${contact.id}`} type="button" role="option" onMouseDown={(event) => event.preventDefault()} onClick={() => addParticipant({ kind: "contact", displayName: contact.displayName, email: contact.email })} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-[#f3f4f8]"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#edf4eb] text-[#557450]"><UsersRound size={14} /></span><span className="min-w-0"><strong className="block truncate text-xs text-[#303657]">{contact.displayName}</strong><small className="block truncate text-[0.68rem] text-[#767c90]">{contact.email}</small></span></button>) : <p className="px-2 py-2 text-xs text-[#7d8194]">Saved calendar contacts will appear here as you use them.</p>}{canAddExternalEmail ? <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={addExternalEmail} className="mt-2 flex w-full items-center gap-2 rounded-lg border border-[#d8c39b]/45 bg-[#fcf7ed] px-2 py-2 text-left text-xs font-bold text-[#78572f]"><Mail size={14} />Add <span className="truncate">{participantInput.trim()}</span> as an external guest</button> : <p className="mt-2 px-2 pb-1 text-[0.68rem] leading-4 text-[#8a8f9f]">Enter a complete email address to invite someone who is not in Simply Saturn.</p>}</div> : null}</div>
            <label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Notes <span className="font-medium text-[#8c90a1]">(optional)</span></span><textarea value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} maxLength={4000} className="mt-1.5 min-h-24 w-full resize-y rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm leading-6 text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="Add useful preparation, property, or coordination details." /></label>
            <DialogFooter><button type="button" onClick={() => setDialogOpen(false)} className="ss-button-secondary justify-center">Cancel</button><button type="submit" disabled={createMutation.isPending} className="ss-button-primary justify-center disabled:cursor-not-allowed disabled:opacity-50">{createMutation.isPending ? "Creating event…" : "Create event"}<CalendarPlus size={16} /></button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
