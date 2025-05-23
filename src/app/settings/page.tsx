
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Shield, Building2, Coins, Printer, Database, Edit, Trash2, PlusCircle, Save, UserPlus, KeyRound, Percent, Palette, Cog, Tag, Ruler, FileCog } from "lucide-react"; 
import React, { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { GeneralSettings, getGeneralSettings, updateGeneralSettings as updateGeneralSettingsService, User, getUsers, addUser as addUserSevice, updateUser as updateUserService, deleteUser as deleteUserService, CompanyBranch, getBranches, addBranch as addBranchService, updateBranch as updateBranchService, deleteBranch as deleteBranchService, Currency, getCurrencies, addCurrency as addCurrencyService, updateCurrency as updateCurrencyService, deleteCurrency as deleteCurrencyService, Tax, Discount, getTaxes, addTax as addTaxService, updateTax as updateTaxService, deleteTax as deleteTaxService, getDiscounts, addDiscount as addDiscountService, updateDiscount as updateDiscountService, deleteDiscount as deleteDiscountService, UnitOfMeasure, getUnitsOfMeasure, addUnitOfMeasure as addUnitService, updateUnitOfMeasure as updateUnitService, deleteUnitOfMeasure as deleteUnitService, ProductCategory, getProductCategories, addProductCategory as addCategoryService, updateProductCategory as updateCategoryService, deleteProductCategory as deleteCategoryService } from "@/lib/services/settings";
import { Badge } from "@/components/ui/badge";

// Zod Schemas
const generalSettingsSchema = z.object({
  companyName: z.string().min(1, "اسم الشركة مطلوب"), taxNumber: z.string().optional(),
  companyAddress: z.string().optional(), companyPhone: z.string().optional(),
  companyEmail: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal('')),
  baseCurrency: z.string().min(1, "العملة الأساسية مطلوبة").default("SYP"), enableEInvoice: z.boolean().default(false),
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

const currencyFormSchema = z.object({ code: z.string().min(3, "3 أحرف").max(3, "3 أحرف").toUpperCase(), name: z.string().min(1, "الاسم مطلوب"), symbol: z.string().min(1, "الرمز مطلوب"), exchangeRateToBase: z.coerce.number().min(0, "سعر الصرف موجب"), isBaseCurrency: z.boolean().default(false) });
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


// Dialog Components
interface UserDialogProps { open: boolean; onOpenChange: (open: boolean) => void; user?: User | null; onSave: () => void; }
function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) { 
  const { toast } = useToast();
  const form = useForm<UserFormData>({ resolver: zodResolver(userFormSchema), defaultValues: { fullName: "", username: "", email: "", role: "موظف مبيعات", isActive: true, password: "", confirmPassword: "" }});
  useEffect(() => {
    if (open) { 
        if (user) {
            form.reset({ fullName: user.fullName, username: user.username, email: user.email, role: user.role, isActive: user.isActive, password: "", confirmPassword: "" });
        } else {
            form.reset({ fullName: "", username: "", email: "", role: "موظف مبيعات", isActive: true, password: "", confirmPassword: "" });
        }
    }
  }, [user, form, open]);

  const onSubmit = async (data: UserFormData) => {
    try {
      const finalData: any = { ...data };
      delete finalData.confirmPassword; 

      if (user) { 
        if (!data.password) { 
            delete finalData.password;
        }
        await updateUserService(user.id, finalData); 
        toast({ title: "تم تحديث المستخدم بنجاح" }); 
      } else { 
        if (!data.password) { form.setError("password", { type: "manual", message: "كلمة المرور مطلوبة للمستخدم الجديد."}); return; } 
        await addUserSevice(finalData as Omit<User, 'id' | 'lastLogin'>); 
        toast({ title: "تمت إضافة المستخدم بنجاح" }); 
      }
      onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "خطأ", description: (error as Error).message }); }
  };
  return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
    <DialogHeader><DialogTitle>{user ? `تعديل بيانات المستخدم: ${user.username}` : "إضافة مستخدم جديد"}</DialogTitle></DialogHeader>
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
      <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>الاسم الكامل</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <div className="grid md:grid-cols-2 gap-4">
      <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>اسم المستخدم</FormLabel><FormControl><Input {...field} disabled={!!user} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      </div>
      <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>الدور</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
        <SelectContent><SelectItem value="مدير">مدير</SelectItem><SelectItem value="محاسب">محاسب</SelectItem><SelectItem value="موظف مبيعات">موظف مبيعات</SelectItem><SelectItem value="مراجع">مراجع</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/>
      <div className="grid md:grid-cols-2 gap-4">
      <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>{user ? "كلمة مرور جديدة (اتركها فارغة لعدم التغيير)" : "كلمة المرور"}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>{user ? "تأكيد كلمة المرور الجديدة" : "تأكيد كلمة المرور"}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      </div>
      <FormField control={form.control} name="isActive" render={({ field }) => (<FormItem className="flex items-center gap-2 pt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">حساب نشط</FormLabel></FormItem>)}/>
      <DialogFooter className="pt-4"><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit"><Save className="ml-2 h-4 w-4"/>حفظ</Button></DialogFooter>
    </form></Form></DialogContent></Dialog>);
}

