
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Search, Filter, Landmark, BookOpen, FileArchive, FileText, Receipt, HandCoins, Eye, Banknote, CalendarDays, Users2, UserCircle } from "lucide-react"; 
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getJournalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry, JournalEntry, JournalEntryDetail, getChartOfAccounts, addAccount, updateAccount, deleteAccount, Account, getCostCenters, addCostCenter, updateCostCenter, deleteCostCenter, CostCenter, getReceiptVouchers, addReceiptVoucher, updateReceiptVoucher, deleteReceiptVoucher, ReceiptVoucher, getPaymentVouchers, addPaymentVoucher, updatePaymentVoucher, deletePaymentVoucher, PaymentVoucher } from "@/lib/services/accounting"; 

// Zod Schemas
const journalEntryDetailSchema = z.object({
  accountId: z.string().min(1, "الحساب مطلوب"),
  debit: z.coerce.number().optional().default(0),
  credit: z.coerce.number().optional().default(0),
  costCenterId: z.string().optional(),
  description: z.string().optional(), // Optional description for each detail line
});

const journalEntryFormSchema = z.object({
  date: z.string().min(1, "التاريخ مطلوب").refine(val => !isNaN(Date.parse(val.split('/').reverse().join('-'))), {message: "تاريخ غير صالح"}),
  description: z.string().min(1, "الوصف مطلوب"),
  reference: z.string().optional(),
  isPosted: z.boolean().default(false),
  details: z.array(journalEntryDetailSchema).min(2, "يجب أن يحتوي القيد على طرفين على الأقل")
    .refine(details => { // Ensure total debits equal total credits
        const totalDebit = details.reduce((sum, d) => sum + (d.debit || 0), 0);
        const totalCredit = details.reduce((sum, d) => sum + (d.credit || 0), 0);
        return Math.abs(totalDebit - totalCredit) < 0.001; // Using a small epsilon for float comparison
    }, { message: "إجمالي المدين يجب أن يساوي إجمالي الدائن" })
    .refine(details => details.every(d => (d.debit || 0) >= 0 && (d.credit || 0) >= 0), {message: "المبالغ لا يمكن أن تكون سالبة"}),
});
type JournalEntryFormData = z.infer<typeof journalEntryFormSchema>;


const accountFormSchema = z.object({
  code: z.string().min(1, "رمز الحساب مطلوب"),
  name: z.string().min(1, "اسم الحساب مطلوب"),
  type: z.enum(["أصول", "التزامات", "حقوق ملكية", "إيرادات", "مصروفات"], { required_error: "نوع الحساب مطلوب" }),
  parentAccountId: z.string().optional(),
  isMain: z.boolean().default(false),
  // Balance will be calculated or set as opening balance via a separate process/journal entry
});
type AccountFormData = z.infer<typeof accountFormSchema>;

const costCenterFormSchema = z.object({
  code: z.string().min(1, "رمز مركز التكلفة مطلوب"),
  name: z.string().min(1, "اسم مركز التكلفة مطلوب"),
  description: z.string().optional(),
});
type CostCenterFormData = z.infer<typeof costCenterFormSchema>;

const voucherSchemaBase = {
  date: z.string().min(1, "التاريخ مطلوب").refine(val => !isNaN(Date.parse(val.split('/').reverse().join('-'))), {message: "تاريخ غير صالح"}),
  accountId: z.string().min(1, "الحساب (الصندوق/البنك) مطلوب"),
  amount: z.coerce.number().min(0.01, "المبلغ يجب أن يكون أكبر من صفر"),
  description: z.string().min(1, "الوصف مطلوب"),
  paymentMethod: z.enum(["نقدي", "شيك", "تحويل بنكي", "شبكة"], { required_error: "طريقة الدفع مطلوبة" }),
  reference: z.string().optional(),
};

const receiptVoucherFormSchema = z.object({
  ...voucherSchemaBase,
  receivedFrom: z.string().min(1, "اسم المستلم منه مطلوب"), // Can be linked to Contact.id
});
type ReceiptVoucherFormData = z.infer<typeof receiptVoucherFormSchema>;

const paymentVoucherFormSchema = z.object({
  ...voucherSchemaBase,
  paidTo: z.string().min(1, "اسم المدفوع له مطلوب"), // Can be linked to Contact.id
});
type PaymentVoucherFormData = z.infer<typeof paymentVoucherFormSchema>;


interface JournalEntryDialogProps {
  open: boolean; onOpenChange: (open: boolean) => void;
  entry?: JournalEntry | null; onSave: () => void;
  accounts: Account[]; costCenters: CostCenter[];
}

