import { ArrowRight, BarChart3, CheckCircle2, FileText, House, UsersRound } from "lucide-react";
import { Link } from "wouter";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SectionIntro, TrustRow } from "@/components/marketing/MarketingPrimitives";
import { Seo } from "@/components/Seo";

const capabilities = [
  { icon: UsersRound, title: "Know every relationship", copy: "Keep people, households, referral partners, and the conversations that matter in one shared record." },
  { icon: House, title: "See every opportunity", copy: "Bring listings, buyers, property context, stages, and ownership into a pipeline that stays current." },
  { icon: CheckCircle2, title: "Move the work forward", copy: "Use focused next steps, checklists, and accountability signals that help every role follow through." },
];

export default function Home() {
  return (
    <MarketingLayout>
      <Seo title="The CRM built for real estate teams" description="Simply Saturn is the CRM built for real estate teams that want clearer relationships, pipeline visibility, and accountable service." />
      <section className="ssm-hero">
        <div className="ssm-container ssm-hero-inner">
          <div className="ssm-status"><span />Now with AI-powered contact intelligence</div>
          <h1 className="ssm-home-title">The CRM built for <span>real estate teams</span></h1>
          <p className="ssm-hero-copy">Manage your entire pipeline — from first contact to closed deal — with a platform designed specifically for buyer agents, listing agents, ISAs, and leadership.</p>
          <div className="ssm-hero-actions">
            <Link href="/contact" className="ssm-button ssm-button-light">Book a Demo <ArrowRight size={16} /></Link>
            <Link href="/login" className="ssm-button ssm-button-ghost">Sign In to CRM</Link>
          </div>
          <TrustRow />
        </div>
        <svg className="ssm-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 74C182 46 342 109 531 81C699 56 795 35 991 62C1175 88 1293 87 1440 58V120H0Z" /></svg>
      </section>

      <section className="ssm-light-section">
        <div className="ssm-container">
          <SectionIntro eyebrow="A calmer operating system" title={<>A single view of the work, <em>and the people behind it.</em></>} copy="Simply Saturn connects the details a real estate team needs to remember with the work it needs to finish." />
          <div className="ssm-card-grid">
            {capabilities.map((item) => { const Icon = item.icon; return <article className="ssm-card" key={item.title}><span className="ssm-icon"><Icon size={20} /></span><h3>{item.title}</h3><p>{item.copy}</p></article>; })}
          </div>
        </div>
      </section>

      <section className="ssm-dark-section">
        <div className="ssm-container ssm-dark-section-grid">
          <div><p className="ssm-section-kicker">Built for the complete client journey</p><h2>From first signal to closing table, nothing important gets lost.</h2><p>Give your agents, coordinators, and leadership a clear, shared understanding of every relationship, handoff, and next right action.</p><Link href="/product" className="ssm-inline-link">Explore solutions <ArrowRight size={16} /></Link></div>
          <div className="ssm-stage-card"><div><span>01</span><p>Contact context</p><strong>Every history in one place</strong></div><div><span>02</span><p>Deal rhythm</p><strong>Every stage clearly owned</strong></div><div><span>03</span><p>Team service</p><strong>Every handoff visible</strong></div></div>
        </div>
      </section>

      <section className="ssm-light-section ssm-compact-section">
        <div className="ssm-container ssm-role-grid">
          <SectionIntro eyebrow="A platform for every role" title={<>The right context for the <em>right person.</em></>} copy="A shared operating model that feels useful whether you lead the team, coordinate the work, or meet the client." />
          <div className="ssm-role-list"><span>Buyer & listing agents</span><span>Inside sales teams</span><span>Transaction coordinators</span><span>Brokerage leadership</span></div>
        </div>
      </section>

      <section className="ssm-container"><div className="ssm-cta-band"><div><p>READY TO SEE THE DIFFERENCE?</p><h2>Build a more connected real estate team.</h2></div><Link href="/contact" className="ssm-button ssm-button-light">Book a Demo <ArrowRight size={16} /></Link></div></section>
    </MarketingLayout>
  );
}
