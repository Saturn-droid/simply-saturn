import { BrandMark } from "@/components/BrandMark";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

const footerGroups = [
  {
    heading: "Platform",
    links: [
      ["Product overview", "/product"],
      ["Features", "/features"],
      ["Pricing", "/pricing"],
      ["Request a demo", "/contact"],
    ],
  },
  {
    heading: "Company",
    links: [
      ["Our vision", "/about"],
      ["Contact", "/contact"],
      ["[Placeholder] Careers", "/contact"],
      ["[Placeholder] Press", "/contact"],
    ],
  },
  {
    heading: "Legal",
    links: [
      ["[Placeholder] Privacy", "/privacy"],
      ["[Placeholder] Terms", "/terms"],
      ["[Placeholder] Security", "/security"],
      ["[Placeholder] Accessibility", "/accessibility"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#171b39] text-[#f7f4ed]">
      <div aria-hidden="true" className="absolute -right-24 -top-40 h-[26rem] w-[44rem] rotate-[-18deg] rounded-[100%] border border-[#d1a467]/30" />
      <div aria-hidden="true" className="absolute -right-10 -top-28 h-[17rem] w-[31rem] rotate-[-18deg] rounded-[100%] border border-white/12" />
      <div className="container relative py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr] lg:gap-20">
          <div>
            <BrandMark inverse />
            <p className="mt-6 max-w-sm text-sm leading-6 text-[#d9d8e1]">
              Simply Saturn brings real estate relationships, workflows, and service delivery into one accountable workspace.
            </p>
            <p className="mt-5 max-w-sm text-xs leading-5 text-[#b5b4c6]">
              <strong className="font-semibold text-[#d1a467]">[Ready for substitution]</strong> Contact details, support hours, and social destinations will be connected to approved production information.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-7 gap-y-10 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <section key={group.heading}>
                <h2 className="font-sans text-xs font-extrabold uppercase tracking-[0.14em] text-[#d1a467]">{group.heading}</h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="group inline-flex items-center gap-1 text-sm text-[#dedde7] hover:text-white">
                        {label}
                        {label.includes("Placeholder") ? <ArrowUpRight size={12} className="opacity-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#aaa9bd] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Simply Saturn. Operationally focused real estate software.</p>
          <p><span className="text-[#d1a467]">[Placeholder]</span> LinkedIn · Instagram · X</p>
        </div>
      </div>
    </footer>
  );
}
