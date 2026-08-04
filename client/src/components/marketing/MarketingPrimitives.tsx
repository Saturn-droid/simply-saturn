import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, description, primaryLabel = "Book a Demo", primaryHref = "/contact", children }: PageHeroProps) {
  return (
    <section className="ssm-page-hero">
      <div className="ssm-container ssm-page-hero-inner">
        <div className="ssm-status"><span />{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="ssm-hero-actions">
          <Link href={primaryHref} className="ssm-button ssm-button-light">{primaryLabel}<ArrowRight size={16} /></Link>
          <Link href="/login" className="ssm-button ssm-button-ghost">Sign In to CRM</Link>
        </div>
        {children}
      </div>
      <svg className="ssm-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 74C182 46 342 109 531 81C699 56 795 35 991 62C1175 88 1293 87 1440 58V120H0Z" /></svg>
    </section>
  );
}

export function TrustRow() {
  return (
    <div className="ssm-trust-row">
      {["No credit card required", "14-day free trial", "Cancel anytime"].map((item) => <span key={item}><CheckCircle2 size={15} />{item}</span>)}
    </div>
  );
}

export function SectionIntro({ eyebrow, title, copy }: { eyebrow: string; title: ReactNode; copy: string }) {
  return <div className="ssm-section-intro"><p>{eyebrow}</p><h2>{title}</h2><span>{copy}</span></div>;
}
