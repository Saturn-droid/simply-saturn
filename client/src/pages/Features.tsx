import { ArrowRight, Bot, Building2, ClipboardList, FileText, Handshake, Layers3, Users } from "lucide-react";
import { Link } from "wouter";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHero, SectionIntro } from "@/components/marketing/MarketingPrimitives";
import { Seo } from "@/components/Seo";

const features = [
  [Users, "Contact intelligence", "Keep contact details, relationship roles, notes, and engagement history in meaningful context."],
  [Building2, "Property context", "Connect ownership, preferences, homes, and opportunities to the people your team serves."],
  [ClipboardList, "Deal pipelines", "Build clear motion around your own stages, ownership rules, and service checkpoints."],
  [Handshake, "Team coordination", "Make assignments, handoffs, and responsibility visible across every client experience."],
  [FileText, "Documents & compliance", "Keep requests, completed work, and key records close to the deal they support."],
  [Bot, "Helpful automation", "Reduce routine follow-up while keeping a human accountable for consequential decisions."],
  [Layers3, "Extensible foundation", "Grow the operating model around the systems and services your organization needs."],
] as const;

export default function Features() {
  return (
    <MarketingLayout>
      <Seo title="CRM features for real estate teams" description="Explore the contact intelligence, pipeline, coordination, documentation, and automation capabilities in Simply Saturn." />
      <PageHero eyebrow="Platform capabilities" title={<>Everything your team needs to <em>move with clarity.</em></>} description="A connected set of capabilities for the relationships, pipeline, and service standards that make a real estate organization work." />
      <section className="ssm-light-section">
        <div className="ssm-container">
          <SectionIntro eyebrow="Designed for real estate teams" title={<>Practical tools. One <em>shared record.</em></>} copy="Every feature begins with the people and operating context that sit behind the transaction." />
          <div className="ssm-feature-list">
            {features.map(([Icon, title, copy], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div className="ssm-icon"><Icon size={19} /></div>
                <div><h3>{title}</h3><p>{copy}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="ssm-container"><div className="ssm-cta-band"><div><p>SEE THE PLATFORM IN CONTEXT</p><h2>Map your current workflow to a more connected future.</h2></div><Link href="/contact" className="ssm-button ssm-button-light">Book a Demo <ArrowRight size={16} /></Link></div></section>
    </MarketingLayout>
  );
}
