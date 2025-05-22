import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, BookOpenText, FileText, Zap, Barcode, Warehouse, Users, Settings, LogIn } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group?: string;
}

export const navItems: NavItem[] = [
  {
    href: "/",
    label: "لوحة التحكم",
    icon: LayoutDashboard,
    group: "نظرة عامة",
  },
  {
    href: "/accounting",
    label: "المحاسبة",
    icon: BookOpenText,
    group: "المالية",
  },
  {
    href: "/invoicing",
    label: "الفوترة",
    icon: FileText,
    group: "المالية",
  },
  {
    href: "/fast-invoice",
    label: "فاتورة سريعة",
    icon: Zap,
    group: "العمليات",
  },
  {
    href: "/barcode-support",
    label: "دعم الباركود",
    icon: Barcode,
    group: "العمليات",
  },
  {
    href: "/inventory",
    label: "المخزون",
    icon: Warehouse,
    group: "العمليات",
  },
  {
    href: "/contacts",
    label: "جهات الاتصال",
    icon: Users,
    group: "الإدارة",
  },
  // {
  //   href: "/login",
  //   label: "تسجيل الدخول",
  //   icon: LogIn,
  //   group: "النظام",
  // }
  // Example of a settings link, can be removed or adapted
  // {
  //   href: "/settings",
  //   label: "الإعدادات",
  //   icon: Settings,
  //   group: "النظام",
  // }
];
