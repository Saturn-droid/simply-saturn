import DashboardLayout from "@/components/DashboardLayout";
import { Seo } from "@/components/Seo";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Building2, CalendarDays, ChevronRight, CircleDollarSign, Plus, UserRound, Workflow } from "lucide-react";
import React, { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

const pipelineStages = [
  { value: "lead", label: "Lead", tone: "bg-[#f0ece4] text-[#796646]" },
  { value: "qualification", label: "Qualified", tone: "bg-[#e8edf7] text-[#456084]" },
  { value: "active", label: "Active", tone: "bg-[#e6f0ea] text-[#517456]" },
  { value: "offer", label: "Offer", tone: "bg-[#f7e9e3] text-[#9b5c45]" },
  { value: "under_contract", label: "Under contract", tone: "bg-[#ece7f2] text-[#695184]" },
  { value: "closed", label: "Closed", tone: "bg-[#edf4eb] text-[#557450]" },
  { value: "lost", label: "Lost", tone: "bg-[#f4e9e9] text-[#8a5555]" },
] as const;

type Stage = (typeof pipelineStages)[number]["value"];

function currency(valueCents: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(valueCents / 100);
}

function defaultDraft() {
  return { contactId: "", title: "", propertyAddress: "", stage: "lead" as Stage, estimatedValue: "", targetClose: "" };
}

export default function Deals() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState(defaultDraft);
  const dealsQuery = trpc.deals.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const contactsQuery = trpc.contacts.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const deals = dealsQuery.data ?? [];
  const contacts = contactsQuery.data ?? [];
  const totalPipeline = useMemo(() => deals.filter((deal) => !["closed", "lost"].includes(deal.stage)).reduce((total, deal) => total + deal.estimatedValueCents, 0), [deals]);

  const createMutation = trpc.deals.create.useMutation({
    onSuccess: async () => {
      toast.success("Deal added to the pipeline.");
      setDialogOpen(false);
      setDraft(defaultDraft());
      await Promise.all([utils.deals.list.invalidate(), utils.contacts.list.invalidate()]);
    },
    onError: (error) => toast.error(error.message),
  });
  const stageMutation = trpc.deals.updateStage.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.deals.list.invalidate(), utils.contacts.list.invalidate()]);
    },
    onError: (error) => toast.error(error.message),
  });

  const submitDeal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const contactId = Number(draft.contactId);
    if (!Number.isInteger(contactId) || contactId <= 0) {
      toast.error("Choose the contact tied to this deal.");
      return;
    }
    const estimatedValue = Number(draft.estimatedValue || "0");
    if (!Number.isFinite(estimatedValue) || estimatedValue < 0) {
      toast.error("Enter a valid estimated value.");
      return;
    }
    createMutation.mutate({
      contactId,
      title: draft.title.trim(),
      propertyAddress: draft.propertyAddress.trim() || undefined,
      stage: draft.stage,
      estimatedValueCents: Math.round(estimatedValue * 100),
      targetCloseAt: draft.targetClose ? new Date(`${draft.targetClose}T12:00:00`) : undefined,
    });
  };

  return <DashboardLayout>
    <Seo title="Deals" description="Manage contact-linked real estate deal pipelines in Simply Saturn." />
    <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-sans text-xs font-extrabold uppercase tracking-[.14em] text-[#8a6c45]">Pipeline · deals</p><h1 className="mt-2 text-4xl leading-tight text-[#202547] sm:text-5xl">Every opportunity has a next move.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#697087]">Connect each real estate opportunity to a known contact, maintain a clear stage, and keep the pipeline grounded in accountable work.</p></div><button type="button" onClick={() => setDialogOpen(true)} className="ss-button-primary self-start sm:self-auto"><Plus size={16} />Add deal</button></section>

    <section className="mt-7 grid gap-4 md:grid-cols-3"><article className="rounded-[1.2rem] border border-[#171b39]/9 bg-white p-5 shadow-[0_14px_38px_rgba(26,30,59,.05)]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8edf7] text-[#42567f]"><Workflow size={19} /></span><p className="mt-5 font-sans text-[0.62rem] font-extrabold uppercase tracking-[.12em] text-[#7a7f93]">Open opportunities</p><p className="mt-1 text-3xl font-semibold text-[#2b3053]">{deals.filter((deal) => !["closed", "lost"].includes(deal.stage)).length}</p><p className="mt-1 text-xs leading-5 text-[#73798f]">Across your working pipeline.</p></article><article className="rounded-[1.2rem] border border-[#171b39]/9 bg-white p-5 shadow-[0_14px_38px_rgba(26,30,59,.05)]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f1ece0] text-[#8a6c45]"><CircleDollarSign size={19} /></span><p className="mt-5 font-sans text-[0.62rem] font-extrabold uppercase tracking-[.12em] text-[#7a7f93]">Pipeline value</p><p className="mt-1 text-3xl font-semibold text-[#2b3053]">{currency(totalPipeline)}</p><p className="mt-1 text-xs leading-5 text-[#73798f]">Estimated across non-closed deals.</p></article><article className="rounded-[1.2rem] bg-[#22294e] p-5 text-white shadow-[0_18px_45px_rgba(26,30,59,.15)]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/8 text-[#dfcda9]"><UserRound size={19} /></span><p className="mt-5 font-sans text-[0.62rem] font-extrabold uppercase tracking-[.12em] text-[#d8cda9]">Connected data</p><p className="mt-1 text-lg font-semibold">Deals follow the relationship.</p><p className="mt-1 text-xs leading-5 text-[#d5d4df]">Each opportunity is linked to one saved CRM contact.</p></article></section>

    <section className="mt-5 overflow-hidden rounded-[1.35rem] border border-[#171b39]/9 bg-white shadow-[0_18px_45px_rgba(26,30,59,.06)]"><div className="flex flex-col gap-3 border-b border-[#171b39]/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-sans text-[0.62rem] font-extrabold uppercase tracking-[.13em] text-[#8a6c45]">Pipeline board</p><h2 className="mt-1 text-2xl text-[#2d3255]">Move the work, not the context.</h2><p className="mt-1 text-xs leading-5 text-[#73798f]">Update a stage directly on the deal card. Contact deal totals update from the real connected record.</p></div><span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#edf4eb] px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-[.08em] text-[#557450]"><Building2 size={12} />{deals.length} total deals</span></div>{dealsQuery.isLoading ? <p className="px-5 py-14 text-center text-sm font-bold text-[#74798d]">Loading the pipeline…</p> : <div className="overflow-x-auto p-4"><div className="grid min-w-[1080px] grid-cols-7 gap-3">{pipelineStages.map((stage) => { const stageDeals = deals.filter((deal) => deal.stage === stage.value); return <section key={stage.value} className="min-h-[20rem] rounded-xl bg-[#fbfaf6] p-3"><div className="flex items-center justify-between gap-2"><span className={`rounded-full px-2 py-1 text-[0.6rem] font-extrabold uppercase tracking-[.08em] ${stage.tone}`}>{stage.label}</span><span className="text-xs font-bold text-[#777c91]">{stageDeals.length}</span></div><div className="mt-3 space-y-2">{stageDeals.map((deal) => <article key={deal.id} className="rounded-xl border border-[#171b39]/9 bg-white p-3 shadow-[0_8px_18px_rgba(26,30,59,.04)]"><h3 className="text-sm font-extrabold leading-5 text-[#303657]">{deal.title}</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-[#697087]"><UserRound size={12} />{deal.contactName}</p>{deal.propertyAddress ? <p className="mt-1.5 text-xs leading-5 text-[#74798d]">{deal.propertyAddress}</p> : null}<div className="mt-3 flex items-center justify-between gap-2"><strong className="text-xs text-[#4b516f]">{currency(deal.estimatedValueCents)}</strong>{deal.targetCloseAt ? <span className="inline-flex items-center gap-1 text-[0.62rem] text-[#7d8194]"><CalendarDays size={11} />{new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(deal.targetCloseAt))}</span> : null}</div><label className="mt-3 block"><span className="sr-only">Update stage for {deal.title}</span><select value={deal.stage} disabled={stageMutation.isPending} onChange={(event) => stageMutation.mutate({ dealId: deal.id, stage: event.target.value as Stage })} className="w-full rounded-lg border border-[#171b39]/10 bg-[#fbfaf6] px-2 py-1.5 text-[0.68rem] font-bold text-[#58607c] outline-none focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12">{pipelineStages.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></article>)}{stageDeals.length === 0 ? <p className="px-1 py-6 text-center text-xs leading-5 text-[#9a9dab]">No deals here yet.</p> : null}</div></section>; })}</div></div>}</section>

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-h-[90vh] overflow-y-auto border-[#171b39]/10 bg-[#fffdf9] text-[#303657] shadow-[0_24px_80px_rgba(22,26,53,.2)] sm:max-w-2xl"><DialogHeader><p className="font-sans text-[0.65rem] font-extrabold uppercase tracking-[.14em] text-[#8a6c45]">New opportunity</p><DialogTitle className="font-serif text-3xl text-[#252c53]">Add a deal with context.</DialogTitle><DialogDescription className="leading-6 text-[#697087]">A saved contact anchors every deal. Keep an estimated value and a target close date when they are known.</DialogDescription></DialogHeader><form className="mt-2 space-y-4" onSubmit={submitDeal}><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Contact</span><select required value={draft.contactId} onChange={(event) => setDraft((current) => ({ ...current, contactId: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12"><option value="">Choose a saved contact</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.displayName}{contact.email ? ` · ${contact.email}` : ""}</option>)}</select></label><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Deal title</span><input required value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} maxLength={240} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="123 Main Street listing" /></label><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Property address <span className="font-medium text-[#8c90a1]">(optional)</span></span><input value={draft.propertyAddress} onChange={(event) => setDraft((current) => ({ ...current, propertyAddress: event.target.value }))} maxLength={320} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="123 Main Street, Austin, TX" /></label><div className="grid gap-4 sm:grid-cols-3"><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Starting stage</span><select value={draft.stage} onChange={(event) => setDraft((current) => ({ ...current, stage: event.target.value as Stage }))} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12">{pipelineStages.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}</select></label><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Estimated value</span><input type="number" min="0" step="1000" value={draft.estimatedValue} onChange={(event) => setDraft((current) => ({ ...current, estimatedValue: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="500000" /></label><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Target close</span><input type="date" value={draft.targetClose} onChange={(event) => setDraft((current) => ({ ...current, targetClose: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" /></label></div><DialogFooter><button type="button" onClick={() => setDialogOpen(false)} className="ss-button-secondary justify-center">Cancel</button><button type="submit" disabled={createMutation.isPending} className="ss-button-primary justify-center disabled:cursor-not-allowed disabled:opacity-50">{createMutation.isPending ? "Adding…" : "Add deal"}<ChevronRight size={16} /></button></DialogFooter></form></DialogContent></Dialog>
  </DashboardLayout>;
}