function JournalEntryDialog({ open, onOpenChange, entry, onSave, accounts, costCenters }: JournalEntryDialogProps) {
  const { toast } = useToast();
  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntryFormSchema),
    defaultValues: entry ? { ...entry, date: entry.date.split('/').reverse().join('-') } : {
      date: new Date().toISOString().split('T')[0], description: "", isPosted: false,
      details: [{ accountId: "", debit: 0, credit: 0 }, { accountId: "", debit: 0, credit: 0 }]
    }
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "details" });

  useEffect(() => {
    if (open) {
      form.reset(entry ? { ...entry, date: entry.date.split('/').reverse().join('-') } : {
        date: new Date().toISOString().split('T')[0], description: "", isPosted: false,
        details: [{ accountId: "", debit: 0, credit: 0 }, { accountId: "", debit: 0, credit: 0 }]
      });
    }
  }, [entry, form, open]);

  const onSubmit = async (data: JournalEntryFormData) => {
    try {
      const formattedData = { ...data, date: new Date(data.date).toLocaleDateString('ar-EG', {day:'2-digit',month:'2-digit',year:'numeric'}) };
      if (entry) {
        await updateJournalEntry(entry.id, formattedData);
        toast({ title: "تم التحديث بنجاح" });
      } else {
        await addJournalEntry(formattedData);
        toast({ title: "تمت الإضافة بنجاح" });
      }
      onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "حدث خطأ", description: (error as Error).message }); }
  };
  
  const totalDebits = form.watch("details").reduce((sum, d) => sum + (d.debit || 0), 0);
  const totalCredits = form.watch("details").reduce((sum, d) => sum + (d.credit || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader><DialogTitle>{entry ? "تعديل قيد يومية" : "إضافة قيد يومية جديد"}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>التاريخ</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="description" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>الوصف الرئيسي للقيد</FormLabel><FormControl><Input placeholder="وصف القيد" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="reference" render={({ field }) => (<FormItem><FormLabel>رقم المرجع (اختياري)</FormLabel><FormControl><Input placeholder="مرجع الفاتورة أو المستند" {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            <Card><CardHeader><CardTitle>تفاصيل القيد</CardTitle></CardHeader>
              <CardContent>
                {fields.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_1fr_auto] gap-2 items-end mb-3 p-2 border-b">
                    <FormField control={form.control} name={`details.${index}.accountId`} render={({ field }) => (
                      <FormItem><FormLabel className="text-xs md:hidden">الحساب</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                          <FormControl><SelectTrigger><SelectValue placeholder="اختر حساب..." /></SelectTrigger></FormControl>
                          <SelectContent>{accounts.filter(a=>!a.isMain).map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.code})</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                      </FormItem>)} />
                    <FormField control={form.control} name={`details.${index}.debit`} render={({ field }) => (<FormItem><FormLabel className="text-xs md:hidden">مدين</FormLabel><FormControl><Input type="number" step="any" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`details.${index}.credit`} render={({ field }) => (<FormItem><FormLabel className="text-xs md:hidden">دائن</FormLabel><FormControl><Input type="number" step="any" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`details.${index}.costCenterId`} render={({ field }) => (
                      <FormItem><FormLabel className="text-xs md:hidden">مركز تكلفة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                          <FormControl><SelectTrigger><SelectValue placeholder="اختر مركز تكلفة (اختياري)" /></SelectTrigger></FormControl>
                          <SelectContent>{costCenters.map(cc => <SelectItem key={cc.id} value={cc.id}>{cc.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>)} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => fields.length > 2 && remove(index)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ accountId: "", debit: 0, credit: 0 })}><PlusCircle className="ml-2 h-4 w-4" /> إضافة طرف جديد</Button>
                <div className="grid grid-cols-2 gap-4 mt-4 font-semibold">
                    <div>إجمالي المدين: {totalDebits.toFixed(2)}</div>
                    <div>إجمالي الدائن: {totalCredits.toFixed(2)}</div>
                    {Math.abs(totalDebits - totalCredits) >= 0.001 && <div className="col-span-2 text-destructive">القيد غير متوازن! الفرق: {(totalDebits - totalCredits).toFixed(2)}</div>}
                </div>
                 {form.formState.errors.details && <FormMessage>{form.formState.errors.details.message || form.formState.errors.details.root?.message}</FormMessage>}
              </CardContent></Card>
            <FormField control={form.control} name="isPosted" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel className="mb-0">ترحيل القيد</FormLabel><FormControl><Input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} className="h-5 w-5" /></FormControl></FormItem>)} />
            <DialogFooter className="pt-4"><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit" disabled={form.formState.isSubmitting || Math.abs(totalDebits - totalCredits) >= 0.001}><BookOpen className="ml-2 h-4 w-4"/>حفظ القيد</Button></DialogFooter>
          </form></Form>
      </DialogContent></Dialog>
  );
}

interface AccountDialogProps { open: boolean; onOpenChange: (open: boolean) => void; account?: Account | null; onSave: () => void; accounts: Account[];}
function AccountDialog({ open, onOpenChange, account, onSave, accounts }: AccountDialogProps) {
  const { toast } = useToast();
  const form = useForm<AccountFormData>({ resolver: zodResolver(accountFormSchema), defaultValues: account || { code: "", name: "", type: "أصول", isMain: false }});
  useEffect(() => { if (open) form.reset(account || { code: "", name: "", type: "أصول", isMain: false }); }, [account, form, open]);
  const onSubmit = async (data: AccountFormData) => {
    try {
      if (account) { await updateAccount(account.id, data); toast({ title: "تم التحديث" }); } 
      else { await addAccount(data); toast({ title: "تمت الإضافة" }); }
      onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "خطأ", description: (error as Error).message }); }
  };
  return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{account ? "تعديل حساب" : "إضافة حساب جديد"}</DialogTitle></DialogHeader>
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
      <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>رمز الحساب</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم الحساب</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
      <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>نوع الحساب</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
        <SelectContent><SelectItem value="أصول">أصول</SelectItem><SelectItem value="التزامات">التزامات</SelectItem><SelectItem value="حقوق ملكية">حقوق ملكية</SelectItem><SelectItem value="إيرادات">إيرادات</SelectItem><SelectItem value="مصروفات">مصروفات</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
      <FormField control={form.control} name="parentAccountId" render={({ field }) => (<FormItem><FormLabel>الحساب الرئيسي (اختياري)</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="اختر حساب رئيسي..." /></SelectTrigger></FormControl>
        <SelectContent>{accounts.filter(a=>a.isMain).map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
      <FormField control={form.control} name="isMain" render={({ field }) => (<FormItem className="flex items-center gap-2"><FormControl><Input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} className="h-5 w-5" /></FormControl><FormLabel className="!mt-0">حساب رئيسي (لا يقبل حركات مباشرة)</FormLabel></FormItem>)} />
      <DialogFooter><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit"><FileArchive className="ml-2 h-4 w-4"/>حفظ</Button></DialogFooter>
    </form></Form></DialogContent></Dialog>);
}

