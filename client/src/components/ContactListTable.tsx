import { ContactQuickActions } from "@/components/ContactQuickActions";
import { ContactRecord, contactInitials, contactTypeLabels, relativeContactTime, statusTone } from "@/lib/contactUtils";
import { cn } from "@/lib/utils";
import { BriefcaseBusiness, Mail, MessageSquareText, Phone, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type ContactListTableProps = {
  contacts: ContactRecord[];
  onOpenContact: (contactId: number) => void;
  onStatusChange: (contactId: number, status: string | null) => void;
};

export function ContactListTable({ contacts, onOpenContact, onStatusChange }: ContactListTableProps) {
  const [statusDrafts, setStatusDrafts] = useState<Record<number, string>>({});
  const removalIntentIds = useRef(new Set<number>());

  useEffect(() => {
    setStatusDrafts(Object.fromEntries(contacts.map((contact) => [contact.id, contact.status ?? ""])));
  }, [contacts]);

  const updateDraft = (contactId: number, status: string) => setStatusDrafts((current) => ({ ...current, [contactId]: status }));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1080px] w-full text-left">
        <thead className="border-b border-[#171b39]/8 bg-[#fbfaf6]">
          <tr className="text-[0.62rem] font-extrabold uppercase tracking-[.12em] text-[#777b8f]">
            <th className="px-5 py-3.5">Name</th><th className="px-5 py-3.5">Contact info</th><th className="px-5 py-3.5">Type(s)</th><th className="px-5 py-3.5 text-center">Deals</th><th className="px-5 py-3.5">Last contact</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Contact</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#171b39]/8">
          {contacts.map((contact) => {
            const status = statusDrafts[contact.id] ?? "";
            return <tr key={contact.id} className="group transition-colors hover:bg-[#fcfbf8]">
              <td className="px-5 py-4"><button type="button" onClick={() => onOpenContact(contact.id)} className="flex items-center gap-3 text-left"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8ebf3] text-xs font-extrabold text-[#445575]">{contactInitials(contact.displayName)}</span><span><strong className="block text-sm text-[#303657] transition group-hover:text-[#544174]">{contact.displayName}</strong><small className="mt-0.5 block text-[0.68rem] text-[#85899b]">Open record</small></span></button></td>
              <td className="px-5 py-4"><div className="space-y-1 text-xs text-[#61677d]">{contact.email ? <p className="flex items-center gap-1.5"><Mail size={12} className="text-[#8a6c45]" />{contact.email}</p> : <p className="text-[#9a9dab]">No email</p>}{contact.phone ? <p className="flex items-center gap-1.5"><Phone size={12} className="text-[#8a6c45]" />{contact.phone}</p> : <p className="text-[#9a9dab]">No phone</p>}</div></td>
              <td className="px-5 py-4"><div className="flex max-w-48 flex-wrap gap-1.5">{contact.types.length ? contact.types.map((type) => <span key={type} className="rounded-full bg-[#eaf5ee] px-2 py-1 text-[0.6rem] font-extrabold uppercase tracking-[.08em] text-[#557450]">{contactTypeLabels[type] || type}</span>) : <span className="text-xs text-[#9a9dab]">—</span>}</div></td>
              <td className="px-5 py-4 text-center"><span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f1eee6] px-2.5 py-1.5 text-xs font-extrabold text-[#615675]"><BriefcaseBusiness size={13} />{contact.dealCount}</span></td>
              <td className="px-5 py-4"><div className="flex items-center gap-3 text-[0.68rem] font-bold text-[#73798f]"><span aria-label={`Last text for ${contact.displayName}: ${relativeContactTime(contact.lastTextAt)}`} className="inline-flex items-center gap-1"><MessageSquareText size={13} className="text-[#5e77a7]" />{relativeContactTime(contact.lastTextAt)}</span><span aria-label={`Last call for ${contact.displayName}: ${relativeContactTime(contact.lastCallAt)}`} className="inline-flex items-center gap-1"><Phone size={13} className="text-[#4f8065]" />{relativeContactTime(contact.lastCallAt)}</span><span aria-label={`Last email for ${contact.displayName}: ${relativeContactTime(contact.lastEmailAt)}`} className="inline-flex items-center gap-1"><Mail size={13} className="text-[#a16b45]" />{relativeContactTime(contact.lastEmailAt)}</span></div></td>
              <td className="px-5 py-4"><div className="flex items-center gap-1.5"><input list="contact-status-suggestions" value={status} onChange={(event) => updateDraft(contact.id, event.target.value)} onBlur={() => { if (removalIntentIds.current.delete(contact.id)) return; const normalized = status.trim() || null; if (normalized !== (contact.status ?? null)) onStatusChange(contact.id, normalized); }} aria-label={`Update status for ${contact.displayName}`} className={cn("w-28 rounded-lg border-0 px-2 py-1.5 text-xs font-extrabold outline-none ring-1 ring-inset ring-black/5", statusTone(status || null))} placeholder="No status" />{status ? <button type="button" onPointerDown={() => removalIntentIds.current.add(contact.id)} onClick={() => { updateDraft(contact.id, ""); onStatusChange(contact.id, null); }} aria-label={`Remove ${contact.displayName} status`} className="rounded-md p-1 text-[#8d91a1] transition hover:bg-[#f1eee8] hover:text-[#7b4d48]"><X size={14} /></button> : null}</div></td>
              <td className="px-5 py-4"><ContactQuickActions contact={contact} compact /></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}
