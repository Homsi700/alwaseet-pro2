
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Edit, Trash2, Search, Filter, FileText, ShoppingBag, RotateCcw, FileSignature, Printer, Save, ScanLine } from "lucide-react";
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
import { getInventoryItems, InventoryItem, getInventoryItemByBarcode } from "@/lib/services/inventory";

// Mappings for display
const statusMap: Record<InvoiceStatus, string> = {
  Paid: "مدفوعة", Pending: "معلقة", Overdue: "متأخرة السداد", Draft: "مسودة", Cancelled: "ملغاة", PartiallyPaid: "مدفوعة جزئياً",
};
const typeMap: Record<InvoiceType, string> = {
  Sales: "مبيعات", Purchase: "مشتريات", Tax: "ضريبية", Return: "مرتجع",
};
const getStatusVariant = (status: InvoiceStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Paid": return "default"; case "Pending": return "secondary"; case "Overdue": return "destructive"; 
    case "Draft": return "outline"; case "Cancelled": return "outline"; case "PartiallyPaid": return "secondary"; 
    default: return "outline";
  }
};
const getStatusColorClass = (status: InvoiceStatus): string => {
  // Using Tailwind classes directly for badges, can be customized further
  switch (status) {
    case "Paid": return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
    case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700";
    case "Overdue": return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
    case "Draft": return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600";
    case "Cancelled": return "bg-slate-100 text-slate-600 border-slate-300 opacity-70 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700";
    case "PartiallyPaid": return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
    default: return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600";
  }
};

// Zod Schemas
const invoiceItemSchema = z.object({
  productId: z.string().min(1, "المنتج مطلوب"),
  productName: z.string(), // Auto-filled
  quantity: z.coerce.number().min(0.01, "الكمية يجب أن تكون أكبر من صفر"),
  unitPrice: z.coerce.number().min(0, "سعر الوحدة لا يمكن أن يكون سالبًا"),
  discountRate: z.coerce.number().min(0).max(1).optional().default(0),
  taxRate: z.coerce.number().min(0).max(1).default(0.15), // Default VAT 15%
  // totalPrice will be calculated
});
type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;

const invoiceFormSchema = z.object({
  type: z.enum(["Sales", "Purchase", "Tax", "Return"], { required_error: "نوع الفاتورة مطلوب" }),
  customerSupplierId: z.string().min(1, "العميل/المورد مطلوب"),
  date: z.string().min(1, "تاريخ الفاتورة مطلوب").refine(val => !isNaN(Date.parse(val.split('/').reverse().join('-'))), {message: "تاريخ الفاتورة غير صالح (مثال: 31/12/2025)"}),
  dueDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val.split('/').reverse().join('-'))), {message: "تاريخ الاستحقاق غير صالح"}),
  paymentMethod: z.string().optional(),
  salesperson: z.string().optional(),
  notes: z.string().optional(),
  isEInvoice: z.boolean().default(true), // Default to true as per previous setup
  status: z.enum(["Paid", "Pending", "Overdue", "Draft", "Cancelled", "PartiallyPaid"]).default("Draft"),
  items: z.array(invoiceItemSchema).min(1, "يجب إضافة بند واحد على الأقل للفاتورة"),
});
type InvoiceFormData = z.infer<typeof invoiceFormSchema>;


interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
  onSave: () => void; // Callback to refresh data
  contacts: Contact[];
  products: InventoryItem[];
}