interface CostCenterDialogProps { open: boolean; onOpenChange: (open: boolean) => void; costCenter?: CostCenter | null; onSave: () => void; }
function CostCenterDialog({ open, onOpenChange, costCenter, onSave }: CostCenterDialogProps) {
  const { toast } = useToast();
  const form = useForm<CostCenterFormData>({ resolver: zodResolver(costCenterFormSchema), defaultValues: costCenter || { code: "", name: "", description: "" }});
  useEffect(() => { if (open) form.reset(costCenter || { code: "", name: "", description: "" }); }, [costCenter, form, open]);
  const onSubmit = async (data: CostCenterFormData) => {
    try {
      if (costCenter) { await updateCostCenter(costCenter.id, data); toast({ title: "تم التحديث" }); }
      else { await addCostCenter(data); toast({ title: "تمت الإضافة" }); }
      onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "خطأ", description: (error as Error).message }); }
  };
  return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{costCenter ? "تعديل مركز تكلفة" : "إضافة مركز تكلفة"}</DialogTitle></DialogHeader>
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
      <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>رمز المركز</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم المركز</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
      <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>الوصف</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
      <DialogFooter><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit"><Landmark className="ml-2 h-4 w-4"/>حفظ</Button></DialogFooter>
    </form></Form></DialogContent></Dialog>);
}

interface VoucherDialogProps<T extends ReceiptVoucherFormData | PaymentVoucherFormData> {
  open: boolean; onOpenChange: (open: boolean) => void;
  voucher?: (T extends ReceiptVoucherFormData ? ReceiptVoucher : PaymentVoucher) | null;
  onSave: () => void; accounts: Account[]; type: "receipt" | "payment";
}

