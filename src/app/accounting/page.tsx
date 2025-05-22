"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Search, Filter } from "lucide-react";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";

interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  account: string;
  reference?: string; 
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: "أصول" | "التزامات" | "حقوق ملكية" | "إيرادات" | "مصروفات"; // Account types in Arabic
  balance: number;
  parentAccount?: string;
}

export default function AccountingPage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [chartOfAccountsData, setChartOfAccountsData] = useState<Account[]>([]);

  // TODO: Implement fetching, adding, editing, deleting logic

  return (
    <>
      <PageHeader 
        title="نظام المحاسبة المتكامل" 
        description="إدارة قيود اليومية اليومية، شجرة الحسابات، والتقارير المالية."
        actions={
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" /> إضافة قيد يومية جديد
          </Button>
        }
      />

      <Tabs defaultValue="journal" dir="rtl" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px] mb-4">
          <TabsTrigger value="journal" className="text-base py-2.5">قيود اليومية</TabsTrigger>
          <TabsTrigger value="accounts" className="text-base py-2.5">شجرة الحسابات</TabsTrigger>
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
              {journalEntries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>رقم المرجع</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>الحساب</TableHead>
                      <TableHead className="text-left">مدين (ر.س)</TableHead>
                      <TableHead className="text-left">دائن (ر.س)</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.reference || "-"}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.account}</TableCell>
                        <TableCell className="text-left">{entry.debit ? `${entry.debit.toFixed(2)}` : "-"}</TableCell>
                        <TableCell className="text-left">{entry.credit ? `${entry.credit.toFixed(2)}` : "-"}</TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="تعديل القيد">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="حذف القيد" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg">لا توجد قيود يومية لعرضها حاليًا.</p>
                  <p className="text-sm">ابدأ بإضافة قيد يومية جديد لتتبع معاملاتك المالية.</p>
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
              {chartOfAccountsData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رمز الحساب</TableHead>
                      <TableHead>اسم الحساب</TableHead>
                      <TableHead>نوع الحساب</TableHead>
                      <TableHead>الحساب الرئيسي</TableHead>
                      <TableHead className="text-left">الرصيد (ر.س)</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartOfAccountsData.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>{account.code}</TableCell>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell>{account.parentAccount || "-"}</TableCell>
                        <TableCell className="text-left">{account.balance.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" title="تعديل الحساب">
                            <Edit className="h-4 w-4" />
                          </Button>
                           <Button variant="ghost" size="icon" title="حذف الحساب" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg">لا توجد حسابات في شجرة الحسابات لعرضها حاليًا.</p>
                  <p className="text-sm">ابدأ بإضافة حسابات جديدة لتنظيم معاملاتك المالية.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
