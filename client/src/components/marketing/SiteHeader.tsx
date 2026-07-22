import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const navigation = [
  { label: "Product", href: "/product" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Vision", href: "/about" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#171b39]/8 bg-[#fbfaf4]/82 backdrop-blur-xl">
      <div className="container flex h-[4.75rem] items-center justify-between gap-4">
        <Link href="/" onClick={closeMenu} aria-label="Simply Saturn home">
          <BrandMark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => {
            const active = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "ss-nav-link rounded-lg px-3 py-2 text-[0.8rem] font-semibold",
                  active ? "bg-[#171b39]/6 text-[#171b39]" : "text-[#555975] hover:text-[#171b39]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/login" className="ss-nav-pill rounded-lg px-3 py-2 text-[0.8rem] font-bold text-[#323757] hover:bg-[#171b39]/5">
            Sign In
          </Link>
          <Link href="/signup" className="ss-button-primary text-[0.76rem]">
            Get Started
          </Link>
        </div>

        <button
          type="button"
          aria-controls="mobile-primary-nav"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-[#171b39]/10 bg-white text-[#171b39] lg:hidden"
        >
          <span className="sr-only">{isOpen ? "Close navigation" : "Open navigation"}</span>
          {isOpen ? <X size={18} /> : <Menu size={19} />}
        </button>
      </div>

      {isOpen ? (
        <div id="mobile-primary-nav" className="border-t border-[#171b39]/8 bg-[#fbfaf4] px-5 pb-5 pt-3 lg:hidden">
          <nav aria-label="Mobile primary" className="mx-auto flex max-w-xl flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-xl px-3 py-3 text-sm font-bold text-[#323757] hover:bg-[#171b39]/5"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-[#171b39]/8" />
            <Link href="/login" onClick={closeMenu} className="rounded-xl px-3 py-3 text-sm font-bold text-[#323757] hover:bg-[#171b39]/5">
              Sign In
            </Link>
            <Link href="/signup" onClick={closeMenu} className="ss-button-primary mt-1 w-full">
              Get Started
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
