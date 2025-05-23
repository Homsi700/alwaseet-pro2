
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Shield, Building2, Coins, Printer, Database, Edit, Trash2, PlusCircle, Filter, FileCog, Save, UserPlus, KeyRound, Percent, Palette, Cog, Tag, Ruler } from "lucide-react"; 
import React, { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { GeneralSettings, getGeneralSettings, updateGeneralSettings, User, getUsers, addUser, updateUser, deleteUser as deleteUserService, CompanyBranch, getBranches, addBranch, updateBranch, deleteBranch as deleteBranchService, Currency, getCurrencies, addCurrency, updateCurrency, deleteCurrency as deleteCurrencyService, Tax, Discount, getTaxes, addTax, updateTax, deleteTax as deleteTaxService, getDiscounts, addDiscount, updateDiscount, deleteDiscount as deleteDiscountService, UnitOfMeasure, getUnitsOfMeasure, addUnitOfMeasure, updateUnitOfMeasure, deleteUnitOfMeasure, ProductCategory, getProductCategories, addProductCategory, updateProductCategory, deleteProductCategory } from "@/lib/services/settings";

// Zod Schemas
const generalSettingsSchema = z.object({
  companyName: z.string().min(1, "اسم الشركة مطلوب"), taxNumber: z.string().optional(),
  companyAddress: z.string().optional(), companyPhone: z.string().optional(),
  companyEmail: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal('')),
  baseCurrency: z.string().min(1, "العملة الأساسية مطلوبة"), enableEInvoice: z.boolean().default(false),
});
type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

const userFormSchema = z.object({
  fullName: z.string().min(1, "الاسم الكامل مطلوب"), username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  email: z.string().email("بريد إلكتروني غير صالح"), role: z.enum(["مدير", "محاسب", "موظف مبيعات", "مراجع"], { required_error: "الدور مطلوب"}),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").optional(), confirmPassword: z.string().optional(),
  isActive: z.boolean().default(true),
}).refine(data => { if (data.password && data.password !== data.confirmPassword) return false; return true; }, { message: "كلمتا المرور غير متطابقتين", path: ["confirmPassword"]});
type UserFormData = z.infer<typeof userFormSchema>;

const branchFormSchema = z.object({ name: z.string().min(1, "اسم الفرع مطلوب"), address: z.string().min(1, "العنوان مطلوب"), phone: z.string().optional(), isMain: z.boolean().default(false) });
type BranchFormData = z.infer<typeof branchFormSchema>;

const currencyFormSchema = z.object({ code: z.string().min(3, "3 أحرف").max(3, "3 أحرف"), name: z.string().min(1, "الاسم مطلوب"), symbol: z.string().min(1, "الرمز مطلوب"), exchangeRateToBase: z.coerce.number().min(0, "سعر الصرف موجب"), isBaseCurrency: z.boolean().default(false) });
type CurrencyFormData = z.infer<typeof currencyFormSchema>;

const taxFormSchema = z.object({ name: z.string().min(1, "اسم الضريبة مطلوب"), rate: z.coerce.number().min(0).max(100, "النسبة بين 0 و 100"), isDefault: z.boolean().default(false) });
type TaxFormData = z.infer<typeof taxFormSchema>;

const discountFormSchema = z.object({ name: z.string().min(1, "اسم الخصم مطلوب"), rate: z.coerce.number().min(0).max(100, "النسبة بين 0 و 100").optional(), amount: z.coerce.number().min(0, "المبلغ موجب").optional(), type: z.enum(["percentage", "fixed"], {required_error: "نوع الخصم مطلوب"}), isDefault: z.boolean().default(false) })
.refine(data => data.type === 'percentage' ? data.rate !== undefined : data.amount !== undefined, { message: "يجب تحديد نسبة للخصم المئوي أو مبلغ للخصم الثابت", path: ["rate"] });
type DiscountFormData = z.infer<typeof discountFormSchema>;

