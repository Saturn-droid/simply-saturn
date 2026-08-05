import DashboardLayout from "@/components/DashboardLayout";
import { Seo } from "@/components/Seo";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { CalendarDays, CheckCircle2, Circle, ClipboardCheck, Handshake, Plus, UserRound } from "lucide-react";
import React, { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

const priorities = [
  { value: "high", label: "High", tone: "bg-[#f8e7e5] text-[#9a514c]" },
  { value: "normal", label: "Normal", tone: "bg-[#e8edf7] text-[#425f87]" },
  { value: "low", label: "Low", tone: "bg-[#edf4eb] text-[#557450]" },
] as const;
type Priority = (typeof priorities)[number]["value"];

function draftDefaults() {
  return { title: "", notes: "", dueAt: "", priority: "normal" as Priority, contactId: "", dealId: "" };
}

function priorityTone(priority: string) {
  return priorities.find((item) => item.value === priority)?.tone ?? priorities[1].tone;
}

function dueText(dueAt: Date | string | null) {
  if (!dueAt) return "No due date";
  const due = new Date(dueAt);
  const today = new Date();
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  if (dueDay < todayDay) return `Overdue · ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(due)}`;
  if (dueDay === todayDay) return "Due today";
  return `Due ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(due)}`;
}

export default function Tasks() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState(draftDefaults);
  const tasksQuery = trpc.tasks.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const contactsQuery = trpc.contacts.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const dealsQuery = trpc.deals.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const tasks = tasksQuery.data ?? [];
  const contacts = contactsQuery.data ?? [];
  const deals = dealsQuery.data ?? [];
  const openTasks = useMemo(() => tasks.filter((task) => task.status === "open"), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((task) => task.status === "completed"), [tasks]);
  const dueToday = useMemo(() => openTasks.filter((task) => dueText(task.dueAt) === "Due today").length, [openTasks]);

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: async () => {
      toast.success("Task added to your work list.");
      setDialogOpen(false);
      setDraft(draftDefaults());
      await utils.tasks.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const statusMutation = trpc.tasks.setStatus.useMutation({
    onSuccess: async () => {
      await utils.tasks.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const submitTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const contactId = Number(draft.contactId) || undefined;
    const dealId = Number(draft.dealId) || undefined;
    createMutation.mutate({
      title: draft.title.trim(),
      notes: draft.notes.trim() || undefined,
      dueAt: draft.dueAt ? new Date(`${draft.dueAt}T12:00:00`) : undefined,
      priority: draft.priority,
      contactId,
      dealId,
    });
  };

  return <DashboardLayout>
    <Seo title="Tasks" description="Manage owner-scoped real estate follow-up tasks with contact and deal context." />
    <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-sans text-xs font-extrabold uppercase tracking-[.14em] text-[#8a6c45]">Operations · tasks</p><h1 className="mt-2 text-4xl leading-tight text-[#202547] sm:text-5xl">Make the next move visible.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#697087]">Keep follow-up work connected to the people and opportunities it serves. Complete a task when the work is actually done.</p></div><button type="button" onClick={() => setDialogOpen(true)} className="ss-button-primary self-start sm:self-auto"><Plus size={16} />Add task</button></section>
    <section className="mt-7 grid gap-4 md:grid-cols-3"><article className="rounded-[1.2rem] border border-[#171b39]/9 bg-white p-5 shadow-[0_14px_38px_rgba(26,30,59,.05)]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8edf7] text-[#42567f]"><ClipboardCheck size={19} /></span><p className="mt-5 font-sans text-[0.62rem] font-extrabold uppercase tracking-[.12em] text-[#7a7f93]">Open tasks</p><p className="mt-1 text-3xl font-semibold text-[#2b3053]">{openTasks.length}</p><p className="mt-1 text-xs leading-5 text-[#73798f]">Work that still needs a next move.</p></article><article className="rounded-[1.2rem] border border-[#171b39]/9 bg-white p-5 shadow-[0_14px_38px_rgba(26,30,59,.05)]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f1ece0] text-[#8a6c45]"><CalendarDays size={19} /></span><p className="mt-5 font-sans text-[0.62rem] font-extrabold uppercase tracking-[.12em] text-[#7a7f93]">Due today</p><p className="mt-1 text-3xl font-semibold text-[#2b3053]">{dueToday}</p><p className="mt-1 text-xs leading-5 text-[#73798f]">Time-sensitive follow-through.</p></article><article className="rounded-[1.2rem] bg-[#22294e] p-5 text-white shadow-[0_18px_45px_rgba(26,30,59,.15)]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/8 text-[#dfcda9]"><Handshake size={19} /></span><p className="mt-5 font-sans text-[0.62rem] font-extrabold uppercase tracking-[.12em] text-[#d8cda9]">Connected context</p><p className="mt-1 text-lg font-semibold">People and pipeline stay together.</p><p className="mt-1 text-xs leading-5 text-[#d5d4df]">Link a task to the relevant contact, deal, or both.</p></article></section>
    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,.75fr)]"><div className="overflow-hidden rounded-[1.35rem] border border-[#171b39]/9 bg-white shadow-[0_18px_45px_rgba(26,30,59,.06)]"><div className="flex items-center justify-between border-b border-[#171b39]/8 px-5 py-5"><div><p className="font-sans text-[0.62rem] font-extrabold uppercase tracking-[.13em] text-[#8a6c45]">Open work</p><h2 className="mt-1 text-2xl text-[#2d3255]">Finish what matters next.</h2></div><span className="rounded-full bg-[#edf4eb] px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-[.08em] text-[#557450]">{openTasks.length} open</span></div>{tasksQuery.isLoading ? <p className="px-5 py-12 text-center text-sm font-bold text-[#74798d]">Loading your task list…</p> : openTasks.length === 0 ? <div className="px-5 py-14 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e9e6ef] text-[#5d4f7d]"><CheckCircle2 size={22} /></span><h3 className="mt-4 text-xl text-[#303657]">Your task list is clear.</h3><p className="mt-2 text-sm leading-6 text-[#74798e]">Add a follow-up to keep the next responsible action visible.</p></div> : <div className="divide-y divide-[#171b39]/8">{openTasks.map((task) => <article key={task.id} className="flex gap-3 px-5 py-4"><button type="button" aria-label={`Complete ${task.title}`} onClick={() => statusMutation.mutate({ taskId: task.id, status: "completed" })} disabled={statusMutation.isPending} className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#617096]/35 text-[#60709b] transition hover:border-[#557450] hover:bg-[#edf4eb] hover:text-[#557450] disabled:opacity-50"><Circle size={15} /></button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-extrabold text-[#303657]">{task.title}</h3><span className={`rounded-full px-2 py-0.5 text-[0.58rem] font-extrabold uppercase tracking-[.08em] ${priorityTone(task.priority)}`}>{task.priority}</span></div>{task.notes ? <p className="mt-1 text-xs leading-5 text-[#74798d]">{task.notes}</p> : null}<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] font-bold text-[#71788e]"><span className="inline-flex items-center gap-1"><CalendarDays size={12} />{dueText(task.dueAt)}</span>{task.contactName ? <span className="inline-flex items-center gap-1"><UserRound size={12} />{task.contactName}</span> : null}{task.dealTitle ? <span className="inline-flex items-center gap-1"><Handshake size={12} />{task.dealTitle}</span> : null}</div></div></article>)}</div>}</div><aside className="overflow-hidden rounded-[1.35rem] border border-[#171b39]/9 bg-white shadow-[0_18px_45px_rgba(26,30,59,.06)]"><div className="border-b border-[#171b39]/8 px-5 py-5"><p className="font-sans text-[0.62rem] font-extrabold uppercase tracking-[.13em] text-[#8a6c45]">Completed</p><h2 className="mt-1 text-xl text-[#2d3255]">Closed loops.</h2></div>{completedTasks.length === 0 ? <p className="px-5 py-10 text-center text-xs leading-5 text-[#7a8094]">Completed tasks will appear here.</p> : <div className="divide-y divide-[#171b39]/8">{completedTasks.slice(0, 8).map((task) => <article key={task.id} className="flex gap-3 px-5 py-4"><button type="button" aria-label={`Reopen ${task.title}`} onClick={() => statusMutation.mutate({ taskId: task.id, status: "open" })} disabled={statusMutation.isPending} className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#edf4eb] text-[#557450] disabled:opacity-50"><CheckCircle2 size={15} /></button><div className="min-w-0"><p className="text-sm font-bold text-[#656b7d] line-through">{task.title}</p><p className="mt-1 text-[0.68rem] text-[#8a8f9f]">Completed {task.completedAt ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(task.completedAt)) : "recently"}</p></div></article>)}</div>}</aside></section>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-h-[90vh] overflow-y-auto border-[#171b39]/10 bg-[#fffdf9] text-[#303657] shadow-[0_24px_80px_rgba(22,26,53,.2)] sm:max-w-2xl"><DialogHeader><p className="font-sans text-[0.65rem] font-extrabold uppercase tracking-[.14em] text-[#8a6c45]">New task</p><DialogTitle className="font-serif text-3xl text-[#252c53]">Make an accountable next move.</DialogTitle><DialogDescription className="leading-6 text-[#697087]">Connect work to a contact or deal when it provides useful context. Both links are optional.</DialogDescription></DialogHeader><form className="mt-2 space-y-4" onSubmit={submitTask}><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Task title</span><input required value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} maxLength={240} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="Confirm listing paperwork" /></label><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Notes <span className="font-medium text-[#8c90a1]">(optional)</span></span><Textarea value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} maxLength={4000} className="mt-1.5 min-h-24 resize-y rounded-xl border-[#171b39]/10 bg-[#fbfaf6] text-sm leading-6 text-[#303657] focus-visible:border-[#6a5889] focus-visible:ring-[#6a5889]/12" placeholder="What should happen next?" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Contact <span className="font-medium text-[#8c90a1]">(optional)</span></span><select value={draft.contactId} onChange={(event) => setDraft((current) => ({ ...current, contactId: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12"><option value="">No linked contact</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.displayName}</option>)}</select></label><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Deal <span className="font-medium text-[#8c90a1]">(optional)</span></span><select value={draft.dealId} onChange={(event) => setDraft((current) => ({ ...current, dealId: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12"><option value="">No linked deal</option>{deals.map((deal) => <option key={deal.id} value={deal.id}>{deal.title} · {deal.contactName}</option>)}</select></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Due date <span className="font-medium text-[#8c90a1]">(optional)</span></span><input type="date" value={draft.dueAt} onChange={(event) => setDraft((current) => ({ ...current, dueAt: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" /></label><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Priority</span><select value={draft.priority} onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as Priority }))} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12">{priorities.map((priority) => <option key={priority.value} value={priority.value}>{priority.label}</option>)}</select></label></div><DialogFooter><button type="button" onClick={() => setDialogOpen(false)} className="ss-button-secondary justify-center">Cancel</button><button type="submit" disabled={createMutation.isPending} className="ss-button-primary justify-center disabled:cursor-not-allowed disabled:opacity-50">{createMutation.isPending ? "Adding…" : "Add task"}<Plus size={16} /></button></DialogFooter></form></DialogContent></Dialog>
  </DashboardLayout>;
}
