import { OrbitBackdrop } from "@/components/OrbitBackdrop";
import { Seo } from "@/components/Seo";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  ContactRound,
  FileCheck2,
  FolderKanban,
  Network,
  PanelTop,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Workflow,
} from "lucide-react";
import { Link } from "wouter";

const capabilities = [
  {
    icon: ContactRound,
    title: "Contact management",
    description: "Preserve context across people, households, ownership, preferences, and every relationship that matters.",
  },
  {
    icon: FolderKanban,
    title: "Deal pipelines",
    description: "Shape distinct deal motions with configurable stages, next steps, accountable owners, and calm visibility.",
  },
  {
    icon: UsersRound,
    title: "Team coordination",
    description: "Route work through assignment groups, shared queues, and role-aware handoffs without losing the thread.",
  },
  {
    icon: PanelTop,
    title: "Client portal",
    description: "Create a more coherent property collaboration experience for clients and the people serving them.",
  },
  {
    icon: Sparkles,
    title: "Automation",
    description: "Automate routine work with clear triggers, review points, and human verification where it counts.",
  },
  {
    icon: FileCheck2,
    title: "Document & compliance",
    description: "Keep critical files, checklists, approvals, and operational requirements connected to the work itself.",
  },
  {
    icon: Network,
    title: "Integration-friendly",
    description: "Use a modular architecture that can fit the systems, portals, and specialist services around your operation.",
  },
];

const workflowCards = [
  { eyebrow: "Shared data", title: "One relationship graph", detail: "People, properties, teams, and opportunities remain connected as work moves forward.", icon: Network },
  { eyebrow: "Configurable work", title: "Pipelines with intent", detail: "Model the stages, checkpoints, and ownership your organization actually uses.", icon: Workflow },
  { eyebrow: "Role-based access", title: "The right view for every role", detail: "Give broker leaders, coordinators, agents, and clients the context they need—without unnecessary noise.", icon: ShieldCheck },
];

const proofPlaceholders = [
  { label: "[Verified customer outcome]", value: "—", description: "Reserved for a documented team result, with customer permission and source notes." },
  { label: "[Verified operational metric]", value: "—", description: "Reserved for a measured workflow or service metric once production data is available." },
  { label: "[Approved customer quote]", value: "—", description: "Reserved for a real testimonial after customer approval. No sample testimonial is presented here." },
];

function MiniDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-[40rem] ss-reveal ss-reveal-delay-2">
      <div className="absolute -right-14 -top-10 h-52 w-52 rounded-full bg-[#d1a467]/18 blur-3xl" />
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/70 bg-[#fcfbf7]/94 p-3 shadow-[0_35px_100px_rgba(20,25,55,0.2)] sm:p-4">
        <div className="flex items-center justify-between rounded-xl border border-[#171b39]/8 bg-white px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#171b39] text-[#d1a467]"><CircleDot size={14} /></span>
            <div>
              <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[#777a90]">Simply Saturn</p>
              <p className="mt-0.5 text-xs font-bold text-[#171b39]">Operations overview</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#85ab86]" />
            <span className="text-[0.68rem] font-bold text-[#5f6576]">In sync</span>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-xl border border-[#171b39]/8 bg-white p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[0.67rem] font-extrabold uppercase tracking-[0.12em] text-[#777a90]">Pipeline focus</p>
              <ChevronRight size={15} className="text-[#777a90]" />
            </div>
            <div className="mt-3 rounded-lg bg-[#f2f0eb] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-full bg-[#dad3eb]" />
                  <div>
                    <p className="text-[0.69rem] font-bold text-[#222747]">Listing launch</p>
                    <p className="mt-0.5 text-[0.58rem] text-[#777a90]">Coordination stage</p>
                  </div>
                </div>
                <span className="rounded-md bg-[#e4f0e2] px-1.5 py-1 text-[0.56rem] font-extrabold text-[#47734d]">ON TRACK</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#ddd9d2]"><div className="h-full w-[68%] rounded-full bg-[#8a7aaa]" /></div>
            </div>
            <div className="mt-2.5 flex items-center justify-between rounded-lg border border-dashed border-[#171b39]/13 px-3 py-2.5">
              <div className="flex items-center gap-2"><BellRing size={13} className="text-[#8a6c45]" /><span className="text-[0.66rem] font-bold text-[#474c66]">Next workflow checkpoint</span></div>
              <span className="text-[0.58rem] font-bold text-[#777a90]">Today</span>
            </div>
          </div>

          <div className="rounded-xl bg-[#22294e] p-3.5 text-white">
            <p className="text-[0.67rem] font-extrabold uppercase tracking-[0.12em] text-[#d9c59f]">Today’s rhythm</p>
            <div className="mt-3 space-y-2.5">
              {["Handoff review", "Client update", "Document checkpoint"].map((item, index) => (
                <div key={item} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/6 px-2.5 py-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[#d1a467]/18 text-[0.58rem] font-extrabold text-[#e5cfaa]">0{index + 1}</span>
                  <span className="text-[0.62rem] font-semibold text-[#f1eff1]">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-white/12 pt-3 text-[0.59rem] leading-4 text-[#c7c5d2]">A single view of the work and the context around it.</div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-7 hidden rounded-xl border border-[#171b39]/8 bg-white px-4 py-3 shadow-xl sm:block ss-float">
        <div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#eef2e8] text-[#527352]"><Check size={15} /></span><div><p className="text-[0.64rem] font-extrabold text-[#222747]">Human verified</p><p className="mt-0.5 text-[0.58rem] text-[#777a90]">Automation waits for approval</p></div></div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <MarketingLayout>
      <Seo
        title="The real estate operations platform"
        description="Simply Saturn unifies contacts, deals, workflows, portals, and team coordination for real estate brokerages, teams, and agents."
      />

      <section className="relative isolate overflow-hidden border-b border-[#171b39]/8 bg-[#f8f7f0]">
        <OrbitBackdrop />
        <div className="absolute inset-0 ss-orbit-grid opacity-70" />
        <div className="container relative grid gap-12 pb-20 pt-16 lg:grid-cols-[.97fr_1.03fr] lg:items-center lg:pb-28 lg:pt-24">
          <div className="max-w-2xl">
            <div className="ss-eyebrow ss-reveal"><span className="ss-kicker-dot" />Real estate, in better orbit</div>
            <h1 className="mt-6 text-[clamp(2.8rem,6vw,5.75rem)] font-medium leading-[0.98] text-[#171b39] ss-reveal ss-reveal-delay-1">
              Your real estate operation, aligned around the work that matters.
            </h1>
            <p className="mt-6 max-w-xl text-[1.04rem] leading-7 text-[#565b76] ss-reveal ss-reveal-delay-2 sm:text-lg">
              Simply Saturn is the operating platform for brokerages, teams, and agents who want contacts, deals, workflows, portals, and collaboration to move as one.
            </p>
            <div className="mt-8 flex flex-col gap-3 ss-reveal ss-reveal-delay-3 sm:flex-row sm:items-center">
              <Link href="/signup" className="ss-button-primary min-h-11">Get Started <ArrowRight size={16} /></Link>
              <Link href="/contact" className="ss-button-secondary min-h-11">Request Demo <ArrowRight size={16} /></Link>
              <Link href="/login" className="inline-flex min-h-11 items-center justify-center px-3 text-sm font-extrabold text-[#3b4164] hover:text-[#171b39]">Sign In</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-[#626780]">
              <span className="inline-flex items-center gap-2"><BadgeCheck size={15} className="text-[#8a6c45]" />Built for brokerages, teams, and agents</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-[#8a6c45]" />Role-aware by design</span>
            </div>
          </div>
          <div className="relative lg:pl-7">
            <div aria-hidden="true" className="absolute -left-1 top-7 h-52 w-52 rounded-full bg-[#8b7ba7]/14 blur-3xl" />
            <MiniDashboard />
          </div>
        </div>
      </section>

      <section className="border-b border-[#171b39]/8 bg-white">
        <div className="container grid gap-7 py-7 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[#171b39]/9">
          {[
            ["One shared workspace", "Keep the operational record connected across people, properties, and work."],
            ["Purposeful automation", "Let routines run, then preserve human review for moments that need judgment."],
            ["Built to adapt", "Configure pipelines, teams, access, and services around how your organization works."],
          ].map(([heading, copy]) => (
            <div key={heading} className="px-0 first:pl-0 sm:px-7 sm:first:pl-0 sm:last:pr-0">
              <h2 className="font-sans text-sm font-extrabold text-[#222747]">{heading}</h2>
              <p className="mt-1.5 text-sm leading-5 text-[#6b7087]">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ss-section relative overflow-hidden">
        <div aria-hidden="true" className="ss-orbital-ring left-[48%] top-10 h-[31rem] w-[58rem] rotate-[20deg] border-[#50416f]/12" />
        <div className="container relative">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <div className="ss-eyebrow"><span className="ss-kicker-dot" />The platform, in orbit</div>
              <h2 className="mt-5 text-4xl leading-[1.02] text-[#171b39] sm:text-5xl">The workspace behind a more considered client experience.</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#5d627a] lg:justify-self-end">Every capability is designed to give the right person the right context, while keeping the underlying operation coherent enough to scale.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <article key={capability.title} className="ss-surface ss-lift group rounded-[1.35rem] p-6" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ece8dd] text-[#4b416c] transition-colors group-hover:bg-[#171b39] group-hover:text-[#d1a467]"><Icon size={20} /></div>
                  <h3 className="mt-6 text-xl text-[#1a1f42]">{capability.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#676c83]">{capability.description}</p>
                </article>
              );
            })}
            <Link href="/features" className="group relative flex min-h-56 flex-col justify-between overflow-hidden rounded-[1.35rem] bg-[#22294e] p-6 text-white ss-lift">
              <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-64 rotate-[-20deg] rounded-[100%] border border-[#d1a467]/40" />
              <BriefcaseBusiness size={22} className="relative text-[#d1a467]" />
              <div className="relative"><p className="font-sans text-xs font-extrabold uppercase tracking-[0.15em] text-[#d1a467]">Explore the platform</p><h3 className="mt-2 text-2xl">See all seven operating layers <ArrowRight className="ml-1 inline transition-transform group-hover:translate-x-1" size={18} /></h3></div>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#22294e] py-20 text-white sm:py-28">
        <OrbitBackdrop tone="dark" />
        <div className="container relative">
          <div className="max-w-2xl">
            <div className="ss-eyebrow border-white/15 bg-white/6 text-[#dfcda9]"><span className="ss-kicker-dot" />How Simply Saturn thinks</div>
            <h2 className="mt-5 text-4xl leading-[1.03] sm:text-5xl">One platform. Shared data. Workflows that fit. Access that respects the role.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c9c8d6]">The goal is not more tabs. It is a clearer operating model—one that helps your people move from an incoming relationship to a finished service experience with fewer blind spots.</p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {workflowCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="rounded-[1.3rem] border border-white/12 bg-white/6 p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between"><span className="font-sans text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[#d1a467]">{card.eyebrow}</span><Icon size={18} className="text-[#f4e8ca]" /></div>
                  <h3 className="mt-9 text-2xl">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#c6c4d3]">{card.detail}</p>
                </article>
              );
            })}
          </div>
          <Link href="/product" className="mt-9 inline-flex items-center gap-2 text-sm font-extrabold text-[#f5e9ce] hover:text-white">Explore the product model <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="ss-section relative overflow-hidden bg-[#f7f5ee]">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
            <div>
              <div className="ss-eyebrow"><span className="ss-kicker-dot" />Designed for real proof</div>
              <h2 className="mt-5 text-4xl leading-[1.04] text-[#171b39] sm:text-5xl">A proof-point framework that stays honest.</h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-[#626780]">This foundation deliberately avoids invented testimonials and unverified performance claims. These locations are structured for future, approved customer stories and measured outcomes.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {proofPlaceholders.map((item) => (
                <article key={item.label} className="ss-surface rounded-[1.25rem] p-5 sm:min-h-64">
                  <p className="font-sans text-[0.62rem] font-extrabold uppercase tracking-[0.13em] text-[#8a6c45]">{item.label}</p>
                  <div className="mt-7 text-5xl font-medium text-[#292e55]">{item.value}</div>
                  <p className="mt-7 text-sm leading-6 text-[#666b82]">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-16 sm:py-20">
        <div className="container">
          <div className="relative overflow-hidden rounded-[1.7rem] bg-[#e9e5da] px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
            <div aria-hidden="true" className="absolute -right-24 -top-44 h-[32rem] w-[52rem] rotate-[-19deg] rounded-[100%] border border-[#8c7957]/30" />
            <div aria-hidden="true" className="absolute -right-14 -top-30 h-[21rem] w-[39rem] rotate-[-19deg] rounded-[100%] border border-[#50416f]/18" />
            <div className="relative grid gap-9 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-2xl"><p className="font-sans text-xs font-extrabold uppercase tracking-[0.15em] text-[#755d3e]">A clearer system begins with a clearer conversation</p><h2 className="mt-4 text-4xl leading-[1.04] text-[#171b39] sm:text-5xl">Build the operating model your organization can grow into.</h2></div>
              <div className="flex flex-col gap-3 sm:flex-row"><Link href="/contact" className="ss-button-primary">Request Demo <ArrowRight size={16} /></Link><Link href="/signup" className="ss-button-secondary">Get Started</Link></div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
