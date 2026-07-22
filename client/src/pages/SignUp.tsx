import { AuthLayout } from "@/components/auth/AuthLayout";
import { Seo } from "@/components/Seo";
import { ArrowLeft, ArrowRight, CheckCircle2, UsersRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<1 | 2>(1);
  const [ready, setReady] = useState(false);

  function handleOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep(2);
  }

  function completeWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReady(true);
  }

  return (
    <>
      <Seo title="Create your organization" description="Start a Simply Saturn workspace for your brokerage, real estate team, or operating group." />
      <AuthLayout eyebrow="Organization setup" title="Put your operation into a better orbit." description="Create the first layer of your Simply Saturn workspace, then shape the team and workflow structure around it.">
        <div className="mb-5 flex items-center gap-2"><span className={`h-2.5 rounded-full transition-all ${step === 1 ? "w-9 bg-[#51416f]" : "w-2.5 bg-[#51416f]"}`} /><span className={`h-2.5 rounded-full transition-all ${step === 2 ? "w-9 bg-[#51416f]" : "w-2.5 bg-[#ddd8cd]"}`} /><span className="ml-2 text-xs font-bold text-[#757a8f]">Step {step} of 2</span></div>
        {ready ? <div className="rounded-[1.35rem] border border-[#171b39]/9 bg-white/80 p-7 text-center shadow-[0_25px_70px_rgba(26,30,59,.08)]"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#edf3e8] text-[#557852]"><CheckCircle2 size={29} /></span><h3 className="mt-6 text-3xl text-[#202547]">Your workspace foundation is ready.</h3><p className="mt-4 text-sm leading-6 text-[#6b7085]">This product foundation has completed the setup interaction locally. Connect your approved onboarding and authentication service before production use.</p><button type="button" onClick={() => setLocation("/app")} className="ss-button-primary mt-7">Open the workspace <ArrowRight size={16} /></button></div> : step === 1 ? <form onSubmit={handleOrganization} className="rounded-[1.35rem] border border-[#171b39]/9 bg-white/80 p-6 shadow-[0_25px_70px_rgba(26,30,59,.08)] sm:p-7"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eeeadf] text-[#554775]"><UsersRound size={20} /></span><div><h3 className="font-sans text-sm font-extrabold text-[#272d50]">Your organization</h3><p className="mt-0.5 text-xs text-[#74798f]">The shared home for your team and client operations.</p></div></div><div className="mt-6 grid gap-5"><label className="grid gap-2 text-sm font-extrabold text-[#3d4363]">Organization name<input className="ss-input" name="organizationName" required placeholder="Brokerage, team, or operating group" /></label><label className="grid gap-2 text-sm font-extrabold text-[#3d4363]">Your work email<input className="ss-input" name="workEmail" type="email" required placeholder="name@organization.com" /></label><label className="grid gap-2 text-sm font-extrabold text-[#3d4363]">Organization type<select className="ss-input" name="organizationType" defaultValue="" required><option value="" disabled>Select the closest fit</option><option value="brokerage">Brokerage</option><option value="team">Real estate team</option><option value="solo">Independent agent</option><option value="operations">Operations / support group</option></select></label></div><button type="submit" className="ss-button-primary mt-7 w-full">Continue <ArrowRight size={16} /></button><p className="mt-4 text-center text-xs text-[#7b8094]">Already have access? <Link href="/login" className="font-extrabold text-[#564774]">Sign in</Link></p></form> : <form onSubmit={completeWorkspace} className="rounded-[1.35rem] border border-[#171b39]/9 bg-white/80 p-6 shadow-[0_25px_70px_rgba(26,30,59,.08)] sm:p-7"><h3 className="text-2xl text-[#222747]">Shape the first workspace view.</h3><p className="mt-2 text-sm leading-6 text-[#6e7389]">These choices are a starting point. Your organization can refine teams, roles, pipelines, and access as the operating model develops.</p><div className="mt-6 grid gap-5"><label className="grid gap-2 text-sm font-extrabold text-[#3d4363]">Your primary role<select className="ss-input" name="role" defaultValue="" required><option value="" disabled>Select your role</option><option value="broker-owner">Broker / owner</option><option value="team-leader">Team leader</option><option value="agent">Agent</option><option value="operations">Operations / support</option></select></label><label className="grid gap-2 text-sm font-extrabold text-[#3d4363]">First pipeline to establish<select className="ss-input" name="pipeline" defaultValue="" required><option value="" disabled>Choose a starting workflow</option><option value="buyer">Buyer journey</option><option value="listing">Listing journey</option><option value="referral">Referral and relationships</option><option value="transaction">Transaction coordination</option></select></label></div><div className="mt-7 flex gap-3"><button type="button" onClick={() => setStep(1)} className="ss-button-secondary"><ArrowLeft size={16} />Back</button><button type="submit" className="ss-button-primary flex-1">Create workspace <ArrowRight size={16} /></button></div></form>}
      </AuthLayout>
    </>
  );
}
