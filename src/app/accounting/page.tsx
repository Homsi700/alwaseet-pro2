"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import React, { useState } from 'react'; // Import useState

interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  account: string;
}

interface Account {
  code: string;
  name: string;
  type: string;
  balance: number;
}

export default function AccountingPage() {
  // Use useState for managing data, initialized as empty arrays
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [chartOfAccountsData, setChartOfAccountsData] = useState<Account[]>([]);

  // TODO: Add functions to fetch/add/edit/delete entries and accounts

  return (
    <>
      <PageHeader 
        title="نظام المحاسبة" 
        description="إدارة قيود اليومية وشجرة الحسابات."
        actions={
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" /> إضافة قيد جديد
          </Button>
        }
      />

      <Tabs defaultValue="journal" dir="rtl">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="journal">قيود اليومية</TabsTrigger>
          <TabsTrigger value="accounts">شجرة الحسابات</TabsTrigger>
        </TabsList>
        <TabsContent value="journal">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>قيود اليومية</CardTitle>
            </CardHeader>
            <CardContent>
              {journalEntries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>الحساب</TableHead>
                      <TableHead className="text-left">مدين</TableHead>
                      <TableHead className="text-left">دائن</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries.map((entry, index) => (
                      <TableRow key={`${entry.id}-${index}`}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.account}</TableCell>
                        <TableCell className="text-left">{entry.debit ? `${entry.debit.toFixed(2)} ر.س` : "-"}</TableCell>
                        <TableCell className="text-left">{entry.credit ? `${entry.credit.toFixed(2)} ر.س` : "-"}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" className="ml-1">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">لا توجد قيود يومية لعرضها حاليًا.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="accounts">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>شجرة الحسابات</CardTitle>
            </CardHeader>
            <CardContent>
              {chartOfAccountsData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الرمز</TableHead>
                      <TableHead>اسم الحساب</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead className="text-left">الرصيد</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartOfAccountsData.map((account) => (
                      <TableRow key={account.code}>
                        <TableCell>{account.code}</TableCell>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell className="text-left">{account.balance.toFixed(2)} ر.س</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">لا توجد حسابات لعرضها حاليًا.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