const unitOfMeasureFormSchema = z.object({ name: z.string().min(1, "اسم الوحدة مطلوب"), symbol: z.string().min(1, "رمز الوحدة مطلوب"), isBaseUnit: z.boolean().default(false) });
type UnitOfMeasureFormData = z.infer<typeof unitOfMeasureFormSchema>;

const productCategoryFormSchema = z.object({ name: z.string().min(1, "اسم الفئة مطلوب"), parentCategoryId: z.string().optional() });
type ProductCategoryFormData = z.infer<typeof productCategoryFormSchema>;


// Dialog Components (simplified for brevity, expand as needed)
interface UserDialogProps { open: boolean; onOpenChange: (open: boolean) => void; user?: User | null; onSave: () => void; }
function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) { /* ... (Implementation from previous step, ensure it's complete) ... */ 
  const { toast } = useToast();
  const form = useForm<UserFormData>({ resolver: zodResolver(userFormSchema), defaultValues: { fullName: "", username: "", email: "", role: "موظف مبيعات", isActive: true, password: "", confirmPassword: "" }});
  useEffect(() => {
    if (user) form.reset({ fullName: user.fullName, username: user.username, email: user.email, role: user.role, isActive: user.isActive, password: "", confirmPassword: "" });
    else form.reset({ fullName: "", username: "", email: "", role: "موظف مبيعات", isActive: true, password: "", confirmPassword: "" });
  }, [user, form, open]);
  const onSubmit = async (data: UserFormData) => {
    try {
      if (user) { const updateData: Partial<User> = { ...data }; if (!data.password) delete updateData.password; await updateUser(user.id, updateData); toast({ title: "تم التحديث" }); }
      else { if (!data.password) { form.setError("password", { type: "manual", message: "كلمة المرور مطلوبة للمستخدم الجديد."}); return; } await addUser(data as Omit<User, 'id' | 'lastLogin'>); toast({ title: "تمت الإضافة" }); }
      onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "خطأ", description: (error as Error).message }); }
  };
  return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
    <DialogHeader><DialogTitle>{user ? `تعديل: ${user.username}` : "إضافة مستخدم"}</DialogTitle></DialogHeader>
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
      <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>الاسم الكامل</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <div className="grid md:grid-cols-2 gap-4">
      <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>اسم المستخدم</FormLabel><FormControl><Input {...field} disabled={!!user} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>البريد</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      </div>
      <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>الدور</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
        <SelectContent><SelectItem value="مدير">مدير</SelectItem><SelectItem value="محاسب">محاسب</SelectItem><SelectItem value="موظف مبيعات">موظف مبيعات</SelectItem><SelectItem value="مراجع">مراجع</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/>
      <div className="grid md:grid-cols-2 gap-4">
      <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>{user ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور"}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>{user ? "تأكيد كلمة المرور" : "تأكيد"}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      </div>
      <FormField control={form.control} name="isActive" render={({ field }) => (<FormItem className="flex items-center gap-2 pt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">حساب نشط</FormLabel></FormItem>)}/>
      <DialogFooter className="pt-4"><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit"><Save className="ml-2 h-4 w-4"/>حفظ</Button></DialogFooter>
    </form></Form></DialogContent></Dialog>);
}

