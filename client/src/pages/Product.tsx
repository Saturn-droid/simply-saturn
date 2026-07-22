import { OrbitBackdrop } from "@/components/OrbitBackdrop";
import { Seo } from "@/components/Seo";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ArrowRight, Boxes, CheckCircle2, CircleDot, Database, Layers3, Network, Route, UsersRound, Workflow } from "lucide-react";
import { Link } from "wouter";

const layers = [
  {
    number: "01",
    label: "Relationship layer",
    title: "The real-world context lives together.",
    body: "Contacts, ownership, properties, households, referral relationships, and team responsibilities can be represented as connected operating data—not isolated records.",
    icon: Network,
  },
  {
    number: "02",
    label: "Workflow layer",
    title: "Work moves in visible, configurable stages.",
    body: "Deals, pipelines, stages, checklists, tasks, documents, and approvals create an accountable path from first signal to client-ready finish.",
    icon: Workflow,
  },
  {
    number: "03",
    label: "Service layer",
    title: "Every role can contribute without losing continuity.",
    body: "Assignment groups and role-aware surfaces keep agents, operations, support staff, and leadership aligned around the client and the next right action.",
    icon: UsersRound,
  },
];

const operatingModel = [
  ["Contacts", "Relationships, properties, and client context form the durable base."],
  ["Deals", "The business motion is governed through pipeline, stage, owner, and checkpoints."],
  ["Teams", "Assignment groups make handoffs intentional across an organization."],
  ["Portals", "Client-facing collaboration can remain connected to the operational record."],
  ["Automations", "Triggers and actions reduce routine work while preserving human approval points."],
];

