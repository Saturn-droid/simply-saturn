import { cn } from "@/lib/utils";
import { ContactChannel, ContactRecord, contactActionHref } from "@/lib/contactUtils";
import { Mail, MessageSquareText, Phone } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type ContactQuickActionsProps = {
  contact: ContactRecord;
  compact?: boolean;
};

export function ContactQuickActions({ contact, compact = false }: ContactQuickActionsProps) {
  const [, setLocation] = useLocation();

  const openAction = (channel: ContactChannel) => {
    const hasDestination = channel === "email" ? Boolean(contact.email) : Boolean(contact.phone);
    if (!hasDestination) {
      toast.error(`${contact.displayName} does not have a ${channel === "email" ? "saved email address" : "saved phone number"}.`);
      return;
    }
    setLocation(contactActionHref(contact, channel));
  };

  const actionClass = cn(
    "grid place-items-center rounded-lg border border-[#171b39]/10 bg-white text-[#5b6383] transition hover:border-[#5f5585]/35 hover:bg-[#f4f1ea] hover:text-[#453a65] active:scale-[.97]",
    compact ? "h-8 w-8" : "h-10 w-10",
  );

  return <div className="flex items-center justify-end gap-1.5" aria-label={`Quick contact actions for ${contact.displayName}`}>
    <button type="button" onClick={() => openAction("call")} className={actionClass} aria-label={`Call ${contact.displayName}`}><Phone size={compact ? 14 : 16} /></button>
    <button type="button" onClick={() => openAction("text")} className={actionClass} aria-label={`Text ${contact.displayName}`}><MessageSquareText size={compact ? 14 : 16} /></button>
    <button type="button" onClick={() => openAction("email")} className={actionClass} aria-label={`Email ${contact.displayName}`}><Mail size={compact ? 14 : 16} /></button>
  </div>;
}
