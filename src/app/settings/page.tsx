
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Shield, Building2, Coins, Printer, Database, Edit, Trash2, PlusCircle, Filter, FileCog } from "lucide-react";
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: "مدير" | "محاسب" | "موظف مبيعات" | "مراجع";
  isActive: boolean;
  lastLogin?: string;
}

interface CompanyBranch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  isMain: boolean;
}

interface Currency {
  id: string;
  code: string; // e.g., USD, EUR, SAR
  name: string; // e.g., US Dollar, Euro, Saudi Riyal
  symbol: string; // e.g., $, €, ر.س
  exchangeRateToBase: number; // Rate to the base currency
  isBaseCurrency: boolean;
}

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  // TODO: Add state for general settings, invoice settings, etc.

  return (
    <>
      <PageHeader 
        title="إعدادات النظام والتخصيص" 
        description="إدارة إعدادات الشركة، المستخدمين، الصلاحيات، الفروع، العملات، والمزيد."
      />

      <Tabs defaultValue="general" dir="rtl" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4">
          <TabsTrigger value="general" className="text-base py-2.5 flex items-center gap-1"><FileCog className="h-4 w-4"/>إعدادات عامة</TabsTrigger>
          <TabsTrigger value="users" className="text-base py-2.5 flex items-center gap-1"><Users className="h-4 w-4"/>المستخدمون والصلاحيات</TabsTrigger>
          <TabsTrigger value="branches" className="text-base py-2.5 flex items-center gap-1"><Building2 className="h-4 w-4"/>الفروع والمستودعات</TabsTrigger>
          <TabsTrigger value="currencies" className="text-base py-2.5 flex items-center gap-1"><Coins className="h-4 w-4"/>العملات وأسعار الصرف</TabsTrigger>
          <TabsTrigger value="backup" className="text-base py-2.5 flex items-center gap-1"><Database className="h-4 w-4"/>النسخ الاحتياطي</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>إعدادات الشركة العامة</CardTitle>
              <CardDescription>تكوين معلومات الشركة الأساسية وتفضيلات النظام.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">اسم الشركة</Label>
                  <Input id="companyName" defaultValue="شركة الوسيط برو النموذجية" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                  <Input id="taxNumber" placeholder="أدخل الرقم الضريبي" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">عنوان الشركة</Label>
                <Input id="companyAddress" placeholder="شارع الأمير محمد، الرياض" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="companyPhone">هاتف الشركة</Label>
                    <Input id="companyPhone" type="tel" placeholder="+966..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">البريد الإلكتروني للشركة</Label>
                    <Input id="companyEmail" type="email" placeholder="info@alwaseet.pro" />
                  </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="baseCurrency">العملة الأساسية للنظام</Label>
                  <Select dir="rtl" defaultValue="SAR">
                    <SelectTrigger id="baseCurrency">
                      <SelectValue placeholder="اختر العملة الأساسية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR">يورو (EUR)</SelectItem>
                      <SelectItem value="SYP">ليرة سورية (SYP)</SelectItem>
                      <SelectItem value="TRY">ليرة تركية (TRY)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch id="enable-einv" />
                    <Label htmlFor="enable-einv" className="text-base">تفعيل نظام الفوترة الإلكترونية (حسب الدولة)</Label>
                </div>
              <Button>حفظ الإعدادات العامة</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>إدارة المستخدمين والصلاحيات</CardTitle>
              <CardDescription>تحكم في وصول المستخدمين إلى أجزاء مختلفة من النظام.</CardDescription>
               <div className="flex items-center gap-2 pt-4">
                <Input placeholder="ابحث عن مستخدم..." className="max-w-sm" />
                <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button>
                <Button><PlusCircle className="ml-2 h-4 w-4" /> إضافة مستخدم جديد</Button>
              </div>
            </CardHeader>
            <CardContent>
              {users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم المستخدم</TableHead>
                      <TableHead>الاسم الكامل</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>الدور/الصلاحية</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>آخر تسجيل دخول</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                        <TableCell>{user.isActive ? "نشط" : "غير نشط"}</TableCell>
                        <TableCell>{user.lastLogin || "لم يسجل دخول"}</TableCell>
                        <TableCell className="text-center space-x-1">
                           <Button variant="ghost" size="icon" title="تعديل المستخدم"><Edit className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" title="تغيير الصلاحيات"><Shield className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" title={user.isActive ? "تعطيل المستخدم" : "تفعيل المستخدم"} className={user.isActive ? "text-destructive hover:text-destructive" : "text-green-600 hover:text-green-600"}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg">لا يوجد مستخدمون مضافون حاليًا.</p>
                    <p className="text-sm">ابدأ بإضافة مستخدمين وتعيين صلاحيات لهم.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>إدارة الفروع والمستودعات</CardTitle>
              <CardDescription>إضافة وتعديل معلومات الفروع والمستودعات التابعة للمؤسسة.</CardDescription>
               <div className="flex items-center gap-2 pt-4">
                <Input placeholder="ابحث عن فرع أو مستودع..." className="max-w-sm" />
                 <Button><PlusCircle className="ml-2 h-4 w-4" /> إضافة فرع/مستودع جديد</Button>
              </div>
            </CardHeader>
            <CardContent>
              {branches.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم الفرع/المستودع</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>هل هو رئيسي؟</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell>{branch.address}</TableCell>
                        <TableCell>{branch.phone || "-"}</TableCell>
                        <TableCell>{branch.isMain ? "نعم" : "لا"}</TableCell>
                        <TableCell className="text-center space-x-1">
                           <Button variant="ghost" size="icon" title="تعديل"><Edit className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" title="حذف" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg">لا توجد فروع أو مستودعات مضافة حاليًا.</p>
                    <p className="text-sm">ابدأ بإضافة معلومات فروع ومستودعات شركتك.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="currencies">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>إدارة العملات وأسعار الصرف</CardTitle>
              <CardDescription>تحديد العملات المستخدمة في النظام وتحديث أسعار صرفها.</CardDescription>
               <div className="flex items-center gap-2 pt-4">
                 <Button><PlusCircle className="ml-2 h-4 w-4" /> إضافة عملة جديدة</Button>
              </div>
            </CardHeader>
            <CardContent>
              {currencies.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رمز العملة</TableHead>
                      <TableHead>اسم العملة</TableHead>
                      <TableHead>الرمز</TableHead>
                      <TableHead className="text-left">سعر الصرف (مقابل العملة الأساسية)</TableHead>
                       <TableHead>هل هي أساسية؟</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencies.map((currency) => (
                      <TableRow key={currency.id}>
                        <TableCell className="font-medium">{currency.code}</TableCell>
                        <TableCell>{currency.name}</TableCell>
                        <TableCell>{currency.symbol}</TableCell>
                        <TableCell className="text-left">{currency.isBaseCurrency ? "-" : currency.exchangeRateToBase.toFixed(4)}</TableCell>
                        <TableCell>{currency.isBaseCurrency ? <Badge>أساسية</Badge> : "لا"}</TableCell>
                        <TableCell className="text-center space-x-1">
                           <Button variant="ghost" size="icon" title="تعديل سعر الصرف"><Edit className="h-4 w-4" /></Button>
                           {!currency.isBaseCurrency && <Button variant="ghost" size="icon" title="حذف العملة" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                    <Coins className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg">لا توجد عملات مضافة حاليًا.</p>
                    <p className="text-sm">ابدأ بإضافة العملات التي تتعامل بها شركتك وأسعار صرفها.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="backup">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>النسخ الاحتياطي واستعادة البيانات</CardTitle>
              <CardDescription>إدارة عمليات النسخ الاحتياطي لبيانات النظام.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-md bg-muted/50">
                    <p className="text-sm">آخر نسخة احتياطية: <span className="font-semibold">لم يتم أخذ نسخة احتياطية بعد</span></p>
                    <p className="text-xs text-muted-foreground">يوصى بإجراء نسخ احتياطي دوري لبياناتك.</p>
                </div>
                <div className="flex gap-4">
                    <Button className="flex-1">
                        <Database className="ml-2 h-4 w-4" /> إنشاء نسخة احتياطية الآن
                    </Button>
                    <Button variant="outline" className="flex-1" disabled>
                        استعادة من نسخة احتياطية
                    </Button>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="autoBackup">جدولة النسخ الاحتياطي التلقائي</Label>
                    <Select dir="rtl" defaultValue="daily">
                        <SelectTrigger id="autoBackup">
                        <SelectValue placeholder="اختر تكرار النسخ الاحتياطي" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="disabled">معطل</SelectItem>
                        <SelectItem value="daily">يوميًا</SelectItem>
                        <SelectItem value="weekly">أسبوعيًا</SelectItem>
                        <SelectItem value="monthly">شهريًا</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <p className="text-xs text-muted-foreground">سيتم حفظ النسخ الاحتياطية في مكان آمن (يتطلب تكوينًا من مسؤول النظام).</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
