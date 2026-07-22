import { OrbitBackdrop } from "@/components/OrbitBackdrop";
import { Seo } from "@/components/Seo";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ArrowRight, Eye, HeartHandshake, Layers3, ShieldCheck, Sparkles, Waypoints } from "lucide-react";
import { Link } from "wouter";

const principles = [
  { icon: Eye, title: "Clarity before volume", body: "A system should make the work easier to see—not generate another stream of opaque activity." },
  { icon: HeartHandshake, title: "Service is a team sport", body: "Great client experiences are created across roles. The platform should preserve continuity when work changes hands." },
  { icon: Sparkles, title: "Automation with judgment", body: "Routine actions deserve leverage. Consequential decisions deserve the right human review." },
  { icon: Layers3, title: "Configuration without fragmentation", body: "Organizations need flexibility, but not at the cost of a shared operating model." },
  { icon: ShieldCheck, title: "Access with intent", body: "People should receive relevant context and responsibilities, not a generic surface full of irrelevant controls." },
  { icon: Waypoints, title: "Designed to evolve", body: "A modular foundation leaves room for services, integrations, and ways of working that have yet to emerge." },
];

export default function About() {
  return (
    <MarketingLayout>
      <Seo title="Our vision" description="Learn why Simply Saturn is being built as a real estate operating platform for clarity, shared service, configurable workflow, and role-aware operations." />
      <section className="relative isolate overflow-hidden bg-[#22294e] py-20 text-white sm:py-28"><OrbitBackdrop tone="dark" /><div className="container relative max-w-5xl"><div className="ss-eyebrow border-white/15 bg-white/6 text-[#dfcda9]"><span className="ss-kicker-dot" />The Simply Saturn vision</div><h1 className="mt-6 max-w-4xl text-5xl leading-[.98] sm:text-6xl lg:text-7xl">Real estate operations should feel less fragmented—and more considered.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[#c9c8d6]">Simply Saturn is being shaped for organizations that believe client service, business workflow, and team coordination are part of the same operating system.</p></div></section>
      <section className="ss-section bg-white"><div className="container grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div><div className="ss-eyebrow"><span className="ss-kicker-dot" />Why this matters</div><h2 className="mt-5 text-4xl leading-[1.04] text-[#171b39] sm:text-5xl">A CRM should understand the work around the relationship.</h2></div><div className="max-w-2xl space-y-5 text-base leading-8 text-[#626780]"><p>Real estate work often spans multiple roles, systems, timelines, and client expectations. When its context is separated, teams compensate through manual updates, repeated questions, and informal workarounds.</p><p>The Simply Saturn direction is to make the operating record richer and more usable: connect the contact to the deal, the deal to the workflow, the workflow to the right people, and the client-facing experience to the shared service behind it.</p><p>That is what we mean by a real estate operations platform—not more software for its own sake, but a more coherent way for an organization to run.</p></div></div></section>
      <section className="relative overflow-hidden bg-[#f5f2e9] py-20 sm:py-28"><div aria-hidden="true" className="ss-orbital-ring -left-24 bottom-0 h-[28rem] w-[56rem] rotate-[20deg] border-[#50416f]/14" /><div className="container relative"><div className="max-w-2xl"><p className="font-sans text-xs font-extrabold uppercase tracking-[.14em] text-[#8a6c45]">Operating principles</p><h2 className="mt-4 text-4xl leading-[1.04] text-[#171b39] sm:text-5xl">A durable platform is built on durable beliefs.</h2></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{principles.map((principle) => { const Icon = principle.icon; return <article key={principle.title} className="ss-surface ss-lift rounded-[1.25rem] p-6"><Icon size={21} className="text-[#5d4d79]" /><h3 className="mt-8 text-2xl text-[#202547]">{principle.title}</h3><p className="mt-3 text-sm leading-6 text-[#676c83]">{principle.body}</p></article>; })}</div></div></section>
      <section className="bg-white py-16 sm:py-20"><div className="container"><div className="relative overflow-hidden rounded-[1.6rem] bg-[#e9e5db] p-8 sm:p-12"><div aria-hidden="true" className="absolute -right-16 -top-28 h-[22rem] w-[47rem] rotate-[-17deg] rounded-[100%] border border-[#8c7957]/30" /><div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="font-sans text-xs font-extrabold uppercase tracking-[.14em] text-[#7d623f]">The next conversation</p><h2 className="mt-4 max-w-2xl text-4xl leading-[1.04] text-[#171b39]">Bring your organization’s operating reality into the room.</h2></div><Link href="/contact" className="ss-button-primary">Request Demo <ArrowRight size={16} /></Link></div></div></div></section>
    </MarketingLayout>
  );
}
