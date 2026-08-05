import { AuthLayout } from "@/components/auth/AuthLayout";
import { Seo } from "@/components/Seo";
import { startLogin } from "@/const";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import { Link, useSearch } from "wouter";

export default function Login() {
  const search = useSearch();
  const [launchError, setLaunchError] = useState("");
  const credentialError = new URLSearchParams(search).get("error") === "invalid_credentials"
    ? "We couldn't verify your workspace credentials. Check your organization access and try again."
    : launchError;

  function continueToWorkspace() {
    try {
      setLaunchError("");
      startLogin();
    } catch {
      setLaunchError("We couldn't start secure sign-in. Refresh the page and try again.");
    }
  }

  return (
    <>
      <Seo title="Sign in" description="Access your Simply Saturn real estate operations workspace." />
      <AuthLayout eyebrow="Workspace access" title="Welcome back." description="Sign in to continue the work, relationships, and service commitments your organization has in motion.">
        <section className="rounded-[1.35rem] border border-[#171b39]/9 bg-white/80 p-5 shadow-[0_25px_70px_rgba(26,30,59,.08)] sm:p-7">
          {credentialError ? <p role="alert" className="mb-4 rounded-xl border border-[#b45a55]/25 bg-[#fff0ee] px-3 py-2.5 text-sm font-semibold leading-5 text-[#8b3e39]">{credentialError}</p> : null}
          <p className="text-sm font-extrabold text-[#3d4363]">Secure workspace sign-in</p>
          <p className="mt-2 text-sm leading-6 text-[#697087]">Use your approved organization account. Simply Saturn never collects your workspace password on this page.</p>
          <button type="button" onClick={continueToWorkspace} className="ss-button-primary mt-6 w-full">Continue to sign in <ArrowRight size={16} /></button>
          <div className="my-6 flex items-center gap-3 text-[0.65rem] font-bold uppercase tracking-[.12em] text-[#9a9daf]"><span className="h-px flex-1 bg-[#171b39]/9" />secure access<span className="h-px flex-1 bg-[#171b39]/9" /></div>
          <button type="button" onClick={continueToWorkspace} className="ss-button-secondary w-full"><LockKeyhole size={15} />Continue with secure workspace</button>
          <div className="mt-5 flex justify-end"><Link href="/forgot-password" className="text-xs font-bold text-[#5a4c7b] hover:text-[#24294d]">Need account help?</Link></div>
          <p className="mt-5 flex gap-2 text-xs leading-5 text-[#73788e]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#89714c]" />Your workspace is designed around organization context and role-based access. Use your approved organization sign-in route if one has been configured.</p>
        </section>
        <div className="mt-6 grid gap-2 text-center text-sm text-[#687087]"><p>New to Simply Saturn? <Link href="/signup" className="font-extrabold text-[#50416f] hover:text-[#20254a]">Create an organization</Link></p><p>Joining an existing team? <Link href="/invite" className="font-extrabold text-[#50416f] hover:text-[#20254a]">Accept an invite</Link></p></div>
      </AuthLayout>
    </>
  );
}
