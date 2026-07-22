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
    <div className="min-h-screen bg-[#f8f7f1] lg:grid lg:grid-cols-[.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-[#20274b] px-10 py-10 text-white lg:flex lg:min-h-screen lg:flex-col">
        <div aria-hidden="true" className="absolute -right-40 -top-24 h-[35rem] w-[60rem] rotate-[-19deg] rounded-[100%] border border-[#d1a467]/38" />
        <div aria-hidden="true" className="absolute -right-28 -top-5 h-[24rem] w-[45rem] rotate-[-19deg] rounded-[100%] border border-white/12" />
        <div aria-hidden="true" className="absolute -bottom-24 -left-36 h-[34rem] w-[52rem] rotate-[25deg] rounded-[100%] border border-white/10" />
        <Link href="/" aria-label="Return to Simply Saturn home" className="relative z-10">
          <BrandMark inverse />
        </Link>
        <div className="relative z-10 my-auto max-w-md pb-12 pt-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/6 px-3 py-1.5 font-sans text-[0.66rem] font-extrabold uppercase tracking-[.14em] text-[#dfcda9]"><CircleDot size={12} />A more connected workspace</div>
          <h1 className="mt-6 text-5xl leading-[1.02]">Operations feel lighter when the context holds together.</h1>
          <p className="mt-6 text-base leading-7 text-[#c9c8d5]">Simply Saturn is built for the people who need to turn real estate relationships into consistent, accountable service.</p>
        </div>
        <p className="relative z-10 text-xs leading-5 text-[#aeadc0]">Secure access and workspace setup are designed to respect organization context, team structure, and role-based responsibilities.</p>
      </aside>

      <main className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-14">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#d1a467]/10 blur-3xl" />
        <div className="relative w-full max-w-lg">
          <div className="flex items-center justify-between lg:hidden">
            <Link href="/" aria-label="Return to Simply Saturn home"><BrandMark /></Link>
            <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-[#565b77]"><ArrowLeft size={14} /> Home</Link>
          </div>
          <div className="mt-14 lg:mt-0">
            <p className="font-sans text-xs font-extrabold uppercase tracking-[.15em] text-[#8a6c45]">{eyebrow}</p>
            <h2 className="mt-3 text-4xl leading-[1.05] text-[#1b2044] sm:text-5xl">{title}</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#686d83]">{description}</p>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