function InvoiceDialog({ open, onOpenChange, invoice, onSave, contacts, products }: InvoiceDialogProps) {
  const { toast } = useToast();
  const itemBarcodeRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: invoice 
      ? {
          ...invoice,
          items: invoice.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountRate: item.discountRate || 0,
            taxRate: item.taxRate || 0.15,
          }))
        }
      : {
          type: "Sales",
          date: new Date().toLocaleDateString('fr-CA').split('-').reverse().join('/'), // DD/MM/YYYY
          items: [{ productId: "", productName: "", quantity: 1, unitPrice: 0, taxRate: 0.15, discountRate: 0 }],
          isEInvoice: true,
          status: "Draft",
        },
  });
  const { fields, append, remove, update } = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    if (open) { // Reset form when dialog opens or invoice prop changes
      if (invoice) {
        form.reset({
          ...invoice,
          customerSupplierId: invoice.customerSupplierId || "",
          items: invoice.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountRate: item.discountRate || 0,
            taxRate: item.taxRate || 0.15,
          }))
        });
      } else {
         form.reset({
          type: "Sales", customerSupplierId: "", date: new Date().toLocaleDateString('fr-CA').split('-').reverse().join('/'),
          items: [{ productId: "", productName: "", quantity: 1, unitPrice: 0, taxRate: 0.15, discountRate: 0 }],
          isEInvoice: true, status: "Draft", paymentMethod: "نقدي",
        });
      }
    }
  }, [invoice, form, open]);

  const onSubmit = async (data: InvoiceFormData) => {
    const customerSupplier = contacts.find(c => c.id === data.customerSupplierId);
    if (!customerSupplier) {
      toast({ variant: "destructive", title: "خطأ", description: "لم يتم العثور على العميل/المورد المحدد."});
      return;
    }

    // Recalculate totals accurately before saving
    let calculatedAmount = 0;
    let calculatedTaxAmount = 0;
    const itemsWithDetails = data.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const unitPrice = product ? (data.type === "Purchase" ? product.costPrice : product.sellingPrice) : item.unitPrice;
      const itemSubTotal = item.quantity * unitPrice * (1 - (item.discountRate || 0));
      const itemTax = itemSubTotal * (item.taxRate || 0);
      calculatedAmount += itemSubTotal;
      calculatedTaxAmount += itemTax;
      return { ...item, productName: product?.name || "منتج غير معروف", unitPrice, totalPrice: itemSubTotal + itemTax };
    });
    const calculatedTotalAmount = calculatedAmount + calculatedTaxAmount;
    
    const invoicePayload = {
      ...data,
      customerSupplierName: customerSupplier.name,
      items: itemsWithDetails,
      amount: calculatedAmount,
      taxAmount: calculatedTaxAmount,
      totalAmount: calculatedTotalAmount,
    };

    try {
      if (invoice && invoice.id) { // Editing existing invoice
        await updateInvoiceService(invoice.id, invoicePayload as Omit<Invoice, 'id' | 'invoiceNumber'>); // Cast as service expects this shape for update
        toast({ title: "تم التحديث بنجاح", description: "تم تحديث الفاتورة." });
      } else { // Adding new invoice
        await createInvoiceService(invoicePayload as Omit<Invoice, 'id' | 'invoiceNumber'>); // Cast as service expects this shape for create
        toast({ title: "تم الإنشاء بنجاح", description: "تم إنشاء الفاتورة." });
      }
      onSave(); // Refresh the list
      onOpenChange(false); // Close dialog
    } catch (error) {
      toast({ variant: "destructive", title: "حدث خطأ", description: `لم يتم حفظ الفاتورة. ${error instanceof Error ? error.message : ''}` });
      console.error("Failed to save invoice:", error);
    }
  };

  const calculateItemTotal = (index: number) => {
    const item = form.getValues(`items.${index}`);
    if (!item || !item.productId) return 0;
    const product = products.find(p => p.id === item.productId);
    // Use cost price for purchase invoices, selling price otherwise
    const unitPrice = product ? (form.getValues("type") === "Purchase" ? product.costPrice : product.sellingPrice) : item.unitPrice;
    const subTotal = item.quantity * unitPrice * (1-(item.discountRate || 0));
    return subTotal * (1+(item.taxRate || 0));
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
            update(itemIndex, {
                ...fields[itemIndex], // Keep existing fields like quantity if user set it
                productId: product.id,
                productName: product.name,
                unitPrice: price,
                // Potentially reset taxRate if it should come from product
            });
            toast({title: "تم العثور على المنتج", description: `تم تحديث البند: ${product.name}`});
            if (itemBarcodeRefs.current[itemIndex]) {
                 itemBarcodeRefs.current[itemIndex]!.value = ""; // Clear input
            }
             // Focus next barcode input or add new item line
            if (itemIndex === fields.length - 1) { // If it's the last item
                document.getElementById(`items.${itemIndex}.quantity`)?.focus(); // Focus quantity of current item
            } else if (itemBarcodeRefs.current[itemIndex+1]){
                itemBarcodeRefs.current[itemIndex+1]?.focus();
            }


        } else {
            toast({title: "منتج غير موجود", description: "لم يتم العثور على منتج بهذا الباركود.", variant: "destructive"});
        }
    } catch (error) {
        toast({title: "خطأ", description: "خطأ أثناء البحث بالباركود.", variant: "destructive"});
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{invoice ? `تعديل فاتورة ${invoice.invoiceNumber}` : "إنشاء فاتورة جديدة"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Invoice Header Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>نوع الفاتورة</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.entries(typeMap).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="customerSupplierId" render={({ field }) => (
                <FormItem><FormLabel>{form.getValues("type") === "Purchase" || (form.getValues("type") === "Return" && contacts.find(c=>c.id === field.value)?.type === "Supplier") ? "المورد" : "العميل"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                    <FormControl><SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      {contacts.filter(c => form.getValues("type") === "Purchase" || (form.getValues("type") === "Return" && c.type === "Supplier") ? c.type === "Supplier" : c.type === "Customer").map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.phone})</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem><FormLabel>تاريخ الفاتورة</FormLabel><FormControl><Input type="date" {...field} onChange={e => field.onChange(e.target.value ? new Date(e.target.value).toLocaleDateString('fr-CA').split('-').reverse().join('/') : '')} value={field.value ? new Date(field.value.split('/').reverse().join('-')).toISOString().split('T')[0] : ''} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FormField control={form.control} name="dueDate" render={({ field }) => (
                <FormItem><FormLabel>تاريخ الاستحقاق (اختياري)</FormLabel><FormControl><Input type="date" {...field} onChange={e => field.onChange(e.target.value ? new Date(e.target.value).toLocaleDateString('fr-CA').split('-').reverse().join('/') : '')} value={field.value ? new Date(field.value.split('/').reverse().join('-')).toISOString().split('T')[0] : ''} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                <FormItem><FormLabel>طريقة الدفع</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "نقدي"} dir="rtl">
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="نقدي">نقدي</SelectItem>
                      <SelectItem value="شبكة">شبكة (مدى/فيزا)</SelectItem>
                      <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                      <SelectItem value="آجل">آجل</SelectItem>
                      <SelectItem value="شيك">شيك</SelectItem>
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>حالة الفاتورة</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                       {Object.entries(statusMap).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>ملاحظات (اختياري)</FormLabel><FormControl><Textarea placeholder="أي ملاحظات إضافية على الفاتورة" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="salesperson" render={({ field }) => (
                    <FormItem><FormLabel>مندوب المبيعات (اختياري)</FormLabel><FormControl><Input placeholder="اسم المندوب" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="isEInvoice" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-x-reverse space-y-0 rounded-md border p-3 shadow-sm mt-4 h-[70px] justify-between">
                        <FormLabel className="font-normal mb-0!">فاتورة إلكترونية</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} dir="ltr" /></FormControl>
                    </FormItem>
                )}/>
            </div>

            <Card className="mt-4">
              <CardHeader><CardTitle>بنود الفاتورة</CardTitle></CardHeader>
              <CardContent>
                <div className="hidden md:grid md:grid-cols-[60px_1fr_100px_100px_80px_80px_120px_auto] gap-2 items-end mb-2 font-medium text-sm text-muted-foreground">
                    <span>باركود</span>
                    <span>المنتج</span>
                    <span>الكمية</span>
                    <span>السعر</span>
                    <span>خصم</span>
                    <span>ضريبة</span>
                    <span>الإجمالي</span>
                    <span></span>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-2 md:grid-cols-[60px_1fr_100px_100px_80px_80px_120px_auto] gap-2 items-start md:items-end mb-3 p-2 border-b">
                    {/* Barcode input for item */}
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel htmlFor={`items.${index}.barcode`} className="text-xs md:hidden">باركود</FormLabel>
                      <Input
                        id={`items.${index}.barcode`}
                        ref={el => itemBarcodeRefs.current[index] = el}
                        placeholder="امسح"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                e.preventDefault();
                                handleBarcodeScan(e.currentTarget.value, index);
                            }
                        }}
                        className="h-9"
                      />
                    </FormItem>
                    <FormField control={form.control} name={`items.${index}.productId`} render={({ field: itemField }) => (
                      <FormItem className="col-span-2 md:col-span-1"><FormLabel className="text-xs md:hidden">المنتج</FormLabel>
                        <Select onValueChange={(value) => {
                            itemField.onChange(value);
                            const product = products.find(p => p.id === value);
                            form.setValue(`items.${index}.productName`, product?.name || "");
                            const price = product ? (form.getValues("type") === "Purchase" ? product.costPrice : product.sellingPrice) : 0;
                            form.setValue(`items.${index}.unitPrice`, price);
                        }} value={itemField.value} dir="rtl">
                          <FormControl><SelectTrigger className="h-9"><SelectValue placeholder="اختر منتجًا..." /></SelectTrigger></FormControl>
                          <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (م: {p.quantity})</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field: itemField }) => (
                      <FormItem><FormLabel className="text-xs md:hidden">الكمية</FormLabel><FormControl><Input type="number" step="any" {...itemField} className="h-9"/></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field: itemField }) => (
                      <FormItem><FormLabel className="text-xs md:hidden">سعر الوحدة</FormLabel><FormControl><Input type="number" step="any" {...itemField} className="h-9"/></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.discountRate`} render={({ field: itemField }) => (
                      <FormItem><FormLabel className="text-xs md:hidden">خصم (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0" {...itemField} onChange={e => itemField.onChange(e.target.value ? parseFloat(e.target.value) / 100 : 0)} value={itemField.value !== undefined ? (itemField.value * 100).toFixed(2) : ""} className="h-9"/></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.taxRate`} render={({ field: itemField }) => (
                      <FormItem><FormLabel className="text-xs md:hidden">ضريبة (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="15" {...itemField} onChange={e => itemField.onChange(e.target.value ? parseFloat(e.target.value) / 100 : 0.15)} value={itemField.value !== undefined ? (itemField.value * 100).toFixed(2) : "15.00"} className="h-9"/></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormItem><FormLabel className="text-xs md:hidden">الإجمالي</FormLabel><Input value={calculateItemTotal(index).toFixed(2)} readOnly className="bg-muted h-9"/></FormItem>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="self-center md:self-end text-destructive hover:text-destructive h-9 w-9"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", productName:"", quantity: 1, unitPrice: 0, taxRate: 0.15, discountRate: 0 })}>
                  <PlusCircle className="ml-2 h-4 w-4" /> إضافة بند جديد
                </Button>
              </CardContent>
            </Card>
            <div className="text-left font-bold text-xl mt-4">الإجمالي الكلي للفاتورة: {calculateGrandTotal().toFixed(2)} ل.س</div>

            <DialogFooter className="pt-6">
              <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Save className="ml-2 h-4 w-4"/> {form.formState.isSubmitting ? "جاري الحفظ..." : (invoice ? "حفظ التعديلات" : "إنشاء الفاتورة")}
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
              <TableHead className="text-left">الإجمالي (ل.س)</TableHead>
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

  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [invoicesData, contactsData, productsData] = await Promise.all([
        getInvoicesService(), 
        getContacts(),
        getInventoryItems()
      ]);
      setAllInvoices(invoicesData);
      setContacts(contactsData);
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch page data:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل البيانات اللازمة لصفحة الفواتير." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleOpenAddDialog = () => {
    setEditingInvoice(null);
    form.reset(); // Ensure form is reset for new entry
    setIsDialogOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsDialogOpen(true);
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
     if (window.confirm(`هل أنت متأكد من حذف الفاتورة رقم ${invoice.invoiceNumber}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
        try {
            await deleteInvoiceService(invoice.id);
            toast({ title: "تم الحذف", description: `تم حذف الفاتورة ${invoice.invoiceNumber}.` });
            fetchPageData(); 
        } catch (error) {
            toast({ variant: "destructive", title: "خطأ في الحذف", description: "لم يتم حذف الفاتورة."});
        }
    }
  };
  const handleViewInvoice = (invoice: Invoice) => {
    // For now, just log and show toast. Future: open a detailed view dialog/page.
    console.log("View invoice:", invoice);
    setEditingInvoice(invoice); // Use the same dialog for viewing, but disable form fields
    setIsDialogOpen(true); // This will need modification to the dialog to be a "view" mode
    toast({title: "عرض التفاصيل", description: `عرض تفاصيل الفاتورة ${invoice.invoiceNumber} (النموذج الحالي يستخدم للتعديل).`});
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    console.log("Print invoice:", invoice.id);
    // Simplified print logic for now
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<html><head><title>فاتورة</title>');
        printWindow.document.write('<style> body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; } th, td { border: 1px solid #ccc; padding: 8px; text-align: right; } .header { text-align: center; margin-bottom: 30px; } .total-section { margin-top: 20px; text-align: left; } .total-section p { margin: 5px 0; } </style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<div class="header"><h1>فاتورة ${typeMap[invoice.type]}</h1><h2>${invoice.invoiceNumber}</h2></div>`);
        printWindow.document.write(`<p><strong>العميل/المورد:</strong> ${invoice.customerSupplierName}</p>`);
        printWindow.document.write(`<p><strong>التاريخ:</strong> ${invoice.date}</p>`);
        if(invoice.dueDate) printWindow.document.write(`<p><strong>تاريخ الاستحقاق:</strong> ${invoice.dueDate}</p>`);
        
        printWindow.document.write('<table><thead><tr><th>الصنف</th><th>الكمية</th><th>سعر الوحدة (ل.س)</th><th>الخصم (%)</th><th>الضريبة (%)</th><th>الإجمالي (ل.س)</th></tr></thead><tbody>');
        invoice.items.forEach(item => {
            const subTotal = item.quantity * item.unitPrice;
            const discountAmount = subTotal * (item.discountRate || 0);
            const priceAfterDiscount = subTotal - discountAmount;
            const taxAmountItem = priceAfterDiscount * (item.taxRate || 0);
            const totalItemPrice = priceAfterDiscount + taxAmountItem;
            printWindow.document.write(`<tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice.toFixed(2)}</td>
                <td>${((item.discountRate || 0) * 100).toFixed(0)}%</td>
                <td>${((item.taxRate || 0) * 100).toFixed(0)}%</td>
                <td>${totalItemPrice.toFixed(2)}</td>
            </tr>`);
        });
        printWindow.document.write('</tbody></table>');

        printWindow.document.write('<div class="total-section">');
        printWindow.document.write(`<p><strong>المبلغ قبل الضريبة:</strong> ${invoice.amount.toFixed(2)} ل.س</p>`);
        printWindow.document.write(`<p><strong>مبلغ الضريبة:</strong> ${invoice.taxAmount.toFixed(2)} ل.س</p>`);
        printWindow.document.write(`<p><strong>الإجمالي الكلي:</strong> ${invoice.totalAmount.toFixed(2)} ل.س</p>`);
        printWindow.document.write('</div>');

        if(invoice.notes) printWindow.document.write(`<p><strong>ملاحظات:</strong> ${invoice.notes}</p>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus(); // Necessary for some browsers
        printWindow.print();
        // printWindow.close(); // Optional: close after print
    } else {
        toast({title: "خطأ", description: "متصفحك منع فتح نافذة الطباعة."});
    }
  };

  const salesInvoices = allInvoices.filter(inv => inv.type === "Sales");
  const purchaseInvoices = allInvoices.filter(inv => inv.type === "Purchase");
  const taxInvoices = allInvoices.filter(inv => inv.type === "Tax"); 
  const returnInvoices = allInvoices.filter(inv => inv.type === "Return");
  // Assuming form is defined somewhere, or pass it if needed
  const form = useForm<InvoiceFormData>(); // Placeholder if not defined globally

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
        onSave={fetchPageData} // Use fetchPageData to refresh all necessary data
        contacts={contacts}
        products={products}
      />
    </>
  );
}
