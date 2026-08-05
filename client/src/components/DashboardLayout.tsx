import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/lib/utils";
import { Bell, CalendarDays, ChevronDown, FileText, LayoutDashboard, Megaphone, Menu, MessageSquareText, Search, Settings2, Sparkles, UserRound, UsersRound, Workflow, X, BarChart3, CheckSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

type NavigationItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

const navigationItems: NavigationItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/app" },
  { label: "Contacts", icon: UsersRound, href: "/app/contacts" },
  { label: "Deals", icon: Workflow, href: "/app/deals" },
  { label: "Calendar", icon: CalendarDays, href: "/app/calendar" },
  { label: "Tasks", icon: CheckSquare, href: "/app/tasks" },
  { label: "Documents", icon: FileText, href: "/app/documents" },
  { label: "Marketing", icon: Megaphone, href: "/app/marketing" },
  { label: "Automations", icon: Sparkles, href: "/app/automations" },
  { label: "Reports", icon: BarChart3, href: "/app/reports" },
  { label: "Administration", icon: Settings2, href: "/app/team" },
];

type DashboardLayoutProps = {
  children: ReactNode;
  demoMode?: boolean;
};

export default function DashboardLayout({ children, demoMode = false }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(location.startsWith("/app/calendar") ? "Calendar" : location.startsWith("/app/contacts") ? "Contacts" : location.startsWith("/app/deals") ? "Deals" : location.startsWith("/app/tasks") ? "Tasks" : location.startsWith("/app/documents") ? "Documents" : location.startsWith("/app/marketing") ? "Marketing" : location.startsWith("/app/automations") ? "Automations" : location.startsWith("/app/reports") ? "Reports" : location.startsWith("/app/inbox") ? "Inbox & Text" : location.startsWith("/app/team") ? "Administration" : "Dashboard");

  if (!demoMode && loading) {
    return <div className="grid min-h-screen place-items-center bg-[#f8f7f1] text-sm font-bold text-[#5e637d]">Loading your workspace…</div>;
  }

  if (!demoMode && !user) {
    return <div className="grid min-h-screen place-items-center bg-[#f8f7f1] px-5"><div className="max-w-md rounded-[1.35rem] border border-[#171b39]/9 bg-white p-8 text-center shadow-[0_25px_80px_rgba(26,30,59,.08)]"><BrandMark className="mx-auto justify-center" /><h1 className="mt-8 text-3xl text-[#202547]">Sign in to access your workspace.</h1><p className="mt-3 text-sm leading-6 text-[#70758b]">Your operations dashboard is available through your approved Simply Saturn organization account.</p><button type="button" onClick={() => setLocation("/login")} className="ss-button-primary mt-7">Go to sign in</button></div></div>;
  }

  const displayName = user?.name || "Workspace member";
  const initials = displayName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "WS";

  const chooseItem = (item: NavigationItem) => {
    setActiveItem(item.label);
    setMobileOpen(false);
    if (item.href) setLocation(item.href);
  };

  const signOut = () => {
    if (user) logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-[#f7f6f0] text-[#212648]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17.5rem] flex-col overflow-hidden bg-[#20274b] px-3 py-4 text-white lg:flex">
        <div aria-hidden="true" className="absolute -right-24 -top-14 h-64 w-[28rem] rotate-[-18deg] rounded-[100%] border border-[#d1a467]/28" />
        <div className="relative px-2 py-2"><BrandMark inverse /></div>
        <div className="relative mt-9 px-2"><p className="font-sans text-[0.61rem] font-extrabold uppercase tracking-[.15em] text-[#b8b6c5]">Your workspace</p></div>
        <nav aria-label="Workspace sections" className="relative mt-3 flex-1 space-y-1 overflow-y-auto pr-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = item.href ? (item.href === "/app" ? location === "/app" : location.startsWith(item.href)) : activeItem === item.label;
            return <button key={item.label} type="button" onClick={() => chooseItem(item)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-colors", active ? "bg-white/12 text-white shadow-sm" : "text-[#c8c7d4] hover:bg-white/6 hover:text-white")}><Icon size={17} className={active ? "text-[#e0c89e]" : "text-[#aaa9bc]"} /><span>{item.label}</span>{active ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d1a467]" /> : null}</button>;
          })}
        </nav>
        <div className="relative mt-4 rounded-xl border border-white/9 bg-white/5 p-3"><p className="font-sans text-[0.61rem] font-extrabold uppercase tracking-[.13em] text-[#d1a467]">Foundation state</p><p className="mt-1.5 text-xs leading-5 text-[#c6c5d1]">Module shells are ready for the next connected workflow.</p></div>
      </aside>

          {mobileOpen ? <div className="fixed inset-0 z-50 lg:hidden"><button type="button" className="absolute inset-0 bg-[#131735]/50" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /><aside className="relative flex h-full w-[18.5rem] flex-col bg-[#20274b] p-3 text-white shadow-2xl"><div className="flex items-center justify-between px-2 py-2"><BrandMark inverse /><button type="button" onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg text-[#dddce5] hover:bg-white/8" aria-label="Close navigation"><X size={18} /></button></div><p className="mt-8 px-2 font-sans text-[0.61rem] font-extrabold uppercase tracking-[.15em] text-[#b8b6c5]">Your workspace</p><nav aria-label="Mobile workspace sections" className="mt-3 space-y-1">{navigationItems.map((item) => { const Icon = item.icon; const active = item.href ? (item.href === "/app" ? location === "/app" : location.startsWith(item.href)) : activeItem === item.label; return <button key={item.label} type="button" onClick={() => chooseItem(item)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold", active ? "bg-white/12 text-white" : "text-[#c8c7d4]")}><Icon size={17} className={active ? "text-[#e0c89e]" : "text-[#aaa9bc]"} />{item.label}</button>; })}</nav></aside></div> : null}

      <div className="min-h-screen lg:pl-[17.5rem]">
        <header className="sticky top-0 z-30 flex h-[4.7rem] items-center gap-3 border-b border-[#171b39]/8 bg-[#fbfaf5]/88 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button type="button" onClick={() => setMobileOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#171b39]/9 bg-white text-[#303655] lg:hidden" aria-label="Open workspace navigation"><Menu size={19} /></button>
          <div className="relative min-w-0 flex-1 max-w-xl"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#85899c]" /><input aria-label="Search the workspace" className="w-full rounded-xl border border-[#171b39]/9 bg-white py-2.5 pl-9 pr-4 text-sm text-[#2c3154] placeholder:text-[#999cac] focus:border-[#6a5889] focus:outline-none focus:ring-2 focus:ring-[#6a5889]/12" placeholder="Search contacts, deals, documents…" /></div>
          <button type="button" onClick={() => setLocation("/app/inbox")} aria-label="Open inbox and text" className="grid h-10 w-10 place-items-center rounded-xl border border-[#171b39]/9 bg-white text-[#4b506d] hover:border-[#50416f]/30 hover:text-[#50416f]"><MessageSquareText size={17} /></button>
          <button type="button" aria-label="Open notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#171b39]/9 bg-white text-[#4b506d] hover:border-[#50416f]/30 hover:text-[#50416f]"><Bell size={17} /><span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#c99d62]" /></button>
          <div className="relative"><button type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-haspopup="menu" className="flex h-10 items-center gap-2 rounded-xl border border-[#171b39]/9 bg-white px-2 pr-2.5 text-left hover:border-[#50416f]/30"><span className="grid h-6 w-6 place-items-center rounded-lg bg-[#eae5d9] text-[0.6rem] font-extrabold text-[#4d416f]">{initials}</span><span className="hidden max-w-28 truncate text-xs font-extrabold text-[#353a5c] sm:block">{displayName}</span><ChevronDown size={14} className="text-[#7a7e91]" /></button>{profileOpen ? <div role="menu" className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-[#171b39]/10 bg-white p-1.5 shadow-[0_20px_45px_rgba(26,30,59,.16)]"><div className="px-3 py-2.5"><p className="text-xs font-extrabold text-[#2c3154]">{displayName}</p><p className="mt-0.5 truncate text-[0.65rem] text-[#777c91]">{user?.email || "Demo workspace access"}</p></div><div className="h-px bg-[#171b39]/8" /><button role="menuitem" type="button" onClick={signOut} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-bold text-[#5d516f] hover:bg-[#f4f1e9]"><UserRound size={14} />Sign out</button></div> : null}</div>
        </header>
        <main className="relative p-4 sm:p-6 lg:p-8"><div aria-hidden="true" className="pointer-events-none absolute right-8 top-8 h-52 w-52 rounded-full bg-[#d1a467]/8 blur-3xl" /><div className="relative">{activeItem !== "Dashboard" && !location.startsWith("/app/calendar") && !location.startsWith("/app/contacts") && !location.startsWith("/app/deals") && !location.startsWith("/app/tasks") && !location.startsWith("/app/documents") && !location.startsWith("/app/marketing") && !location.startsWith("/app/automations") && !location.startsWith("/app/reports") && !location.startsWith("/app/inbox") && !location.startsWith("/app/team") ? <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#171b39]/9 bg-white/70 px-4 py-3 text-xs text-[#616780]"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#eee9de] text-[#5a4c7a]"><Sparkles size={14} /></span><span><strong className="font-extrabold text-[#333958]">{activeItem}</strong> is represented in this app shell and ready for its connected product module.</span></div> : null}{children}</div></main>
      </div>
    </div>
  );
}
