
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Shield, Building2, Coins, Printer, Database, Edit, Trash2, PlusCircle, Filter, FileCog, Save, UserPlus, KeyRound } from "lucide-react"; // Added UserPlus, KeyRound
import React, { useState, useEffect, useCallback } from 'react';
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
import { GeneralSettings, getGeneralSettings, updateGeneralSettings, User, getUsers, addUser, updateUser, deleteUser, CompanyBranch, getBranches, addBranch, updateBranch, deleteBranch, Currency, getCurrencies, addCurrency, updateCurrency, deleteCurrency } from "@/lib/services/settings"; // Updated imports
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

const generalSettingsSchema = z.object({
  companyName: z.string().min(1, "اسم الشركة مطلوب"),
  taxNumber: z.string().optional(),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal('')),
  baseCurrency: z.string().min(1, "العملة الأساسية مطلوبة"),
  enableEInvoice: z.boolean().default(false),
});
type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

const userFormSchema = z.object({
  fullName: z.string().min(1, "الاسم الكامل مطلوب"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  role: z.enum(["مدير", "محاسب", "موظف مبيعات", "مراجع"], { required_error: "الدور مطلوب"}),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").optional(), // Optional for edit, required for new
  confirmPassword: z.string().optional(),
  isActive: z.boolean().default(true),
}).refine(data => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});
type UserFormData = z.infer<typeof userFormSchema>;

const branchFormSchema = z.object({
  name: z.string().min(1, "اسم الفرع مطلوب"),
  address: z.string().min(1, "العنوان مطلوب"),
  phone: z.string().optional(),
  isMain: z.boolean().default(false),
});
type BranchFormData = z.infer<typeof branchFormSchema>;

const currencyFormSchema = z.object({
    code: z.string().min(3, "رمز العملة يجب أن يكون 3 أحرف").max(3, "رمز العملة يجب أن يكون 3 أحرف"),
    name: z.string().min(1, "اسم العملة مطلوب"),
    symbol: z.string().min(1, "رمز العرض مطلوب"),
    exchangeRateToBase: z.coerce.number().min(0, "سعر الصرف لا يمكن أن يكون سالبًا"),
    isBaseCurrency: z.boolean().default(false),
});
type CurrencyFormData = z.infer<typeof currencyFormSchema>;


interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSave: () => void;
}

