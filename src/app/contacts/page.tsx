
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Edit, Trash2, Mail, Phone, Landmark, Search, Filter, Users, Briefcase, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getContacts, addContact, updateContact, deleteContact as deleteContactService } from "@/lib/services/contacts";

export interface Contact {
  id: string;
  name: string;
  avatarUrl?: string; 
  avatarFallback: string;
  email?: string; // Made optional as per schema
  phone: string;
  type: "Customer" | "Supplier"; 
  balance: number; 
  lastActivity: string;
  companyName?: string;
  address?: string;
  taxNumber?: string; 
  contactGroup?: string; 
  creditLimit?: number; 
  paymentTerms?: string; 
}

const contactFormSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  type: z.enum(["Customer", "Supplier"], { required_error: "نوع جهة الاتصال مطلوب" }),
  email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal('')),
  phone: z.string().min(9, "رقم الهاتف يجب أن يكون 9 أرقام على الأقل"),
  companyName: z.string().optional(),
  address: z.string().optional(),
  taxNumber: z.string().optional(),
  contactGroup: z.string().optional(),
  creditLimit: z.coerce.number().nonnegative("حد الائتمان لا يمكن أن يكون سالبًا").optional(),
  paymentTerms: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null; // For editing
  onSave: () => void; // Callback to refresh data
}

