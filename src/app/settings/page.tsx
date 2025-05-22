
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Shield, Building2, Coins, Printer, Database, Edit, Trash2, PlusCircle, Filter, FileCog, Save } from "lucide-react";
import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// Mock data and services (replace with actual API calls later)
// For now, settings will be local state or very simple mock service

interface GeneralSettingsData {
  companyName: string;
  taxNumber?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  baseCurrency: string;
  enableEInvoice: boolean;
}

const generalSettingsSchema = z.object({
  companyName: z.string().min(1, "اسم الشركة مطلوب"),
  taxNumber: z.string().optional(),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal('')),
  baseCurrency: z.string().min(1, "العملة الأساسية مطلوبة"),
  enableEInvoice: z.boolean().default(false),
});


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
  code: string; 
  name: string; 
  symbol: string; 
  exchangeRateToBase: number; 
  isBaseCurrency: boolean;
}

// Mock data - In a real app, this would come from a database or API
let mockUsers: User[] = [
    {id: 'user1', username: 'admin', fullName: 'المدير العام', email: 'admin@alwaseet.pro', role: 'مدير', isActive: true, lastLogin: '15/07/2024 10:00 ص'},
    {id: 'user2', username: 'accountant1', fullName: 'المحاسب الأول', email: 'accountant@alwaseet.pro', role: 'محاسب', isActive: true, lastLogin: '14/07/2024 03:30 م'},
];
let mockBranches: CompanyBranch[] = [
    {id: 'branch1', name: 'الفرع الرئيسي', address: 'شارع الملك عبد العزيز، الرياض', phone: '011-1234567', isMain: true},
    {id: 'branch2', name: 'مستودع جدة', address: 'المنطقة الصناعية، جدة', phone: '012-9876543', isMain: false},
];
let mockCurrencies: Currency[] = [
    {id: 'curr1', code: 'SYP', name: 'ليرة سورية', symbol: 'ل.س', exchangeRateToBase: 1, isBaseCurrency: true},
    {id: 'curr2', code: 'USD', name: 'دولار أمريكي', symbol: '$', exchangeRateToBase: 15000, isBaseCurrency: false},
    {id: 'curr3', code: 'EUR', name: 'يورو', symbol: '€', exchangeRateToBase: 16000, isBaseCurrency: false},
    {id: 'curr4', code: 'TRY', name: 'ليرة تركية', symbol: '₺', exchangeRateToBase: 450, isBaseCurrency: false},
    {id: 'curr5', code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', exchangeRateToBase: 4000, isBaseCurrency: false},
];


export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [branches, setBranches] = useState<CompanyBranch[]>(mockBranches);
  const [currencies, setCurrencies] = useState<Currency[]>(mockCurrencies);
  const { toast } = useToast();

  const form = useForm<GeneralSettingsData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: { // Load these from an API or a settings service in a real app
      companyName: "شركة الوسيط برو (الافتراضية)",
      taxNumber: "",
      companyAddress: "غير محدد",
      companyPhone: "",
      companyEmail: "info@alwaseet.pro",
      baseCurrency: "SYP", // Syrian Pound as default
      enableEInvoice: true,
    },
  });
  
  // Simulate fetching settings on mount
  useEffect(() => {
    // In a real app, fetch settings from a service and use form.reset(fetchedData)
    console.log("Settings page mounted. Current form values:", form.getValues());
  }, [form]);

  const onSubmitGeneralSettings = async (data: GeneralSettingsData) => {
    console.log("Saving general settings:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // Update local state or re-fetch if using a real service
    form.reset(data); // Keep form updated with saved data
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم تحديث الإعدادات العامة للشركة.",
    });
  };


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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitGeneralSettings)}>
                <CardHeader>
                  <CardTitle>إعدادات الشركة العامة</CardTitle>
                  <CardDescription>تكوين معلومات الشركة الأساسية وتفضيلات النظام.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الشركة</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="taxNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الرقم الضريبي</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل الرقم الضريبي" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="baseCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العملة الأساسية للنظام</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر العملة الأساسية" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SYP">ليرة سورية (SYP)</SelectItem>
                              <SelectItem value="TRY">ليرة تركية (TRY)</SelectItem>
                              <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                              <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                              <SelectItem value="EUR">يورو (EUR)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="companyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان الشركة</FormLabel>
                        <FormControl>
                           <Input placeholder="شارع الأمير محمد، الرياض" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="companyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>هاتف الشركة</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+963..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني للشركة</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="info@alwaseet.pro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="enableEInvoice"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>تفعيل نظام الفوترة الإلكترونية</FormLabel>
                          <FormDescription>
                            (يعتمد على متطلبات بلدك وقوانين الضرائب)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    <Save className="ml-2 h-4 w-4"/>
                    {form.formState.isSubmitting ? "جاري الحفظ..." : "حفظ الإعدادات العامة"}
                  </Button>
                </CardContent>
              </form>
            </Form>
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
                        <TableCell className="text-left">{currency.isBaseCurrency ? "-" : currency.exchangeRateToBase.toFixed(currency.code === 'USD' || currency.code === 'EUR' ? 2 : 0)}</TableCell>
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
