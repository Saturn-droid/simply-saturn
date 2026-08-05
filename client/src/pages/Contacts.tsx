import DashboardLayout from "@/components/DashboardLayout";
import { ContactQuickActions } from "@/components/ContactQuickActions";
import { Seo } from "@/components/Seo";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { ContactStatus, contactStatusLabels, contactStatuses, contactTypeLabels, contactInitials, relativeContactTime, statusTone } from "@/lib/contactUtils";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { BriefcaseBusiness, CirclePlus, Mail, MessageSquareText, Phone, Search, Tags, UserRound, UsersRound, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type ContactDraft = { displayName: string; email: string; phone: string; types: string[]; status: ContactStatus | ""; dealCount: string };
const typeOptions = ["buyer", "seller", "investor", "vendor", "agent", "tenant", "landlord", "other"];
const emptyDraft = (): ContactDraft => ({ displayName: "", email: "", phone: "", types: [], status: "", dealCount: "0" });

export default function Contacts() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "">("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<ContactDraft>(emptyDraft);
  const filterInput = useMemo(() => ({ query: search.trim() || undefined, status: statusFilter || undefined }), [search, statusFilter]);
  const contactsQuery = trpc.contacts.list.useQuery(filterInput, { enabled: isAuthenticated, retry: false });

  const createMutation = trpc.contacts.create.useMutation({
    onSuccess: async (contact) => {
      toast.success(`${contact.displayName} was added to Contacts.`);
      setDialogOpen(false);
      setDraft(emptyDraft());
      await utils.contacts.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const statusMutation = trpc.contacts.setStatus.useMutation({
    onSuccess: async () => { await utils.contacts.list.invalidate(); },
    onError: (error) => toast.error(error.message),
  });

  const contacts = contactsQuery.data ?? [];
  const submitNewContact = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate({
      displayName: draft.displayName,
      email: draft.email,
      phone: draft.phone,
      types: draft.types as ("buyer" | "seller" | "investor" | "vendor" | "agent" | "tenant" | "landlord" | "other")[],
      status: draft.status || null,
      dealCount: Number(draft.dealCount || 0),
    });
  };

  const toggleType = (type: string) => setDraft((current) => ({ ...current, types: current.types.includes(type) ? current.types.filter((entry) => entry !== type) : [...current.types, type] }));

  return <DashboardLayout demoMode>
    <Seo title="Contacts" description="Operational contacts, statuses, deals, and communication activity in Simply Saturn." />
    <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="font-sans text-xs font-extrabold uppercase tracking-[.14em] text-[#8a6c45]">Contacts</p>
        <h1 className="mt-2 text-4xl leading-tight text-[#202547] sm:text-5xl">Relationship work, with operational context.</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#697087]">See the current contact record, their deals, recent outreach, and the fastest next conversation in one disciplined list.</p>
      </div>
      <button type="button" onClick={() => setDialogOpen(true)} className="ss-button-primary self-start"><CirclePlus size={17} />Add contact</button>
    </section>

    <section className="mt-7 overflow-hidden rounded-[1.35rem] border border-[#171b39]/9 bg-white shadow-[0_16px_45px_rgba(26,30,59,.06)]">
      <div className="flex flex-col gap-3 border-b border-[#171b39]/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#85899c]" /><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search contacts" className="w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] py-2.5 pl-9 pr-3 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="Search name, email, phone, or type" /></div>
        <label className="flex items-center gap-2 text-xs font-extrabold text-[#686d82]"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ContactStatus | "")} aria-label="Filter contacts by status" className="rounded-lg border border-[#171b39]/10 bg-[#fbfaf6] px-2.5 py-2 text-xs text-[#454b69] outline-none focus:border-[#6a5889]"><option value="">All statuses</option>{contactStatuses.map((status) => <option value={status} key={status}>{contactStatusLabels[status]}</option>)}</select></label>
      </div>
      {!isAuthenticated ? <div className="px-6 py-16 text-center"><UsersRound className="mx-auto text-[#aa9e86]" size={28} /><h2 className="mt-4 text-xl text-[#303657]">Sign in to work your contacts.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#73798d]">Contacts, statuses, and outreach activity are scoped to your secure workspace.</p></div> : null}
      {isAuthenticated && contactsQuery.isLoading ? <p className="px-6 py-14 text-center text-sm font-bold text-[#74798d]">Loading contacts…</p> : null}
      {isAuthenticated && !contactsQuery.isLoading && contacts.length === 0 ? <div className="px-6 py-16 text-center"><UserRound className="mx-auto text-[#aa9e86]" size={28} /><h2 className="mt-4 text-xl text-[#303657]">No contacts match this view.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#73798d]">Add a contact to begin a practical record of types, deals, status, and outreach.</p></div> : null}
      {isAuthenticated && contacts.length > 0 ? <div className="overflow-x-auto"><table className="min-w-[1080px] w-full text-left"><thead className="border-b border-[#171b39]/8 bg-[#fbfaf6]"><tr className="text-[0.62rem] font-extrabold uppercase tracking-[.12em] text-[#777b8f]"><th className="px-5 py-3.5">Name</th><th className="px-5 py-3.5">Contact info</th><th className="px-5 py-3.5">Type(s)</th><th className="px-5 py-3.5 text-center">Deals</th><th className="px-5 py-3.5">Last contact</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Contact</th></tr></thead><tbody className="divide-y divide-[#171b39]/8">{contacts.map((contact) => <tr key={contact.id} className="group transition-colors hover:bg-[#fcfbf8]"><td className="px-5 py-4"><button type="button" onClick={() => setLocation(`/app/contacts/${contact.id}`)} className="flex items-center gap-3 text-left"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8ebf3] text-xs font-extrabold text-[#445575]">{contactInitials(contact.displayName)}</span><span><strong className="block text-sm text-[#303657] transition group-hover:text-[#544174]">{contact.displayName}</strong><small className="mt-0.5 block text-[0.68rem] text-[#85899b]">Open record</small></span></button></td><td className="px-5 py-4"><div className="space-y-1 text-xs text-[#61677d]">{contact.email ? <p className="flex items-center gap-1.5"><Mail size={12} className="text-[#8a6c45]" />{contact.email}</p> : <p className="text-[#9a9dab]">No email</p>}{contact.phone ? <p className="flex items-center gap-1.5"><Phone size={12} className="text-[#8a6c45]" />{contact.phone}</p> : <p className="text-[#9a9dab]">No phone</p>}</div></td><td className="px-5 py-4"><div className="flex max-w-48 flex-wrap gap-1.5">{contact.types.length ? contact.types.map((type) => <span key={type} className="rounded-full bg-[#eaf5ee] px-2 py-1 text-[0.6rem] font-extrabold uppercase tracking-[.08em] text-[#557450]">{contactTypeLabels[type] || type}</span>) : <span className="text-xs text-[#9a9dab]">—</span>}</div></td><td className="px-5 py-4 text-center"><span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f1eee6] px-2.5 py-1.5 text-xs font-extrabold text-[#615675]"><BriefcaseBusiness size={13} />{contact.dealCount}</span></td><td className="px-5 py-4"><div className="flex items-center gap-3 text-[0.68rem] font-bold text-[#73798f]"><span title="Last text" aria-label={`Last text for ${contact.displayName}: ${relativeContactTime(contact.lastTextAt)}`} className="inline-flex items-center gap-1"><MessageSquareText size={13} className="text-[#5e77a7]" />{relativeContactTime(contact.lastTextAt)}</span><span title="Last call" aria-label={`Last call for ${contact.displayName}: ${relativeContactTime(contact.lastCallAt)}`} className="inline-flex items-center gap-1"><Phone size={13} className="text-[#4f8065]" />{relativeContactTime(contact.lastCallAt)}</span><span title="Last email" aria-label={`Last email for ${contact.displayName}: ${relativeContactTime(contact.lastEmailAt)}`} className="inline-flex items-center gap-1"><Mail size={13} className="text-[#a16b45]" />{relativeContactTime(contact.lastEmailAt)}</span></div></td><td className="px-5 py-4"><div className="flex items-center gap-1.5"><select value={contact.status ?? ""} onChange={(event) => statusMutation.mutate({ contactId: contact.id, status: (event.target.value || null) as ContactStatus | null })} aria-label={`Update status for ${contact.displayName}`} className={cn("rounded-lg border-0 px-2 py-1.5 text-xs font-extrabold outline-none ring-1 ring-inset ring-black/5", statusTone(contact.status))}><option value="">No status</option>{contactStatuses.map((status) => <option value={status} key={status}>{contactStatusLabels[status]}</option>)}</select>{contact.status ? <button type="button" onClick={() => statusMutation.mutate({ contactId: contact.id, status: null })} aria-label={`Remove ${contact.displayName} status`} className="rounded-md p-1 text-[#8d91a1] transition hover:bg-[#f1eee8] hover:text-[#7b4d48]"><X size={14} /></button> : null}</div></td><td className="px-5 py-4"><ContactQuickActions contact={contact} compact /></td></tr>)}</tbody></table></div> : null}
    </section>

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-h-[92vh] overflow-y-auto border-[#171b39]/10 bg-[#fffdf9] text-[#303657] shadow-[0_24px_80px_rgba(22,26,53,.2)]"><DialogHeader><p className="font-sans text-[0.65rem] font-extrabold uppercase tracking-[.14em] text-[#8a6c45]">New contact</p><DialogTitle className="font-serif text-2xl text-[#252c53]">Build a practical contact record.</DialogTitle><DialogDescription className="leading-6 text-[#697087]">Status is optional. Select it only when it helps the ISA know the correct next step.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={submitNewContact}><div className="grid gap-4 sm:grid-cols-2"><label className="block sm:col-span-2"><span className="text-xs font-extrabold text-[#4c5270]">Contact name</span><input required value={draft.displayName} onChange={(event) => setDraft((current) => ({ ...current, displayName: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm outline-none focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="Full name" /></label><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Email <span className="font-medium text-[#8c90a1]">(optional)</span></span><input type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm outline-none focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="name@email.com" /></label><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Phone <span className="font-medium text-[#8c90a1]">(optional)</span></span><input value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm outline-none focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="+15551234567" /></label></div><div><div className="flex items-center gap-2"><Tags size={14} className="text-[#8a6c45]" /><span className="text-xs font-extrabold text-[#4c5270]">Type(s)</span></div><div className="mt-2 flex flex-wrap gap-2">{typeOptions.map((type) => <label key={type} className={cn("cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-bold transition", draft.types.includes(type) ? "border-[#78966f]/35 bg-[#edf4eb] text-[#557450]" : "border-[#171b39]/10 bg-[#fbfaf6] text-[#74798d]")}><input type="checkbox" checked={draft.types.includes(type)} onChange={() => toggleType(type)} className="sr-only" />{contactTypeLabels[type]}</label>)}</div></div><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">ISA status <span className="font-medium text-[#8c90a1]">(optional)</span></span><select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as ContactStatus | "" }))} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm outline-none focus:border-[#6a5889]"><option value="">No status</option>{contactStatuses.map((status) => <option value={status} key={status}>{contactStatusLabels[status]}</option>)}</select></label><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Current deal count</span><input type="number" min="0" value={draft.dealCount} onChange={(event) => setDraft((current) => ({ ...current, dealCount: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm outline-none focus:border-[#6a5889]" /></label></div><DialogFooter><button type="button" onClick={() => setDialogOpen(false)} className="ss-button-secondary justify-center">Cancel</button><button type="submit" disabled={createMutation.isPending} className="ss-button-primary justify-center disabled:opacity-50">{createMutation.isPending ? "Adding…" : "Add contact"}<CirclePlus size={16} /></button></DialogFooter></form></DialogContent></Dialog>
  </DashboardLayout>;
}