function ContactDialog({ open, onOpenChange, contact, onSave }: ContactDialogProps) {
  const { toast } = useToast();
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      type: "Customer",
      email: "",
      phone: "",
      companyName: "",
      address: "",
      taxNumber: "",
      contactGroup: "",
      creditLimit: undefined,
      paymentTerms: "",
    },
  });

  useEffect(() => {
    if (contact) {
      form.reset({
        name: contact.name,
        type: contact.type,
        email: contact.email || "",
        phone: contact.phone,
        companyName: contact.companyName || "",
        address: contact.address || "",
        taxNumber: contact.taxNumber || "",
        contactGroup: contact.contactGroup || "",
        creditLimit: contact.type === "Customer" ? contact.creditLimit : undefined,
        paymentTerms: contact.paymentTerms || "",
      });
    } else {
      form.reset({ // Default values for new contact
        name: "",
        type: "Customer",
        email: "",
        phone: "",
        companyName: "",
        address: "",
        taxNumber: "",
        contactGroup: "",
        creditLimit: undefined,
        paymentTerms: "",
      });
    }
  }, [contact, form, open]); // Add open to dependencies to reset form when dialog opens for new contact

  const onSubmit = async (data: ContactFormData) => {
    try {
      if (contact) { // Editing
        await updateContact(contact.id, data);
        toast({ title: "تم التحديث بنجاح", description: `تم تحديث بيانات ${data.name}.` });
      } else { // Adding
        await addContact(data as Omit<Contact, 'id' | 'avatarFallback' | 'lastActivity' | 'balance' | 'avatarUrl'>);
        toast({ title: "تمت الإضافة بنجاح", description: `تمت إضافة ${data.name} إلى جهات الاتصال.` });
      }
      onSave(); // Refresh the list
      onOpenChange(false); // Close dialog
    } catch (error) {
      toast({ variant: "destructive", title: "حدث خطأ", description: "لم يتم حفظ التغييرات. الرجاء المحاولة مرة أخرى." });
      console.error("Failed to save contact:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{contact ? "تعديل جهة اتصال" : "إضافة جهة اتصال جديدة"}</DialogTitle>
          <DialogDescription>
            {contact ? `قم بتحديث تفاصيل ${contact.name}.` : "أدخل تفاصيل جهة الاتصال الجديدة أدناه."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: محمد الأحمد" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع جهة الاتصال</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Customer">عميل</SelectItem>
                      <SelectItem value="Supplier">مورد</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="مثال: 0501234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني (اختياري)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الشركة (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: شركة النور للتجارة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: حي الملك فهد، الرياض" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرقم الضريبي (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: 300012345600003" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مجموعة جهة الاتصال (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: عملاء جملة، موردين محليين" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {form.watch("type") === "Customer" && (
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حد الائتمان (للعملاء - اختياري)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="مثال: 5000" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>شروط الدفع (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: 30 يوم، عند الاستلام" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">إلغاء</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Save className="ml-2 h-4 w-4" />
                {form.formState.isSubmitting ? "جاري الحفظ..." : "حفظ جهة الاتصال"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const ContactTable = ({ contacts, type, onEdit, onDelete, onViewTransactions, isLoading }: { 
  contacts: Contact[]; 
  type: string;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onViewTransactions: (contact: Contact) => void;
  isLoading: boolean;
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
      {isLoading && <p className="text-center p-4">جاري تحميل البيانات...</p>}
      {!isLoading && contacts.length === 0 && (
        <div className="text-center text-muted-foreground py-10">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg">
            {type === "Customer" ? "لا يوجد عملاء لعرضهم حاليًا." : "لا يوجد موردون لعرضهم حاليًا."}
            </p>
            <p className="text-sm">ابدأ بإضافة {type === "Customer" ? "عملاء" : "موردين"} جدد لتتبع معاملاتك وعلاقاتك التجارية.</p>
        </div>
      )}
      {!isLoading && contacts.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الشركة</TableHead>
              <TableHead>البريد/الهاتف</TableHead>
              <TableHead>الرقم الضريبي</TableHead>
              <TableHead>المجموعة</TableHead>
              {type === "Customer" && <TableHead className="text-left">حد الائتمان (ر.س)</TableHead>}
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
                  {contact.email && 
                    <a href={`mailto:${contact.email}`} className="text-primary hover:underline flex items-center gap-1 text-xs">
                      <Mail className="h-3 w-3"/> {contact.email}
                    </a>
                  }
                   <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Phone className="h-3 w-3"/> {contact.phone}
                   </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{contact.taxNumber || "-"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{contact.contactGroup || "-"}</TableCell>
                {type === "Customer" && (
                  <TableCell className="text-left text-sm">
                    {contact.creditLimit !== undefined ? `${contact.creditLimit.toFixed(2)}` : "-"}
                  </TableCell>
                )}
                <TableCell className={`text-left font-semibold ${contact.balance < 0 ? 'text-red-600' : contact.balance > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {Math.abs(contact.balance).toFixed(2)}
                  {contact.balance < 0 && contact.type === "Customer" && <Badge variant="destructive" className="mr-1 text-xs">مستحق عليك</Badge>}
                  {contact.balance > 0 && contact.type === "Customer" && <Badge variant="outline" className="mr-1 text-xs border-green-500 text-green-600">رصيد له</Badge>}
                  {contact.balance < 0 && contact.type === "Supplier" && <Badge variant="outline" className="mr-1 text-xs border-green-500 text-green-600">رصيد لك</Badge>}
                  {contact.balance > 0 && contact.type === "Supplier" && <Badge variant="destructive" className="mr-1 text-xs">مستحق له</Badge>}
                  {contact.balance === 0 && <Badge variant="outline" className="mr-1 text-xs">مسدد</Badge>}
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
      )}
    </CardContent>
  </Card>
);

export default function ContactsPage() {
  const [contactsData, setContactsData] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const { toast } = useToast();

  const fetchContactsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getContacts();
      setContactsData(data);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل بيانات جهات الاتصال." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchContactsData();
  }, [fetchContactsData]);

  const handleOpenAddDialog = () => {
    setEditingContact(null);
    setIsDialogOpen(true);
  };
  
  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
  };

  const handleDeleteContact = async (contact: Contact) => {
    // TODO: Add confirmation dialog here
    if (confirm(`هل أنت متأكد من حذف ${contact.name}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      try {
        await deleteContactService(contact.id);
        toast({ title: "تم الحذف بنجاح", description: `تم حذف ${contact.name}.` });
        fetchContactsData(); // Refresh list
      } catch (error) {
        toast({ variant: "destructive", title: "خطأ", description: "فشل حذف جهة الاتصال." });
      }
    }
  };

  const handleViewTransactions = (contact: Contact) => {
    console.log("View transactions for:", contact.id);
    toast({ title: "ميزة قيد التطوير", description: `عرض معاملات ${contact.name} (لم تنفذ بعد).`});
  };

  const customers = contactsData.filter(c => c.type === "Customer");
  const suppliers = contactsData.filter(c => c.type === "Supplier");

  return (
    <>
      <PageHeader 
        title="إدارة جهات الاتصال الشاملة" 
        description="إدارة معلومات العملاء والموردين، سجل المعاملات، وتتبع الأرصدة المالية بكفاءة."
        actions={
          <Button onClick={handleOpenAddDialog}>
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
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="suppliers">
          <ContactTable 
            contacts={suppliers} 
            type="Supplier"
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onViewTransactions={handleViewTransactions}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
      <ContactDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        contact={editingContact}
        onSave={fetchContactsData}
      />
    </>
  );
}