function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const { toast } = useToast();
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: "", username: "", email: "", role: "موظف مبيعات", isActive: true, password: "", confirmPassword: ""
    }
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        password: "", // Password should not be pre-filled for editing
        confirmPassword: "",
      });
    } else {
      form.reset({
        fullName: "", username: "", email: "", role: "موظف مبيعات", isActive: true, password: "", confirmPassword: ""
      });
    }
  }, [user, form, open]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (user) { // Editing existing user
        // For edit, password is only updated if provided
        const updateData: Partial<User> = { ...data };
        if (!data.password) {
          delete updateData.password; // Don't send empty password
        }
        await updateUser(user.id, updateData);
        toast({ title: "تم التحديث بنجاح", description: `تم تحديث بيانات المستخدم ${data.username}.` });
      } else { // Adding new user
        if (!data.password) {
            form.setError("password", { type: "manual", message: "كلمة المرور مطلوبة للمستخدم الجديد."});
            return;
        }
        await addUser(data as Omit<User, 'id' | 'lastLogin'>);
        toast({ title: "تمت الإضافة بنجاح", description: `تمت إضافة المستخدم ${data.username}.` });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "حدث خطأ", description: "لم يتم حفظ بيانات المستخدم." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{user ? `تعديل بيانات المستخدم: ${user.username}` : "إضافة مستخدم جديد"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField control={form.control} name="fullName" render={({ field }) => (
              <FormItem><FormLabel>الاسم الكامل</FormLabel><FormControl><Input placeholder="مثال: أحمد المحمد" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem><FormLabel>اسم المستخدم (للدخول)</FormLabel><FormControl><Input placeholder="مثال: user123" {...field} disabled={!!user} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem><FormLabel>الدور/الصلاحية</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="مدير">مدير</SelectItem>
                    <SelectItem value="محاسب">محاسب</SelectItem>
                    <SelectItem value="موظف مبيعات">موظف مبيعات</SelectItem>
                    <SelectItem value="مراجع">مراجع</SelectItem>
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>{user ? "كلمة المرور الجديدة (اختياري)" : "كلمة المرور"}</FormLabel><FormControl><Input type="password" placeholder="******" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>{user ? "تأكيد كلمة المرور الجديدة" : "تأكيد كلمة المرور"}</FormLabel><FormControl><Input type="password" placeholder="******" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
            <FormField control={form.control} name="isActive" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <FormLabel className="mb-0">حالة الحساب (نشط)</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}/>
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}><Save className="ml-2 h-4 w-4"/>{form.formState.isSubmitting ? "جاري الحفظ..." : (user ? "حفظ التعديلات" : "إضافة المستخدم")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: CompanyBranch | null;
  onSave: () => void;
}

function BranchDialog({ open, onOpenChange, branch, onSave }: BranchDialogProps) {
  const { toast } = useToast();
  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: { name: "", address: "", phone: "", isMain: false }
  });

  useEffect(() => {
    if (branch) form.reset(branch);
    else form.reset({ name: "", address: "", phone: "", isMain: false });
  }, [branch, form, open]);

  const onSubmit = async (data: BranchFormData) => {
    try {
      if (branch) {
        await updateBranch(branch.id, data);
        toast({ title: "تم التحديث بنجاح", description: `تم تحديث بيانات الفرع ${data.name}.` });
      } else {
        await addBranch(data);
        toast({ title: "تمت الإضافة بنجاح", description: `تمت إضافة الفرع ${data.name}.` });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "حدث خطأ", description: "لم يتم حفظ بيانات الفرع." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl"><DialogHeader><DialogTitle>{branch ? "تعديل فرع/مستودع" : "إضافة فرع/مستودع جديد"}</DialogTitle></DialogHeader>
        <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم الفرع/المستودع</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
          <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>العنوان</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
          <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>الهاتف (اختياري)</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)}/>
          <FormField control={form.control} name="isMain" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel className="mb-0">فرع رئيسي</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
          <DialogFooter className="pt-4"><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit"><Save className="ml-2 h-4 w-4"/>حفظ</Button></DialogFooter>
        </form></Form>
      </DialogContent>
    </Dialog>
  );
}

interface CurrencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency?: Currency | null;
  onSave: () => void;
}

function CurrencyDialog({ open, onOpenChange, currency, onSave }: CurrencyDialogProps) {
  const { toast } = useToast();
  const form = useForm<CurrencyFormData>({
    resolver: zodResolver(currencyFormSchema),
    defaultValues: { code: "", name: "", symbol: "", exchangeRateToBase: 1, isBaseCurrency: false }
  });

   useEffect(() => {
    if (currency) form.reset(currency);
    else form.reset({ code: "", name: "", symbol: "", exchangeRateToBase: 1, isBaseCurrency: false });
  }, [currency, form, open]);

  const onSubmit = async (data: CurrencyFormData) => {
    try {
      if (currency) {
        await updateCurrency(currency.id, data);
        toast({ title: "تم التحديث بنجاح", description: `تم تحديث بيانات العملة ${data.name}.` });
      } else {
        await addCurrency(data);
        toast({ title: "تمت الإضافة بنجاح", description: `تمت إضافة العملة ${data.name}.` });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "حدث خطأ", description: "لم يتم حفظ بيانات العملة." });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl"><DialogHeader><DialogTitle>{currency ? "تعديل عملة" : "إضافة عملة جديدة"}</DialogTitle></DialogHeader>
        <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>رمز العملة (ISO)</FormLabel><FormControl><Input placeholder="SYP" {...field} /></FormControl><FormMessage /></FormItem>)}/>
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم العملة</FormLabel><FormControl><Input placeholder="ليرة سورية" {...field} /></FormControl><FormMessage /></FormItem>)}/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="symbol" render={({ field }) => (<FormItem><FormLabel>الرمز (للعرض)</FormLabel><FormControl><Input placeholder="ل.س" {...field} /></FormControl><FormMessage /></FormItem>)}/>
            <FormField control={form.control} name="exchangeRateToBase" render={({ field }) => (<FormItem><FormLabel>سعر الصرف للعملة الأساسية</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>)}/>
          </div>
          <FormField control={form.control} name="isBaseCurrency" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel className="mb-0">عملة أساسية</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
          <DialogFooter className="pt-4"><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit"><Save className="ml-2 h-4 w-4"/>حفظ</Button></DialogFooter>
        </form></Form>
      </DialogContent>
    </Dialog>
  );
}


