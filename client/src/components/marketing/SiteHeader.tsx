import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const solutionLinks = [
  { label: "Platform overview", description: "One connected CRM for the full client journey.", href: "/product" },
  { label: "Relationship intelligence", description: "Keep people, properties, and context together.", href: "/product#relationship-intelligence" },
  { label: "Team execution", description: "Coordinate handoffs, accountability, and service.", href: "/product#team-execution" },
] as const;

const navigation = [
  { label: "Solutions", href: "/product", hasChevron: true },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Book a Demo", href: "/contact" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [location] = useLocation();
  const closeMenu = () => {
    setIsOpen(false);
    setSolutionsOpen(false);
  };

  return (
    <header className="ssm-header">
      <div className="ssm-container ssm-header-inner">
        <Link href="/" onClick={closeMenu} className="ssm-brand" aria-label="Simply Saturn home">
          <span className="ssm-brand-mark" aria-hidden="true">S</span>
          <span>Simply Saturn</span>
        </Link>

        <nav className="ssm-desktop-nav" aria-label="Primary navigation">
          <div
            className="ssm-solutions-wrap"
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
            onFocus={() => setSolutionsOpen(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setSolutionsOpen(false);
            }}
          >
            <Link href="/product" className={location === "/product" ? "is-active ssm-solutions-trigger" : "ssm-solutions-trigger"} aria-haspopup="menu" aria-expanded={solutionsOpen}>
              Solutions <ChevronDown size={13} strokeWidth={1.8} aria-hidden="true" />
            </Link>
            {solutionsOpen ? (
              <div className="ssm-solutions-panel" role="menu" aria-label="Solutions">
                <p>Explore solutions</p>
                {solutionLinks.map((item) => (
                  <Link key={item.href} href={item.href} role="menuitem" className="ssm-solution-link" onClick={closeMenu}>
                    <span>{item.label}</span>
                    <small>{item.description}</small>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          {navigation.filter((item) => !item.hasChevron).map((item) => (
            <Link key={item.href} href={item.href} className={location === item.href ? "is-active" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ssm-desktop-actions">
          <Link href="/login" className="ssm-signin-pill">Sign In</Link>
        </div>

        <button
          type="button"
          aria-controls="mobile-primary-nav"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="ssm-menu-button"
        >
          <span className="sr-only">{isOpen ? "Close navigation" : "Open navigation"}</span>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen ? (
        <div id="mobile-primary-nav" className="ssm-mobile-nav">
          <div className="ssm-container">
            <div className="ssm-mobile-solutions">
              <Link href="/product" onClick={closeMenu}>Solutions <ChevronDown size={15} /></Link>
              <div className="ssm-mobile-solution-links">
                {solutionLinks.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu}>{item.label}</Link>)}
              </div>
            </div>
            {navigation.filter((item) => !item.hasChevron).map((item) => <Link key={item.href} href={item.href} onClick={closeMenu}>{item.label}</Link>)}
            <Link href="/login" onClick={closeMenu} className="ssm-mobile-signin">Sign In</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
