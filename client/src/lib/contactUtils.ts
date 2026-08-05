export const contactStatuses = ["dead", "expired", "dnc", "prospect", "active", "forever_client", "vendor"] as const;
export type ContactStatus = string;

export const contactStatusLabels: Record<string, string> = {
  dead: "Dead",
  expired: "Expired",
  dnc: "DNC",
  prospect: "Prospect",
  active: "Active",
  forever_client: "Forever Client",
  vendor: "Vendor",
};

export const contactTypeLabels: Record<string, string> = {
  buyer: "Buyer",
  seller: "Seller",
  investor: "Investor",
  vendor: "Vendor",
  agent: "Agent",
  tenant: "Tenant",
  landlord: "Landlord",
  other: "Other",
};

export type ContactRecord = {
  id: number;
  displayName: string;
  email: string | null;
  phone: string | null;
  types: string[];
  status: ContactStatus | null;
  dealCount: number;
  lastTextAt: Date | string | null;
  lastCallAt: Date | string | null;
  lastEmailAt: Date | string | null;
};

export type ContactChannel = "text" | "email" | "call";

export function contactInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((part) => part.slice(0, 1)).slice(0, 2).join("").toUpperCase() || "CT";
}

export function relativeContactTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "—";
  const minutes = Math.max(0, Math.round((Date.now() - time) / 60000));
  if (minutes < 60) return minutes < 2 ? "Now" : `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day" : `${days} days`;
}

export function statusTone(status: ContactStatus | null) {
  if (!status) return "bg-[#f3f2ee] text-[#7c7f8d]";
  if (status === "active" || status === "forever_client") return "bg-[#eaf5ee] text-[#4d775d]";
  if (status === "prospect") return "bg-[#e9effc] text-[#4b6191]";
  if (status === "vendor") return "bg-[#f5eee3] text-[#8a6533]";
  return "bg-[#f8e9e7] text-[#9a5149]";
}

export function displayContactStatus(status: ContactStatus | null) {
  if (!status) return "No status";
  return contactStatusLabels[status] || status;
}

export function contactActionHref(contact: ContactRecord, channel: ContactChannel) {
  const query = new URLSearchParams({
    channel,
    contactId: String(contact.id),
    name: contact.displayName,
  });
  if (contact.email) query.set("email", contact.email);
  if (contact.phone) query.set("phone", contact.phone);
  return `/app/inbox?${query.toString()}`;
}
