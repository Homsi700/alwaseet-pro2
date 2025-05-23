
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Edit, Trash2, Search, Filter, FileText, ShoppingBag, RotateCcw, FileSignature, Printer, Save, ScanLine, CalendarDays, Users2, Hash, ShieldCheck, ShieldX } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getInvoices as getInvoicesService, createInvoice as createInvoiceService, updateInvoice as updateInvoiceService, deleteInvoice as deleteInvoiceService, Invoice, InvoiceItem as InvoiceLineItem, InvoiceStatus, InvoiceType } from "@/lib/services/invoicing";
import { getContacts, Contact } from "@/lib/services/contacts";
import { getProducts, InventoryItem, getInventoryItemByBarcode } from "@/lib/services/inventory"; // Changed getInventoryItems to getProducts

// Mappings for display
const statusMap: Record<InvoiceStatus, string> = {
  Paid: "مدفوعة", Pending: "معلقة", Overdue: "متأخرة السداد", Draft: "مسودة", Cancelled: "ملغاة", PartiallyPaid: "مدفوعة جزئياً",
};
const typeMap: Record<InvoiceType, string> = {
  Sales: "مبيعات", Purchase: "مشتريات", Tax: "ضريبية", Return: "مرتجع", Quote: "عرض سعر", SalesOrder: "أمر بيع", PurchaseOrder: "أمر شراء"
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
    case "Paid": return "bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-600";
    case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700/30 dark:text-yellow-300 dark:border-yellow-600";
    case "Overdue": return "bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-300 dark:border-red-600";
    case "Draft": return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-600/30 dark:text-gray-300 dark:border-gray-500";
    case "Cancelled": return "bg-slate-100 text-slate-600 border-slate-300 opacity-70 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600";
    case "PartiallyPaid": return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-600";
    default: return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-600/30 dark:text-gray-300 dark:border-gray-500";
  }
};

const invoiceItemSchema = z.object({
  productId: z.string().min(1, "المنتج مطلوب"),
  productName: z.string().optional(), 
  quantity: z.coerce.number().min(0.01, "الكمية يجب أن تكون أكبر من صفر"),
  unitPrice: z.coerce.number().min(0, "سعر الوحدة لا يمكن أن يكون سالبًا"),
  discountRate: z.coerce.number().min(0).max(1).optional().default(0),
  taxRate: z.coerce.number().min(0).max(1).default(0.15), // Default 15% VAT
});
type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;

const invoiceFormSchema = z.object({
  type: z.enum(["Sales", "Purchase", "Tax", "Return", "Quote", "SalesOrder", "PurchaseOrder"], { required_error: "نوع الفاتورة مطلوب" }),
  customerSupplierId: z.string().min(1, "العميل/المورد مطلوب"),
  date: z.string().min(1, "تاريخ الفاتورة مطلوب").refine(val => !isNaN(Date.parse(val.split('/').reverse().join('-'))), {message: "تاريخ الفاتورة غير صالح (DD/MM/YYYY)"}),
  dueDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val.split('/').reverse().join('-'))), {message: "تاريخ الاستحقاق غير صالح (DD/MM/YYYY)"}),
  paymentMethod: z.string().optional(),
  salesperson: z.string().optional(),
  notes: z.string().optional(),
  isEInvoice: z.boolean().default(true),
  eInvoiceStatus: z.string().optional(), // Consider enum if statuses are fixed
  status: z.enum(["Paid", "Pending", "Overdue", "Draft", "Cancelled", "PartiallyPaid"]).default("Draft"),
  items: z.array(invoiceItemSchema).min(1, "يجب إضافة بند واحد على الأقل للفاتورة"),
});
type InvoiceFormData = z.infer<typeof invoiceFormSchema>;


interface InvoiceDialogProps {
  open: boolean; onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null; onSave: () => void;
  contacts: Contact[]; products: InventoryItem[];
}

