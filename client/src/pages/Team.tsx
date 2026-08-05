import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Seo } from "@/components/Seo";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Crown, Mail, ShieldCheck, UserMinus, UserPlus, UsersRound, X } from "lucide-react";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function roleLabel(role: "admin" | "user") {
  return role === "admin" ? "Leadership" : "Team member";
}

export default function Team() {
  const { isAuthenticated, user } = useAuth();
  const utils = trpc.useUtils();
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<{ userId: number; displayName: string } | null>(null);
  const directoryQuery = trpc.team.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const members = directoryQuery.data ?? [];
  const canManageTeam = user?.role === "admin";
  const leadershipCount = useMemo(() => members.filter((member) => member.role === "admin").length, [members]);
  const currentMember = members.find((member) => member.userId === user?.id);

  useEffect(() => {
    setPhone(currentMember?.phone ?? "");
  }, [currentMember?.phone]);

  const enrollMutation = trpc.team.enroll.useMutation({
    onSuccess: async (member) => {
      toast.success(`${member.displayName} is now part of this workspace.`);
      setEmail("");
      setEnrollOpen(false);
      await Promise.all([utils.team.list.invalidate(), utils.calendar.teamDirectory.invalidate(), utils.calendar.participantSuggestions.invalidate()]);
    },
    onError: (error) => toast.error(error.message),
  });

  const removeMutation = trpc.team.remove.useMutation({
    onSuccess: async () => {
      toast.success("Team member removed from this workspace.");
      setMemberToRemove(null);
      await Promise.all([utils.team.list.invalidate(), utils.calendar.teamDirectory.invalidate(), utils.calendar.participantSuggestions.invalidate()]);
    },
    onError: (error) => toast.error(error.message),
  });

  const phoneMutation = trpc.team.updateMyPhone.useMutation({
    onSuccess: async () => {
      toast.success("Your directory phone was updated.");
      await utils.team.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const enrollMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      toast.error("Enter a valid registered teammate email.");
      return;
    }
    enrollMutation.mutate({ email: normalized });
  };

  const saveMyPhone = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = phone.trim();
    if (normalized && normalized.length < 7) {
      toast.error("Enter a complete phone number or clear the field to remove it.");
      return;
    }
    phoneMutation.mutate({ phone: normalized || null });
  };

  return <DashboardLayout>
    <Seo title="Team Management" description="Manage the registered Simply Saturn team directory and workspace access." />
    <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="font-sans text-xs font-extrabold uppercase tracking-[.14em] text-[#8a6c45]">Administration · team</p><h1 className="mt-2 text-4xl leading-tight text-[#202547] sm:text-5xl">The people behind the work.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#697087]">Keep the registered team directory clear so members are available for shared calendar coordination and operational handoffs.</p></div>
      {canManageTeam ? <button type="button" onClick={() => setEnrollOpen(true)} className="ss-button-primary self-start sm:self-auto"><UserPlus size={16} />Enroll team member</button> : null}
    </section>

    <section className="mt-7 grid gap-4 md:grid-cols-3">
      <article className="rounded-[1.2rem] border border-[#171b39]/9 bg-white p-5 shadow-[0_14px_38px_rgba(26,30,59,.05)]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8edf7] text-[#42567f]"><UsersRound size={19} /></span><p className="mt-5 font-sans text-[0.62rem] font-extrabold uppercase tracking-[.12em] text-[#7a7f93]">Registered members</p><p className="mt-1 text-3xl font-semibold text-[#2b3053]">{members.length}</p><p className="mt-1 text-xs leading-5 text-[#73798f]">Available to your workspace directory.</p></article>
      <article className="rounded-[1.2rem] border border-[#171b39]/9 bg-white p-5 shadow-[0_14px_38px_rgba(26,30,59,.05)]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f1ece0] text-[#8a6c45]"><Crown size={19} /></span><p className="mt-5 font-sans text-[0.62rem] font-extrabold uppercase tracking-[.12em] text-[#7a7f93]">Leadership</p><p className="mt-1 text-3xl font-semibold text-[#2b3053]">{leadershipCount}</p><p className="mt-1 text-xs leading-5 text-[#73798f]">Can manage registered access.</p></article>
      <article className="rounded-[1.2rem] bg-[#22294e] p-5 text-white shadow-[0_18px_45px_rgba(26,30,59,.15)]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/8 text-[#dfcda9]"><ShieldCheck size={19} /></span><p className="mt-5 font-sans text-[0.62rem] font-extrabold uppercase tracking-[.12em] text-[#d8cda9]">Access principle</p><p className="mt-1 text-lg font-semibold">Leadership controls membership.</p><p className="mt-1 text-xs leading-5 text-[#d5d4df]">All registered users can view the directory; enrollment and removal remain leader-only.</p></article>
    </section>

    <section className="mt-5 overflow-hidden rounded-[1.35rem] border border-[#171b39]/9 bg-white shadow-[0_18px_45px_rgba(26,30,59,.06)]">
      <div className="flex flex-col gap-3 border-b border-[#171b39]/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-sans text-[0.62rem] font-extrabold uppercase tracking-[.13em] text-[#8a6c45]">Team members</p><h2 className="mt-1 text-2xl text-[#2d3255]">Registered workspace directory</h2><p className="mt-1 text-xs leading-5 text-[#73798f]">Role, email, and saved phone details come directly from each registered Simply Saturn account.</p></div><span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#edf4eb] px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-[.08em] text-[#557450]"><ShieldCheck size={12} />Access active</span></div>
      {directoryQuery.isLoading ? <p className="px-5 py-12 text-center text-sm font-bold text-[#74798d]">Loading your team directory…</p> : null}
      {!directoryQuery.isLoading && members.length === 0 ? <div className="px-5 py-14 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#eee9de] text-[#5d507a]"><UsersRound size={22} /></span><h3 className="mt-4 text-2xl text-[#303657]">Start with the people already here.</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#74798d]">The workspace owner is added automatically. Leaders can enroll colleagues after they have signed in to Simply Saturn.</p></div> : null}
      {members.length > 0 ? <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left"><thead className="bg-[#fbfaf6] text-[0.62rem] font-extrabold uppercase tracking-[.12em] text-[#777b8f]"><tr><th className="px-5 py-3.5">Member</th><th className="px-5 py-3.5">Role</th><th className="px-5 py-3.5">Contact details</th><th className="px-5 py-3.5">Access</th><th className="px-5 py-3.5 text-right">Management</th></tr></thead><tbody className="divide-y divide-[#171b39]/8">{members.map((member) => <tr key={member.userId} className="transition-colors hover:bg-[#fcfbf8]"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e8ebf3] text-xs font-extrabold text-[#445575]">{initials(member.displayName)}</span><div><strong className="block text-sm text-[#303657]">{member.displayName}</strong>{member.isOwner ? <span className="mt-0.5 inline-flex items-center gap-1 text-[0.65rem] font-bold text-[#8a6c45]"><Crown size={11} />Workspace owner</span> : null}</div></div></td><td className="px-5 py-4"><span className={member.role === "admin" ? "rounded-full bg-[#f4ecdc] px-2.5 py-1 text-xs font-extrabold text-[#896a3d]" : "rounded-full bg-[#e8edf7] px-2.5 py-1 text-xs font-extrabold text-[#456084]"}>{roleLabel(member.role)}</span></td><td className="px-5 py-4"><p className="flex items-center gap-1.5 text-xs text-[#61677d]"><Mail size={12} className="text-[#8a6c45]" />{member.email}</p><p className="mt-1 text-xs text-[#61677d]" aria-label={`Phone for ${member.displayName}: ${member.phone || "not saved"}`}>{member.phone || "Phone not saved"}</p></td><td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf4eb] px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-[.08em] text-[#557450]"><ShieldCheck size={12} />Active</span></td><td className="px-5 py-4 text-right">{canManageTeam && !member.isOwner ? <button type="button" onClick={() => setMemberToRemove({ userId: member.userId, displayName: member.displayName })} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-[#8a5252] transition hover:bg-[#fcf0ee]"><UserMinus size={14} />Remove</button> : <span className="text-xs text-[#9a9dab]">{member.isOwner ? "Owner retained" : "Leader only"}</span>}</td></tr>)}</tbody></table></div> : null}
    </section>

    <section className="mt-5 rounded-[1.2rem] border border-[#171b39]/9 bg-white p-5 shadow-[0_14px_38px_rgba(26,30,59,.05)]"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-sans text-[0.62rem] font-extrabold uppercase tracking-[.13em] text-[#8a6c45]">Your team profile</p><h2 className="mt-1 text-xl text-[#303657]">Keep your directory phone current.</h2><p className="mt-1 max-w-xl text-xs leading-5 text-[#74798d]">This phone number appears only to members of your registered workspace directory.</p></div><form onSubmit={saveMyPhone} className="flex w-full max-w-md gap-2"><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="(555) 555-5555" aria-label="Your team directory phone" /><button type="submit" disabled={phoneMutation.isPending} className="ss-button-secondary shrink-0 disabled:cursor-not-allowed disabled:opacity-50">{phoneMutation.isPending ? "Saving…" : "Save phone"}</button></form></div></section>

    <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}><DialogContent className="border-[#171b39]/10 bg-[#fffdf9] text-[#303657] shadow-[0_24px_80px_rgba(22,26,53,.2)] sm:max-w-lg"><DialogHeader><p className="font-sans text-[0.65rem] font-extrabold uppercase tracking-[.14em] text-[#8a6c45]">Team enrollment</p><DialogTitle className="font-serif text-3xl text-[#252c53]">Add a registered teammate.</DialogTitle><DialogDescription className="leading-6 text-[#697087]">Use the email on a colleague’s existing Simply Saturn account. Invitation delivery remains a separate setup item.</DialogDescription></DialogHeader><form className="mt-3 space-y-4" onSubmit={enrollMember}><label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Registered teammate email</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="teammate@company.com" /></label><DialogFooter><button type="button" onClick={() => setEnrollOpen(false)} className="ss-button-secondary justify-center">Cancel</button><button type="submit" disabled={enrollMutation.isPending} className="ss-button-primary justify-center disabled:cursor-not-allowed disabled:opacity-50">{enrollMutation.isPending ? "Enrolling…" : "Enroll teammate"}<UserPlus size={16} /></button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={Boolean(memberToRemove)} onOpenChange={(open) => { if (!open) setMemberToRemove(null); }}><DialogContent className="border-[#171b39]/10 bg-[#fffdf9] text-[#303657] shadow-[0_24px_80px_rgba(22,26,53,.2)] sm:max-w-md"><DialogHeader><p className="font-sans text-[0.65rem] font-extrabold uppercase tracking-[.14em] text-[#8a6c45]">Remove member</p><DialogTitle className="font-serif text-3xl text-[#252c53]">Remove {memberToRemove?.displayName}?</DialogTitle><DialogDescription className="leading-6 text-[#697087]">This removes the person from this workspace directory and future team participant suggestions. It does not delete their Simply Saturn account.</DialogDescription></DialogHeader><DialogFooter><button type="button" onClick={() => setMemberToRemove(null)} className="ss-button-secondary justify-center">Keep member</button><button type="button" disabled={removeMutation.isPending || !memberToRemove} onClick={() => memberToRemove && removeMutation.mutate({ memberUserId: memberToRemove.userId })} className="ss-button-primary justify-center disabled:cursor-not-allowed disabled:opacity-50">{removeMutation.isPending ? "Removing…" : "Remove from team"}<X size={16} /></button></DialogFooter></DialogContent></Dialog>
  </DashboardLayout>;
}
