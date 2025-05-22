
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Search, Filter, Landmark, BookOpen, FileArchive } from "lucide-react"; 
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference?: string; 
  isPosted: boolean; // هل تم ترحيل القيد
  details: JournalEntryDetail[];
}

interface JournalEntryDetail {
  accountId: string;
  accountName?: string; // For display
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
  parentAccountName?: string; // For display
  isMain: boolean; // هل هو حساب رئيسي أم فرعي
}

interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export default function AccountingPage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [chartOfAccountsData, setChartOfAccountsData] = useState<Account[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);

  // TODO: Implement fetching, adding, editing, deleting logic
  // TODO: Implement dialogs for adding/editing entries

  return (
    <>
      <PageHeader 
        title="نظام المحاسبة المتكامل" 
        description="إدارة قيود اليومية، شجرة الحسابات، مراكز التكلفة، والتقارير المالية."
        actions={
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" /> إضافة قيد يومية جديد
          </Button>
        }
      />

      <Tabs defaultValue="journal" dir="rtl" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-4">
          <TabsTrigger value="journal" className="text-base py-2.5 flex items-center gap-1"><BookOpen className="h-4 w-4"/>قيود اليومية</TabsTrigger>
          <TabsTrigger value="accounts" className="text-base py-2.5 flex items-center gap-1"><FileArchive className="h-4 w-4"/>شجرة الحسابات</TabsTrigger>
          <TabsTrigger value="costCenters" className="text-base py-2.5 flex items-center gap-1"><Landmark className="h-4 w-4"/>مراكز التكلفة</TabsTrigger>
          {/* A new tab for financial reports could be added here, linking to /reports or a section within */}
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
                          <Button variant="ghost" size="icon" title="تعديل القيد" disabled={entry.isPosted}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="حذف القيد" className="text-destructive hover:text-destructive"  disabled={entry.isPosted}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                           <Button variant="ghost" size="icon" title={entry.isPosted ? "إلغاء ترحيل" : "ترحيل القيد"} >
                             {/* Icon changes based on state */}
                            {entry.isPosted ? <FileArchive className="h-4 w-4 text-yellow-600"/> : <FileArchive className="h-4 w-4 text-green-600"/>}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                      <TableHead>طبيعة الحساب</TableHead> {/* مدين/دائن */}
                      <TableHead className="text-left">الرصيد (ر.س)</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartOfAccountsData.map((account) => (
                      <TableRow key={account.id} className={account.isMain ? "bg-muted/50 font-semibold" : ""}>
                        <TableCell style={{ paddingRight: account.parentAccountId ? '2rem' : '1rem' }}> {/* Basic indentation */}
                          {account.code}
                        </TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell>{account.parentAccountName || (account.parentAccountId ? "غير محدد" : "-")}</TableCell>
                        <TableCell>{(account.type === "أصول" || account.type === "مصروفات") ? "مدين" : "دائن"}</TableCell>
                        <TableCell className="text-left">{account.balance.toFixed(2)}</TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="تعديل الحساب">
                            <Edit className="h-4 w-4" />
                          </Button>
                           <Button variant="ghost" size="icon" title="حذف الحساب" className="text-destructive hover:text-destructive" disabled={account.balance !== 0 || chartOfAccountsData.some(c => c.parentAccountId === account.id)}>
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
              {costCenters.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رمز مركز التكلفة</TableHead>
                      <TableHead>اسم مركز التكلفة</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costCenters.map((center) => (
                      <TableRow key={center.id}>
                        <TableCell>{center.code}</TableCell>
                        <TableCell className="font-medium">{center.name}</TableCell>
                        <TableCell>{center.description || "-"}</TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" title="تعديل مركز التكلفة">
                            <Edit className="h-4 w-4" />
                          </Button>
                           <Button variant="ghost" size="icon" title="حذف مركز التكلفة" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <Landmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg">لا توجد مراكز تكلفة لعرضها حاليًا.</p>
                  <p className="text-sm">ابدأ بإضافة مراكز تكلفة جديدة لتنظيم تتبع النفقات.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
