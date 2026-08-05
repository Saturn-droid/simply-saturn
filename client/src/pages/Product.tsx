import { ArrowRight, CalendarCheck2, ContactRound, FileCheck2, Network, Workflow } from "lucide-react";
import { Link } from "wouter";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHero, SectionIntro } from "@/components/marketing/MarketingPrimitives";
import { Seo } from "@/components/Seo";

const layers = [
  { icon: ContactRound, title: "Relationship intelligence", copy: "The people, properties, activity, and context that make every next conversation more relevant." },
  { icon: Workflow, title: "Pipeline clarity", copy: "Configurable stages, owners, and milestones that make momentum visible from first signal to close." },
  { icon: CalendarCheck2, title: "Team execution", copy: "Tasks, handoffs, and service standards that keep the operation moving with intention." },
  { icon: FileCheck2, title: "Deal confidence", copy: "Documents, requirements, and completed work connected to the transaction they support." },
  { icon: Network, title: "Connected operations", copy: "A durable platform model that can grow around the systems your team already relies on." },
];

export default function Product() {
  return (
    <MarketingLayout>
      <Seo title="Solutions for real estate teams" description="Explore Simply Saturn's connected CRM platform for relationships, deal flow, and accountable real estate service." />
      <PageHero eyebrow="Simply Saturn solutions" title={<>One CRM for the work that keeps <em>real estate moving.</em></>} description="Replace fragmented activity and disconnected records with a focused operating system for real estate relationships, deals, and team service." />
      <section className="ssm-light-section">
        <div className="ssm-container">
          <SectionIntro eyebrow="Every part has a place" title={<>The operating layer behind a more <em>considered client experience.</em></>} copy="Simply Saturn brings the relationship record and the work around it into the same accountable place." />
          <div className="ssm-card-grid ssm-five-grid">
            {layers.map((layer) => {
              const Icon = layer.icon;
              const sectionId = layer.title === "Relationship intelligence" ? "relationship-intelligence" : layer.title === "Team execution" ? "team-execution" : undefined;
              return <article className="ssm-card" key={layer.title} id={sectionId}><span className="ssm-icon"><Icon size={20} /></span><h3>{layer.title}</h3><p>{layer.copy}</p></article>;
            })}
          </div>
        </div>
      </section>
      <section className="ssm-dark-section">
        <div className="ssm-container ssm-dark-section-grid">
          <div><p className="ssm-section-kicker">Designed around real work</p><h2>Software should support the relationship, not get in its way.</h2><p>Give every person a clear sense of what matters now, without making them recreate the story across tools.</p></div>
          <div className="ssm-quote-card"><p>“A record is only useful when the next person can understand what happened, what matters, and what should happen next.”</p><Link href="/contact" className="ssm-inline-link">Talk through your workflow <ArrowRight size={16} /></Link></div>
        </div>
      </section>
    </MarketingLayout>
  );
}
