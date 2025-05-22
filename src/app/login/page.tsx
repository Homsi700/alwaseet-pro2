"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import for navigation
import React, { useState } from "react"; // Import React for FormEvent type

export default function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const router = useRouter(); // Initialize router

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // TODO: Implement actual login logic here
    // For now, simulate login and redirect to dashboard if credentials are correct
    if (username === "admin" && password === "admin123") {
      console.log("Login successful with:", { username, password });
      // Redirect to dashboard or home page upon successful login
      router.push("/"); 
    } else {
      console.log("Login failed");
      setError("اسم المستخدم أو كلمة المرور غير صحيحة.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/30 via-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-3 p-8 bg-primary/10">
          <div className="mx-auto bg-primary text-primary-foreground p-4 rounded-full w-fit shadow-lg">
            <ShieldCheck className="h-12 w-12" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">مرحباً بك في الوسيط برو</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            سجل الدخول للوصول إلى نظام إدارة أعمالك المتكامل.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-medium">اسم المستخدم</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="أدخل اسم المستخدم الخاص بك" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background/70 border-border focus:border-primary text-base py-3"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base font-medium">كلمة المرور</Label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  هل نسيت كلمة المرور؟
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="أدخل كلمة المرور" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/70 border-border focus:border-primary text-base py-3"
              />
            </div>
            {error && (
              <p className="text-sm font-medium text-destructive text-center">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-8 pt-0">
            <Button type="submit" className="w-full text-lg py-6 shadow-md hover:shadow-lg transition-shadow">
              <LogIn className="mr-2 h-5 w-5" /> تسجيل الدخول
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link href="#" className="text-primary hover:underline font-semibold">
                إنشاء حساب جديد
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