interface BranchDialogProps { open: boolean; onOpenChange: (open: boolean) => void; branch?: CompanyBranch | null; onSave: () => void; }
function BranchDialog({ open, onOpenChange, branch, onSave }: BranchDialogProps) { /* ... (Implementation from previous step) ... */ 
  const { toast } = useToast();
  const form = useForm<BranchFormData>({ resolver: zodResolver(branchFormSchema), defaultValues: { name: "", address: "", phone: "", isMain: false }});
  useEffect(() => { if (branch) form.reset(branch); else form.reset({ name: "", address: "", phone: "", isMain: false }); }, [branch, form, open]);
  const onSubmit = async (data: BranchFormData) => {
    try { if (branch) { await updateBranch(branch.id, data); toast({ title: "تم التحديث" }); } else { await addBranch(data); toast({ title: "تمت الإضافة" }); } onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "خطأ", description: (error as Error).message }); }
  };
  return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{branch ? "تعديل فرع" : "إضافة فرع"}</DialogTitle></DialogHeader>
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم الفرع/المستودع</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>العنوان</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>الهاتف</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="isMain" render={({ field }) => (<FormItem className="flex items-center gap-2 pt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">فرع رئيسي</FormLabel></FormItem>)}/>
      <DialogFooter className="pt-4"><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit"><Save className="ml-2 h-4 w-4"/>حفظ</Button></DialogFooter>
    </form></Form></DialogContent></Dialog>);
}