interface BranchDialogProps { open: boolean; onOpenChange: (open: boolean) => void; branch?: CompanyBranch | null; onSave: () => void; }
function BranchDialog({ open, onOpenChange, branch, onSave }: BranchDialogProps) { 
  const { toast } = useToast();
  const form = useForm<BranchFormData>({ resolver: zodResolver(branchFormSchema), defaultValues: { name: "", address: "", phone: "", isMain: false }});
  useEffect(() => { if (open) form.reset(branch || { name: "", address: "", phone: "", isMain: false }); }, [branch, form, open]);
  const onSubmit = async (data: BranchFormData) => {
    try { if (branch) { await updateBranchService(branch.id, data); toast({ title: "تم تحديث الفرع" }); } else { await addBranchService(data); toast({ title: "تمت إضافة الفرع" }); } onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "خطأ", description: (error as Error).message }); }
  };
  return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{branch ? "تعديل بيانات الفرع/المستودع" : "إضافة فرع/مستودع جديد"}</DialogTitle></DialogHeader>
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم الفرع/المستودع</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>العنوان</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>رقم الهاتف (اختياري)</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="isMain" render={({ field }) => (<FormItem className="flex items-center gap-2 pt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">هل هو الفرع الرئيسي؟</FormLabel></FormItem>)}/>
      <DialogFooter className="pt-4"><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit"><Save className="ml-2 h-4 w-4"/>حفظ</Button></DialogFooter>
    </form></Form></DialogContent></Dialog>);
}

