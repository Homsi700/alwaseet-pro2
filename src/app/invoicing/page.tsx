"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Edit, Trash2 } from "lucide-react";
import React, { useState } from 'react';

type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Draft";
type InvoiceStatusArabic = "مدفوعة" | "معلقة" | "متأخرة" | "مسودة";

interface Invoice {
  id: string;
  date: string;
  customerSupplier: string;
  amount: number;
  status: InvoiceStatus;
}

const statusMap: Record<InvoiceStatus, InvoiceStatusArabic> = {
  Paid: "مدفوعة",
  Pending: "معلقة",
  Overdue: "متأخرة",
  Draft: "مسودة",
};

const getStatusVariant = (status: InvoiceStatus) => {
  switch (status) {
    case "Paid": return "default";
    case "Pending": return "secondary";
    case "Overdue": return "destructive";
    case "Draft": return "outline";
    default: return "outline";
  }
};

const InvoiceTable = ({ invoices, type }: { invoices: Invoice[]; type: string }) => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle>فواتير {type}</CardTitle>
    </CardHeader>
    <CardContent>
      {invoices.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الفاتورة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>العميل/المورد</TableHead>
              <TableHead className="text-left">المبلغ</TableHead>
              <TableHead className="text-center">الحالة</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{invoice.customerSupplier}</TableCell>
                <TableCell className="text-left">{invoice.amount.toFixed(2)} ر.س</TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(invoice.status)}>{statusMap[invoice.status]}</Badge>
                </TableCell>
                <TableCell className="text-center space-x-1">
                  <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-muted-foreground py-4">لا توجد فواتير {type} لعرضها حاليًا.</p>
      )}
    </CardContent>
  </Card>
);

export default function InvoicingPage() {
  const [sampleInvoices, setSampleInvoices] = useState<Invoice[]>([]);
  // TODO: Fetch invoices from API

  // Filtering logic remains, but will operate on empty or fetched data
  const salesInvoices = sampleInvoices; // Adjust filter as needed, e.g. by type property
  const purchaseInvoices = sampleInvoices;
  const taxInvoices = sampleInvoices;
  const returnInvoices = sampleInvoices;


  return (
    <>
      <PageHeader 
        title="وحدة الفوترة" 
        description="إدارة جميع فواتير المبيعات، المشتريات، الضرائب، والمرتجعات."
        actions={
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" /> إنشاء فاتورة جديدة
          </Button>
        }
      />

      <Tabs defaultValue="sales" dir="rtl">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="purchase">المشتريات</TabsTrigger>
          <TabsTrigger value="tax">الضرائب</TabsTrigger>
          <TabsTrigger value="returns">المرتجعات</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <InvoiceTable invoices={salesInvoices} type="المبيعات" />
        </TabsContent>
        <TabsContent value="purchase">
          <InvoiceTable invoices={purchaseInvoices} type="المشتريات" />
        </TabsContent>
        <TabsContent value="tax">
           <InvoiceTable invoices={taxInvoices} type="الضرائب" />
        </TabsContent>
        <TabsContent value="returns">
           <InvoiceTable invoices={returnInvoices} type="المرتجعات" />
        </TabsContent>
      </Tabs>
    </>
  );
}
