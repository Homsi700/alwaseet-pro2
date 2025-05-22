"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, ChevronDown, ChevronUp, LogOut, User, Settings, CreditCard } from "lucide-react"; // Added icons
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { navItems, type NavItem } from "@/config/nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

interface AppShellProps {
  children: ReactNode;
}

interface GroupedNavItems {
  [key: string]: NavItem[];
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const groupedItems = navItems.reduce((acc, item) => {
    const groupName = item.group || "عام"; // Default group name in Arabic
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(item);
    return acc;
  }, {} as GroupedNavItems);

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              الوسيط برو
            </h1>
          </Link>
        </SidebarHeader>
        <ScrollArea className="flex-1">
          <SidebarContent>
            <SidebarMenu>
              {Object.entries(groupedItems).map(([groupName, items]) => (
                <SidebarGroup key={groupName}>
                  <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                    {groupName}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    {items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                          tooltip={{ children: item.label, side: "left", className: "bg-primary text-primary-foreground" }}
                        >
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </ScrollArea>
        <SidebarFooter className="p-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto">
                <Avatar className="h-8 w-8">
                  {/* Removed placeholder AvatarImage, relying on Fallback */}
                  <AvatarFallback>م ض</AvatarFallback> {/* Example: Admin User initials in Arabic */}
                </Avatar>
                <span className="text-sidebar-foreground group-data-[collapsible=icon]:hidden">المستخدم المسؤول</span>
                <ChevronDown className="mr-auto h-4 w-4 text-sidebar-foreground group-data-[collapsible=icon]:hidden" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56" dir="rtl">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="ml-2 h-4 w-4" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="ml-2 h-4 w-4" />
                <span>الفواتير</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="ml-2 h-4 w-4" />
                <span>الإعدادات</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="ml-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 md:px-8">
           <SidebarTrigger className="md:hidden" />
           {/* Current Page Title could be dynamically set here using a context or prop */}
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
