"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Edit, Trash2, Mail, Phone, Landmark, Search, Filter, Users, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";

interface Contact {
  id: string;
  name: string;
  avatarUrl?: string; 
  avatarFallback: string;
  email: string;
  phone: string;
  type: "Customer" | "Supplier"; 
  balance: number; // Positive for customer credit/supplier payable, negative for customer debit/supplier receivable
  lastActivity: string;
  companyName?: string;
  address?: string;
}

const ContactTable = ({ contacts, type, onEdit, onDelete, onViewTransactions }: { 
  contacts: Contact[]; 
  type: string;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onViewTransactions: (contact: Contact) => void;
}) => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle>{type === "Customer" ? "قائمة العملاء" : "قائمة الموردين"}</CardTitle>
      <CardDescription>عرض وإدارة جميع {type === "Customer" ? "العملاء" : "الموردين"} المسجلين.</CardDescription>
      <div className="flex items-center gap-2 pt-4">
        <Input placeholder={`ابحث في ${type === "Customer" ? "العملاء" : "الموردين"}...`} className="max-w-sm" />
        <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button>
      </div>
    </CardHeader>
    <CardContent>
      {contacts.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الشركة</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead className="text-left">الرصيد (ر.س)</TableHead>
              <TableHead>آخر نشاط</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint="person business" />}
                      <AvatarFallback className="bg-muted text-muted-foreground">{contact.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{contact.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{contact.companyName || "-"}</TableCell>
                <TableCell>
                  <a href={`mailto:${contact.email}`} className="text-primary hover:underline flex items-center gap-1 text-sm">
                    <Mail className="h-3.5 w-3.5"/> {contact.email}
                  </a>
                </TableCell>
                <TableCell>
                   <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5"/> {contact.phone}
                   </span>
                </TableCell>
                <TableCell className={`text-left font-semibold ${contact.balance < 0 ? 'text-red-600' : contact.balance > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {Math.abs(contact.balance).toFixed(2)}
                  {contact.balance < 0 && <Badge variant="destructive" className="mr-1 text-xs">مستحق عليك</Badge>}
                  {contact.balance > 0 && contact.type === "Customer" && <Badge variant="outline" className="mr-1 text-xs border-green-500 text-green-600">رصيد له</Badge>}
                   {contact.balance > 0 && contact.type === "Supplier" && <Badge variant="secondary" className="mr-1 text-xs">مستحق له</Badge>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{contact.lastActivity}</TableCell>
                <TableCell className="text-center space-x-1">
                  <Button variant="ghost" size="icon" title="عرض المعاملات" onClick={() => onViewTransactions(contact)}><Landmark className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="تعديل جهة الاتصال" onClick={() => onEdit(contact)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="حذف جهة الاتصال" className="text-destructive hover:text-destructive" onClick={() => onDelete(contact)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center text-muted-foreground py-10">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg">
            {type === "Customer" ? "لا يوجد عملاء لعرضهم حاليًا." : "لا يوجد موردون لعرضهم حاليًا."}
            </p>
            <p className="text-sm">ابدأ بإضافة {type === "Customer" ? "عملاء" : "موردين"} جدد لتتبع معاملاتك وعلاقاتك التجارية.</p>
        </div>
      )}
    </CardContent>
  </Card>
);

export default function ContactsPage() {
  const [contactsData, setContactsData] = useState<Contact[]>([]);
  
  // TODO: Implement actual data fetching and CRUD operations
  const handleEditContact = (contact: Contact) => console.log("Edit contact:", contact.id);
  const handleDeleteContact = (contact: Contact) => console.log("Delete contact:", contact.id);
  const handleViewTransactions = (contact: Contact) => console.log("View transactions for:", contact.id);


  const customers = contactsData.filter(c => c.type === "Customer");
  const suppliers = contactsData.filter(c => c.type === "Supplier");

  return (
    <>
      <PageHeader 
        title="إدارة جهات الاتصال الشاملة" 
        description="إدارة معلومات العملاء والموردين، سجل المعاملات، وتتبع الأرصدة المالية بكفاءة."
        actions={
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" /> إضافة جهة اتصال جديدة
          </Button>
        }
      />

      <Tabs defaultValue="customers" dir="rtl" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:w-[350px] mb-4">
          <TabsTrigger value="customers" className="text-base py-2.5 flex items-center gap-2"><Users className="h-4 w-4"/>العملاء</TabsTrigger>
          <TabsTrigger value="suppliers" className="text-base py-2.5 flex items-center gap-2"><Briefcase className="h-4 w-4"/>الموردون</TabsTrigger>
        </TabsList>
        <TabsContent value="customers">
          <ContactTable 
            contacts={customers} 
            type="Customer" 
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onViewTransactions={handleViewTransactions}
          />
        </TabsContent>
        <TabsContent value="suppliers">
          <ContactTable 
            contacts={suppliers} 
            type="Supplier"
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onViewTransactions={handleViewTransactions}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
