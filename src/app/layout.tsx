
"use client"; 

import type { Metadata } from "next"; 
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/toaster";
import React, { useEffect, useState, useCallback } from "react"; 

// Static metadata (can still be defined even with "use client" for initial page load)
// export const metadata: Metadata = { // Keep export keyword for it to be potentially picked up by Next.js
//   title: "الوسيط برو",
//   description: "حل شامل لإدارة الأعمال",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<string>("light"); // Default to light, will be updated by useEffect

  useEffect(() => {
    const storedTheme = localStorage.getItem('alwaseet_pro_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);
  
  useEffect(() => {
    if (theme) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('alwaseet_pro_theme', theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  }, []);
  
  // Optional: Render a loading state or null until the theme is determined to prevent flash of unstyled content or incorrect theme
  // However, for simplicity and direct application, we'll let it render with default and update.
  // For perfect flicker-free, a script in <head> is often used, but that's outside ShadCN's typical client-side toggle.

  return (
    <html lang="ar" dir="rtl" className={theme} suppressHydrationWarning>
        <head>
            <title>الوسيط برو</title>
            <meta name="description" content="حل شامل لإدارة الأعمال" />
        </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AppShell currentTheme={theme} toggleTheme={toggleTheme}>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
