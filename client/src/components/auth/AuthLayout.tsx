import { BrandMark } from "@/components/BrandMark";
import { ArrowLeft, CircleDot } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthLayout({ eyebrow, title, description, children }: AuthLayoutProps) {
  return (
    <div className="ss-auth-shell min-h-screen lg:grid lg:grid-cols-[.95fr_1.05fr]">
      <aside className="ss-auth-promise relative hidden overflow-hidden px-10 py-10 text-white lg:flex lg:min-h-screen lg:flex-col">
        <div aria-hidden="true" className="absolute -right-40 -top-24 h-[35rem] w-[60rem] rotate-[-19deg] rounded-[100%] border border-[#d1a467]/38" />
        <div aria-hidden="true" className="absolute -right-28 -top-5 h-[24rem] w-[45rem] rotate-[-19deg] rounded-[100%] border border-white/12" />
        <div aria-hidden="true" className="absolute -bottom-24 -left-36 h-[34rem] w-[52rem] rotate-[25deg] rounded-[100%] border border-white/10" />
        <Link href="/" aria-label="Return to Simply Saturn home" className="relative z-10">
          <BrandMark inverse />
        </Link>
        <div className="relative z-10 my-auto max-w-md pb-12 pt-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/6 px-3 py-1.5 font-sans text-[0.66rem] font-extrabold uppercase tracking-[.14em] text-[#c7d5ee]"><CircleDot size={12} />The CRM built for real estate teams</div>
          <h1 className="mt-6 text-5xl leading-[1.02]">The context behind every relationship.</h1>
          <p className="mt-6 text-base leading-7 text-[#c9d2e5]">Return to the shared view of contacts, commitments, deals, and service that keeps your team in motion.</p>
        </div>
        <p className="relative z-10 text-xs leading-5 text-[#aebbd3]">Secure access is designed around organization context, team structure, and role-based responsibilities.</p>
      </aside>

      <main className="ss-auth-main relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-14">
        <div className="ss-auth-glow absolute right-0 top-0 h-72 w-72 rounded-full blur-3xl" />
        <div className="ss-auth-content relative w-full max-w-lg">
          <div className="flex items-center justify-between lg:hidden">
            <Link href="/" aria-label="Return to Simply Saturn home"><BrandMark inverse /></Link>
            <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-[#c8d3e6] hover:text-white"><ArrowLeft size={14} /> Home</Link>
          </div>
          <div className="mt-14 lg:mt-0">
            <p className="font-sans text-xs font-extrabold uppercase tracking-[.15em] text-[#95b8d3]">{eyebrow}</p>
            <h2 className="mt-3 text-4xl leading-[1.05] text-white sm:text-5xl">{title}</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#c2cee0]">{description}</p>
          </div>
          <div className="ss-auth-form-slot mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
