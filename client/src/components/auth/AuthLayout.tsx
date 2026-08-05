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
    <div className="ss-auth-shell ss-auth-sales min-h-screen">
      <header className="ssm-header ss-auth-header">
        <div className="ssm-container ssm-header-inner">
          <Link href="/" className="ssm-brand" aria-label="Simply Saturn home"><span className="ssm-brand-mark" aria-hidden="true">S</span><span>Simply Saturn</span></Link>
          <nav className="ssm-desktop-nav" aria-label="Sales navigation"><Link href="/product">Solutions</Link><Link href="/features">Features</Link><Link href="/pricing">Pricing</Link><Link href="/about">About</Link><Link href="/contact">Book a Demo</Link></nav>
          <Link href="/" className="ssm-signin-pill ss-auth-home-link"><ArrowLeft size={14} />Back to home</Link>
        </div>
      </header>
      <main className="ssm-container ss-auth-hero">
        <section className="ss-auth-copy">
          <div className="ssm-status"><span />Secure workspace access</div>
          <p className="ss-auth-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="ss-auth-description">{description}</p>
          <div className="ss-auth-trust"><span>Shared relationship context</span><span>Clear next commitments</span><span>Role-aware workspace access</span></div>
        </section>
        <section className="ss-auth-panel">
          <div className="ss-auth-form-slot">{children}</div>
        </section>
      </main>
      <svg className="ss-auth-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 74C182 46 342 109 531 81C699 56 795 35 991 62C1175 88 1293 87 1440 58V120H0Z" /></svg>
    </div>
  );
}
