import { AuthLayout } from "@/components/auth/AuthLayout";
import { Seo } from "@/components/Seo";
import { CheckCircle2, KeyRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "wouter";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <>
      <Seo title="Reset your password" description="Request a password recovery link for your Simply Saturn workspace." />
      <AuthLayout eyebrow="Password recovery" title="Regain workspace access." description="Enter the work email connected to your organization. The production experience will use your approved identity and recovery service.">
        {sent ? <div className="rounded-[1.35rem] border border-[#171b39]/9 bg-white/80 p-7 text-center shadow-[0_25px_70px_rgba(26,30,59,.08)]"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#edf3e8] text-[#557852]"><CheckCircle2 size={28} /></span><h3 className="mt-6 text-3xl text-[#202547]">Recovery request recorded.</h3><p className="mt-4 text-sm leading-6 text-[#6d7188]">This foundation confirms the interaction locally. Connect password reset delivery to your approved identity provider before production use.</p><Link href="/login" className="ss-button-primary mt-7">Return to sign in</Link></div> : <form onSubmit={requestReset} className="rounded-[1.35rem] border border-[#171b39]/9 bg-white/80 p-6 shadow-[0_25px_70px_rgba(26,30,59,.08)] sm:p-7"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#ede9de] text-[#5c4e7c]"><KeyRound size={20} /></span><label className="mt-6 grid gap-2 text-sm font-extrabold text-[#3d4363]">Work email<input className="ss-input" type="email" required placeholder="name@organization.com" /></label><button type="submit" className="ss-button-primary mt-7 w-full">Request reset link</button><p className="mt-5 text-center text-sm text-[#6d7289]">Remembered your details? <Link href="/login" className="font-extrabold text-[#50416f]">Return to sign in</Link></p></form>}
      </AuthLayout>
    </>
  );
}
