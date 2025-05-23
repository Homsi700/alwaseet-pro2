
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Search, Filter, Landmark, BookOpen, FileArchive, FileText, Receipt, HandCoins } from "lucide-react"; 
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
// Assuming mock services will be created for accounting entities
// import { getJournalEntries, addJournalEntry, ... } from "@/lib/services/accounting"; 

interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference?: string; 
  isPosted: boolean;
  details: JournalEntryDetail[];
}

interface JournalEntryDetail {
  accountId: string;
  accountName?: string; 
  debit: number | null;
  credit: number | null;
  costCenterId?: string; 
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: "أصول" | "التزامات" | "حقوق ملكية" | "إيرادات" | "مصروفات"; 
  balance: number;
  parentAccountId?: string;
  parentAccountName?: string; 
  isMain: boolean;
}

interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
}

// New Interfaces for Vouchers
interface ReceiptVoucher {
    id: string;
    voucherNumber: string;
    date: string;
    accountId: string; // Account being credited (e.g., Cash, Bank)
    accountName?: string;
    receivedFrom: string; // Name of person/entity
    amount: number;
    description: string;
    paymentMethod: "نقدي" | "شيك" | "تحويل بنكي";
    reference?: string; // e.g., Check number
}

interface PaymentVoucher {
    id: string;
    voucherNumber: string;
    date: string;
    accountId: string; // Account being debited (e.g., Cash, Bank)
    accountName?: string;
    paidTo: string; // Name of person/entity
    amount: number;
    description: string;
    paymentMethod: "نقدي" | "شيك" | "تحويل بنكي";
    reference?: string;
}


