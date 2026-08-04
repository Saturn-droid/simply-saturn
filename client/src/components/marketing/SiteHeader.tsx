import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const navigation = [
  { label: "Solutions", href: "/product", hasChevron: true },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Book a Demo", href: "/contact" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="ssm-header">
      <div className="ssm-container ssm-header-inner">
        <Link href="/" onClick={closeMenu} className="ssm-brand" aria-label="Simply Saturn home">
          <span className="ssm-brand-mark" aria-hidden="true">S</span>
          <span>Simply Saturn</span>
        </Link>

        <nav className="ssm-desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={location === item.href ? "is-active" : undefined}>
              {item.label}{item.hasChevron ? <ChevronDown size={13} strokeWidth={1.8} /> : null}
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
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}{item.hasChevron ? <ChevronDown size={15} /> : null}
              </Link>
            ))}
            <Link href="/login" onClick={closeMenu} className="ssm-mobile-signin">Sign In</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
