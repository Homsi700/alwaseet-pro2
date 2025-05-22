
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Edit, Trash2, Search, Filter, FileText, ShoppingBag, RotateCcw, FileSignature, Printer, Save } from "lucide-react";
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInvoices as getInvoicesService, createInvoice, updateInvoice, deleteInvoice as deleteInvoiceService } from "@/lib/services/invoicing";
import { getContacts, Contact } from "@/lib/services/contacts"; // Assuming Contact type is exported
import { getInventoryItems, InventoryItem } from "@/lib/services/inventory"; // Assuming InventoryItem type is exported


export type InvoiceType = "Sales" | "Purchase" | "Tax" | "Return";
export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Draft" | "Cancelled" | "PartiallyPaid";
type InvoiceStatusArabic = "مدفوعة" | "معلقة" | "متأخرة السداد" | "مسودة" | "ملغاة" | "مدفوعة جزئياً";

export interface InvoiceItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discountRate?: number; 
    taxRate?: number; 
    totalPrice: number; 
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  customerSupplierName: string; 
  customerSupplierId: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  type: InvoiceType; 
  paymentMethod?: string; 
  notes?: string; 
  salesperson?: string; 
  isEInvoice?: boolean; 
  eInvoiceStatus?: string; 
  items: InvoiceItem[];
}

const invoiceItemSchema = z.object({
  productId: z.string().min(1, "المنتج مطلوب"),
  productName: z.string(), // Will be auto-filled
  quantity: z.coerce.number().min(1, "الكمية يجب أن تكون 1 على الأقل"),
  unitPrice: z.coerce.number().min(0, "سعر الوحدة لا يمكن أن يكون سالبًا"),
  discountRate: z.coerce.number().min(0).max(1).optional(),
  taxRate: z.coerce.number().min(0).max(1).default(0.15), // Default VAT 15%
});

const invoiceFormSchema = z.object({
  type: z.enum(["Sales", "Purchase", "Tax", "Return"], { required_error: "نوع الفاتورة مطلوب" }),
  customerSupplierId: z.string().min(1, "العميل/المورد مطلوب"),
  date: z.string().min(1, "تاريخ الفاتورة مطلوب").refine(val => !isNaN(Date.parse(val.split('/').reverse().join('-'))), {message: "تاريخ الفاتورة غير صالح (مثال: 31/12/2025)"}),
  dueDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val.split('/').reverse().join('-'))), {message: "تاريخ الاستحقاق غير صالح"}),
  paymentMethod: z.string().optional(),
  salesperson: z.string().optional(),
  notes: z.string().optional(),
  isEInvoice: z.boolean().default(false),
  items: z.array(invoiceItemSchema).min(1, "يجب إضافة بند واحد على الأقل للفاتورة"),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;


const statusMap: Record<InvoiceStatus, InvoiceStatusArabic> = {
  Paid: "مدفوعة", Pending: "معلقة", Overdue: "متأخرة السداد", Draft: "مسودة", Cancelled: "ملغاة", PartiallyPaid: "مدفوعة جزئياً",
};

const getStatusVariant = (status: InvoiceStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Paid": return "default"; case "Pending": return "secondary"; case "Overdue": return "destructive"; 
    case "Draft": return "outline"; case "Cancelled": return "outline"; case "PartiallyPaid": return "secondary"; 
    default: return "outline";
  }
};
const getStatusColorClass = (status: InvoiceStatus): string => {
  switch (status) {
    case "Paid": return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
    case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700";
    case "Overdue": return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
    case "Draft": return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600";
    case "Cancelled": return "bg-slate-100 text-slate-600 border-slate-300 opacity-70 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700";
    case "PartiallyPaid": return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
    default: return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600";
  }
}

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
  onSave: () => void;
  contacts: Contact[];
  products: InventoryItem[];
}