export default function AccountingPage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [chartOfAccountsData, setChartOfAccountsData] = useState<Account[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [receiptVouchers, setReceiptVouchers] = useState<ReceiptVoucher[]>([]); // New state
  const [paymentVouchers, setPaymentVouchers] = useState<PaymentVoucher[]>([]); // New state

  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // TODO: Implement fetching, adding, editing, deleting logic for all entities
  // For now, initialize with empty arrays or load from mock services if available
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    // Simulate fetching data
    // Replace with actual service calls:
    // const [journals, accounts, centers, receipts, payments] = await Promise.all([
    //   getJournalEntries(), getChartOfAccounts(), getCostCenters(), getReceiptVouchers(), getPaymentVouchers()
    // ]);
    // setJournalEntries(journals); setChartOfAccountsData(accounts); setCostCenters(centers);
    // setReceiptVouchers(receipts); setPaymentVouchers(payments);
    setJournalEntries([]); // Example empty data
    setChartOfAccountsData([]);
    setCostCenters([]);
    setReceiptVouchers([
        {id: 'rv1', voucherNumber: 'قبض-001', date: '20/07/2024', accountId: 'accCash', accountName: 'الصندوق', receivedFrom: 'العميل محمد', amount: 5000, description: 'دفعة من فاتورة #123', paymentMethod: 'نقدي'},
        {id: 'rv2', voucherNumber: 'قبض-002', date: '21/07/2024', accountId: 'accBank1', accountName: 'بنك الأمانة', receivedFrom: 'العميل خالد', amount: 12000, description: 'تحصيل شيك رقم 555', paymentMethod: 'شيك', reference: '555'},
    ]);
    setPaymentVouchers([
        {id: 'pv1', voucherNumber: 'صرف-001', date: '22/07/2024', accountId: 'accCash', accountName: 'الصندوق', paidTo: 'المورد شركة النور', amount: 3000, description: 'سداد فاتورة مشتريات #P080', paymentMethod: 'نقدي'},
        {id: 'pv2', voucherNumber: 'صرف-002', date: '23/07/2024', accountId: 'accBank1', accountName: 'بنك الأمانة', paidTo: 'مصاريف كهرباء', amount: 750, description: 'فاتورة كهرباء شهر يونيو', paymentMethod: 'تحويل بنكي'},
    ]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  return (
    <>
      <PageHeader 
        title="نظام المحاسبة المتكامل" 
        description="إدارة قيود اليومية، شجرة الحسابات، مراكز التكلفة، وسندات القبض والصرف."
        actions={
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" /> إضافة قيد يومية جديد
          </Button>
        }
      />

      <Tabs defaultValue="journal" dir="rtl" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-4">
          <TabsTrigger value="journal" className="text-base py-2.5 flex items-center gap-1"><BookOpen className="h-4 w-4"/>قيود اليومية</TabsTrigger>
          <TabsTrigger value="accounts" className="text-base py-2.5 flex items-center gap-1"><FileArchive className="h-4 w-4"/>شجرة الحسابات</TabsTrigger>
          <TabsTrigger value="costCenters" className="text-base py-2.5 flex items-center gap-1"><Landmark className="h-4 w-4"/>مراكز التكلفة</TabsTrigger>
          <TabsTrigger value="receiptVouchers" className="text-base py-2.5 flex items-center gap-1"><Receipt className="h-4 w-4"/>سندات القبض</TabsTrigger>
          <TabsTrigger value="paymentVouchers" className="text-base py-2.5 flex items-center gap-1"><HandCoins className="h-4 w-4"/>سندات الصرف</TabsTrigger>
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
              {isLoading && <p>جار التحميل...</p>}
              {!isLoading && journalEntries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>رقم المرجع</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>الحسابات</TableHead>
                      <TableHead className="text-left">إجمالي مدين (ر.س)</TableHead>
                      <TableHead className="text-left">إجمالي دائن (ر.س)</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries.map((entry) => {
                      const totalDebit = entry.details.reduce((sum, d) => sum + (d.debit || 0), 0);
                      const totalCredit = entry.details.reduce((sum, d) => sum + (d.credit || 0), 0);
                      return (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.reference || "-"}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-xs">
                          {entry.details.map(d => `${d.accountName || d.accountId} (${d.debit ? 'مدين' : 'دائن'}: ${d.debit || d.credit})`).join(', ')}
                        </TableCell>
                        <TableCell className="text-left">{totalDebit.toFixed(2)}</TableCell>
                        <TableCell className="text-left">{totalCredit.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={entry.isPosted ? "default" : "outline"}>{entry.isPosted ? "مرحّل" : "غير مرحّل"}</Badge>
                        </TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="تعديل القيد" disabled={entry.isPosted}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title="حذف القيد" className="text-destructive hover:text-destructive"  disabled={entry.isPosted}><Trash2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title={entry.isPosted ? "إلغاء ترحيل" : "ترحيل القيد"} >
                            {entry.isPosted ? <FileArchive className="h-4 w-4 text-yellow-600"/> : <FileArchive className="h-4 w-4 text-green-600"/>}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  </TableBody>
                </Table>
              ) : (
                !isLoading && <div className="text-center text-muted-foreground py-10">
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg">لا توجد قيود يومية لعرضها حاليًا.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>شجرة الحسابات</CardTitle>
              <CardDescription>تنظيم وإدارة هيكل الحسابات المالية للمنشأة.</CardDescription>
               <div className="flex items-center gap-2 pt-4">
                <Input placeholder="ابحث في الحسابات..." className="max-w-sm" />
                <Button variant="outline" > <PlusCircle className="ml-2 h-4 w-4" /> إضافة حساب جديد</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && <p>جار التحميل...</p>}
              {!isLoading && chartOfAccountsData.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>رمز الحساب</TableHead><TableHead>اسم الحساب</TableHead><TableHead>نوع الحساب</TableHead><TableHead>الحساب الرئيسي</TableHead><TableHead>طبيعة الحساب</TableHead><TableHead className="text-left">الرصيد (ر.س)</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {chartOfAccountsData.map((account) => (
                      <TableRow key={account.id} className={account.isMain ? "bg-muted/50 font-semibold" : ""}>
                        <TableCell style={{ paddingRight: account.parentAccountId ? '2rem' : '1rem' }}>{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell><TableCell>{account.type}</TableCell>
                        <TableCell>{account.parentAccountName || (account.parentAccountId ? "غير محدد" : "-")}</TableCell>
                        <TableCell>{(account.type === "أصول" || account.type === "مصروفات") ? "مدين" : "دائن"}</TableCell>
                        <TableCell className="text-left">{account.balance.toFixed(2)}</TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="تعديل الحساب"><Edit className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" title="حذف الحساب" className="text-destructive hover:text-destructive" disabled={account.balance !== 0 || chartOfAccountsData.some(c => c.parentAccountId === account.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                !isLoading && <div className="text-center text-muted-foreground py-10"><Search className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-lg">لا توجد حسابات في شجرة الحسابات لعرضها حاليًا.</p></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costCenters">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>مراكز التكلفة</CardTitle>
              <CardDescription>إدارة وتتبع مراكز التكلفة في المنشأة.</CardDescription>
               <div className="flex items-center gap-2 pt-4">
                <Input placeholder="ابحث في مراكز التكلفة..." className="max-w-sm" />
                <Button variant="outline" > <PlusCircle className="ml-2 h-4 w-4" /> إضافة مركز تكلفة جديد</Button>
              </div>
            </CardHeader>
            <CardContent>
                {isLoading && <p>جار التحميل...</p>}
                {!isLoading && costCenters.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>رمز مركز التكلفة</TableHead><TableHead>اسم مركز التكلفة</TableHead><TableHead>الوصف</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {costCenters.map((center) => (
                      <TableRow key={center.id}>
                        <TableCell>{center.code}</TableCell><TableCell className="font-medium">{center.name}</TableCell>
                        <TableCell>{center.description || "-"}</TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="تعديل مركز التكلفة"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title="حذف مركز التكلفة" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                 !isLoading && <div className="text-center text-muted-foreground py-10"><Landmark className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-lg">لا توجد مراكز تكلفة لعرضها حاليًا.</p></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receiptVouchers">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>سندات القبض</CardTitle>
                  <CardDescription>تسجيل وإدارة جميع المبالغ المقبوضة.</CardDescription>
                </div>
                <Button><PlusCircle className="ml-2 h-4 w-4" /> إنشاء سند قبض</Button>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Input placeholder="ابحث برقم السند أو المستلم منه..." className="max-w-sm" />
                <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && <p>جار التحميل...</p>}
              {!isLoading && receiptVouchers.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>رقم السند</TableHead><TableHead>التاريخ</TableHead><TableHead>الحساب الدائن</TableHead><TableHead>المستلم منه</TableHead><TableHead className="text-left">المبلغ</TableHead><TableHead>طريقة الدفع</TableHead><TableHead>المرجع</TableHead><TableHead>الوصف</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {receiptVouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell>{voucher.voucherNumber}</TableCell>
                        <TableCell>{voucher.date}</TableCell>
                        <TableCell>{voucher.accountName || voucher.accountId}</TableCell>
                        <TableCell>{voucher.receivedFrom}</TableCell>
                        <TableCell className="text-left">{voucher.amount.toFixed(2)}</TableCell>
                        <TableCell>{voucher.paymentMethod}</TableCell>
                        <TableCell>{voucher.reference || "-"}</TableCell>
                        <TableCell>{voucher.description}</TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="تعديل السند"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title="حذف السند" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                !isLoading && <div className="text-center text-muted-foreground py-10"><Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-lg">لا توجد سندات قبض لعرضها حاليًا.</p></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paymentVouchers">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>سندات الصرف</CardTitle>
                  <CardDescription>تسجيل وإدارة جميع المبالغ المصروفة.</CardDescription>
                </div>
                <Button><PlusCircle className="ml-2 h-4 w-4" /> إنشاء سند صرف</Button>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Input placeholder="ابحث برقم السند أو المدفوع له..." className="max-w-sm" />
                <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && <p>جار التحميل...</p>}
              {!isLoading && paymentVouchers.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>رقم السند</TableHead><TableHead>التاريخ</TableHead><TableHead>الحساب المدين</TableHead><TableHead>المدفوع له</TableHead><TableHead className="text-left">المبلغ</TableHead><TableHead>طريقة الدفع</TableHead><TableHead>المرجع</TableHead><TableHead>الوصف</TableHead><TableHead className="text-center">الإجراءات</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {paymentVouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell>{voucher.voucherNumber}</TableCell>
                        <TableCell>{voucher.date}</TableCell>
                        <TableCell>{voucher.accountName || voucher.accountId}</TableCell>
                        <TableCell>{voucher.paidTo}</TableCell>
                        <TableCell className="text-left">{voucher.amount.toFixed(2)}</TableCell>
                        <TableCell>{voucher.paymentMethod}</TableCell>
                        <TableCell>{voucher.reference || "-"}</TableCell>
                        <TableCell>{voucher.description}</TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="تعديل السند"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title="حذف السند" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                !isLoading && <div className="text-center text-muted-foreground py-10"><HandCoins className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-lg">لا توجد سندات صرف لعرضها حاليًا.</p></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </>
  );
}

    