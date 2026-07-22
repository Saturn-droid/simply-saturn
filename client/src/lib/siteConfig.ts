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
  { label: "Product", href: "/product" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Vision", href: "/about" },
] as const;

export const landingCtas = [
  { label: "Get Started", href: "/signup", style: "primary" },
  { label: "Request Demo", href: "/contact", style: "secondary" },
  { label: "Sign In", href: "/login", style: "text" },
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