function InvoiceDialog({ open, onOpenChange, invoice, onSave, contacts, products }: InvoiceDialogProps) {
  const { toast } = useToast();
  const itemBarcodeRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      type: "Sales", date: new Date().toLocaleDateString('fr-CA'), // YYYY-MM-DD for input type="date"
      items: [{ productId: "", productName: "", quantity: 1, unitPrice: 0, taxRate: 0.15, discountRate: 0 }],
      isEInvoice: true, status: "Draft", paymentMethod: "نقدي",
    },
  });
  const { fields, append, remove, update } = useFieldArray({ control: form.control, name: "items" });
  const currentInvoiceType = form.watch("type");

  useEffect(() => {
    if (open) {
      if (invoice) {
        form.reset({
          ...invoice,
          date: invoice.date.split('/').reverse().join('-'), // Convert DD/MM/YYYY to YYYY-MM-DD
          dueDate: invoice.dueDate ? invoice.dueDate.split('/').reverse().join('-') : undefined,
          customerSupplierId: invoice.customerSupplierId || "",
          items: invoice.items.map(item => ({
            productId: item.productId, productName: item.productName, quantity: item.quantity,
            unitPrice: item.unitPrice, discountRate: item.discountRate || 0, taxRate: item.taxRate || 0.15,
          }))
        });
      } else {
         form.reset({
          type: "Sales", customerSupplierId: "", date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          items: [{ productId: "", productName: "", quantity: 1, unitPrice: 0, taxRate: 0.15, discountRate: 0 }],
          isEInvoice: true, status: "Draft", paymentMethod: "نقدي",
        });
      }
      setTimeout(() => itemBarcodeRefs.current[0]?.focus(), 100);
    }
  }, [invoice, form, open]);

  const onSubmit = async (data: InvoiceFormData) => {
    const customerSupplier = contacts.find(c => c.id === data.customerSupplierId);
    if (!customerSupplier) {
      toast({ variant: "destructive", title: "خطأ", description: "لم يتم العثور على العميل/المورد المحدد."});
      return;
    }
    
    let calculatedAmount = 0; let calculatedTaxAmount = 0;
    const itemsWithDetails = data.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const basePrice = product ? (data.type === "Purchase" ? product.costPrice : product.sellingPrice) : item.unitPrice;
      const itemSubTotalAfterDiscount = item.quantity * basePrice * (1 - (item.discountRate || 0));
      const itemTax = itemSubTotalAfterDiscount * (item.taxRate || 0);
      calculatedAmount += itemSubTotalAfterDiscount; 
      calculatedTaxAmount += itemTax;
      return { ...item, productName: product?.name || "منتج غير معروف", unitPrice: basePrice, totalPrice: itemSubTotalAfterDiscount + itemTax };
    });
    const calculatedTotalAmount = calculatedAmount + calculatedTaxAmount;
    
    const invoicePayload: Omit<Invoice, 'id' | 'invoiceNumber'> = {
      ...data,
      date: new Date(data.date).toLocaleDateString('ar-EG', {day:'2-digit', month:'2-digit', year:'numeric'}), 
      dueDate: data.dueDate ? new Date(data.dueDate).toLocaleDateString('ar-EG', {day:'2-digit', month:'2-digit', year:'numeric'}) : undefined,
      customerSupplierName: customerSupplier.name, items: itemsWithDetails,
      amount: calculatedAmount, taxAmount: calculatedTaxAmount, totalAmount: calculatedTotalAmount,
    };

    try {
      if (invoice && invoice.id) {
        await updateInvoiceService(invoice.id, invoicePayload);
        toast({ title: "تم تحديث الفاتورة بنجاح" });
      } else {
        await createInvoiceService(invoicePayload);
        toast({ title: "تم إنشاء الفاتورة بنجاح" });
      }
      onSave(); onOpenChange(false);
    } catch (error) { toast({ variant: "destructive", title: "حدث خطأ", description: `لم يتم حفظ الفاتورة. ${(error as Error).message}` }); }
  };

  const calculateItemTotal = (index: number) => {
    const item = form.getValues(`items.${index}`);
    if (!item || !item.productId) return 0;
    const product = products.find(p => p.id === item.productId);
    const unitPrice = product ? (form.getValues("type") === "Purchase" ? product.costPrice : product.sellingPrice) : item.unitPrice;
    const subTotal = (item.quantity || 0) * (unitPrice || 0);
    const discountAmount = subTotal * (item.discountRate || 0);
    const priceAfterDiscount = subTotal - discountAmount;
    const taxAmount = priceAfterDiscount * (item.taxRate || 0);
    return priceAfterDiscount + taxAmount;
  }

  const calculateGrandTotal = () => {
    const items = form.getValues("items");
    return items.reduce((sum, item, index) => sum + calculateItemTotal(index), 0);
  }

  const handleBarcodeScan = async (barcode: string, itemIndex: number) => {
    if (!barcode.trim()) return;
    try {
        const product = await getInventoryItemByBarcode(barcode.trim());
        if (product) {
            const price = form.getValues("type") === "Purchase" ? product.costPrice : product.sellingPrice;
            update(itemIndex, { ...fields[itemIndex], productId: product.id, productName: product.name, unitPrice: price, quantity: fields[itemIndex]?.quantity || 1 });
            toast({title: "تم العثور على المنتج", description: `تم تحديث البند: ${product.name}`});
            if (itemBarcodeRefs.current[itemIndex]) itemBarcodeRefs.current[itemIndex]!.value = "";
            
            const quantityInput = document.getElementById(`items.${index}.quantity`);
            if (quantityInput) {
                quantityInput.focus();
                (quantityInput as HTMLInputElement).select();
            } else if (itemIndex < fields.length - 1 && itemBarcodeRefs.current[itemIndex + 1]) {
                itemBarcodeRefs.current[itemIndex + 1]?.focus();
            } 
        } else { 
            toast({title: "منتج غير موجود", description: `لم يتم العثور على منتج بالباركود: ${barcode}`, variant: "destructive"}); 
            if (itemBarcodeRefs.current[itemIndex]) itemBarcodeRefs.current[itemIndex]!.value = ""; 
            itemBarcodeRefs.current[itemIndex]?.focus(); 
        }
    } catch (error) { 
        toast({title: "خطأ في البحث بالباركود", variant: "destructive", description: (error as Error).message}); 
        if (itemBarcodeRefs.current[itemIndex]) itemBarcodeRefs.current[itemIndex]!.value = "";
        itemBarcodeRefs.current[itemIndex]?.focus();
    }
  };
  
  const customerSupplierLabel = currentInvoiceType === "Purchase" || (currentInvoiceType === "Return" && contacts.find(c => c.id === form.watch("customerSupplierId"))?.type === "Supplier") ? "المورد" : "العميل";
  const filteredContacts = contacts.filter(c => 
    currentInvoiceType === "Purchase" || (currentInvoiceType === "Return" && c.type === "Supplier") ? c.type === "Supplier" : c.type === "Customer"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
      <DialogHeader><DialogTitle>{invoice ? `تعديل ${typeMap[invoice.type]} رقم ${invoice.invoiceNumber}` : `إنشاء ${typeMap[currentInvoiceType || "Sales"]} جديدة`}</DialogTitle></DialogHeader>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>نوع المستند</FormLabel>
            <Select onValueChange={(value) => {field.onChange(value); form.setValue("customerSupplierId", "");}} value={field.value} dir="rtl">
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>{Object.entries(typeMap).map(([key, value]) => (<SelectItem key={key} value={key as InvoiceType}>{value}</SelectItem>))}</SelectContent>
            </Select><FormMessage /></FormItem>)}/>
          <FormField control={form.control} name="customerSupplierId" render={({ field }) => (<FormItem><FormLabel>{customerSupplierLabel}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} dir="rtl">
              <FormControl><SelectTrigger><SelectValue placeholder={`اختر ${customerSupplierLabel}...`} /></SelectTrigger></FormControl>
              <SelectContent>{filteredContacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.phone})</SelectItem>)}</SelectContent>
            </Select><FormMessage /></FormItem>)}/>
          <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>تاريخ المستند</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="dueDate" render={({ field }) => (<FormItem><FormLabel>تاريخ الاستحقاق (اختياري)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)}/>
          <FormField control={form.control} name="paymentMethod" render={({ field }) => (<FormItem><FormLabel>طريقة الدفع</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || "نقدي"} dir="rtl">
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="نقدي">نقدي</SelectItem><SelectItem value="شبكة">شبكة (مدى/فيزا)</SelectItem><SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem><SelectItem value="آجل">آجل</SelectItem><SelectItem value="شيك">شيك</SelectItem></SelectContent>
            </Select><FormMessage /></FormItem>)}/>
          <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>حالة المستند</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} dir="rtl">
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>{Object.entries(statusMap).map(([key, value]) => (<SelectItem key={key} value={key as InvoiceStatus}>{value}</SelectItem>))}</SelectContent>
            </Select><FormMessage /></FormItem>)}/>
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>ملاحظات (اختياري)</FormLabel><FormControl><Textarea placeholder="أي ملاحظات إضافية على الفاتورة..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="salesperson" render={({ field }) => (<FormItem><FormLabel>مندوب المبيعات (اختياري)</FormLabel><FormControl><Input placeholder="اسم المندوب إن وجد" {...field} /></FormControl><FormMessage /></FormItem>)}/>
          <FormField control={form.control} name="isEInvoice" render={({ field }) => (<FormItem className="flex items-center gap-2 pt-6"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">فاتورة إلكترونية (خاضعة للضريبة)</FormLabel></FormItem>)}/>
        </div>
        <Card><CardHeader><CardTitle>بنود المستند</CardTitle></CardHeader>
          <CardContent>
            <div className="hidden md:grid md:grid-cols-[100px_1.2fr_1fr_0.8fr_0.8fr_0.8fr_1fr_auto] gap-x-2 gap-y-1 items-end mb-2 font-medium text-sm text-muted-foreground px-1">
              <span>باركود</span><span>المنتج</span><span>الكمية</span><span>سعر الوحدة (ل.س)</span><span>خصم (%)</span><span>ضريبة (%)</span><span>الإجمالي (ل.س)</span><span></span>
            </div>
            {fields.map((item, index) => (
            <div key={item.id} className="grid grid-cols-2 md:grid-cols-[100px_1.2fr_1fr_0.8fr_0.8fr_0.8fr_1fr_auto] gap-x-2 gap-y-2 items-start md:items-end mb-3 p-2 border rounded-md">
              <FormItem className="col-span-2 md:col-span-1"><FormLabel htmlFor={`items.${index}.barcode`} className="text-xs md:hidden">باركود المنتج</FormLabel>
                <Input id={`items.${index}.barcode`} ref={el => itemBarcodeRefs.current[index] = el} placeholder="امسح الباركود" autoFocus={index === 0}
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value.trim()) { e.preventDefault(); handleBarcodeScan(e.currentTarget.value, index); }}} className="h-9 text-sm"/>
              </FormItem>
              <FormField control={form.control} name={`items.${index}.productId`} render={({ field: itemField }) => (
                <FormItem className="col-span-2 md:col-span-1"><FormLabel className="text-xs md:hidden">المنتج</FormLabel>
                <Select onValueChange={(value) => { itemField.onChange(value); const p=products.find(pr=>pr.id===value); if(p) { form.setValue(`items.${index}.productName`,p.name); const price = form.getValues("type") === "Purchase" ? p.costPrice : p.sellingPrice; form.setValue(`items.${index}.unitPrice`, price); } }} value={itemField.value} dir="rtl">
                  <FormControl><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="اختر المنتج..."/></SelectTrigger></FormControl>
                  <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (متوفر: {p.quantity})</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name={`items.${index}.quantity`} render={({ field: itemField }) => (<FormItem><FormLabel className="text-xs md:hidden">الكمية</FormLabel><FormControl><Input type="number" step="any" {...itemField} className="h-9 text-sm text-center" id={`items.${index}.quantity`} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field: itemField }) => (<FormItem><FormLabel className="text-xs md:hidden">سعر الوحدة</FormLabel><FormControl><Input type="number" step="any" {...itemField} className="h-9 text-sm text-center" readOnly={!!form.watch(`items.${index}.productId`)} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name={`items.${index}.discountRate`} render={({ field: itemField }) => (<FormItem><FormLabel className="text-xs md:hidden">خصم (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0" {...itemField} onChange={e => itemField.onChange(e.target.value ? parseFloat(e.target.value) / 100 : 0)} value={itemField.value !== undefined ? (itemField.value * 100).toFixed(0) : ""} className="h-9 text-sm text-center"/></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name={`items.${index}.taxRate`} render={({ field: itemField }) => (<FormItem><FormLabel className="text-xs md:hidden">ضريبة (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="15" {...itemField} onChange={e => itemField.onChange(e.target.value ? parseFloat(e.target.value) / 100 : 0.15)} value={itemField.value !== undefined ? (itemField.value * 100).toFixed(0) : "15"} className="h-9 text-sm text-center"/></FormControl><FormMessage /></FormItem>)}/>
              <FormItem><FormLabel className="text-xs md:hidden">الإجمالي</FormLabel><Input value={calculateItemTotal(index).toFixed(2)} readOnly className="bg-muted h-9 text-sm text-center font-semibold"/></FormItem>
              <Button type="button" variant="ghost" size="icon" onClick={() => fields.length > 1 && remove(index)} className="self-center md:self-end text-destructive h-9 w-9"><Trash2 className="h-4 w-4"/></Button>
            </div>))}
            <Button type="button" variant="outline" size="sm" onClick={() => {append({ productId: "", productName:"", quantity: 1, unitPrice: 0, taxRate: 0.15, discountRate: 0 }); setTimeout(() => itemBarcodeRefs.current[fields.length]?.focus(),50);}}><PlusCircle className="ml-2 h-4 w-4"/>إضافة بند جديد</Button>
          </CardContent></Card>
        <div className="text-left font-bold text-xl mt-4">الإجمالي الكلي للمستند: {calculateGrandTotal().toFixed(2)} ل.س</div>
        <DialogFooter className="pt-6"><DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
          <Button type="submit" disabled={form.formState.isSubmitting}><Save className="ml-2 h-4 w-4"/>{form.formState.isSubmitting ? "جاري الحفظ..." : (invoice ? "حفظ التعديلات" : "إنشاء المستند")}</Button>
        </DialogFooter></form></Form></DialogContent></Dialog>
  );
}

interface InvoiceViewDialogProps {
  open: boolean; onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}
function InvoiceViewDialog({ open, onOpenChange, invoice }: InvoiceViewDialogProps) {
  if (!invoice) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-2xl" dir="rtl">
      <DialogHeader><DialogTitle>تفاصيل {typeMap[invoice.type]}: {invoice.invoiceNumber}</DialogTitle>
        <DialogDescription>تاريخ: {invoice.date} | الحالة: <Badge variant={getStatusVariant(invoice.status)} className={getStatusColorClass(invoice.status)}>{statusMap[invoice.status]}</Badge></DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-3 text-sm max-h-[60vh] overflow-y-auto">
        <p><strong>{invoice.type === "Purchase" ? "المورد" : "العميل"}:</strong> {invoice.customerSupplierName}</p>
        {invoice.dueDate && <p><strong>تاريخ الاستحقاق:</strong> {invoice.dueDate}</p>}
        {invoice.paymentMethod && <p><strong>طريقة الدفع:</strong> {invoice.paymentMethod}</p>}
        {invoice.salesperson && <p><strong>مندوب المبيعات:</strong> {invoice.salesperson}</p>}
        <Table><TableHeader><TableRow><TableHead>المنتج</TableHead><TableHead>الكمية</TableHead><TableHead>سعر الوحدة (ل.س)</TableHead><TableHead>الخصم</TableHead><TableHead>الضريبة</TableHead><TableHead className="text-left">الإجمالي (ل.س)</TableHead></TableRow></TableHeader>
          <TableBody>{invoice.items.map((item, idx) => {
            const itemSubTotal = item.quantity * item.unitPrice;
            const discountAmount = itemSubTotal * (item.discountRate || 0);
            const priceAfterDiscount = itemSubTotal - discountAmount;
            const taxAmountItem = priceAfterDiscount * (item.taxRate || 0);
            const totalItemPrice = priceAfterDiscount + taxAmountItem;
            return (<TableRow key={idx}>
              <TableCell>{item.productName}</TableCell><TableCell>{item.quantity}</TableCell><TableCell>{item.unitPrice.toFixed(2)}</TableCell>
              <TableCell>{((item.discountRate || 0) * 100).toFixed(0)}%</TableCell><TableCell>{((item.taxRate || 0) * 100).toFixed(0)}%</TableCell>
              <TableCell className="text-left">{totalItemPrice.toFixed(2)}</TableCell>
          </TableRow>)})}</TableBody></Table>
        <div className="grid grid-cols-2 gap-1 pt-2 border-t">
          <span>المبلغ قبل الضريبة:</span><span className="font-semibold text-left">{invoice.amount.toFixed(2)} ل.س</span>
          <span>مبلغ الضريبة:</span><span className="font-semibold text-left">{invoice.taxAmount.toFixed(2)} ل.س</span>
          <span className="text-lg font-bold">الإجمالي النهائي:</span><span className="text-lg font-bold text-left">{invoice.totalAmount.toFixed(2)} ل.س</span>
        </div>
        {invoice.isEInvoice && <p className="pt-2"><strong>الفاتورة الإلكترونية:</strong> <Badge variant="outline" className="border-sky-500 text-sky-600">{invoice.eInvoiceStatus || "معدة للإرسال"}</Badge></p>}
        {invoice.notes && <div className="pt-2"><strong>ملاحظات:</strong><p className="p-2 bg-muted/50 rounded-md">{invoice.notes}</p></div>}
      </div>
      <DialogFooter><Button onClick={() => {handlePrintInvoice(invoice, true); onOpenChange(false);}}><Printer className="ml-2 h-4 w-4"/>طباعة</Button><DialogClose asChild><Button variant="outline">إغلاق</Button></DialogClose></DialogFooter>
    </DialogContent></Dialog>
  );
}

const handlePrintInvoice = (invoice: Invoice, fromDialog = false) => {
    console.log("Print invoice:", invoice.id);
    const features = fromDialog ? 'width=320,height=600,scrollbars=yes' : 'width=800,height=600,scrollbars=yes';
    const printWindow = window.open('', '_blank', features);

    if (printWindow) {
        printWindow.document.write('<html><head><title>فاتورة</title>');
        printWindow.document.write('<style> body { font-family: "Tajawal", Arial, sans-serif; direction: rtl; margin: 10mm; font-size: 10pt; } table { width: 100%; border-collapse: collapse; margin-bottom: 15px; } th, td { border: 1px solid #ccc; padding: 5px; text-align: right; } .header { text-align: center; margin-bottom: 20px; } .header h1 {margin-bottom: 5px;} .total-section { margin-top: 15px; float: left; width: 40%; border: 1px solid #eee; padding: 10px; } .total-section p { margin: 3px 0; display: flex; justify-content: space-between;} @media print { body { margin:0; transform: scale(0.95); transform-origin: top left;} .no-print { display: none; } } </style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<div class="header"><h1>${typeMap[invoice.type]}</h1><h2>رقم: ${invoice.invoiceNumber}</h2></div>`);
        printWindow.document.write(`<p><strong>العميل/المورد:</strong> ${invoice.customerSupplierName}</p><p><strong>التاريخ:</strong> ${invoice.date}</p>`);
        if(invoice.dueDate) printWindow.document.write(`<p><strong>تاريخ الاستحقاق:</strong> ${invoice.dueDate}</p>`);
        if(invoice.paymentMethod) printWindow.document.write(`<p><strong>طريقة الدفع:</strong> ${invoice.paymentMethod}</p>`);
        
        printWindow.document.write('<table><thead><tr><th>الصنف</th><th>الكمية</th><th>سعر الوحدة (ل.س)</th><th>الخصم</th><th>الضريبة</th><th>الإجمالي (ل.س)</th></tr></thead><tbody>');
        invoice.items.forEach(item => {
            const itemSubTotal = item.quantity * item.unitPrice;
            const discountAmount = itemSubTotal * (item.discountRate || 0);
            const priceAfterDiscount = itemSubTotal - discountAmount;
            const taxAmountItem = priceAfterDiscount * (item.taxRate || 0);
            const totalItemPrice = priceAfterDiscount + taxAmountItem;
            printWindow.document.write(`<tr><td>${item.productName}</td><td>${item.quantity}</td><td>${item.unitPrice.toFixed(2)}</td><td>${((item.discountRate || 0) * 100).toFixed(0)}%</td><td>${((item.taxRate || 0) * 100).toFixed(0)}%</td><td>${totalItemPrice.toFixed(2)}</td></tr>`);
        });
        printWindow.document.write('</tbody></table>');
        printWindow.document.write('<div style="clear:both;"></div>');
        printWindow.document.write('<div class="total-section">');
        printWindow.document.write(`<p><span>المبلغ قبل الضريبة:</span> <strong>${invoice.amount.toFixed(2)} ل.س</strong></p>`);
        printWindow.document.write(`<p><span>مبلغ الضريبة:</span> <strong>${invoice.taxAmount.toFixed(2)} ل.س</strong></p>`);
        printWindow.document.write(`<p style="font-size:1.2em;"><span>الإجمالي الكلي:</span> <strong>${invoice.totalAmount.toFixed(2)} ل.س</strong></p>`);
        printWindow.document.write('</div>');
        if(invoice.notes) printWindow.document.write(`<div style="clear:both; margin-top: 15px;"><p><strong>ملاحظات:</strong> ${invoice.notes}</p></div>`);
        printWindow.document.write('<p style="text-align:center; font-size: 8pt; margin-top:30px;">شكراً لتعاملكم معنا - الوسيط برو</p>')
        printWindow.document.write('</body></html>');
        printWindow.document.close(); printWindow.focus(); 
        setTimeout(() => printWindow.print(), 500); 
    } else { alert("متصفحك منع فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.");}
  };


const InvoiceTable = ({ invoices, typeLabel, onEdit, onDelete, onView, isLoading, onStatusChange }: { 
  invoices: Invoice[]; typeLabel: string;
  onEdit: (invoice: Invoice) => void; onDelete: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void; 
  isLoading: boolean; onStatusChange: (invoice: Invoice, newStatus: InvoiceStatus) => void;
}) => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle>قائمة {typeLabel}</CardTitle>
      <CardDescription>عرض وإدارة جميع {typeLabel} المسجلة في النظام.</CardDescription>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 pt-4 items-end">
        <Input placeholder="بحث برقم الفاتورة..." />
        <Input placeholder="بحث بالعميل/المورد..." />
        <Select><SelectTrigger><SelectValue placeholder="فلترة بالحالة..."/></SelectTrigger><SelectContent>{Object.entries(statusMap).map(([k,v])=><SelectItem key={k} value={k as InvoiceStatus}>{v}</SelectItem>)}</SelectContent></Select>
        <Button variant="outline" className="w-full"><Filter className="ml-2 h-4 w-4" /> تطبيق الفلاتر</Button>
      </div>
    </CardHeader>
    <CardContent>
      {isLoading && <p className="text-center p-4">جار تحميل بيانات {typeLabel}...</p>}
      {!isLoading && invoices.length === 0 && (
        <div className="text-center text-muted-foreground py-10"><Search className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-lg">لا توجد {typeLabel} لعرضها حاليًا.</p></div>
      )}
      {!isLoading && invoices.length > 0 && (
        <Table>
          <TableHeader><TableRow>
            <TableHead><Hash className="h-4 w-4 inline-block ml-1"/>رقم الفاتورة</TableHead>
            <TableHead><CalendarDays className="h-4 w-4 inline-block ml-1"/>التاريخ</TableHead>
            <TableHead><Users2 className="h-4 w-4 inline-block ml-1"/>العميل/المورد</TableHead>
            <TableHead className="text-left">الإجمالي (ل.س)</TableHead>
            <TableHead className="text-center">الحالة</TableHead>
            <TableHead className="text-center">الإجراءات</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{invoice.date}</TableCell>
                <TableCell>{invoice.customerSupplierName}</TableCell>
                <TableCell className="text-left font-semibold">{invoice.totalAmount.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <Select value={invoice.status} onValueChange={(newStatus) => onStatusChange(invoice, newStatus as InvoiceStatus)}>
                    <SelectTrigger className={`h-8 text-xs ${getStatusColorClass(invoice.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusMap).map(([key, value]) => (
                        <SelectItem key={key} value={key as InvoiceStatus} className="text-xs">{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-center space-x-1">
                  <Button variant="ghost" size="icon" title="عرض تفاصيل الفاتورة" onClick={() => onView(invoice)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="طباعة الفاتورة" onClick={() => handlePrintInvoice(invoice)}><Printer className="h-4 w-4" /></Button>
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
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<InventoryItem[]>([]);

  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [invoicesData, contactsData, productsData] = await Promise.all([
        getInvoicesService(), getContacts(), getProducts() // Changed getInventoryItems to getProducts
      ]);
      setAllInvoices(invoicesData); setContacts(contactsData); setProducts(productsData);
    } catch (error) { toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل بيانات الفواتير." }); }
    setIsLoading(false);
  }, [toast]);
  
  useEffect(() => { fetchPageData(); }, [fetchPageData]);

  const handleOpenAddDialog = (type?: InvoiceType) => {
    setEditingInvoice(null); 
    const newInvoiceDefaults: Partial<Invoice> = { type: type || "Sales" };
    setEditingInvoice(newInvoiceDefaults as Invoice); 
    setIsDialogOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => { setEditingInvoice(invoice); setIsDialogOpen(true); };
  const handleViewInvoice = (invoice: Invoice) => { setViewingInvoice(invoice); setIsViewDialogOpen(true); };

  const handleDeleteInvoice = async (invoice: Invoice) => {
     if (window.confirm(`هل أنت متأكد من حذف ${typeMap[invoice.type]} رقم ${invoice.invoiceNumber}؟`)) {
        try { await deleteInvoiceService(invoice.id); toast({ title: "تم الحذف بنجاح" }); fetchPageData(); 
        } catch (error) { toast({ variant: "destructive", title: "خطأ في الحذف", description: (error as Error).message}); }
    }
  };

  const handleInvoiceStatusChange = async (invoice: Invoice, newStatus: InvoiceStatus) => {
    if (window.confirm(`هل أنت متأكد من تغيير حالة الفاتورة ${invoice.invoiceNumber} إلى "${statusMap[newStatus]}"؟`)) {
        try {
            await updateInvoiceService(invoice.id, { status: newStatus });
            toast({ title: "تم تحديث الحالة بنجاح" });
            fetchPageData();
        } catch (error) {
            toast({ variant: "destructive", title: "خطأ في تحديث الحالة", description: (error as Error).message });
        }
    }
  };
  
  const salesInvoices = allInvoices.filter(inv => inv.type === "Sales");
  const purchaseInvoices = allInvoices.filter(inv => inv.type === "Purchase");
  const taxInvoices = allInvoices.filter(inv => inv.type === "Tax"); 
  const returnInvoices = allInvoices.filter(inv => inv.type === "Return");
  const quoteInvoices = allInvoices.filter(inv => inv.type === "Quote");
  const salesOrderInvoices = allInvoices.filter(inv => inv.type === "SalesOrder");
  const purchaseOrderInvoices = allInvoices.filter(inv => inv.type === "PurchaseOrder");

  return (
    <>
      <PageHeader title="وحدة الفوترة والمستندات" description="إدارة متكاملة لجميع أنواع الفواتير، عروض الأسعار، وأوامر الشراء/البيع."
        actions={<Button onClick={() => handleOpenAddDialog("Sales")}><PlusCircle className="ml-2 h-4 w-4" /> إنشاء مستند جديد</Button>} />
      <Tabs defaultValue="sales" dir="rtl" className="mt-6">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7 mb-4">
          <TabsTrigger value="sales" className="text-sm py-2 flex items-center gap-1"><FileText className="h-4 w-4"/>مبيعات</TabsTrigger>
          <TabsTrigger value="purchase" className="text-sm py-2 flex items-center gap-1"><ShoppingBag className="h-4 w-4"/>مشتريات</TabsTrigger>
          <TabsTrigger value="returns" className="text-sm py-2 flex items-center gap-1"><RotateCcw className="h-4 w-4"/>مرتجعات</TabsTrigger>
          <TabsTrigger value="quotes" className="text-sm py-2 flex items-center gap-1"><FileSignature className="h-4 w-4"/>عروض أسعار</TabsTrigger>
          <TabsTrigger value="salesOrders" className="text-sm py-2 flex items-center gap-1"><ShieldCheck className="h-4 w-4"/>أوامر بيع</TabsTrigger>
          <TabsTrigger value="purchaseOrders" className="text-sm py-2 flex items-center gap-1"><ShieldX className="h-4 w-4"/>أوامر شراء</TabsTrigger>
          <TabsTrigger value="tax" className="text-sm py-2 flex items-center gap-1"><FileSignature className="h-4 w-4"/>فواتير ضريبية</TabsTrigger> 
        </TabsList>
        <TabsContent value="sales"><InvoiceTable invoices={salesInvoices} typeLabel="المبيعات" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} isLoading={isLoading} onStatusChange={handleInvoiceStatusChange}/></TabsContent>
        <TabsContent value="purchase"><InvoiceTable invoices={purchaseInvoices} typeLabel="المشتريات" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} isLoading={isLoading} onStatusChange={handleInvoiceStatusChange}/></TabsContent>
        <TabsContent value="returns"><InvoiceTable invoices={returnInvoices} typeLabel="المرتجعات" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} isLoading={isLoading} onStatusChange={handleInvoiceStatusChange}/></TabsContent>
        <TabsContent value="quotes"><InvoiceTable invoices={quoteInvoices} typeLabel="عروض الأسعار" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} isLoading={isLoading} onStatusChange={handleInvoiceStatusChange}/></TabsContent>
        <TabsContent value="salesOrders"><InvoiceTable invoices={salesOrderInvoices} typeLabel="أوامر البيع" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} isLoading={isLoading} onStatusChange={handleInvoiceStatusChange}/></TabsContent>
        <TabsContent value="purchaseOrders"><InvoiceTable invoices={purchaseOrderInvoices} typeLabel="أوامر الشراء" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} isLoading={isLoading} onStatusChange={handleInvoiceStatusChange}/></TabsContent>
        <TabsContent value="tax"><InvoiceTable invoices={taxInvoices} typeLabel="الفواتير الضريبية" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} isLoading={isLoading} onStatusChange={handleInvoiceStatusChange}/></TabsContent>
      </Tabs>
      {isDialogOpen && <InvoiceDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} invoice={editingInvoice} onSave={fetchPageData} contacts={contacts} products={products}/>}
      {isViewDialogOpen && <InvoiceViewDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} invoice={viewingInvoice} />}
    </>
  );
}
