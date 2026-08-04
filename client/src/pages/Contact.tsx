import { ArrowRight, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Seo } from "@/components/Seo";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <MarketingLayout>
      <Seo title="Book a demo" description="Book a Simply Saturn demo and talk through the operating model for your real estate team." />
      <section className="ssm-contact-hero">
        <div className="ssm-container ssm-contact-grid">
          <div>
            <div className="ssm-status"><span />Book a demo</div>
            <h1>Start with the way your operation <em>actually works.</em></h1>
            <p>Tell us where your current handoffs, relationship records, workflow controls, or client experiences need more alignment. We will start with the right next step.</p>
            <div className="ssm-contact-points">
              <div className="ssm-contact-point"><ShieldCheck size={18} /><div><b>A considered conversation</b><span>We will start from your team structure and service model — not a generic sales script.</span></div></div>
              <div className="ssm-contact-point"><Clock3 size={18} /><div><b>Ready for your process</b><span>Bring the workflow questions and service concerns that matter to your organization.</span></div></div>
            </div>
          </div>
          <div className="ssm-form-panel">
            {submitted ? (
              <div className="ssm-success"><CheckCircle2 size={35} /><p>Request received</p><h2>Thank you. We will be in touch shortly.</h2><span>This prototype form has recorded your interest locally; production routing will be connected to the approved intake process.</span></div>
            ) : (
              <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
                <div className="ssm-form-heading"><div><p>DEMO REQUEST</p><h2>Tell us a little about your team.</h2></div><span>PROTOTYPE FORM</span></div>
                <div className="ssm-form-two"><label>First name<input className="ssm-form-input" required placeholder="First name" /></label><label>Last name<input className="ssm-form-input" required placeholder="Last name" /></label></div>
                <label>Work email<input className="ssm-form-input" required type="email" placeholder="name@company.com" /></label>
                <label>Organization<input className="ssm-form-input" required placeholder="Brokerage, team, or organization name" /></label>
                <label>What would you like to improve?<select className="ssm-form-input" required defaultValue=""><option value="" disabled>Select a focus area</option><option>Relationship and contact clarity</option><option>Deal pipeline visibility</option><option>Team coordination</option><option>Client service workflow</option></select></label>
                <label>A short note <span>(optional)</span><textarea className="ssm-form-input" rows={4} placeholder="What should we know before we speak?" /></label>
                <button type="submit" className="ssm-button ssm-button-dark">Book a Demo <ArrowRight size={16} /></button>
                <small>By sending this prototype form, you acknowledge that production routing has not yet been connected.</small>
              </form>
            )}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