export default function Product() {
  return (
    <MarketingLayout>
      <Seo title="A connected real estate operating model" description="See how Simply Saturn connects relationship data, workflows, teams, portals, and automation into a shared real estate operating system." />

      <section className="relative isolate overflow-hidden bg-[#f7f5ee] py-20 sm:py-28">
        <OrbitBackdrop />
        <div className="container relative max-w-5xl">
          <div className="ss-eyebrow"><span className="ss-kicker-dot" />Product overview</div>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[0.98] text-[#171b39] sm:text-6xl lg:text-7xl">A unified operating model for the relationships behind real estate.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5b6078]">Simply Saturn is built to keep the moving parts of a real estate business connected: the people, opportunities, services, decisions, documents, and shared commitments.</p>
          <div className="mt-10 flex flex-wrap gap-3"><Link href="/contact" className="ss-button-primary">Request Demo <ArrowRight size={16} /></Link><Link href="/features" className="ss-button-secondary">Explore capabilities</Link></div>
        </div>
      </section>

      <section className="ss-section bg-white">
        <div className="container">
          <div className="grid gap-8 border-b border-[#171b39]/9 pb-12 lg:grid-cols-[.74fr_1.26fr] lg:items-end">
            <div><p className="font-sans text-xs font-extrabold uppercase tracking-[0.15em] text-[#8a6c45]">The platform story</p><h2 className="mt-4 text-4xl leading-[1.04] text-[#171b39] sm:text-5xl">Not a set of features. A shared operational language.</h2></div>
            <p className="max-w-xl text-base leading-7 text-[#636880] lg:justify-self-end">Instead of asking teams to reconcile separate systems after the fact, Simply Saturn creates a common home for the context, work, and role-specific experiences that a real estate organization depends on.</p>
          </div>
          <div className="divide-y divide-[#171b39]/9">
            {layers.map((layer) => {
              const Icon = layer.icon;
              return <article key={layer.number} className="grid gap-6 py-10 md:grid-cols-[.18fr_.57fr_.9fr] md:items-start"><div className="font-sans text-xs font-extrabold tracking-[0.16em] text-[#8a6c45]">{layer.number}</div><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eeeadf] text-[#4d416d]"><Icon size={19} /></span><p className="font-sans text-[0.69rem] font-extrabold uppercase tracking-[0.13em] text-[#555b75]">{layer.label}</p></div><div><h3 className="text-3xl leading-tight text-[#1d2247]">{layer.title}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-[#686d83]">{layer.body}</p></div></article>;
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#22294e] py-20 text-white sm:py-28">
        <div aria-hidden="true" className="absolute -left-20 top-16 h-[26rem] w-[52rem] rotate-[21deg] rounded-[100%] border border-[#d1a467]/36" />
        <div className="container relative grid gap-12 lg:grid-cols-[.83fr_1.17fr] lg:items-center">
          <div><div className="ss-eyebrow border-white/15 bg-white/5 text-[#dfcda9]"><span className="ss-kicker-dot" />Built around shared services</div><h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">A property experience should not come apart at the seams.</h2><p className="mt-5 max-w-lg text-base leading-7 text-[#c6c6d4]">The client portal is designed as an extension of the operating workspace: a coordinated place for property collaboration that can evolve alongside connected MLS portals and specialist systems where appropriate.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-[1.25rem] border border-white/13 bg-white/6 p-5 sm:col-span-2"><div className="flex items-center justify-between"><p className="font-sans text-[0.64rem] font-extrabold uppercase tracking-[0.14em] text-[#d1a467]">The operating record</p><Database size={18} className="text-[#dfcda9]" /></div><p className="mt-8 text-2xl leading-tight">A property, its relationships, the opportunity, and the delivery work all have a shared center of gravity.</p></article>
            <article className="rounded-[1.25rem] border border-white/13 bg-white/6 p-5"><Boxes size={18} className="text-[#dfcda9]" /><h3 className="mt-7 text-xl">Modular by design</h3><p className="mt-2 text-sm leading-6 text-[#c6c6d4]">Add capabilities without breaking the data model that keeps them coherent.</p></article>
            <article className="rounded-[1.25rem] border border-white/13 bg-white/6 p-5"><Route size={18} className="text-[#dfcda9]" /><h3 className="mt-7 text-xl">Connected paths</h3><p className="mt-2 text-sm leading-6 text-[#c6c6d4]">Move between client work, team service, and leadership visibility without recreating context.</p></article>
          </div>
        </div>
      </section>

      <section className="ss-section bg-[#fbfaf5]">
        <div className="container grid gap-10 lg:grid-cols-[.74fr_1.26fr] lg:items-start"><div><div className="ss-eyebrow"><span className="ss-kicker-dot" />Core concepts</div><h2 className="mt-5 text-4xl leading-[1.04] text-[#171b39] sm:text-5xl">A foundation that fits the work.</h2><p className="mt-5 max-w-md text-sm leading-6 text-[#666b82]">These concepts are designed as durable building blocks for future organization-specific configuration and extensions.</p></div><div className="rounded-[1.4rem] border border-[#171b39]/9 bg-white p-2 shadow-[0_25px_70px_rgba(26,30,59,.07)]">{operatingModel.map(([term, explanation], index) => <div key={term} className="flex gap-4 rounded-xl p-4 sm:items-center"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eee9dd] text-xs font-extrabold text-[#5b4d78]">0{index + 1}</span><div><h3 className="font-sans text-sm font-extrabold text-[#222747]">{term}</h3><p className="mt-1 text-sm leading-6 text-[#6c7186]">{explanation}</p></div><CheckCircle2 size={16} className="ml-auto shrink-0 text-[#9e8865]" /></div>)}</div></div>
      </section>

      <section className="bg-white py-16 sm:py-20"><div className="container"><div className="flex flex-col justify-between gap-7 rounded-[1.55rem] border border-[#171b39]/9 bg-[#f4f1e8] p-8 sm:p-11 lg:flex-row lg:items-end"><div><p className="font-sans text-xs font-extrabold uppercase tracking-[0.14em] text-[#8a6c45]">See the fit</p><h2 className="mt-3 text-3xl text-[#171b39] sm:text-4xl">Explore the operating layers in detail.</h2></div><Link href="/features" className="ss-button-primary">View features <ArrowRight size={16} /></Link></div></div></section>
    </MarketingLayout>
  );
}
