import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

const groups = [
  { title: "Platform", links: [["Solutions", "/product"], ["Features", "/features"], ["Pricing", "/pricing"], ["Book a Demo", "/contact"]] },
  { title: "Company", links: [["About", "/about"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"]] },
];

export function SiteFooter() {
  return (
    <footer className="ssm-footer">
      <div className="ssm-container ssm-footer-grid">
        <div>
          <Link href="/" className="ssm-brand ssm-footer-brand" aria-label="Simply Saturn home">
            <span className="ssm-brand-mark" aria-hidden="true">S</span>
            <span>Simply Saturn</span>
          </Link>
          <p className="ssm-footer-copy">The CRM built for the relationships, pipeline, and service standards behind a more accountable real estate team.</p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <p className="ssm-footer-heading">{group.title}</p>
            <ul>
              {group.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href}>
                    {label}
                    {["Privacy", "Terms"].includes(label) ? <ArrowUpRight size={12} /> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="ssm-container ssm-footer-bottom">
        <span>© 2026 Simply Saturn. Built for modern real estate teams.</span>
        <span>Relationship intelligence, without the noise.</span>
      </div>
    </footer>
  );
}
