"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Edit, Trash2, Mail, Phone, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React, { useState } from 'react';

interface Contact {
  id: string;
  name: string;
  avatar?: string; // Avatar is optional
  avatarFallback: string;
  email: string;
  phone: string;
  type: "Customer" | "Supplier"; // Kept as string literals for clarity, can be enum
  balance: number;
  lastActivity: string;
}

// ContactTable expects "العملاء" or "الموردون" for type
const ContactTable = ({ contacts, type }: { contacts: Contact[]; type: string }) => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle>{type}</CardTitle>
    </CardHeader>
    <CardContent>
      {contacts.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead className="text-left">الرصيد</TableHead>
              <TableHead>آخر نشاط</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {contact.avatar && <AvatarImage src={contact.avatar} alt={contact.name} />}
                      <AvatarFallback>{contact.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{contact.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <a href={`mailto:${contact.email}`} className="text-primary hover:underline flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5"/> {contact.email}
                  </a>
                </TableCell>
                <TableCell>
                   <span className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5"/> {contact.phone}
                   </span>
                </TableCell>
                <TableCell className={`text-left font-semibold ${contact.balance < 0 ? 'text-red-500' : contact.balance > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {Math.abs(contact.balance).toFixed(2)} ر.س
                  {contact.balance < 0 && <Badge variant="destructive" className="mr-1">مستحق</Badge>}
                  {contact.balance > 0 && contact.type === "Customer" && <Badge variant="outline" className="mr-1">رصيد</Badge>}
                   {contact.balance > 0 && contact.type === "Supplier" && <Badge variant="secondary" className="mr-1">للدفع</Badge>}
                </TableCell>
                <TableCell>{contact.lastActivity}</TableCell>
                <TableCell className="text-center space-x-1">
                  <Button variant="ghost" size="icon" title="عرض المعاملات"><Landmark className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="تعديل جهة الاتصال"><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="حذف جهة الاتصال" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-muted-foreground py-4">
          {type === "العملاء" ? "لا يوجد عملاء لعرضهم حاليًا." : "لا يوجد موردون لعرضهم حاليًا."}
        </p>
      )}
    </CardContent>
  </Card>
);

export default function ContactsPage() {
  const [contactsData, setContactsData] = useState<Contact[]>([]);
  // TODO: Fetch contactsData from an API

  const customers = contactsData.filter(c => c.type === "Customer");
  const suppliers = contactsData.filter(c => c.type === "Supplier");

  return (
    <>
      <PageHeader 
        title="إدارة جهات الاتصال" 
        description="إدارة معلومات العملاء والموردين، سجل المعاملات، والأرصدة."
        actions={
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" /> إضافة جهة اتصال جديدة
          </Button>
        }
      />

      <Tabs defaultValue="customers" dir="rtl">
        <TabsList className="grid w-full grid-cols-2 md:w-[300px]">
          <TabsTrigger value="customers">العملاء</TabsTrigger>
          <TabsTrigger value="suppliers">الموردون</TabsTrigger>
        </TabsList>
        <TabsContent value="customers">
          <ContactTable contacts={customers} type="العملاء" />
        </TabsContent>
        <TabsContent value="suppliers">
          <ContactTable contacts={suppliers} type="الموردون" />
        </TabsContent>
      </Tabs>
    </>
  );
}
