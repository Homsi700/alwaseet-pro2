
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, BookOpenText, FileText, Zap, Barcode, Warehouse, Users, Settings, LogIn, Landmark, BarChart3, Building2, Coins } from "lucide-react";

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
    label: "المحاسبة العامة",
    icon: BookOpenText,
    group: "المالية",
  },
  {
    href: "/invoicing",
    label: "الفواتير والمبيعات",
    icon: FileText,
    group: "المالية",
  },
  {
    href: "/banking",
    label: "الشؤون المالية والبنوك",
    icon: Landmark,
    group: "المالية",
  },
  {
    href: "/fast-invoice",
    label: "نقطة بيع سريعة",
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
    label: "إدارة المخزون",
    icon: Warehouse,
    group: "العمليات",
  },
  {
    href: "/contacts",
    label: "إدارة العملاء والموردين",
    icon: Users,
    group: "الإدارة",
  },
  {
    href: "/reports",
    label: "التقارير والتحليلات",
    icon: BarChart3,
    group: "الإدارة",
  },
  {
    href: "/settings",
    label: "الإعدادات والتخصيص",
    icon: Settings,
    group: "النظام",
  },
  // {
  //   href: "/login",
  //   label: "تسجيل الدخول",
  //   icon: LogIn,
  //   group: "النظام",
  // }
];