interface CurrencyDialogProps { open: boolean; onOpenChange: (open: boolean) => void; currency?: Currency | null; onSave: () => void; }
function CurrencyDialog({ open, onOpenChange, currency, onSave }: CurrencyDialogProps) { /* ... (Implementation from previous step) ... */ 
  const { toast } = useToast();
  const form = useForm<CurrencyFormData>({ resolver: zodResolver(currencyFormSchema), defaultValues: { code: "", name: "", symbol: "", exchangeRateToBase: 1, isBaseCurrency: false }});
  useEffect(() => { if (currency) form.reset(currency); else form.reset({ code: "", name: "", symbol: "", exchangeRateToBase: 1, isBaseCurrency: false }); }, [currency, form, open]);
  const onSubmit = async (data: CurrencyFormData) => {
    try { if (currency) { await updateCurrency(currency.id, data); toast({ title: "تم التحديث" }); } else { await addCurrency(data); toast({ title: "تمت الإضافة" }); } onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "خطأ", description: (error as Error).message }); }
  };
  return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{currency ? "تعديل عملة" : "إضافة عملة"}</DialogTitle></DialogHeader>
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
      <div className="grid md:grid-cols-2 gap-4">
      <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>رمز العملة (ISO)</FormLabel><FormControl><Input placeholder="SYP" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم العملة</FormLabel><FormControl><Input placeholder="ليرة سورية" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      </div><div className="grid md:grid-cols-2 gap-4">
      <FormField control={form.control} name="symbol" render={({ field }) => (<FormItem><FormLabel>الرمز (للعرض)</FormLabel><FormControl><Input placeholder="ل.س" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="exchangeRateToBase" render={({ field }) => (<FormItem><FormLabel>سعر الصرف للعملة الأساسية</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      </div>
      <FormField control={form.control} name="isBaseCurrency" render={({ field }) => (<FormItem className="flex items-center gap-2 pt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">عملة أساسية</FormLabel></FormItem>)}/>
      <DialogFooter className="pt-4"><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit"><Save className="ml-2 h-4 w-4"/>حفظ</Button></DialogFooter>
    </form></Form></DialogContent></Dialog>);
}

interface TaxDialogProps { open: boolean; onOpenChange: (open: boolean) => void; tax?: Tax | null; onSave: () => void; }
function TaxDialog({ open, onOpenChange, tax, onSave }: TaxDialogProps) {
  const { toast } = useToast();
  const form = useForm<TaxFormData>({ resolver: zodResolver(taxFormSchema), defaultValues: tax || { name: "", rate: 0, isDefault: false }});
  useEffect(() => { if (open) form.reset(tax || { name: "", rate: 0, isDefault: false }); }, [tax, form, open]);
  const onSubmit = async (data: TaxFormData) => {
    try { if (tax) { await updateTax(tax.id, data); toast({ title: "تم تحديث الضريبة" }); } else { await addTax(data); toast({ title: "تمت إضافة الضريبة" }); } onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "خطأ", description: (error as Error).message }); }
  };
  return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{tax ? "تعديل ضريبة" : "إضافة ضريبة"}</DialogTitle></DialogHeader>
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم الضريبة</FormLabel><FormControl><Input placeholder="ضريبة القيمة المضافة" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="rate" render={({ field }) => (<FormItem><FormLabel>النسبة المئوية (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="15" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="isDefault" render={({ field }) => (<FormItem className="flex items-center gap-2 pt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">ضريبة افتراضية؟</FormLabel></FormItem>)}/>
      <DialogFooter><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit"><Percent className="ml-2 h-4 w-4"/>حفظ</Button></DialogFooter>
    </form></Form></DialogContent></Dialog>);
}
// Add similar Dialogs for Discount, UnitOfMeasure, ProductCategory as needed

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false); const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false); const [editingBranch, setEditingBranch] = useState<CompanyBranch | null>(null);
  const [isCurrencyDialogOpen, setIsCurrencyDialogOpen] = useState(false); const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [isTaxDialogOpen, setIsTaxDialogOpen] = useState(false); const [editingTax, setEditingTax] = useState<Tax | null>(null);
  // Add states for other dialogs: Discount, Unit, Category

  const generalSettingsForm = useForm<GeneralSettingsFormData>({ resolver: zodResolver(generalSettingsSchema) });

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [settingsData, usersData, branchesData, currenciesData, taxesData, discountsData, unitsData, categoriesData] = await Promise.all([
        getGeneralSettings(), getUsers(), getBranches(), getCurrencies(), getTaxes(), getDiscounts(), getUnitsOfMeasure(), getProductCategories()
      ]);
      setGeneralSettings(settingsData); generalSettingsForm.reset(settingsData);
      setUsers(usersData); setBranches(branchesData); setCurrencies(currenciesData);
      setTaxes(taxesData); setDiscounts(discountsData); setUnits(unitsData); setCategories(categoriesData);
    } catch (error) { toast({variant: "destructive", title: "خطأ", description: "فشل تحميل بيانات الإعدادات."}); }
    setIsLoading(false);
  }, [generalSettingsForm, toast]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const onSubmitGeneralSettings = async (data: GeneralSettingsFormData) => {
    try { await updateGeneralSettings(data); toast({ title: "تم حفظ الإعدادات العامة"}); fetchAllData(); }
    catch (error) { toast({variant: "destructive", title: "خطأ", description: (error as Error).message});}
  };

  const handleDelete = async (type: "user" | "branch" | "currency" | "tax" | "discount" | "unit" | "category", id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف "${name}"؟`)) {
      try {
        if (type === "user") await deleteUserService(id);
        else if (type === "branch") await deleteBranchService(id);
        else if (type === "currency") await deleteCurrencyService(id);
        else if (type === "tax") await deleteTaxService(id);
        // Add delete for discount, unit, category
        toast({ title: "تم الحذف" }); fetchAllData();
      } catch (error) { toast({ variant: "destructive", title: "خطأ في الحذف", description: (error as Error).message}); }
    }
  };
  
  const openDialog = (type: "user"|"branch"|"currency"|"tax", item?: any) => {
      if(type==="user") { setEditingUser(item); setIsUserDialogOpen(true); }
      if(type==="branch") { setEditingBranch(item); setIsBranchDialogOpen(true); }
      if(type==="currency") { setEditingCurrency(item); setIsCurrencyDialogOpen(true); }
      if(type==="tax") { setEditingTax(item); setIsTaxDialogOpen(true); }
  }

  if (isLoading) return <div className="p-6">جاري تحميل إعدادات النظام...</div>

  return (
    <>
      <PageHeader title="إعدادات النظام والتخصيص" description="إدارة إعدادات الشركة، المستخدمين، الفروع، العملات، الضرائب، والمزيد."/>
      <Tabs defaultValue="general" dir="rtl" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-4">
          <TabsTrigger value="general" className="text-sm py-2 flex items-center gap-1"><FileCog className="h-4 w-4"/>عامة</TabsTrigger>
          <TabsTrigger value="users" className="text-sm py-2 flex items-center gap-1"><Users className="h-4 w-4"/>المستخدمون</TabsTrigger>
          <TabsTrigger value="branches" className="text-sm py-2 flex items-center gap-1"><Building2 className="h-4 w-4"/>الفروع</TabsTrigger>
          <TabsTrigger value="currencies" className="text-sm py-2 flex items-center gap-1"><Coins className="h-4 w-4"/>العملات</TabsTrigger>
          <TabsTrigger value="taxes" className="text-sm py-2 flex items-center gap-1"><Percent className="h-4 w-4"/>الضرائب والخصومات</TabsTrigger>
          <TabsTrigger value="inventory_settings" className="text-sm py-2 flex items-center gap-1"><Cog className="h-4 w-4"/>المخزون</TabsTrigger>
          <TabsTrigger value="print_settings" className="text-sm py-2 flex items-center gap-1"><Printer className="h-4 w-4"/>الطباعة</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="shadow-lg">
            <Form {...generalSettingsForm}> <form onSubmit={generalSettingsForm.handleSubmit(onSubmitGeneralSettings)}>
              <CardHeader><CardTitle>إعدادات الشركة العامة</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <FormField control={generalSettingsForm.control} name="companyName" render={({ field }) => (<FormItem><FormLabel>اسم الشركة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={generalSettingsForm.control} name="taxNumber" render={({ field }) => (<FormItem><FormLabel>الرقم الضريبي</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={generalSettingsForm.control} name="baseCurrency" render={({ field }) => (<FormItem><FormLabel>العملة الأساسية</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} dir="rtl" disabled={!currencies.length}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{currencies.map(c => <SelectItem key={c.id} value={c.code}>{c.name} ({c.code})</SelectItem>)}
                        {!currencies.some(c => c.code === 'SYP') && <SelectItem value="SYP">ليرة سورية (SYP)</SelectItem>}
                      </SelectContent></Select><FormMessage /></FormItem>)}/>
                </div>
                <FormField control={generalSettingsForm.control} name="companyAddress" render={({ field }) => (<FormItem><FormLabel>عنوان الشركة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={generalSettingsForm.control} name="companyPhone" render={({ field }) => (<FormItem><FormLabel>هاتف الشركة</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={generalSettingsForm.control} name="companyEmail" render={({ field }) => (<FormItem><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                </div>
                <FormField control={generalSettingsForm.control} name="enableEInvoice" render={({ field }) => (<FormItem className="flex items-center gap-2 pt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl><FormLabel className="!mt-0">تفعيل الفوترة الإلكترونية</FormLabel></FormItem>)}/>
              </CardContent>
              <CardFooter><Button type="submit" disabled={generalSettingsForm.formState.isSubmitting}><Save className="ml-2 h-4 w-4"/>حفظ الإعدادات</Button></CardFooter>
            </form></Form>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="shadow-lg"><CardHeader><div className="flex justify-between items-center">
            <div><CardTitle>إدارة المستخدمين والصلاحيات</CardTitle></div><Button onClick={() => openDialog("user")}><UserPlus className="ml-2 h-4 w-4"/>إضافة مستخدم</Button></div></CardHeader>
            <CardContent>{users.length > 0 ? (<Table><TableHeader><TableRow>
              <TableHead>الاسم الكامل</TableHead><TableHead>اسم المستخدم</TableHead><TableHead>البريد</TableHead><TableHead>الدور</TableHead><TableHead>الحالة</TableHead><TableHead>الإجراءات</TableHead></TableRow></TableHeader>
              <TableBody>{users.map((user) => (<TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell><TableCell>{user.username}</TableCell><TableCell>{user.email}</TableCell>
                <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                <TableCell><Badge variant={user.isActive ? "default" : "outline"}>{user.isActive ? "نشط" : "معطل"}</Badge></TableCell>
                <TableCell className="space-x-1">
                  <Button variant="ghost" size="icon" title="تعديل" onClick={() => openDialog("user", user)}><Edit className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" title="حذف" className="text-destructive" onClick={()=> handleDelete("user", user.id, user.username)}><Trash2 className="h-4 w-4"/></Button>
                </TableCell></TableRow>))}</TableBody></Table>) 
              : (<div className="text-center py-10"><Users className="mx-auto h-12 w-12 text-muted-foreground mb-2"/><p>لا يوجد مستخدمون.</p></div>)}
            </CardContent></Card>
        </TabsContent>
        <TabsContent value="branches">
          <Card className="shadow-lg"><CardHeader><div className="flex justify-between items-center">
            <div><CardTitle>الفروع والمستودعات</CardTitle></div><Button onClick={() => openDialog("branch")}><PlusCircle className="ml-2 h-4 w-4"/>إضافة فرع</Button></div></CardHeader>
            <CardContent>{branches.length > 0 ? (<Table><TableHeader><TableRow>
              <TableHead>الاسم</TableHead><TableHead>العنوان</TableHead><TableHead>الهاتف</TableHead><TableHead>رئيسي؟</TableHead><TableHead>الإجراءات</TableHead></TableRow></TableHeader>
              <TableBody>{branches.map((branch) => (<TableRow key={branch.id}>
                <TableCell>{branch.name}</TableCell><TableCell>{branch.address}</TableCell><TableCell>{branch.phone || "-"}</TableCell>
                <TableCell>{branch.isMain ? <Badge>نعم</Badge> : "لا"}</TableCell>
                <TableCell className="space-x-1">
                  <Button variant="ghost" size="icon" title="تعديل" onClick={() => openDialog("branch", branch)}><Edit className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" title="حذف" className="text-destructive" onClick={()=> handleDelete("branch", branch.id, branch.name)} disabled={branch.isMain}><Trash2 className="h-4 w-4"/></Button>
                </TableCell></TableRow>))}</TableBody></Table>) 
              : (<div className="text-center py-10"><Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2"/><p>لا توجد فروع.</p></div>)}
            </CardContent></Card>
        </TabsContent>
        <TabsContent value="currencies">
          <Card className="shadow-lg"><CardHeader><div className="flex justify-between items-center">
            <div><CardTitle>العملات وأسعار الصرف</CardTitle></div><Button onClick={() => openDialog("currency")}><PlusCircle className="ml-2 h-4 w-4"/>إضافة عملة</Button></div></CardHeader>
            <CardContent>{currencies.length > 0 ? (<Table><TableHeader><TableRow>
              <TableHead>الرمز</TableHead><TableHead>الاسم</TableHead><TableHead>العلامة</TableHead><TableHead>سعر الصرف</TableHead><TableHead>أساسية؟</TableHead><TableHead>الإجراءات</TableHead></TableRow></TableHeader>
              <TableBody>{currencies.map((currency) => (<TableRow key={currency.id}>
                <TableCell>{currency.code}</TableCell><TableCell>{currency.name}</TableCell><TableCell>{currency.symbol}</TableCell>
                <TableCell>{currency.isBaseCurrency ? "-" : currency.exchangeRateToBase.toFixed(4)}</TableCell>
                <TableCell>{currency.isBaseCurrency ? <Badge>نعم</Badge> : "لا"}</TableCell>
                <TableCell className="space-x-1">
                  <Button variant="ghost" size="icon" title="تعديل" onClick={() => openDialog("currency", currency)}><Edit className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" title="حذف" className="text-destructive" onClick={()=> handleDelete("currency", currency.id, currency.name)} disabled={currency.isBaseCurrency}><Trash2 className="h-4 w-4"/></Button>
                </TableCell></TableRow>))}</TableBody></Table>) 
              : (<div className="text-center py-10"><Coins className="mx-auto h-12 w-12 text-muted-foreground mb-2"/><p>لا توجد عملات.</p></div>)}
            </CardContent></Card>
        </TabsContent>
        <TabsContent value="taxes">
            <Card className="shadow-lg">
                <CardHeader><div className="flex justify-between items-center"><div><CardTitle>إعدادات الضرائب والخصومات</CardTitle></div>
                <div className="flex gap-2"><Button onClick={() => openDialog("tax")}><Percent className="ml-2 h-4 w-4"/>إضافة ضريبة</Button> {/* <Button onClick={() => {}}>إضافة خصم</Button> */}</div></div></CardHeader>
                <CardContent>
                    <h3 className="text-lg font-semibold mb-2">الضرائب المسجلة</h3>
                    {taxes.length > 0 ? (<Table><TableHeader><TableRow><TableHead>اسم الضريبة</TableHead><TableHead>النسبة (%)</TableHead><TableHead>افتراضية؟</TableHead><TableHead>الإجراءات</TableHead></TableRow></TableHeader>
                        <TableBody>{taxes.map(tax => (<TableRow key={tax.id}>
                            <TableCell>{tax.name}</TableCell><TableCell>{tax.rate.toFixed(2)}%</TableCell>
                            <TableCell>{tax.isDefault ? <Badge>نعم</Badge> : "لا"}</TableCell>
                            <TableCell className="space-x-1"><Button variant="ghost" size="icon" title="تعديل" onClick={() => openDialog("tax", tax)}><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" title="حذف" className="text-destructive" onClick={()=> handleDelete("tax", tax.id, tax.name)}><Trash2 className="h-4 w-4"/></Button></TableCell>
                        </TableRow>))}</TableBody></Table>)
                    : (<div className="text-center py-6 border rounded-md"><Percent className="mx-auto h-10 w-10 text-muted-foreground mb-2"/><p>لا توجد ضرائب مسجلة.</p></div>)}
                    {/* Add Discount Management UI here later */}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="inventory_settings">
             <Card className="shadow-lg"><CardHeader><CardTitle>إعدادات المخزون المتقدمة</CardTitle></CardHeader>
             <CardContent className="space-y-6">
                <div><h3 className="text-lg font-semibold mb-2">وحدات القياس</h3><Button variant="outline" size="sm"><Ruler className="ml-2 h-4 w-4"/>إدارة وحدات القياس</Button></div>
                <div><h3 className="text-lg font-semibold mb-2">فئات المنتجات</h3><Button variant="outline" size="sm"><Tag className="ml-2 h-4 w-4"/>إدارة فئات المنتجات</Button></div>
                {/* Warehouse management might be covered by Branches or be separate */}
             </CardContent></Card>
        </TabsContent>
        <TabsContent value="print_settings">
            <Card className="shadow-lg"><CardHeader><CardTitle>إعدادات الطباعة</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">سيتم هنا تخصيص قوالب طباعة الفواتير والإيصالات (قيد التطوير).</p></CardContent></Card>
        </TabsContent>
      </Tabs>
      
      {isUserDialogOpen && <UserDialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen} user={editingUser} onSave={fetchAllData} />}
      {isBranchDialogOpen && <BranchDialog open={isBranchDialogOpen} onOpenChange={setIsBranchDialogOpen} branch={editingBranch} onSave={fetchAllData} />}
      {isCurrencyDialogOpen && <CurrencyDialog open={isCurrencyDialogOpen} onOpenChange={setIsCurrencyDialogOpen} currency={editingCurrency} onSave={fetchAllData} />}
      {isTaxDialogOpen && <TaxDialog open={isTaxDialogOpen} onOpenChange={setIsTaxDialogOpen} tax={editingTax} onSave={fetchAllData} />}
    </>
  );
}

    