function InvoiceDialog({ open, onOpenChange, invoice, onSave, contacts, products }: InvoiceDialogProps) {
  const { toast } = useToast();
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      type: "Sales", customerSupplierId: "", date: new Date().toLocaleDateString('fr-CA').split('-').reverse().join('/'), // DD/MM/YYYY
      items: [{ productId: "", productName: "", quantity: 1, unitPrice: 0, taxRate: 0.15 }],
      isEInvoice: true,
    },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    if (invoice) {
      form.reset({
        type: invoice.type,
        customerSupplierId: invoice.customerSupplierId,
        date: invoice.date,
        dueDate: invoice.dueDate || "",
        paymentMethod: invoice.paymentMethod || "",
        salesperson: invoice.salesperson || "",
        notes: invoice.notes || "",
        isEInvoice: invoice.isEInvoice || false,
        items: invoice.items.map(item => ({ ...item, discountRate: item.discountRate || 0, taxRate: item.taxRate || 0.15 })),
      });
    } else {
       form.reset({
        type: "Sales", customerSupplierId: "", date: new Date().toLocaleDateString('fr-CA').split('-').reverse().join('/'),
        items: [{ productId: "", productName: "", quantity: 1, unitPrice: 0, taxRate: 0.15 }],
        isEInvoice: true, 
      });
    }
  }, [invoice, form, open]);

  const onSubmit = async (data: InvoiceFormData) => {
    const customerSupplier = contacts.find(c => c.id === data.customerSupplierId);
    if (!customerSupplier) {
      toast({ variant: "destructive", title: "خطأ", description: "لم يتم العثور على العميل/المورد المحدد."});
      return;
    }

    const itemsWithDetails = data.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const unitPrice = product ? product.sellingPrice : item.unitPrice; // Use product selling price if available
      const itemSubTotal = item.quantity * unitPrice * (1 - (item.discountRate || 0));
      const itemTotal = itemSubTotal * (1 + (item.taxRate || 0));
      return { ...item, productName: product?.name || "منتج غير معروف", unitPrice, totalPrice: itemTotal };
    });
    
    const invoicePayload = {
      ...data,
      customerSupplierName: customerSupplier.name,
      items: itemsWithDetails,
      // Amount, taxAmount, totalAmount will be calculated by the service/backend
    };

    try {
      if (invoice) {
        await updateInvoice(invoice.id, invoicePayload as Partial<Omit<Invoice, 'id' | 'invoiceNumber' | 'amount' | 'taxAmount' | 'totalAmount'>>);
        toast({ title: "تم التحديث بنجاح", description: "تم تحديث الفاتورة." });
      } else {
        // For add, status is usually draft or pending
        await createInvoice({ ...invoicePayload, status: "Draft" } as Omit<Invoice, 'id' | 'amount' | 'taxAmount' | 'totalAmount'>);
        toast({ title: "تم الإنشاء بنجاح", description: "تم إنشاء الفاتورة." });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "حدث خطأ", description: "لم يتم حفظ الفاتورة." });
    }
  };

  const calculateItemTotal = (index: number) => {
    const item = form.getValues(`items.${index}`);
    if (!item) return 0;
    const product = products.find(p => p.id === item.productId);
    const unitPrice = product ? product.sellingPrice : item.unitPrice;
    const subTotal = item.quantity * unitPrice * (1-(item.discountRate || 0));
    return subTotal * (1+(item.taxRate || 0));
  }

  const calculateGrandTotal = () => {
    const items = form.getValues("items");
    return items.reduce((sum, item, index) => sum + calculateItemTotal(index), 0);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{invoice ? "تعديل فاتورة" : "إنشاء فاتورة جديدة"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Invoice Header Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>نوع الفاتورة</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Sales">مبيعات</SelectItem><SelectItem value="Purchase">مشتريات</SelectItem>
                      <SelectItem value="Tax">ضريبية</SelectItem><SelectItem value="Return">مرتجع</SelectItem>
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="customerSupplierId" render={({ field }) => (
                <FormItem><FormLabel>{form.getValues("type") === "Purchase" || form.getValues("type") === "Return" && contacts.find(c=>c.id === field.value)?.type === "Supplier" ? "المورد" : "العميل"}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                    <FormControl><SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      {contacts.filter(c => form.getValues("type") === "Purchase" || form.getValues("type") === "Return" ? c.type === "Supplier" : c.type === "Customer").map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem><FormLabel>تاريخ الفاتورة</FormLabel><FormControl><Input placeholder="DD/MM/YYYY" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FormField control={form.control} name="dueDate" render={({ field }) => (
                <FormItem><FormLabel>تاريخ الاستحقاق (اختياري)</FormLabel><FormControl><Input placeholder="DD/MM/YYYY" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                <FormItem><FormLabel>طريقة الدفع (اختياري)</FormLabel><FormControl><Input placeholder="نقدي، تحويل..." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="salesperson" render={({ field }) => (
                <FormItem><FormLabel>مندوب المبيعات (اختياري)</FormLabel><FormControl><Input placeholder="اسم المندوب" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
             <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>ملاحظات (اختياري)</FormLabel><FormControl><Input placeholder="أي ملاحظات إضافية على الفاتورة" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="isEInvoice" render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-x-reverse space-y-0 rounded-md border p-3 shadow-sm mt-4">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="font-normal mb-0!">فاتورة إلكترونية (حسب متطلبات بلدك)</FormLabel>
                </FormItem>
            )}/>

            {/* Invoice Items */}
            <Card className="mt-4">
              <CardHeader><CardTitle>بنود الفاتورة</CardTitle></CardHeader>
              <CardContent>
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[1fr_100px_100px_80px_80px_120px_auto] gap-2 items-end mb-3 p-2 border-b">
                    <FormField control={form.control} name={`items.${index}.productId`} render={({ field: itemField }) => (
                      <FormItem><FormLabel className="text-xs">المنتج</FormLabel>
                        <Select onValueChange={(value) => {
                            itemField.onChange(value);
                            const product = products.find(p => p.id === value);
                            form.setValue(`items.${index}.productName`, product?.name || "");
                            form.setValue(`items.${index}.unitPrice`, product?.sellingPrice || 0);
                        }} defaultValue={itemField.value} dir="rtl">
                          <FormControl><SelectTrigger><SelectValue placeholder="اختر منتجًا..." /></SelectTrigger></FormControl>
                          <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (المتوفر: {p.quantity})</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field: itemField }) => (
                      <FormItem><FormLabel className="text-xs">الكمية</FormLabel><FormControl><Input type="number" {...itemField} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field: itemField }) => (
                      <FormItem><FormLabel className="text-xs">سعر الوحدة</FormLabel><FormControl><Input type="number" step="0.01" {...itemField} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.discountRate`} render={({ field: itemField }) => (
                      <FormItem><FormLabel className="text-xs">خصم (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...itemField} onChange={e => itemField.onChange(e.target.value ? parseFloat(e.target.value) / 100 : undefined)} value={itemField.value !== undefined ? itemField.value * 100 : ""} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.taxRate`} render={({ field: itemField }) => (
                      <FormItem><FormLabel className="text-xs">ضريبة (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="15.00" {...itemField} onChange={e => itemField.onChange(e.target.value ? parseFloat(e.target.value) / 100 : 0.15)} value={itemField.value !== undefined ? itemField.value * 100 : "15"} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormItem><FormLabel className="text-xs">الإجمالي</FormLabel><Input value={calculateItemTotal(index).toFixed(2)} readOnly className="bg-muted" /></FormItem>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="self-end text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", productName:"", quantity: 1, unitPrice: 0, taxRate: 0.15 })}>
                  <PlusCircle className="ml-2 h-4 w-4" /> إضافة بند جديد
                </Button>
              </CardContent>
            </Card>
            <div className="text-left font-bold text-lg mt-4">الإجمالي الكلي للفاتورة: {calculateGrandTotal().toFixed(2)} ر.س</div>

            <DialogFooter className="pt-6">
              <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Save className="ml-2 h-4 w-4"/> {form.formState.isSubmitting ? "جاري الحفظ..." : "حفظ الفاتورة"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


const InvoiceTable = ({ invoices, typeLabel, onEdit, onDelete, onView, onPrint, isLoading }: { 
  invoices: Invoice[]; typeLabel: string;
  onEdit: (invoice: Invoice) => void; onDelete: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void; onPrint: (invoice: Invoice) => void;
  isLoading: boolean;
}) => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle>قائمة فواتير {typeLabel}</CardTitle>
      <CardDescription>عرض وإدارة جميع فواتير {typeLabel} المسجلة في النظام.</CardDescription>
      <div className="flex items-center gap-2 pt-4">
        <Input placeholder={`ابحث في فواتير ${typeLabel}...`} className="max-w-sm" />
        <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button>
      </div>
    </CardHeader>
    <CardContent>
      {isLoading && <p className="text-center p-4">جاري تحميل الفواتير...</p>}
      {!isLoading && invoices.length === 0 && (
        <div className="text-center text-muted-foreground py-10">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg">لا توجد فواتير {typeLabel} لعرضها حاليًا.</p>
            <p className="text-sm">ابدأ بإنشاء فاتورة جديدة لتتبع معاملاتك المالية.</p>
        </div>
      )}
      {!isLoading && invoices.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الفاتورة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>تاريخ الاستحقاق</TableHead>
              <TableHead>العميل/المورد</TableHead>
              <TableHead className="text-left">الإجمالي (ر.س)</TableHead>
              <TableHead>طريقة الدفع</TableHead>
              <TableHead className="text-center">الحالة</TableHead>
              <TableHead className="text-center">فاتورة إلكترونية</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{invoice.date}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{invoice.dueDate || "-"}</TableCell>
                <TableCell>{invoice.customerSupplierName}</TableCell>
                <TableCell className="text-left font-semibold">{invoice.totalAmount.toFixed(2)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{invoice.paymentMethod || "-"}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(invoice.status)} className={`text-xs ${getStatusColorClass(invoice.status)}`}>{statusMap[invoice.status]}</Badge>
                </TableCell>
                 <TableCell className="text-center">
                  {invoice.isEInvoice ? <Badge variant="outline" className="border-sky-500 text-sky-600">{invoice.eInvoiceStatus || "مرسلة"}</Badge> : "-"}
                </TableCell>
                <TableCell className="text-center space-x-1">
                  <Button variant="ghost" size="icon" title="عرض الفاتورة" onClick={() => onView(invoice)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="طباعة الفاتورة" onClick={() => onPrint(invoice)}><Printer className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="تعديل الفاتورة" onClick={() => onEdit(invoice)} disabled={invoice.status === "Paid" || invoice.status === "Cancelled"}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="حذف الفاتورة" className="text-destructive hover:text-destructive" onClick={() => onDelete(invoice)} disabled={invoice.status === "Paid"}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardContent>
  </Card>
);

export default function InvoicingPage() {
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<InventoryItem[]>([]);

  const fetchInvoicesData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getInvoicesService(); // Get all invoices
      setAllInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل بيانات الفواتير." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  const fetchRequiredDataForDialog = useCallback(async () => {
    try {
      const [contactsData, productsData] = await Promise.all([
        getContacts(),
        getInventoryItems()
      ]);
      setContacts(contactsData);
      setProducts(productsData);
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل البيانات اللازمة لإنشاء الفاتورة." });
    }
  }, [toast]);


  useEffect(() => {
    fetchInvoicesData();
    fetchRequiredDataForDialog();
  }, [fetchInvoicesData, fetchRequiredDataForDialog]);

  const handleOpenAddDialog = () => {
    setEditingInvoice(null);
    setIsDialogOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsDialogOpen(true);
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
     if (confirm(`هل أنت متأكد من حذف الفاتورة رقم ${invoice.invoiceNumber}؟`)) {
        try {
            await deleteInvoiceService(invoice.id);
            toast({ title: "تم الحذف", description: `تم حذف الفاتورة ${invoice.invoiceNumber}.` });
            fetchInvoicesData(); // Refresh list
        } catch (error) {
            toast({ variant: "destructive", title: "خطأ في الحذف", description: "لم يتم حذف الفاتورة."});
        }
    }
  };
  const handleViewInvoice = (invoice: Invoice) => {
    console.log("View invoice:", invoice.id);
    toast({title: "عرض التفاصيل", description: `عرض تفاصيل الفاتورة ${invoice.invoiceNumber} (قيد التطوير)`});
  };
  const handlePrintInvoice = (invoice: Invoice) => {
    console.log("Print invoice:", invoice.id);
     toast({title: "طباعة", description: `طباعة الفاتورة ${invoice.invoiceNumber} (قيد التطوير)`});
  };

  const salesInvoices = allInvoices.filter(inv => inv.type === "Sales");
  const purchaseInvoices = allInvoices.filter(inv => inv.type === "Purchase");
  const taxInvoices = allInvoices.filter(inv => inv.type === "Tax"); 
  const returnInvoices = allInvoices.filter(inv => inv.type === "Return");

  return (
    <>
      <PageHeader 
        title="وحدة الفوترة الشاملة" 
        description="إدارة متكاملة لجميع أنواع الفواتير: المبيعات، المشتريات، الضرائب، والمرتجعات."
        actions={
          <Button onClick={handleOpenAddDialog}>
            <PlusCircle className="ml-2 h-4 w-4" /> إنشاء فاتورة جديدة
          </Button>
        }
      />

      <Tabs defaultValue="sales" dir="rtl" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="sales" className="text-base py-2.5 flex items-center gap-2"><FileText className="h-4 w-4"/>فواتير المبيعات</TabsTrigger>
          <TabsTrigger value="purchase" className="text-base py-2.5 flex items-center gap-2"><ShoppingBag className="h-4 w-4"/>فواتير المشتريات</TabsTrigger>
          <TabsTrigger value="tax" className="text-base py-2.5 flex items-center gap-2"><FileSignature className="h-4 w-4"/>فواتير ضريبية</TabsTrigger> 
          <TabsTrigger value="returns" className="text-base py-2.5 flex items-center gap-2"><RotateCcw className="h-4 w-4"/>فواتير المرتجعات</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <InvoiceTable invoices={salesInvoices} typeLabel="المبيعات" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} onPrint={handlePrintInvoice} isLoading={isLoading}/>
        </TabsContent>
        <TabsContent value="purchase">
          <InvoiceTable invoices={purchaseInvoices} typeLabel="المشتريات" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} onPrint={handlePrintInvoice} isLoading={isLoading}/>
        </TabsContent>
        <TabsContent value="tax">
           <InvoiceTable invoices={taxInvoices} typeLabel="الضرائب" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} onPrint={handlePrintInvoice} isLoading={isLoading}/>
        </TabsContent>
        <TabsContent value="returns">
           <InvoiceTable invoices={returnInvoices} typeLabel="المرتجعات" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} onPrint={handlePrintInvoice} isLoading={isLoading}/>
        </TabsContent>
      </Tabs>
      <InvoiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        invoice={editingInvoice}
        onSave={fetchInvoicesData}
        contacts={contacts}
        products={products}
      />
    </>
  );
}
