import { ArrowRight, Compass, Eye, ShieldCheck, Sparkles, UsersRound, Workflow } from "lucide-react";
import { Link } from "wouter";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHero, SectionIntro } from "@/components/marketing/MarketingPrimitives";
import { Seo } from "@/components/Seo";

const principles = [
  [Compass, "Clarity before volume", "The right operating context is more useful than another dashboard full of activity."],
  [UsersRound, "Service is a team sport", "Great real estate experiences are created across roles, not in isolation."],
  [Sparkles, "Automation with judgment", "Routine work can move quickly while important moments keep a human accountable."],
  [Workflow, "Configuration without fragmentation", "Teams should adapt their workflows without losing the shared record underneath."],
  [ShieldCheck, "Access with intent", "Every person sees the context and controls appropriate to their role."],
  [Eye, "Designed to evolve", "A durable operating layer should have room for future services, portals, and integrations."],
] as const;

export default function About() {
  return (
    <MarketingLayout>
      <Seo title="About Simply Saturn" description="Learn the vision behind Simply Saturn's connected real estate CRM and operating platform." />
      <PageHero eyebrow="The Simply Saturn vision" title={<>Real estate operations should feel less fragmented — and <em>more considered.</em></>} description="Simply Saturn is shaped for organizations that believe relationships, business workflow, and team coordination belong in the same operating system." />
      <section className="ssm-light-section">
        <div className="ssm-container">
          <SectionIntro eyebrow="Operating principles" title={<>A durable platform is built on <em>durable beliefs.</em></>} copy="We are building a CRM that makes real estate teams clearer, more coordinated, and more ready to serve people well." />
          <div className="ssm-card-grid">
            {principles.map(([Icon, title, copy]) => <article className="ssm-card" key={title}><span className="ssm-icon"><Icon size={20} /></span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>
      <section className="ssm-container"><div className="ssm-cta-band"><div><p>THE NEXT CONVERSATION</p><h2>Bring your organization’s operating reality into the room.</h2></div><Link href="/contact" className="ssm-button ssm-button-light">Book a Demo <ArrowRight size={16} /></Link></div></section>
    </MarketingLayout>
  );
}
