import { AuthLayout } from "@/components/auth/AuthLayout";
import { Seo } from "@/components/Seo";
import { ArrowRight, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent } from "react";
import { Link, useLocation } from "wouter";

export default function Invite() {
  const [, setLocation] = useLocation();
  function acceptInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocation("/app");
  }

  return (
    <>
      <Seo title="Accept an invite" description="Join an existing Simply Saturn organization and access your team workspace." />
      <AuthLayout eyebrow="Invitation access" title="Join your team’s workspace." description="Use the email address that received your invitation. Your team will determine which workspace access and responsibilities are appropriate for your role.">
        <form onSubmit={acceptInvite} className="rounded-[1.35rem] border border-[#171b39]/9 bg-white/80 p-6 shadow-[0_25px_70px_rgba(26,30,59,.08)] sm:p-7"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#ede9de] text-[#5c4e7c]"><MailCheck size={21} /></span><label className="mt-6 grid gap-2 text-sm font-extrabold text-[#3d4363]">Invitation email<input className="ss-input" type="email" required placeholder="name@organization.com" /></label><label className="mt-5 grid gap-2 text-sm font-extrabold text-[#3d4363]">Invitation code <span className="font-normal text-[#7b8093]">(if supplied)</span><input className="ss-input" placeholder="Enter invitation code" /></label><button type="submit" className="ss-button-primary mt-7 w-full">Accept invite <ArrowRight size={16} /></button><p className="mt-5 flex gap-2 text-xs leading-5 text-[#74798e]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#8b724b]" />This interaction opens the workspace foundation. Connect invitation validation to your authentication service before production use.</p></form><p className="mt-6 text-center text-sm text-[#687087]">Need another way in? <Link href="/login" className="font-extrabold text-[#50416f]">Sign in</Link> or <Link href="/signup" className="font-extrabold text-[#50416f]">create an organization</Link>.</p>
      </AuthLayout>
    </>
  );
}