interface CurrencyDialogProps { open: boolean; onOpenChange: (open: boolean) => void; currency?: Currency | null; onSave: () => void; }
function CurrencyDialog({ open, onOpenChange, currency, onSave }: CurrencyDialogProps) { 
  const { toast } = useToast();
  const form = useForm<CurrencyFormData>({ resolver: zodResolver(currencyFormSchema), defaultValues: { code: "", name: "", symbol: "", exchangeRateToBase: 1, isBaseCurrency: false }});
  useEffect(() => { if (open) form.reset(currency || { code: "", name: "", symbol: "", exchangeRateToBase: 1, isBaseCurrency: false }); }, [currency, form, open]);
  const onSubmit = async (data: CurrencyFormData) => {
    try { 
      const submittedData = {...data, code: data.code.toUpperCase()};
      if (currency) { await updateCurrencyService(currency.id, submittedData); toast({ title: "تم تحديث العملة" }); } 
      else { await addCurrencyService(submittedData); toast({ title: "تمت إضافة العملة" }); } 
      onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "خطأ", description: (error as Error).message }); }
  };
  return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{currency ? "تعديل بيانات العملة" : "إضافة عملة جديدة"}</DialogTitle></DialogHeader>
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
      <div className="grid md:grid-cols-2 gap-4">
      <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>رمز العملة (ISO - 3 أحرف)</FormLabel><FormControl><Input placeholder="SYP" {...field} maxLength={3}  /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم العملة</FormLabel><FormControl><Input placeholder="ليرة سورية" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      </div><div className="grid md:grid-cols-2 gap-4">
      <FormField control={form.control} name="symbol" render={({ field }) => (<FormItem><FormLabel>الرمز (للعرض)</FormLabel><FormControl><Input placeholder="ل.س" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="exchangeRateToBase" render={({ field }) => (<FormItem><FormLabel>سعر الصرف مقابل العملة الأساسية</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      </div>
      <FormField control={form.control} name="isBaseCurrency" render={({ field }) => (<FormItem className="flex items-center gap-2 pt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">هل هي العملة الأساسية للنظام؟</FormLabel></FormItem>)}/>
      <DialogFooter className="pt-4"><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit"><Save className="ml-2 h-4 w-4"/>حفظ</Button></DialogFooter>
    </form></Form></DialogContent></Dialog>);
}

interface TaxDialogProps { open: boolean; onOpenChange: (open: boolean) => void; tax?: Tax | null; onSave: () => void; }
function TaxDialog({ open, onOpenChange, tax, onSave }: TaxDialogProps) {
  const { toast } = useToast();
  const form = useForm<TaxFormData>({ resolver: zodResolver(taxFormSchema), defaultValues: { name: "", rate: 0, isDefault: false }});
  useEffect(() => { if (open) form.reset(tax || { name: "", rate: 0, isDefault: false }); }, [tax, form, open]);
  const onSubmit = async (data: TaxFormData) => {
    try { if (tax) { await updateTaxService(tax.id, data); toast({ title: "تم تحديث الضريبة" }); } else { await addTaxService(data); toast({ title: "تمت إضافة الضريبة" }); } onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "خطأ", description: (error as Error).message }); }
  };
  return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{tax ? "تعديل الضريبة" : "إضافة ضريبة جديدة"}</DialogTitle></DialogHeader>
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم الضريبة</FormLabel><FormControl><Input placeholder="ضريبة القيمة المضافة" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="rate" render={({ field }) => (<FormItem><FormLabel>النسبة المئوية (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="15" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="isDefault" render={({ field }) => (<FormItem className="flex items-center gap-2 pt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">هل هي الضريبة الافتراضية؟</FormLabel></FormItem>)}/>
      <DialogFooter className="pt-4"><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit"><Percent className="ml-2 h-4 w-4"/>حفظ الضريبة</Button></DialogFooter>
    </form></Form></DialogContent></Dialog>);
}

interface UnitDialogProps { open: boolean; onOpenChange: (open: boolean) => void; unit?: UnitOfMeasure | null; onSave: () => void; }
function UnitDialog({ open, onOpenChange, unit, onSave }: UnitDialogProps) {
  const { toast } = useToast();
  const form = useForm<UnitOfMeasureFormData>({ resolver: zodResolver(unitOfMeasureFormSchema), defaultValues: { name: "", symbol: "", isBaseUnit: false }});
  useEffect(() => { if (open) form.reset(unit || { name: "", symbol: "", isBaseUnit: false }); }, [unit, form, open]);
  const onSubmit = async (data: UnitOfMeasureFormData) => {
    try { if (unit) { await updateUnitService(unit.id, data); toast({ title: "تم تحديث الوحدة" }); } else { await addUnitService(data); toast({ title: "تمت إضافة الوحدة" }); } onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "خطأ", description: (error as Error).message }); }
  };
  return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{unit ? "تعديل وحدة قياس" : "إضافة وحدة قياس"}</DialogTitle></DialogHeader>
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم الوحدة</FormLabel><FormControl><Input placeholder="قطعة، كيلوغرام" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="symbol" render={({ field }) => (<FormItem><FormLabel>رمز الوحدة</FormLabel><FormControl><Input placeholder="قطعة، كجم" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="isBaseUnit" render={({ field }) => (<FormItem className="flex items-center gap-2 pt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">هل هي وحدة أساسية للمنتجات التي تستخدمها؟</FormLabel></FormItem>)}/>
      <DialogFooter className="pt-4"><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit"><Ruler className="ml-2 h-4 w-4"/>حفظ الوحدة</Button></DialogFooter>
    </form></Form></DialogContent></Dialog>);
}

interface CategoryDialogProps { open: boolean; onOpenChange: (open: boolean) => void; category?: ProductCategory | null; onSave: () => void; categories: ProductCategory[]; }
function CategoryDialog({ open, onOpenChange, category, onSave, categories }: CategoryDialogProps) {
  const { toast } = useToast();
  const form = useForm<ProductCategoryFormData>({ resolver: zodResolver(productCategoryFormSchema), defaultValues: { name: "", parentCategoryId: undefined }});
  useEffect(() => { if (open) form.reset(category || { name: "", parentCategoryId: undefined }); }, [category, form, open]);
  const onSubmit = async (data: ProductCategoryFormData) => {
    try { if (category) { await updateCategoryService(category.id, data); toast({ title: "تم تحديث الفئة" }); } else { await addCategoryService(data); toast({ title: "تمت إضافة الفئة" }); } onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "خطأ", description: (error as Error).message }); }
  };
  return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{category ? "تعديل فئة منتجات" : "إضافة فئة منتجات"}</DialogTitle></DialogHeader>
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم الفئة</FormLabel><FormControl><Input placeholder="إلكترونيات، مواد غذائية" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="parentCategoryId" render={({ field }) => (<FormItem><FormLabel>الفئة الرئيسية (اختياري)</FormLabel>
        <Select onValueChange={field.onChange} value={field.value} dir="rtl"><FormControl><SelectTrigger><SelectValue placeholder="اختر فئة رئيسية..."/></SelectTrigger></FormControl>
        <SelectContent>{categories.filter(c => c.id !== category?.id).map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
      <DialogFooter className="pt-4"><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit"><Tag className="ml-2 h-4 w-4"/>حفظ الفئة</Button></DialogFooter>
    </form></Form></DialogContent></Dialog>);
}


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
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false); const [editingUnit, setEditingUnit] = useState<UnitOfMeasure | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false); const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  // Placeholder for discount dialog
  // const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false); const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);


  const generalSettingsForm = useForm<GeneralSettingsFormData>({ 
    resolver: zodResolver(generalSettingsSchema), 
    defaultValues: { companyName: "", baseCurrency: "SYP", enableEInvoice: true } 
  });

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [settingsData, usersData, branchesData, currenciesData, taxesData, discountsData, unitsData, categoriesData] = await Promise.all([
        getGeneralSettings(), getUsers(), getBranches(), getCurrencies(), getTaxes(), getDiscounts(), getUnitsOfMeasure(), getProductCategories()
      ]);
      setGeneralSettings(settingsData); 
      generalSettingsForm.reset(settingsData || { companyName: "شركة الوسيط برو (الافتراضية)", baseCurrency: "SYP", enableEInvoice: true, taxNumber: "", companyAddress: "", companyPhone: "", companyEmail: "" });
      setUsers(usersData); setBranches(branchesData); setCurrencies(currenciesData);
      setTaxes(taxesData); setDiscounts(discountsData); setUnits(unitsData); setCategories(categoriesData);
    } catch (error) { toast({variant: "destructive", title: "خطأ", description: "فشل تحميل بيانات الإعدادات."}); }
    setIsLoading(false);
  }, [generalSettingsForm, toast]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const onSubmitGeneralSettings = async (data: GeneralSettingsFormData) => {
    try { await updateGeneralSettingsService(data); toast({ title: "تم حفظ الإعدادات العامة"}); fetchAllData(); }
    catch (error) { toast({variant: "destructive", title: "خطأ", description: (error as Error).message});}
  };

  const handleDelete = async (type: "user" | "branch" | "currency" | "tax" | "discount" | "unit" | "category", id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
        try {
            if (type === "user") await deleteUserService(id);
            else if (type === "branch") await deleteBranchService(id);
            else if (type === "currency") await deleteCurrencyService(id);
            else if (type === "tax") await deleteTaxService(id);
            else if (type === "unit") await deleteUnitService(id);
            else if (type === "category") await deleteCategoryService(id);
            else if (type === "discount") await deleteDiscountService(id);
            toast({ title: "تم الحذف بنجاح" }); 
            fetchAllData(); 
        } catch (error) { 
            toast({ variant: "destructive", title: "خطأ في الحذف", description: (error as Error).message}); 
        }
    }
  };
  
  const openDialog = (type: "user"|"branch"|"currency"|"tax"|"unit"|"category"/*|"discount"*/, item?: any) => {
      if(type==="user") { setEditingUser(item); setIsUserDialogOpen(true); }
      else if(type==="branch") { setEditingBranch(item); setIsBranchDialogOpen(true); }
      else if(type==="currency") { setEditingCurrency(item); setIsCurrencyDialogOpen(true); }
      else if(type==="tax") { setEditingTax(item); setIsTaxDialogOpen(true); }
      else if(type==="unit") { setEditingUnit(item); setIsUnitDialogOpen(true); }
      else if(type==="category") { setEditingCategory(item); setIsCategoryDialogOpen(true); }
      // else if(type==="discount") { setEditingDiscount(item); setIsDiscountDialogOpen(true); }
  }

  if (isLoading && !generalSettings) return <div className="p-6 text-center">جاري تحميل إعدادات النظام... الرجاء الانتظار.</div>

  return (
    <>
      <PageHeader title="إعدادات النظام والتخصيص" description="إدارة إعدادات الشركة، المستخدمين، الفروع، العملات، الضرائب، والمزيد."/>
      <Tabs defaultValue="general" dir="rtl" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-4">
          <TabsTrigger value="general" className="text-sm py-2 flex items-center gap-1"><FileCog className="h-4 w-4"/>عامة</TabsTrigger>
          <TabsTrigger value="users" className="text-sm py-2 flex items-center gap-1"><Users className="h-4 w-4"/>المستخدمون</TabsTrigger>
          <TabsTrigger value="branches" className="text-sm py-2 flex items-center gap-1"><Building2 className="h-4 w-4"/>الفروع</TabsTrigger>
          <TabsTrigger value="currencies" className="text-sm py-2 flex items-center gap-1"><Coins className="h-4 w-4"/>العملات</TabsTrigger>
          <TabsTrigger value="taxes_discounts" className="text-sm py-2 flex items-center gap-1"><Percent className="h-4 w-4"/>الضرائب والخصومات</TabsTrigger>
          <TabsTrigger value="inventory_settings" className="text-sm py-2 flex items-center gap-1"><Cog className="h-4 w-4"/>المخزون</TabsTrigger>
          <TabsTrigger value="print_settings" className="text-sm py-2 flex items-center gap-1"><Printer className="h-4 w-4"/>الطباعة</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="shadow-lg">
            <Form {...generalSettingsForm}> <form onSubmit={generalSettingsForm.handleSubmit(onSubmitGeneralSettings)}>
              <CardHeader><CardTitle>إعدادات الشركة العامة</CardTitle><CardDescription>المعلومات الأساسية للشركة والعملة الافتراضية.</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <FormField control={generalSettingsForm.control} name="companyName" render={({ field }) => (<FormItem><FormLabel>اسم الشركة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={generalSettingsForm.control} name="taxNumber" render={({ field }) => (<FormItem><FormLabel>الرقم الضريبي (اختياري)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={generalSettingsForm.control} name="baseCurrency" render={({ field }) => (<FormItem><FormLabel>العملة الأساسية للنظام</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "SYP"} dir="rtl">
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="SYP">ليرة سورية (SYP)</SelectItem>
                        <SelectItem value="TRY">ليرة تركية (TRY)</SelectItem>
                        {currencies.filter(c => !["SYP", "TRY"].includes(c.code)).map(c => <SelectItem key={c.id} value={c.code}>{c.name} ({c.code})</SelectItem>)}
                      </SelectContent></Select><FormMessage /></FormItem>)}/>
                </div>
                <FormField control={generalSettingsForm.control} name="companyAddress" render={({ field }) => (<FormItem><FormLabel>عنوان الشركة (اختياري)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={generalSettingsForm.control} name="companyPhone" render={({ field }) => (<FormItem><FormLabel>هاتف الشركة (اختياري)</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={generalSettingsForm.control} name="companyEmail" render={({ field }) => (<FormItem><FormLabel>البريد الإلكتروني للشركة (اختياري)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                </div>
                <FormField control={generalSettingsForm.control} name="enableEInvoice" render={({ field }) => (<FormItem className="flex items-center gap-2 pt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl><FormLabel className="!mt-0">تفعيل نظام الفوترة الإلكترونية</FormLabel></FormItem>)}/>
              </CardContent>
              <CardFooter><Button type="submit" disabled={generalSettingsForm.formState.isSubmitting || isLoading}><Save className="ml-2 h-4 w-4"/>حفظ الإعدادات العامة</Button></CardFooter>
            </form></Form>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="shadow-lg"><CardHeader><div className="flex justify-between items-center">
            <div><CardTitle>إدارة المستخدمين والصلاحيات</CardTitle><CardDescription>تحكم في وصول المستخدمين إلى وظائف النظام المختلفة.</CardDescription></div><Button onClick={() => openDialog("user")}><UserPlus className="ml-2 h-4 w-4"/>إضافة مستخدم جديد</Button></div></CardHeader>
            <CardContent>{users.length > 0 ? (<Table><TableHeader><TableRow>
              <TableHead>الاسم الكامل</TableHead><TableHead>اسم المستخدم</TableHead><TableHead>البريد الإلكتروني</TableHead><TableHead>الدور</TableHead><TableHead className="text-center">الحالة</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
              <TableBody>{users.map((user) => (<TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell><TableCell>{user.username}</TableCell><TableCell>{user.email}</TableCell>
                <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                <TableCell className="text-center"><Badge variant={user.isActive ? "default" : "outline"} className={user.isActive ? "bg-green-500 text-white" : ""}>{user.isActive ? "نشط" : "معطل"}</Badge></TableCell>
                <TableCell className="text-center space-x-1">
                  <Button variant="ghost" size="icon" title="تعديل المستخدم" onClick={() => openDialog("user", user)}><Edit className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" title={user.isActive ? "تعطيل الحساب" : "تفعيل الحساب"} onClick={async () => { await updateUserService(user.id, { isActive: !user.isActive }); fetchAllData(); }}><Shield className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" title="حذف المستخدم" className="text-destructive hover:text-destructive" onClick={()=> handleDelete("user", user.id, user.username)}><Trash2 className="h-4 w-4"/></Button>
                </TableCell></TableRow>))}</TableBody></Table>) 
              : (<div className="text-center text-muted-foreground py-10"><Users className="mx-auto h-12 w-12 text-gray-400 mb-2"/><p className="text-lg">لا يوجد مستخدمون معرفون حاليًا.</p><p className="text-sm">ابدأ بإضافة مستخدمين وتعيين أدوار لهم.</p></div>)}
            </CardContent></Card>
        </TabsContent>

        <TabsContent value="branches">
          <Card className="shadow-lg"><CardHeader><div className="flex justify-between items-center">
            <div><CardTitle>إدارة الفروع والمستودعات</CardTitle><CardDescription>عرف فروع شركتك ومواقع المستودعات.</CardDescription></div><Button onClick={() => openDialog("branch")}><PlusCircle className="ml-2 h-4 w-4"/>إضافة فرع/مستودع</Button></div></CardHeader>
            <CardContent>{branches.length > 0 ? (<Table><TableHeader><TableRow>
              <TableHead>اسم الفرع/المستودع</TableHead><TableHead>العنوان</TableHead><TableHead>الهاتف</TableHead><TableHead className="text-center">فرع رئيسي؟</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
              <TableBody>{branches.map((branch) => (<TableRow key={branch.id}>
                <TableCell className="font-medium">{branch.name}</TableCell><TableCell>{branch.address}</TableCell><TableCell>{branch.phone || "-"}</TableCell>
                <TableCell className="text-center">{branch.isMain ? <Badge>نعم</Badge> : "لا"}</TableCell>
                <TableCell className="text-center space-x-1">
                  <Button variant="ghost" size="icon" title="تعديل" onClick={() => openDialog("branch", branch)}><Edit className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" title="حذف" className="text-destructive hover:text-destructive" onClick={()=> handleDelete("branch", branch.id, branch.name)} disabled={branch.isMain}><Trash2 className="h-4 w-4"/></Button>
                </TableCell></TableRow>))}</TableBody></Table>) 
              : (<div className="text-center text-muted-foreground py-10"><Building2 className="mx-auto h-12 w-12 text-gray-400 mb-2"/><p className="text-lg">لا توجد فروع أو مستودعات معرفة.</p></div>)}
            </CardContent></Card>
        </TabsContent>

        <TabsContent value="currencies">
          <Card className="shadow-lg"><CardHeader><div className="flex justify-between items-center">
            <div><CardTitle>إدارة العملات وأسعار الصرف</CardTitle><CardDescription>عرف العملات التي تتعامل بها وحدد أسعار صرفها.</CardDescription></div><Button onClick={() => openDialog("currency")}><PlusCircle className="ml-2 h-4 w-4"/>إضافة عملة</Button></div></CardHeader>
            <CardContent>{currencies.length > 0 ? (<Table><TableHeader><TableRow>
              <TableHead>رمز العملة (ISO)</TableHead><TableHead>اسم العملة</TableHead><TableHead>الرمز (للعرض)</TableHead><TableHead className="text-left">سعر الصرف للعملة الأساسية</TableHead><TableHead className="text-center">عملة أساسية؟</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
              <TableBody>{currencies.map((currency) => (<TableRow key={currency.id}>
                <TableCell className="font-mono">{currency.code}</TableCell><TableCell className="font-medium">{currency.name}</TableCell><TableCell>{currency.symbol}</TableCell>
                <TableCell className="text-left">{currency.isBaseCurrency ? "-" : currency.exchangeRateToBase.toFixed(4)}</TableCell>
                <TableCell className="text-center">{currency.isBaseCurrency ? <Badge>نعم</Badge> : "لا"}</TableCell>
                <TableCell className="text-center space-x-1">
                  <Button variant="ghost" size="icon" title="تعديل" onClick={() => openDialog("currency", currency)}><Edit className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" title="حذف" className="text-destructive hover:text-destructive" onClick={()=> handleDelete("currency", currency.id, currency.name)} disabled={currency.isBaseCurrency}><Trash2 className="h-4 w-4"/></Button>
                </TableCell></TableRow>))}</TableBody></Table>) 
              : (<div className="text-center text-muted-foreground py-10"><Coins className="mx-auto h-12 w-12 text-gray-400 mb-2"/><p className="text-lg">لا توجد عملات معرفة.</p></div>)}
            </CardContent></Card>
        </TabsContent>

        <TabsContent value="taxes_discounts">
            <Card className="shadow-lg">
                <CardHeader><div className="flex justify-between items-center"><div><CardTitle>إعدادات الضرائب والخصومات</CardTitle><CardDescription>عرف أنواع الضرائب والخصومات المطبقة في عملك.</CardDescription></div>
                <div className="flex gap-2"><Button onClick={() => openDialog("tax")}><Percent className="ml-2 h-4 w-4"/>إضافة ضريبة جديدة</Button> 
                {/* <Button onClick={() => openDialog("discount")}><Percent className="ml-2 h-4 w-4"/>إضافة خصم جديد</Button> */}
                </div></div></CardHeader>
                <CardContent>
                    <h3 className="text-lg font-semibold mb-3">الضرائب المسجلة</h3>
                    {taxes.length > 0 ? (<Table><TableHeader><TableRow><TableHead>اسم الضريبة</TableHead><TableHead className="text-left">النسبة (%)</TableHead><TableHead className="text-center">ضريبة افتراضية؟</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
                        <TableBody>{taxes.map(tax => (<TableRow key={tax.id}>
                            <TableCell className="font-medium">{tax.name}</TableCell><TableCell className="text-left">{tax.rate.toFixed(2)}%</TableCell>
                            <TableCell className="text-center">{tax.isDefault ? <Badge>نعم</Badge> : "لا"}</TableCell>
                            <TableCell className="text-center space-x-1"><Button variant="ghost" size="icon" title="تعديل الضريبة" onClick={() => openDialog("tax", tax)}><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" title="حذف الضريبة" className="text-destructive hover:text-destructive" onClick={()=> handleDelete("tax", tax.id, tax.name)}><Trash2 className="h-4 w-4"/></Button></TableCell>
                        </TableRow>))}</TableBody></Table>)
                    : (<div className="text-center text-muted-foreground py-6 border rounded-md"><Percent className="mx-auto h-10 w-10 text-gray-400 mb-2"/><p className="text-lg">لا توجد ضرائب معرفة حاليًا.</p></div>)}
                    
                    <h3 className="text-lg font-semibold mt-6 mb-3">الخصومات المسجلة (قيد التطوير)</h3>
                     <div className="text-center text-muted-foreground py-6 border rounded-md"><Percent className="mx-auto h-10 w-10 text-gray-400 mb-2"/><p className="text-lg">إدارة الخصومات قيد التطوير.</p></div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="inventory_settings">
             <Card className="shadow-lg">
                <CardHeader><CardTitle>إعدادات المخزون المتقدمة</CardTitle><CardDescription>إدارة وحدات القياس، فئات المنتجات، والمزيد.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold">وحدات القياس</h3>
                            <Button onClick={() => openDialog("unit")}><Ruler className="ml-2 h-4 w-4"/>إضافة وحدة قياس</Button>
                        </div>
                        {units.length > 0 ? (<Table><TableHeader><TableRow><TableHead>اسم الوحدة</TableHead><TableHead>الرمز</TableHead><TableHead className="text-center">وحدة أساسية؟</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
                        <TableBody>{units.map(unit => (<TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.name}</TableCell><TableCell>{unit.symbol}</TableCell>
                            <TableCell className="text-center">{unit.isBaseUnit ? <Badge>نعم</Badge> : "لا"}</TableCell>
                            <TableCell className="text-center space-x-1"><Button variant="ghost" size="icon" title="تعديل الوحدة" onClick={() => openDialog("unit", unit)}><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" title="حذف الوحدة" className="text-destructive hover:text-destructive" onClick={()=> handleDelete("unit", unit.id, unit.name)}><Trash2 className="h-4 w-4"/></Button></TableCell>
                        </TableRow>))}</TableBody></Table>)
                        : (<div className="text-center text-muted-foreground py-6 border rounded-md"><Ruler className="mx-auto h-10 w-10 text-gray-400 mb-2"/><p className="text-lg">لا توجد وحدات قياس معرفة.</p></div>)}
                    </div>
                    <hr/>
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold">فئات المنتجات</h3>
                            <Button onClick={() => openDialog("category")}><Tag className="ml-2 h-4 w-4"/>إضافة فئة منتجات</Button>
                        </div>
                         {categories.length > 0 ? (<Table><TableHeader><TableRow><TableHead>اسم الفئة</TableHead><TableHead>الفئة الرئيسية</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
                        <TableBody>{categories.map(cat => (<TableRow key={cat.id}>
                            <TableCell className="font-medium">{cat.name}</TableCell>
                            <TableCell>{categories.find(p => p.id === cat.parentCategoryId)?.name || "-"}</TableCell>
                            <TableCell className="text-center space-x-1"><Button variant="ghost" size="icon" title="تعديل الفئة" onClick={() => openDialog("category", cat)}><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" title="حذف الفئة" className="text-destructive hover:text-destructive" onClick={()=> handleDelete("category", cat.id, cat.name)}><Trash2 className="h-4 w-4"/></Button></TableCell>
                        </TableRow>))}</TableBody></Table>)
                        : (<div className="text-center text-muted-foreground py-6 border rounded-md"><Tag className="mx-auto h-10 w-10 text-gray-400 mb-2"/><p className="text-lg">لا توجد فئات منتجات معرفة.</p></div>)}
                    </div>
                </CardContent>
             </Card>
        </TabsContent>

        <TabsContent value="print_settings">
            <Card className="shadow-lg">
                <CardHeader><CardTitle>إعدادات قوالب الطباعة</CardTitle><CardDescription>تخصيص شكل الفواتير والإيصالات المطبوعة.</CardDescription></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="invoice-template-select">قالب طباعة الفاتورة</Label>
                            <Select dir="rtl">
                                <SelectTrigger id="invoice-template-select"><SelectValue placeholder="اختر قالب..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">القالب الافتراضي</SelectItem>
                                    <SelectItem value="modern">القالب الحديث</SelectItem>
                                    <SelectItem value="classic_a4">القالب الكلاسيكي (A4)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="receipt-template-select">قالب طباعة الإيصال (الكاشير)</Label>
                             <Select dir="rtl">
                                <SelectTrigger id="receipt-template-select"><SelectValue placeholder="اختر قالب..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="thermal_80mm">إيصال حراري 80مم</SelectItem>
                                    <SelectItem value="thermal_58mm">إيصال حراري 58مم</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="border p-4 rounded-md">
                            <Label htmlFor="header-text" className="block mb-1">نص رأس الصفحة (اختياري)</Label>
                            <Textarea id="header-text" placeholder="مثال: شكراً لتعاملكم معنا - اسم الشركة"/>
                            <Label htmlFor="footer-text" className="block mt-3 mb-1">نص تذييل الصفحة (اختياري)</Label>
                            <Textarea id="footer-text" placeholder="مثال: البضاعة المباعة لا ترد ولا تستبدل - شروط الضمان"/>
                        </div>
                        <Button><Printer className="ml-2 h-4 w-4"/>معاينة وحفظ إعدادات الطباعة</Button>
                    </div>
                    <p className="text-muted-foreground mt-4 text-sm">ملاحظة: تخصيص القوالب بشكل كامل قد يتطلب تعديلات برمجية متقدمة.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      {isUserDialogOpen && <UserDialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen} user={editingUser} onSave={fetchAllData} />}
      {isBranchDialogOpen && <BranchDialog open={isBranchDialogOpen} onOpenChange={setIsBranchDialogOpen} branch={editingBranch} onSave={fetchAllData} />}
      {isCurrencyDialogOpen && <CurrencyDialog open={isCurrencyDialogOpen} onOpenChange={setIsCurrencyDialogOpen} currency={editingCurrency} onSave={fetchAllData} />}
      {isTaxDialogOpen && <TaxDialog open={isTaxDialogOpen} onOpenChange={setIsTaxDialogOpen} tax={editingTax} onSave={fetchAllData} />}
      {isUnitDialogOpen && <UnitDialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen} unit={editingUnit} onSave={fetchAllData} />}
      {isCategoryDialogOpen && <CategoryDialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen} category={editingCategory} onSave={fetchAllData} categories={categories} />}
      {/* Add DiscountDialog when implemented */}
    </>
  );
}
