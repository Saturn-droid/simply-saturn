import { Seo } from "@/components/Seo";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ArrowLeft, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";

const pageDetails: Record<string, { title: string; label: string }> = {
  "/privacy": { title: "Privacy information", label: "[Placeholder] Privacy" },
  "/terms": { title: "Terms of use", label: "[Placeholder] Terms" },
  "/security": { title: "Security overview", label: "[Placeholder] Security" },
  "/accessibility": { title: "Accessibility statement", label: "[Placeholder] Accessibility" },
};

export default function LegalPlaceholder() {
  const [location] = useLocation();
  const detail = pageDetails[location] ?? { title: "Information", label: "[Placeholder] Information" };

  return (
    <MarketingLayout>
      <Seo title={detail.title} description={`Simply Saturn ${detail.title.toLowerCase()} placeholder page, ready for approved production content.`} />
      <section className="relative min-h-[65vh] overflow-hidden bg-[#f6f4ed] py-20 sm:py-28">
        <div aria-hidden="true" className="ss-orbital-ring -right-24 top-12 h-[24rem] w-[48rem] rotate-[-18deg] border-[#c99d62]/35" />
        <div className="container relative max-w-3xl"><div className="rounded-[1.5rem] border border-[#171b39]/9 bg-white/82 p-8 shadow-[0_24px_75px_rgba(26,30,59,.08)] sm:p-12"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#eee9de] text-[#5a4c7b]"><FileText size={22} /></span><p className="mt-7 font-sans text-xs font-extrabold uppercase tracking-[.15em] text-[#8a6c45]">{detail.label}</p><h1 className="mt-3 text-4xl text-[#1d2245] sm:text-5xl">Ready for approved content.</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#676c83]">This dedicated route is intentionally present so your legal, policy, or accessibility content can be added without redesigning the public navigation. It should be replaced with review-approved copy before production launch.</p><Link href="/" className="ss-button-secondary mt-8"><ArrowLeft size={16} />Return home</Link></div></div>
      </section>
    </MarketingLayout>
  );
}
