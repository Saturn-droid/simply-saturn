import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHero, SectionIntro } from "@/components/marketing/MarketingPrimitives";
import { Seo } from "@/components/Seo";

const plans: Array<{ title: string; copy: string; benefits: string[] }> = [
  { title: "Team foundation", copy: "For teams organizing the records, deal flow, and service practices that need a single home.", benefits: ["Contact & relationship workspace", "Pipeline foundations", "Role-aware work views"] },
  { title: "Growing operation", copy: "For teams coordinating more people, handoffs, accountability, and client-facing moments.", benefits: ["Everything in Team foundation", "Shared queues & coordination", "Operational reporting"] },
  { title: "Brokerage platform", copy: "For organizations designing a more tailored, organization-wide operating model.", benefits: ["Everything in Growing operation", "Organization-specific configuration", "Planned rollout & integrations"] },
];

export default function Pricing() {
  return (
    <MarketingLayout>
      <Seo title="Pricing" description="Discuss a Simply Saturn plan structure designed around your real estate team's operating model." />
      <PageHero eyebrow="Pricing framework" title={<>A plan structure as clear as the <em>platform behind it.</em></>} description="Commercial packaging is finalized with the right mix of organization size, rollout support, and operational complexity in mind." />
      <section className="ssm-light-section">
        <div className="ssm-container">
          <SectionIntro eyebrow="Pricing to be confirmed" title={<>A clearer way to plan your <em>next operating chapter.</em></>} copy="We do not invent pricing. Instead, we shape a practical plan around the service model and rollout your team needs." />
          <div className="ssm-pricing-grid">
            {plans.map((plan, index) => (
              <article className={index === 1 ? "ssm-price-card featured" : "ssm-price-card"} key={plan.title}>
                <p>{index === 1 ? "MOST COMMON NEXT STEP" : "PLATFORM PATH"}</p>
                <h3>{plan.title}</h3>
                <span>{plan.copy}</span>
                <ul>{plan.benefits.map((benefit) => <li key={benefit}><CheckCircle2 size={16} />{benefit}</li>)}</ul>
                <Link href="/contact">Discuss this path <ArrowRight size={15} /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
