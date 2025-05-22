import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, BookOpenText, FileText, Zap, Barcode, Warehouse, Users, Settings } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group?: string;
}

export const navItems: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "Overview",
  },
  {
    href: "/accounting",
    label: "Accounting",
    icon: BookOpenText,
    group: "Financials",
  },
  {
    href: "/invoicing",
    label: "Invoicing",
    icon: FileText,
    group: "Financials",
  },
  {
    href: "/fast-invoice",
    label: "Fast Invoice",
    icon: Zap,
    group: "Operations",
  },
  {
    href: "/barcode-support",
    label: "Barcode Support",
    icon: Barcode,
    group: "Operations",
  },
  {
    href: "/inventory",
    label: "Inventory",
    icon: Warehouse,
    group: "Operations",
  },
  {
    href: "/contacts",
    label: "Contacts",
    icon: Users,
    group: "Management",
  },
  // Example of a settings link, can be removed or adapted
  // {
  //   href: "/settings",
  //   label: "Settings",
  //   icon: Settings,
  //   group: "System",
  // }
];
