
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, ChevronDown, User, Settings, CreditCard, LogOut, Moon, Sun } from "lucide-react"; 
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
import { useRouter } from "next/navigation"; // For logout redirect

interface AppShellProps {
  children: ReactNode;
  currentTheme: string;
  toggleTheme: () => void;
}

interface GroupedNavItems {
  [key: string]: NavItem[];
}

export function AppShell({ children, currentTheme, toggleTheme }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter(); // Initialize router for logout

  // Hide sidebar and app shell structure for login page and kiosk page
  if (pathname === "/login" || pathname.startsWith("/kiosk")) {
    return <>{children}</>;
  }

  const groupedItems = navItems.reduce((acc, item) => {
    const groupName = item.group || "عام"; 
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(item);
    return acc;
  }, {} as GroupedNavItems);

  const handleLogout = () => {
    // TODO: Implement actual logout logic (e.g., clear session, token)
    console.log("Logout clicked");
    router.push("/login"); // Redirect to login page
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="right" className="border-l border-sidebar-border"> {/* Sidebar on the right, added border */}
        <SidebarHeader className="p-4 border-b border-sidebar-border"> {/* Added border */}
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
                  <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 text-sidebar-foreground/70 px-2 pt-3 pb-1 text-xs">
                    {groupName}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    {items.map((item) => (
                      <SidebarMenuItem key={item.href} className="px-2">
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                          tooltip={{ children: item.label, side: "left", className: "bg-primary text-primary-foreground" }}
                          className="text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9"
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
        <SidebarFooter className="p-2 border-t border-sidebar-border">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground">
                <Avatar className="h-8 w-8 border border-sidebar-border">
                  <AvatarImage src="https://placehold.co/100x100.png?text=User" alt="صورة المستخدم" data-ai-hint="user avatar" />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">م ض</AvatarFallback> 
                </Avatar>
                <span className="group-data-[collapsible=icon]:hidden">المستخدم المسؤول</span>
                <ChevronDown className="mr-auto h-4 w-4 group-data-[collapsible=icon]:hidden" /> {/* Changed ml-auto to mr-auto for RTL */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56" dir="rtl">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="ml-2 h-4 w-4" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                {currentTheme === 'dark' ? <Sun className="ml-2 h-4 w-4" /> : <Moon className="ml-2 h-4 w-4" />}
                <span>تبديل الوضع ({currentTheme === 'dark' ? 'فاتح' : 'داكن'})</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                    <Settings className="ml-2 h-4 w-4" />
                    <span>الإعدادات</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="ml-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 md:px-8">
           <SidebarTrigger className="md:hidden text-foreground" />
           <div className="flex-grow"></div> {/* Spacer */}
           <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="تبديل الوضع" className="text-foreground">
            {currentTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
