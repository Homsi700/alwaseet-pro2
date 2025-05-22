
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Search, Filter, Landmark, FileText, University, DownloadCloud, Eye } from "lucide-react";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  balance: number;
  iban?: string;
}

interface Check {
  id: string;
  checkNumber: string;
  type: "صادر" | "وارد";
  status: "مُصدر" | "مُحصّل" | "مرتجع" | "مؤجل" | "ملغى";
  dueDate: string;
  beneficiaryPayee: string;
  amount: number;
  bankAccountId: string; // Associated bank account
  notes?: string;
}

interface FinancialTransaction {
  id: string;
  date: string;
  type: "إيداع" | "سحب" | "مصروف" | "إيراد";
  description: string;
  amount: number;
  bankAccountId?: string; // For deposits/withdrawals
  linkedAccountId?: string; // For expense/revenue GL account
  reference?: string;
}


export default function BankingPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [checks, setChecks] = useState<Check[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);

  // TODO: Implement CRUD and specific logic for each section

  return (
    <>
      <PageHeader 
        title="إدارة الشؤون المالية والبنوك" 
        description="إدارة الحسابات البنكية، الشيكات، المصروفات، والإيرادات بكفاءة."
        actions={
          <div className="flex gap-2">
            <Button>
              <PlusCircle className="ml-2 h-4 w-4" /> إضافة معاملة مالية
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="accounts" dir="rtl" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="accounts" className="text-base py-2.5 flex items-center gap-1"><University className="h-4 w-4"/>الحسابات البنكية</TabsTrigger>
          <TabsTrigger value="checks" className="text-base py-2.5 flex items-center gap-1"><FileText className="h-4 w-4"/>إدارة الشيكات</TabsTrigger>
          <TabsTrigger value="transactions" className="text-base py-2.5 flex items-center gap-1"><Landmark className="h-4 w-4"/>المصروفات والإيرادات</TabsTrigger>
          <TabsTrigger value="reconciliation" className="text-base py-2.5 flex items-center gap-1"><DownloadCloud className="h-4 w-4"/>التسويات البنكية</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>قائمة الحسابات البنكية</CardTitle>
              <CardDescription>عرض وإدارة جميع حساباتك البنكية.</CardDescription>
              <div className="flex items-center gap-2 pt-4">
                <Input placeholder="ابحث في الحسابات البنكية..." className="max-w-sm" />
                <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button>
                <Button><PlusCircle className="ml-2 h-4 w-4" /> إضافة حساب بنكي جديد</Button>
              </div>
            </CardHeader>
            <CardContent>
              {bankAccounts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم الحساب</TableHead>
                      <TableHead>اسم البنك</TableHead>
                      <TableHead>رقم الحساب</TableHead>
                      <TableHead>IBAN</TableHead>
                      <TableHead>العملة</TableHead>
                      <TableHead className="text-left">الرصيد</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.accountName}</TableCell>
                        <TableCell>{account.bankName}</TableCell>
                        <TableCell>{account.accountNumber}</TableCell>
                        <TableCell>{account.iban || "-"}</TableCell>
                        <TableCell>{account.currency}</TableCell>
                        <TableCell className="text-left">{account.balance.toFixed(2)}</TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="عرض تفاصيل الحساب"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title="تعديل الحساب"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title="حذف الحساب" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <University className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg">لا توجد حسابات بنكية لعرضها حاليًا.</p>
                  <p className="text-sm">ابدأ بإضافة حساباتك البنكية لتتبع معاملاتك.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checks">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>إدارة الشيكات</CardTitle>
              <CardDescription>تتبع الشيكات الصادرة والواردة وحالاتها.</CardDescription>
              <div className="flex items-center gap-2 pt-4">
                <Input placeholder="ابحث برقم الشيك أو المستفيد..." className="max-w-sm" />
                <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button>
                <Button><PlusCircle className="ml-2 h-4 w-4" /> تسجيل شيك جديد</Button>
              </div>
            </CardHeader>
            <CardContent>
              {checks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الشيك</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>تاريخ الاستحقاق</TableHead>
                      <TableHead>المستفيد/الدافع</TableHead>
                      <TableHead className="text-left">المبلغ</TableHead>
                      <TableHead>الحساب البنكي</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell className="font-medium">{check.checkNumber}</TableCell>
                        <TableCell><Badge variant={check.type === "صادر" ? "secondary" : "outline"}>{check.type}</Badge></TableCell>
                        <TableCell>{check.dueDate}</TableCell>
                        <TableCell>{check.beneficiaryPayee}</TableCell>
                        <TableCell className="text-left">{check.amount.toFixed(2)}</TableCell>
                        <TableCell>{bankAccounts.find(ba => ba.id === check.bankAccountId)?.accountName || "-"}</TableCell>
                        <TableCell className="text-center"><Badge variant="default">{check.status}</Badge></TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="عرض تفاصيل الشيك"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title="تعديل الشيك"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title="تغيير حالة الشيك"><PlusCircle className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg">لا توجد شيكات مسجلة حاليًا.</p>
                  <p className="text-sm">ابدأ بتسجيل الشيكات الصادرة أو الواردة.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
           <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>المصروفات والإيرادات اليومية</CardTitle>
              <CardDescription>سجل وتتبع جميع المصروفات والإيرادات الأخرى.</CardDescription>
              <div className="flex items-center gap-2 pt-4">
                <Input placeholder="ابحث بالوصف أو المرجع..." className="max-w-sm" />
                <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button>
                <Button><PlusCircle className="ml-2 h-4 w-4" /> تسجيل مصروف/إيراد جديد</Button>
              </div>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>الحساب البنكي/الرئيسي</TableHead>
                      <TableHead className="text-left">المبلغ</TableHead>
                      <TableHead>المرجع</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell><Badge variant={transaction.type === "إيراد" || transaction.type === "إيداع" ? "default" : "destructive"}>{transaction.type}</Badge></TableCell>
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell>{transaction.bankAccountId ? (bankAccounts.find(ba => ba.id === transaction.bankAccountId)?.accountName) : (transaction.linkedAccountId || "-")}</TableCell>
                        <TableCell className="text-left">{transaction.amount.toFixed(2)}</TableCell>
                        <TableCell>{transaction.reference || "-"}</TableCell>
                        <TableCell className="text-center space-x-1">
                           <Button variant="ghost" size="icon" title="تعديل"><Edit className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" title="حذف" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                 <div className="text-center text-muted-foreground py-10">
                  <Landmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg">لا توجد مصروفات أو إيرادات مسجلة حاليًا.</p>
                  <p className="text-sm">ابدأ بتسجيل معاملاتك المالية اليومية.</p>
                </div>
              )}
            </CardContent>
           </Card>
        </TabsContent>
        
        <TabsContent value="reconciliation">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>التسويات البنكية</CardTitle>
                    <CardDescription>مقارنة كشوفات الحساب البنكية مع سجلات النظام وتسوية الفروقات.</CardDescription>
                     <div className="flex items-center gap-2 pt-4">
                        <Button><PlusCircle className="ml-2 h-4 w-4" /> بدء تسوية بنكية جديدة</Button>
                     </div>
                </CardHeader>
                <CardContent>
                    {/* TODO: Add UI for listing past reconciliations and performing a new one */}
                    <div className="text-center text-muted-foreground py-10">
                        <DownloadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg">لم يتم إجراء تسويات بنكية بعد.</p>
                        <p className="text-sm">ابدأ عملية تسوية جديدة لمطابقة سجلاتك.</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
