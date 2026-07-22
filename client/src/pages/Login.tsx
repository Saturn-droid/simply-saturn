import { AuthLayout } from "@/components/auth/AuthLayout";
import { Seo } from "@/components/Seo";
import { startLogin } from "@/const";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  function continueToWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocation("/app");
  }

  return (
    <>
      <Seo title="Sign in" description="Access your Simply Saturn real estate operations workspace." />
      <AuthLayout eyebrow="Workspace access" title="Welcome back." description="Sign in to continue the work, relationships, and service commitments your organization has in motion.">
        <form onSubmit={continueToWorkspace} className="rounded-[1.35rem] border border-[#171b39]/9 bg-white/80 p-6 shadow-[0_25px_70px_rgba(26,30,59,.08)] sm:p-7">
          <label className="grid gap-2 text-sm font-extrabold text-[#3d4363]">Work email<input className="ss-input" name="email" type="email" autoComplete="email" required placeholder="name@organization.com" /></label>
          <label className="mt-5 grid gap-2 text-sm font-extrabold text-[#3d4363]">Password<span className="relative"><input className="ss-input pr-11" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#777c91]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
          <div className="mt-3 flex justify-end"><Link href="/forgot-password" className="text-xs font-bold text-[#5a4c7b] hover:text-[#24294d]">Forgot password?</Link></div>
          <button type="submit" className="ss-button-primary mt-6 w-full">Sign in <ArrowRight size={16} /></button>
          <div className="my-6 flex items-center gap-3 text-[0.65rem] font-bold uppercase tracking-[.12em] text-[#9a9daf]"><span className="h-px flex-1 bg-[#171b39]/9" />or<span className="h-px flex-1 bg-[#171b39]/9" /></div>
          <button type="button" onClick={() => startLogin()} className="ss-button-secondary w-full"><LockKeyhole size={15} />Continue with secure workspace</button>
          <p className="mt-5 flex gap-2 text-xs leading-5 text-[#73788e]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#89714c]" />Your workspace is designed around organization context and role-based access. Use your approved organization sign-in route if one has been configured.</p>
        </form>
        <div className="mt-6 grid gap-2 text-center text-sm text-[#687087]"><p>New to Simply Saturn? <Link href="/signup" className="font-extrabold text-[#50416f] hover:text-[#20254a]">Create an organization</Link></p><p>Joining an existing team? <Link href="/invite" className="font-extrabold text-[#50416f] hover:text-[#20254a]">Accept an invite</Link></p></div>
      </AuthLayout>
    </>
  );
}
