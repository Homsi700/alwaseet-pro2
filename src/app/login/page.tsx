"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log("Login attempt with:", { email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <LogIn className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بيانات حسابك للمتابعة إلى الوسيط برو</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني أو اسم المستخدم</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="example@mail.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-card-foreground/5 border-border focus:bg-card-foreground/10"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">كلمة المرور</Label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  هل نسيت كلمة المرور؟
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="********" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-card-foreground/5 border-border focus:bg-card-foreground/10"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full text-lg py-6">
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