export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<CompanyBranch | null>(null);
  const [isCurrencyDialogOpen, setIsCurrencyDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);


  const generalSettingsForm = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: async () => {
        const settings = await getGeneralSettings();
        return settings;
    }
  });

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [settingsData, usersData, branchesData, currenciesData] = await Promise.all([
            getGeneralSettings(),
            getUsers(),
            getBranches(),
            getCurrencies()
        ]);
        generalSettingsForm.reset(settingsData);
        setUsers(usersData);
        setBranches(branchesData);
        setCurrencies(currenciesData);
    } catch (error) {
        toast({variant: "destructive", title: "خطأ", description: "فشل تحميل بيانات الإعدادات."});
    } finally {
        setIsLoading(false);
    }
  }, [generalSettingsForm, toast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);


  const onSubmitGeneralSettings = async (data: GeneralSettingsFormData) => {
    try {
        await updateGeneralSettings(data);
        toast({ title: "تم الحفظ بنجاح", description: "تم تحديث الإعدادات العامة للشركة."});
        fetchAllData(); // Refresh all data as base currency might affect others
    } catch (error) {
        toast({variant: "destructive", title: "خطأ", description: "لم يتم حفظ الإعدادات العامة."});
    }
  };

  // User management handlers
  const handleOpenAddUserDialog = () => { setEditingUser(null); setIsUserDialogOpen(true); };
  const handleEditUser = (user: User) => { setEditingUser(user); setIsUserDialogOpen(true); };
  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المستخدم ${username}؟`)) {
      try {
        await deleteUser(userId);
        toast({ title: "تم الحذف", description: `تم حذف المستخدم ${username}.` });
        fetchAllData();
      } catch (error) {
        toast({ variant: "destructive", title: "خطأ في الحذف" });
      }
    }
  };
  
  // Branch management handlers
  const handleOpenAddBranchDialog = () => { setEditingBranch(null); setIsBranchDialogOpen(true); };
  const handleEditBranch = (branch: CompanyBranch) => { setEditingBranch(branch); setIsBranchDialogOpen(true); };
  const handleDeleteBranch = async (branchId: string, branchName: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الفرع ${branchName}؟`)) {
      try {
        await deleteBranch(branchId);
        toast({ title: "تم الحذف", description: `تم حذف الفرع ${branchName}.` });
        fetchAllData();
      } catch (error) {
        toast({ variant: "destructive", title: "خطأ في الحذف" });
      }
    }
  };

  // Currency management handlers
  const handleOpenAddCurrencyDialog = () => { setEditingCurrency(null); setIsCurrencyDialogOpen(true); };
  const handleEditCurrency = (currency: Currency) => { setEditingCurrency(currency); setIsCurrencyDialogOpen(true); };
  const handleDeleteCurrency = async (currencyId: string, currencyName: string) => {
     if (window.confirm(`هل أنت متأكد من حذف العملة ${currencyName}؟`)) {
      try {
        await deleteCurrency(currencyId);
        toast({ title: "تم الحذف", description: `تم حذف العملة ${currencyName}.` });
        fetchAllData();
      } catch (error) {
        toast({ variant: "destructive", title: "خطأ في الحذف" });
      }
    }
  };


  if (isLoading) {
      return <div className="p-6">جاري تحميل إعدادات النظام...</div>
  }

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
            <Form {...generalSettingsForm}>
              <form onSubmit={generalSettingsForm.handleSubmit(onSubmitGeneralSettings)}>
                <CardHeader>
                  <CardTitle>إعدادات الشركة العامة</CardTitle>
                  <CardDescription>تكوين معلومات الشركة الأساسية وتفضيلات النظام.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField control={generalSettingsForm.control} name="companyName" render={({ field }) => (<FormItem><FormLabel>اسم الشركة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={generalSettingsForm.control} name="taxNumber" render={({ field }) => (<FormItem><FormLabel>الرقم الضريبي</FormLabel><FormControl><Input placeholder="أدخل الرقم الضريبي" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={generalSettingsForm.control} name="baseCurrency" render={({ field }) => (
                        <FormItem><FormLabel>العملة الأساسية للنظام</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {currencies.filter(c => c.isBaseCurrency || c.code === 'SYP' || c.code === 'USD' || c.code === 'EUR' || c.code === 'TRY' || c.code === 'SAR').map(c => <SelectItem key={c.id} value={c.code}>{c.name} ({c.code})</SelectItem>)}
                              {/* Fallback options if currencies list is empty or SYP is not there */}
                                {!currencies.some(c => c.code === 'SYP') && <SelectItem value="SYP">ليرة سورية (SYP)</SelectItem>}
                                {!currencies.some(c => c.code === 'TRY') && <SelectItem value="TRY">ليرة تركية (TRY)</SelectItem>}
                                {!currencies.some(c => c.code === 'SAR') && <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>}
                                {!currencies.some(c => c.code === 'USD') && <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>}
                                {!currencies.some(c => c.code === 'EUR') && <SelectItem value="EUR">يورو (EUR)</SelectItem>}
                            </SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                    )}/>
                  </div>
                  <FormField control={generalSettingsForm.control} name="companyAddress" render={({ field }) => (<FormItem><FormLabel>عنوان الشركة</FormLabel><FormControl><Input placeholder="شارع الأمير محمد، الرياض" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={generalSettingsForm.control} name="companyPhone" render={({ field }) => (<FormItem><FormLabel>هاتف الشركة</FormLabel><FormControl><Input type="tel" placeholder="+963..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={generalSettingsForm.control} name="companyEmail" render={({ field }) => (<FormItem><FormLabel>البريد الإلكتروني للشركة</FormLabel><FormControl><Input type="email" placeholder="info@alwaseet.pro" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  </div>
                  <FormField control={generalSettingsForm.control} name="enableEInvoice" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5"><FormLabel>تفعيل نظام الفوترة الإلكترونية</FormLabel><FormDescription>(يعتمد على متطلبات بلدك وقوانين الضرائب)</FormDescription></div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                      </FormItem>
                  )}/>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={generalSettingsForm.formState.isSubmitting}><Save className="ml-2 h-4 w-4"/>{generalSettingsForm.formState.isSubmitting ? "جاري الحفظ..." : "حفظ الإعدادات العامة"}</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>إدارة المستخدمين والصلاحيات</CardTitle>
                  <CardDescription>تحكم في وصول المستخدمين إلى أجزاء مختلفة من النظام.</CardDescription>
                </div>
                <Button onClick={handleOpenAddUserDialog}><UserPlus className="ml-2 h-4 w-4" /> إضافة مستخدم جديد</Button>
              </div>
               <div className="flex items-center gap-2 pt-4">
                <Input placeholder="ابحث عن مستخدم..." className="max-w-sm" /> {/* TODO: Implement search */}
                <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button>
              </div>
            </CardHeader>
            <CardContent>
              {users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم الكامل</TableHead>
                      <TableHead>اسم المستخدم</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>الدور/الصلاحية</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                      <TableHead>آخر تسجيل دخول</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                        <TableCell className="text-center">{user.isActive ? <Badge variant="default">نشط</Badge> : <Badge variant="outline">غير نشط</Badge>}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.lastLogin || "لم يسجل دخول بعد"}</TableCell>
                        <TableCell className="text-center space-x-1">
                           <Button variant="ghost" size="icon" title="تعديل المستخدم" onClick={() => handleEditUser(user)}><Edit className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" title="إعادة تعيين كلمة المرور" ><KeyRound className="h-4 w-4 text-orange-500" /></Button>
                           <Button variant="ghost" size="icon" title={user.isActive ? "تعطيل المستخدم" : "تفعيل المستخدم"} 
                                   className={user.isActive ? "text-destructive hover:text-destructive" : "text-green-600 hover:text-green-600"}
                                   onClick={() => updateUser(user.id, { isActive: !user.isActive }).then(fetchAllData).catch(() => toast({variant: "destructive", title:"خطأ"}))}>
                                {user.isActive ? <Trash2 className="h-4 w-4" /> : <Shield className="h-4 w-4"/> }
                           </Button>
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
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>إدارة الفروع والمستودعات</CardTitle>
                        <CardDescription>إضافة وتعديل معلومات الفروع والمستودعات التابعة للمؤسسة.</CardDescription>
                    </div>
                    <Button onClick={handleOpenAddBranchDialog}><PlusCircle className="ml-2 h-4 w-4" /> إضافة فرع/مستودع</Button>
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
                      <TableHead className="text-center">هل هو رئيسي؟</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell>{branch.address}</TableCell>
                        <TableCell>{branch.phone || "-"}</TableCell>
                        <TableCell className="text-center">{branch.isMain ? <Badge>رئيسي</Badge> : "لا"}</TableCell>
                        <TableCell className="text-center space-x-1">
                           <Button variant="ghost" size="icon" title="تعديل" onClick={() => handleEditBranch(branch)}><Edit className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" title="حذف" className="text-destructive hover:text-destructive" onClick={() => handleDeleteBranch(branch.id, branch.name)} disabled={branch.isMain}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg">لا توجد فروع أو مستودعات مضافة حاليًا.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="currencies">
          <Card className="shadow-lg">
            <CardHeader>
                 <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>إدارة العملات وأسعار الصرف</CardTitle>
                        <CardDescription>تحديد العملات المستخدمة في النظام وتحديث أسعار صرفها.</CardDescription>
                    </div>
                    <Button onClick={handleOpenAddCurrencyDialog}><PlusCircle className="ml-2 h-4 w-4" /> إضافة عملة جديدة</Button>
                </div>
            </CardHeader>
            <CardContent>
              {currencies.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رمز العملة</TableHead>
                      <TableHead>اسم العملة</TableHead>
                      <TableHead>الرمز (للعرض)</TableHead>
                      <TableHead className="text-left">سعر الصرف (مقابل العملة الأساسية)</TableHead>
                       <TableHead className="text-center">هل هي أساسية؟</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencies.map((currency) => (
                      <TableRow key={currency.id}>
                        <TableCell className="font-medium">{currency.code}</TableCell>
                        <TableCell>{currency.name}</TableCell>
                        <TableCell>{currency.symbol}</TableCell>
                        <TableCell className="text-left">{currency.isBaseCurrency ? "-" : currency.exchangeRateToBase.toFixed(2)}</TableCell>
                        <TableCell className="text-center">{currency.isBaseCurrency ? <Badge>أساسية</Badge> : "لا"}</TableCell>
                        <TableCell className="text-center space-x-1">
                           <Button variant="ghost" size="icon" title="تعديل" onClick={() => handleEditCurrency(currency)}><Edit className="h-4 w-4" /></Button>
                           {!currency.isBaseCurrency && <Button variant="ghost" size="icon" title="حذف العملة" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCurrency(currency.id, currency.name)}><Trash2 className="h-4 w-4" /></Button>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                    <Coins className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg">لا توجد عملات مضافة حاليًا.</p>
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
      
      <UserDialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen} user={editingUser} onSave={fetchAllData} />
      <BranchDialog open={isBranchDialogOpen} onOpenChange={setIsBranchDialogOpen} branch={editingBranch} onSave={fetchAllData} />
      <CurrencyDialog open={isCurrencyDialogOpen} onOpenChange={setIsCurrencyDialogOpen} currency={editingCurrency} onSave={fetchAllData} />
    </>
  );
}

    