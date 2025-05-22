
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Edit, Trash2, Search, Filter, FileText, ShoppingBag, Truck, RotateCcw, CreditCard, UserCheck, FileSignature, Printer } from "lucide-react";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";

type InvoiceType = "Sales" | "Purchase" | "Tax" | "Return";
type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Draft" | "Cancelled" | "PartiallyPaid";
type InvoiceStatusArabic = "مدفوعة" | "معلقة" | "متأخرة السداد" | "مسودة" | "ملغاة" | "مدفوعة جزئياً";

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  customerSupplierName: string; // Could be customer or supplier
  customerSupplierId: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  type: InvoiceType; 
  paymentMethod?: string; // طريقة الدفع
  notes?: string; // ملاحظات
  salesperson?: string; // مندوب المبيعات (لفواتير المبيعات)
  isEInvoice?: boolean; // هل هي فاتورة إلكترونية
  eInvoiceStatus?: string; // حالة الفاتورة الإلكترونية (مرسلة، مقبولة، مرفوضة)
  items: InvoiceItem[];
}

interface InvoiceItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discountRate?: number; // 0-1
    taxRate?: number; // 0-1
    totalPrice: number; // (quantity * unitPrice * (1-discountRate)) * (1+taxRate)
}


const statusMap: Record<InvoiceStatus, InvoiceStatusArabic> = {
  Paid: "مدفوعة",
  Pending: "معلقة",
  Overdue: "متأخرة السداد",
  Draft: "مسودة",
  Cancelled: "ملغاة",
  PartiallyPaid: "مدفوعة جزئياً",
};

const getStatusVariant = (status: InvoiceStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Paid": return "default"; 
    case "Pending": return "secondary"; 
    case "Overdue": return "destructive"; 
    case "Draft": return "outline"; 
    case "Cancelled": return "outline"; 
    case "PartiallyPaid": return "secondary"; 
    default: return "outline";
  }
};

const getStatusColorClass = (status: InvoiceStatus): string => {
  switch (status) {
    case "Paid": return "bg-green-100 text-green-700 border-green-300";
    case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "Overdue": return "bg-red-100 text-red-700 border-red-300";
    case "Draft": return "bg-gray-100 text-gray-700 border-gray-300";
    case "Cancelled": return "bg-slate-100 text-slate-600 border-slate-300 opacity-70";
    case "PartiallyPaid": return "bg-blue-100 text-blue-700 border-blue-300";
    default: return "bg-gray-100 text-gray-700 border-gray-300";
  }
}


const InvoiceTable = ({ invoices, typeLabel, onEdit, onDelete, onView, onPrint }: { 
  invoices: Invoice[]; 
  typeLabel: string;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  onPrint: (invoice: Invoice) => void;
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
      {invoices.length > 0 ? (
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
                  {invoice.isEInvoice ? <Badge variant="outline">{invoice.eInvoiceStatus || "مرسلة"}</Badge> : "-"}
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
      ) : (
        <div className="text-center text-muted-foreground py-10">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg">لا توجد فواتير {typeLabel} لعرضها حاليًا.</p>
            <p className="text-sm">ابدأ بإنشاء فاتورة جديدة لتتبع معاملاتك المالية.</p>
        </div>
      )}
    </CardContent>
  </Card>
);

export default function InvoicingPage() {
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  
  // TODO: Implement dialog for creating/editing invoices
  const handleEditInvoice = (invoice: Invoice) => console.log("Edit invoice:", invoice.id);
  const handleDeleteInvoice = (invoice: Invoice) => console.log("Delete invoice:", invoice.id);
  const handleViewInvoice = (invoice: Invoice) => console.log("View invoice:", invoice.id);
  const handlePrintInvoice = (invoice: Invoice) => console.log("Print invoice:", invoice.id);


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
          <Button>
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
          <InvoiceTable invoices={salesInvoices} typeLabel="المبيعات" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} onPrint={handlePrintInvoice}/>
        </TabsContent>
        <TabsContent value="purchase">
          <InvoiceTable invoices={purchaseInvoices} typeLabel="المشتريات" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} onPrint={handlePrintInvoice}/>
        </TabsContent>
        <TabsContent value="tax">
           <InvoiceTable invoices={taxInvoices} typeLabel="الضرائب" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} onPrint={handlePrintInvoice}/>
        </TabsContent>
        <TabsContent value="returns">
           <InvoiceTable invoices={returnInvoices} typeLabel="المرتجعات" onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} onPrint={handlePrintInvoice}/>
        </TabsContent>
      </Tabs>
    </>
  );
}
