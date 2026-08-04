import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  FileText,
  LayoutDashboard,
  Megaphone,
  Settings2,
  Sparkles,
  UsersRound,
  Workflow,
} from "lucide-react";

export const publicNavigation = [
  { label: "Solutions", href: "/product" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Book a Demo", href: "/contact" },
] as const;

export const landingCtas = [
  { label: "Book a Demo", href: "/contact", style: "primary" },
  { label: "Sign In to CRM", href: "/login", style: "secondary" },
] as const;

export type DashboardNavigationItem = {
  label: string;
  icon: LucideIcon;
};

export const dashboardNavigation: DashboardNavigationItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Contacts", icon: UsersRound },
  { label: "Deals", icon: Workflow },
  { label: "Calendar", icon: CalendarDays },
  { label: "Tasks", icon: CheckSquare },
  { label: "Documents", icon: FileText },
  { label: "Marketing", icon: Megaphone },
  { label: "Automations", icon: Sparkles },
  { label: "Reports", icon: BarChart3 },
  { label: "Administration", icon: Settings2 },
];