function VoucherDialog<T extends ReceiptVoucherFormData | PaymentVoucherFormData>({ open, onOpenChange, voucher, onSave, accounts, type }: VoucherDialogProps<T>) {
  const { toast } = useToast();
  const schema = type === "receipt" ? receiptVoucherFormSchema : paymentVoucherFormSchema;
  const defaultPersonField = type === "receipt" ? "receivedFrom" : "paidTo";

  const form = useForm<T>({
    resolver: zodResolver(schema as any), // Need to cast schema due to generic type
    defaultValues: voucher ? { ...voucher, date: voucher.date.split('/').reverse().join('-') } as T : {
      date: new Date().toISOString().split('T')[0], accountId: "", amount: 0, description: "", paymentMethod: "نقدي", [defaultPersonField]: ""
    } as T
  });

  useEffect(() => {
    if (open) {
      form.reset(voucher ? { ...voucher, date: voucher.date.split('/').reverse().join('-') } as T : {
        date: new Date().toISOString().split('T')[0], accountId: "", amount: 0, description: "", paymentMethod: "نقدي", [defaultPersonField]: ""
      } as T);
    }
  }, [voucher, form, open, defaultPersonField]);

  const onSubmit = async (data: T) => {
    try {
      const formattedData = { ...data, date: new Date(data.date).toLocaleDateString('ar-EG', {day:'2-digit',month:'2-digit',year:'numeric'}) };
      if (type === "receipt") {
        if (voucher) await updateReceiptVoucher(voucher.id, formattedData as any); else await addReceiptVoucher(formattedData as any);
      } else {
        if (voucher) await updatePaymentVoucher(voucher.id, formattedData as any); else await addPaymentVoucher(formattedData as any);
      }
      toast({ title: voucher ? "تم التحديث بنجاح" : "تمت الإضافة بنجاح" });
      onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "حدث خطأ", description: (error as Error).message }); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{voucher ? `تعديل سند ${type === "receipt" ? "قبض" : "صرف"}` : `إنشاء سند ${type === "receipt" ? "قبض" : "صرف"} جديد`}</DialogTitle></DialogHeader>
      <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>التاريخ</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name={type === "receipt" ? "receivedFrom" as any : "paidTo" as any} render={({ field }) => (<FormItem><FormLabel>{type === "receipt" ? "المستلم منه" : "المدفوع له"}</FormLabel><FormControl><Input placeholder={`اسم ${type === "receipt" ? "الدافع" : "المستفيد"}`} {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="accountId" render={({ field }) => (<FormItem><FormLabel>الحساب (الصندوق/البنك)</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="اختر حساب..." /></SelectTrigger></FormControl>
          <SelectContent>{accounts.filter(a => a.type === "أصول" && (a.name.includes("صندوق") || a.name.includes("بنك"))).map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>المبلغ</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="paymentMethod" render={({ field }) => (<FormItem><FormLabel>طريقة الدفع</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
          <SelectContent><SelectItem value="نقدي">نقدي</SelectItem><SelectItem value="شيك">شيك</SelectItem><SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem><SelectItem value="شبكة">شبكة (مدى/فيزا)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>الوصف/البيان</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="reference" render={({ field }) => (<FormItem><FormLabel>المرجع (رقم شيك، فاتورة...)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <DialogFooter><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose><Button type="submit">{type === "receipt" ? <Receipt className="ml-2 h-4 w-4"/> : <HandCoins className="ml-2 h-4 w-4"/>} حفظ السند</Button></DialogFooter>
      </form></Form></DialogContent></Dialog>
  );
}

export default function AccountingPage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [chartOfAccountsData, setChartOfAccountsData] = useState<Account[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [receiptVouchers, setReceiptVouchers] = useState<ReceiptVoucher[]>([]); 
  const [paymentVouchers, setPaymentVouchers] = useState<PaymentVoucher[]>([]); 

  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isJournalEntryDialogOpen, setIsJournalEntryDialogOpen] = useState(false);
  const [editingJournalEntry, setEditingJournalEntry] = useState<JournalEntry | null>(null);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isCostCenterDialogOpen, setIsCostCenterDialogOpen] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null);
  const [isReceiptVoucherDialogOpen, setIsReceiptVoucherDialogOpen] = useState(false);
  const [editingReceiptVoucher, setEditingReceiptVoucher] = useState<ReceiptVoucher | null>(null);
  const [isPaymentVoucherDialogOpen, setIsPaymentVoucherDialogOpen] = useState(false);
  const [editingPaymentVoucher, setEditingPaymentVoucher] = useState<PaymentVoucher | null>(null);
  
  const [selectedLedgerAccountId, setSelectedLedgerAccountId] = useState<string | undefined>();
  const [ledgerEntries, setLedgerEntries] = useState<JournalEntryDetail[]>([]);
  const [ledgerAccount, setLedgerAccount] = useState<Account | null>(null);


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [journals, accounts, centers, receipts, payments] = await Promise.all([
        getJournalEntries(), getChartOfAccounts(), getCostCenters(), getReceiptVouchers(), getPaymentVouchers()
      ]);
      setJournalEntries(journals); setChartOfAccountsData(accounts); setCostCenters(centers);
      setReceiptVouchers(receipts); setPaymentVouchers(payments);
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في تحميل البيانات", description: (error as Error).message });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleFetchLedger = useCallback(async () => {
    if (!selectedLedgerAccountId) {
      setLedgerEntries([]);
      setLedgerAccount(null);
      return;
    }
    setIsLoading(true);
    const account = chartOfAccountsData.find(acc => acc.id === selectedLedgerAccountId);
    setLedgerAccount(account || null);
    // In a real app, this would be a specific API call: getLedgerForAccount(selectedLedgerAccountId, dateRange)
    // For mock, filter all journal entries
    const allDetails: JournalEntryDetail[] = [];
    const allJournals = await getJournalEntries(); // refetch or use state if sure it's up-to-date
    allJournals.forEach(je => {
      je.details.forEach(detail => {
        if (detail.accountId === selectedLedgerAccountId) {
          allDetails.push({ ...detail, entryDate: je.date, entryDescription: je.description, entryId: je.id, entryReference: je.reference } as JournalEntryDetail & {entryDate: string, entryDescription: string, entryId: string, entryReference?: string});
        }
      });
    });
    allDetails.sort((a: any, b: any) => new Date(a.entryDate.split('/').reverse().join('-')).getTime() - new Date(b.entryDate.split('/').reverse().join('-')).getTime());
    
    let runningBalance = account?.balance || 0; // Start with opening balance if available
    // For simplicity in mock, if account.balance reflects opening balance (before any of these journal entries), then it's fine.
    // Otherwise, if account.balance is a *current* balance, we'd need to work backwards or only calculate deltas.
    // Let's assume account.balance is an opening balance for this mock ledger.
    // Or, for a simpler mock, let's just calculate running balance from 0 for the displayed transactions.
    runningBalance = 0; // For this mock, let's simplify.
    const entriesWithRunningBalance = allDetails.map(detail => {
        const debit = detail.debit || 0;
        const credit = detail.credit || 0;
        if (account?.type === "أصول" || account?.type === "مصروفات") {
            runningBalance += debit - credit;
        } else { // التزامات، حقوق ملكية، إيرادات
            runningBalance += credit - debit;
        }
        return { ...detail, runningBalance };
    });

    setLedgerEntries(entriesWithRunningBalance as any);
    setIsLoading(false);
  }, [selectedLedgerAccountId, chartOfAccountsData]);


  // Handlers for opening dialogs
  const openDialog = (type: "journal" | "account" | "costCenter" | "receipt" | "payment", item?: any) => {
    if (type === "journal") { setEditingJournalEntry(item); setIsJournalEntryDialogOpen(true); }
    else if (type === "account") { setEditingAccount(item); setIsAccountDialogOpen(true); }
    else if (type === "costCenter") { setEditingCostCenter(item); setIsCostCenterDialogOpen(true); }
    else if (type === "receipt") { setEditingReceiptVoucher(item); setIsReceiptVoucherDialogOpen(true); }
    else if (type === "payment") { setEditingPaymentVoucher(item); setIsPaymentVoucherDialogOpen(true); }
  };
  
  // Generic delete handler
  const handleDelete = async (type: "journal" | "account" | "costCenter" | "receipt" | "payment", id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف "${name}"؟`)) {
      try {
        if (type === "journal") await deleteJournalEntry(id);
        else if (type === "account") await deleteAccount(id);
        else if (type === "costCenter") await deleteCostCenter(id);
        else if (type === "receipt") await deleteReceiptVoucher(id);
        else if (type === "payment") await deletePaymentVoucher(id);
        toast({ title: "تم الحذف بنجاح" });
        fetchData();
      } catch (error) {
        toast({ variant: "destructive", title: "خطأ في الحذف", description: (error as Error).message });
      }
    }
  };

  const handlePostJournalEntry = async (entry: JournalEntry) => {
    if (window.confirm(`هل أنت متأكد من ${entry.isPosted ? 'إلغاء ترحيل' : 'ترحيل'} القيد رقم ${entry.reference || entry.id}؟`)) {
        try {
            await updateJournalEntry(entry.id, { ...entry, isPosted: !entry.isPosted });
            toast({ title: `تم ${entry.isPosted ? 'إلغاء ترحيل' : 'ترحيل'} القيد بنجاح` });
            fetchData();
        } catch (error) {
            toast({ variant: "destructive", title: "خطأ", description: (error as Error).message });
        }
    }
  };


  return (
    <>
      <PageHeader 
        title="نظام المحاسبة المتكامل" 
        description="إدارة قيود اليومية، شجرة الحسابات، مراكز التكلفة، وسندات القبض والصرف."
        actions={
          <Button onClick={() => openDialog("journal")}><PlusCircle className="ml-2 h-4 w-4" /> إضافة قيد يومية جديد</Button>
        }
      />

      <Tabs defaultValue="journal" dir="rtl" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-4">
          <TabsTrigger value="journal" className="text-base py-2.5 flex items-center gap-1"><BookOpen className="h-4 w-4"/>قيود اليومية</TabsTrigger>
          <TabsTrigger value="accounts" className="text-base py-2.5 flex items-center gap-1"><FileArchive className="h-4 w-4"/>شجرة الحسابات</TabsTrigger>
          <TabsTrigger value="costCenters" className="text-base py-2.5 flex items-center gap-1"><Landmark className="h-4 w-4"/>مراكز التكلفة</TabsTrigger>
          <TabsTrigger value="receiptVouchers" className="text-base py-2.5 flex items-center gap-1"><Receipt className="h-4 w-4"/>سندات القبض</TabsTrigger>
          <TabsTrigger value="paymentVouchers" className="text-base py-2.5 flex items-center gap-1"><HandCoins className="h-4 w-4"/>سندات الصرف</TabsTrigger>
          <TabsTrigger value="ledger" className="text-base py-2.5 flex items-center gap-1"><Banknote className="h-4 w-4"/>كشف حساب</TabsTrigger>
        </TabsList>

        <TabsContent value="journal">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>سجل قيود اليومية</CardTitle>
              <CardDescription>عرض وإدارة جميع قيود اليومية المسجلة.</CardDescription>
              <div className="flex items-center gap-2 pt-4">
                <Input placeholder="ابحث في القيود..." className="max-w-sm" />
                <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && <p className="text-center p-4">جار التحميل...</p>}
              {!isLoading && journalEntries.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>التاريخ</TableHead><TableHead>رقم المرجع</TableHead><TableHead>الوصف</TableHead><TableHead>الحسابات (مدين/دائن)</TableHead><TableHead className="text-left">إجمالي مدين</TableHead><TableHead className="text-left">إجمالي دائن</TableHead><TableHead className="text-center">الحالة</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {journalEntries.map((entry) => {
                      const totalDebit = entry.details.reduce((sum, d) => sum + (d.debit || 0), 0);
                      const totalCredit = entry.details.reduce((sum, d) => sum + (d.credit || 0), 0);
                      return (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.reference || "-"}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-xs max-w-xs truncate">
                          {entry.details.map(d => `${(chartOfAccountsData.find(a=>a.id===d.accountId) || {name:d.accountId}).name} (${d.debit ? `مدين: ${d.debit}` : `دائن: ${d.credit}`})`).join('؛ ')}
                        </TableCell>
                        <TableCell className="text-left">{totalDebit.toFixed(2)}</TableCell>
                        <TableCell className="text-left">{totalCredit.toFixed(2)}</TableCell>
                        <TableCell className="text-center"><Badge variant={entry.isPosted ? "default" : "outline"} className={entry.isPosted ? "bg-green-500 text-white" : ""}>{entry.isPosted ? "مرحّل" : "غير مرحّل"}</Badge></TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="عرض/تعديل القيد" onClick={() => openDialog("journal", entry)} disabled={entry.isPosted}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title="حذف القيد" className="text-destructive hover:text-destructive"  onClick={() => handleDelete("journal", entry.id, `القيد بتاريخ ${entry.date}`)} disabled={entry.isPosted}><Trash2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title={entry.isPosted ? "إلغاء ترحيل" : "ترحيل القيد"} onClick={() => handlePostJournalEntry(entry)} >
                            {entry.isPosted ? <FileArchive className="h-4 w-4 text-yellow-600"/> : <FileArchive className="h-4 w-4 text-green-600"/>}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );})}
                  </TableBody>
                </Table>
              ) : (!isLoading && <div className="text-center text-muted-foreground py-10"><BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-lg">لا توجد قيود يومية.</p></div>)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div><CardTitle>شجرة الحسابات</CardTitle><CardDescription>تنظيم وإدارة هيكل الحسابات المالية للمنشأة.</CardDescription></div>
                <Button onClick={() => openDialog("account")}><PlusCircle className="ml-2 h-4 w-4" /> إضافة حساب جديد</Button>
              </div>
               <div className="flex items-center gap-2 pt-4"><Input placeholder="ابحث في الحسابات..." className="max-w-sm" /></div>
            </CardHeader>
            <CardContent>
              {isLoading && <p className="text-center p-4">جار التحميل...</p>}
              {!isLoading && chartOfAccountsData.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>رمز الحساب</TableHead><TableHead>اسم الحساب</TableHead><TableHead>نوع الحساب</TableHead><TableHead>الحساب الرئيسي</TableHead><TableHead>طبيعة الحساب</TableHead><TableHead className="text-left">الرصيد</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {chartOfAccountsData.sort((a,b) => (a.code || "").localeCompare(b.code || "")).map((account) => (
                      <TableRow key={account.id} className={account.isMain ? "bg-muted/50 font-semibold" : ""}>
                        <TableCell style={{ paddingRight: account.parentAccountId ? '2rem' : '1rem' }}>{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell><TableCell>{account.type}</TableCell>
                        <TableCell>{(chartOfAccountsData.find(pAcc => pAcc.id === account.parentAccountId))?.name || "-"}</TableCell>
                        <TableCell>{(account.type === "أصول" || account.type === "مصروفات") ? "مدين" : "دائن"}</TableCell>
                        <TableCell className="text-left">{account.balance.toFixed(2)}</TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="تعديل الحساب" onClick={() => openDialog("account", account)}><Edit className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" title="حذف الحساب" className="text-destructive hover:text-destructive" onClick={() => handleDelete("account", account.id, account.name)} disabled={account.balance !== 0 || chartOfAccountsData.some(c => c.parentAccountId === account.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (!isLoading && <div className="text-center text-muted-foreground py-10"><FileArchive className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-lg">لا توجد حسابات.</p></div>)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costCenters">
          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div><CardTitle>مراكز التكلفة</CardTitle><CardDescription>إدارة وتتبع مراكز التكلفة في المنشأة.</CardDescription></div>
                    <Button onClick={() => openDialog("costCenter")}><PlusCircle className="ml-2 h-4 w-4" /> إضافة مركز تكلفة</Button>
                </div>
               <div className="flex items-center gap-2 pt-4"><Input placeholder="ابحث في مراكز التكلفة..." className="max-w-sm" /></div>
            </CardHeader>
            <CardContent>
                {isLoading && <p className="text-center p-4">جار التحميل...</p>}
                {!isLoading && costCenters.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>رمز المركز</TableHead><TableHead>اسم المركز</TableHead><TableHead>الوصف</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {costCenters.map((center) => (
                      <TableRow key={center.id}>
                        <TableCell>{center.code}</TableCell><TableCell className="font-medium">{center.name}</TableCell>
                        <TableCell>{center.description || "-"}</TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="تعديل" onClick={() => openDialog("costCenter", center)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title="حذف" className="text-destructive hover:text-destructive" onClick={() => handleDelete("costCenter", center.id, center.name)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>))}
                  </TableBody>
                </Table>
              ) : (!isLoading && <div className="text-center text-muted-foreground py-10"><Landmark className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-lg">لا توجد مراكز تكلفة.</p></div>)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receiptVouchers">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div><CardTitle>سندات القبض</CardTitle><CardDescription>تسجيل وإدارة جميع المبالغ المقبوضة.</CardDescription></div>
                <Button onClick={() => openDialog("receipt")}><PlusCircle className="ml-2 h-4 w-4" /> إنشاء سند قبض</Button>
              </div>
              <div className="flex items-center gap-2 pt-4"><Input placeholder="ابحث برقم السند أو المستلم منه..." className="max-w-sm" /><Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button></div>
            </CardHeader>
            <CardContent>
              {isLoading && <p className="text-center p-4">جار التحميل...</p>}
              {!isLoading && receiptVouchers.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>رقم السند</TableHead><TableHead>التاريخ</TableHead><TableHead>الحساب الدائن</TableHead><TableHead>المستلم منه</TableHead><TableHead className="text-left">المبلغ</TableHead><TableHead>طريقة الدفع</TableHead><TableHead>المرجع</TableHead><TableHead>الوصف</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {receiptVouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell>{voucher.voucherNumber}</TableCell><TableCell>{voucher.date}</TableCell>
                        <TableCell>{(chartOfAccountsData.find(a=>a.id===voucher.accountId) || {name: voucher.accountId}).name}</TableCell>
                        <TableCell>{voucher.receivedFrom}</TableCell><TableCell className="text-left">{voucher.amount.toFixed(2)}</TableCell>
                        <TableCell>{voucher.paymentMethod}</TableCell><TableCell>{voucher.reference || "-"}</TableCell>
                        <TableCell>{voucher.description}</TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="تعديل" onClick={() => openDialog("receipt", voucher)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title="حذف" className="text-destructive hover:text-destructive" onClick={() => handleDelete("receipt", voucher.id, voucher.voucherNumber)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>))}
                  </TableBody>
                </Table>
              ) : (!isLoading && <div className="text-center text-muted-foreground py-10"><Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-lg">لا توجد سندات قبض.</p></div>)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paymentVouchers">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div><CardTitle>سندات الصرف</CardTitle><CardDescription>تسجيل وإدارة جميع المبالغ المصروفة.</CardDescription></div>
                <Button onClick={() => openDialog("payment")}><PlusCircle className="ml-2 h-4 w-4" /> إنشاء سند صرف</Button>
              </div>
              <div className="flex items-center gap-2 pt-4"><Input placeholder="ابحث برقم السند أو المدفوع له..." className="max-w-sm" /><Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button></div>
            </CardHeader>
            <CardContent>
              {isLoading && <p className="text-center p-4">جار التحميل...</p>}
              {!isLoading && paymentVouchers.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>رقم السند</TableHead><TableHead>التاريخ</TableHead><TableHead>الحساب المدين</TableHead><TableHead>المدفوع له</TableHead><TableHead className="text-left">المبلغ</TableHead><TableHead>طريقة الدفع</TableHead><TableHead>المرجع</TableHead><TableHead>الوصف</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {paymentVouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell>{voucher.voucherNumber}</TableCell><TableCell>{voucher.date}</TableCell>
                        <TableCell>{(chartOfAccountsData.find(a=>a.id===voucher.accountId) || {name: voucher.accountId}).name}</TableCell>
                        <TableCell>{voucher.paidTo}</TableCell><TableCell className="text-left">{voucher.amount.toFixed(2)}</TableCell>
                        <TableCell>{voucher.paymentMethod}</TableCell><TableCell>{voucher.reference || "-"}</TableCell>
                        <TableCell>{voucher.description}</TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="تعديل" onClick={() => openDialog("payment", voucher)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title="حذف" className="text-destructive hover:text-destructive" onClick={() => handleDelete("payment", voucher.id, voucher.voucherNumber)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>))}
                  </TableBody>
                </Table>
              ) : (!isLoading && <div className="text-center text-muted-foreground py-10"><HandCoins className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-lg">لا توجد سندات صرف.</p></div>)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ledger">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>كشف حساب (دفتر الأستاذ)</CardTitle>
                    <CardDescription>عرض تفصيلي لحركة حساب محدد خلال فترة معينة.</CardDescription>
                    <div className="grid md:grid-cols-3 gap-4 pt-4 items-end">
                        <FormItem>
                            <FormLabel>اختر الحساب</FormLabel>
                            <Select value={selectedLedgerAccountId} onValueChange={setSelectedLedgerAccountId} dir="rtl">
                                <SelectTrigger><SelectValue placeholder="اختر حسابًا لعرض كشفه..." /></SelectTrigger>
                                <SelectContent>
                                    {chartOfAccountsData.filter(a => !a.isMain).map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.code})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                        {/* TODO: Add Date Range Picker for ledger */}
                        <FormItem><FormLabel>من تاريخ</FormLabel><Input type="date" /></FormItem>
                        <FormItem><FormLabel>إلى تاريخ</FormLabel><Input type="date" /></FormItem>
                        <Button onClick={handleFetchLedger} disabled={!selectedLedgerAccountId || isLoading} className="md:col-start-3">
                            <Search className="ml-2 h-4 w-4"/> عرض كشف الحساب
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading && selectedLedgerAccountId && <p className="text-center p-4">جار تحميل كشف الحساب...</p>}
                    {ledgerAccount && (
                        <div className="mb-4 p-3 border rounded-md bg-muted/50">
                            <h3 className="text-lg font-semibold">كشف حساب لـ: {ledgerAccount.name} ({ledgerAccount.code})</h3>
                            <p className="text-sm">نوع الحساب: {ledgerAccount.type} | الرصيد الافتتاحي (مثال): {ledgerAccount.balance.toFixed(2)}</p>
                        </div>
                    )}
                    {!isLoading && selectedLedgerAccountId && ledgerEntries.length === 0 && !ledgerAccount && (
                         <div className="text-center text-muted-foreground py-10"><Banknote className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-lg">الرجاء اختيار حساب وتحديد الفترة لعرض كشف الحساب.</p></div>
                    )}
                     {!isLoading && ledgerAccount && ledgerEntries.length === 0 && (
                         <div className="text-center text-muted-foreground py-10"><Banknote className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-lg">لا توجد حركات لهذا الحساب في الفترة المحددة.</p></div>
                    )}
                    {!isLoading && ledgerEntries.length > 0 && (
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>التاريخ</TableHead><TableHead>المرجع</TableHead><TableHead>الوصف (القيد)</TableHead>
                                <TableHead className="text-left">مدين</TableHead><TableHead className="text-left">دائن</TableHead>
                                <TableHead className="text-left">الرصيد</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {ledgerEntries.map((detail: any, index) => (
                                    <TableRow key={`${detail.entryId}-${index}`}>
                                        <TableCell>{detail.entryDate}</TableCell>
                                        <TableCell>{detail.entryReference || "-"}</TableCell>
                                        <TableCell>{detail.entryDescription}</TableCell>
                                        <TableCell className="text-left">{detail.debit ? detail.debit.toFixed(2) : "-"}</TableCell>
                                        <TableCell className="text-left">{detail.credit ? detail.credit.toFixed(2) : "-"}</TableCell>
                                        <TableCell className="text-left">{detail.runningBalance.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
      
      {isJournalEntryDialogOpen && <JournalEntryDialog open={isJournalEntryDialogOpen} onOpenChange={setIsJournalEntryDialogOpen} entry={editingJournalEntry} onSave={fetchData} accounts={chartOfAccountsData} costCenters={costCenters} />}
      {isAccountDialogOpen && <AccountDialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen} account={editingAccount} onSave={fetchData} accounts={chartOfAccountsData} />}
      {isCostCenterDialogOpen && <CostCenterDialog open={isCostCenterDialogOpen} onOpenChange={setIsCostCenterDialogOpen} costCenter={editingCostCenter} onSave={fetchData} />}
      {isReceiptVoucherDialogOpen && <VoucherDialog type="receipt" open={isReceiptVoucherDialogOpen} onOpenChange={setIsReceiptVoucherDialogOpen} voucher={editingReceiptVoucher} onSave={fetchData} accounts={chartOfAccountsData} />}
      {isPaymentVoucherDialogOpen && <VoucherDialog type="payment" open={isPaymentVoucherDialogOpen} onOpenChange={setIsPaymentVoucherDialogOpen} voucher={editingPaymentVoucher} onSave={fetchData} accounts={chartOfAccountsData} />}
    </>
  );
}

    