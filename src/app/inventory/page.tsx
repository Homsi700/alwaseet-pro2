
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, PackageSearch, AlertOctagon, Edit, History, FileWarning, Package, Search, Filter, ListChecks, Repeat, BellDot, Eye, Trash2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { getInventoryItems, getInventoryItemById, addInventoryItem, updateInventoryItem, deleteInventoryItem, getStockMovements, getInventoryAlerts, getInventoryCounts } from "@/lib/services/inventory";


type InventoryItemStatus = "متوفر" | "مخزون منخفض" | "نفذ المخزون";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  unitOfMeasure: string; 
  quantity: number;
  reorderPoint: number; 
  costPrice: number;
  sellingPrice: number;
  supplierId?: string;
  supplierName?: string; 
  warehouseId?: string; 
  warehouseName?: string; 
  expiryDate?: string; 
  lastCountDate: string;
  images?: string[]; 
  notes?: string;
  alternativeUnits?: { unit: string; conversionFactor: number }[]; 
}

export interface StockMovement {
  id: string;
  date: string;
  itemSku: string;
  itemName: string;
  type: "استلام" | "صرف" | "تعديل جرد" | "مرتجع عميل" | "مرتجع مورد" | "تحويل مخزني"; 
  quantityChanged: number; 
  newQuantity: number;
  reference?: string; 
  user?: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
}

export interface InventoryAlert {
  id: string;
  type: "مخزون منخفض" | "منتج على وشك النفاذ" | "انتهاء صلاحية قريب" | "خطأ في الجرد"; 
  message: string;
  severity: "warning" | "destructive" | "info";
  date: string;
  itemSku?: string;
}

export interface InventoryCount {
    id: string;
    date: string;
    warehouseId: string;
    warehouseName?: string;
    status: "قيد التنفيذ" | "مكتمل" | "ملغى";
    countedBy: string;
    items: { itemId: string; itemName: string; expectedQty: number; countedQty: number; difference: number }[];
}

const inventoryItemFormSchema = z.object({
  name: z.string().min(1, "اسم المنتج مطلوب"),
  sku: z.string().min(1, "SKU مطلوب"),
  barcode: z.string().optional(),
  category: z.string().min(1, "الفئة مطلوبة"),
  unitOfMeasure: z.string().min(1, "وحدة القياس مطلوبة"),
  quantity: z.coerce.number().min(0, "الكمية لا يمكن أن تكون سالبة"),
  reorderPoint: z.coerce.number().min(0, "نقطة إعادة الطلب لا يمكن أن تكون سالبة"),
  costPrice: z.coerce.number().min(0, "سعر التكلفة لا يمكن أن يكون سالبًا"),
  sellingPrice: z.coerce.number().min(0, "سعر البيع لا يمكن أن يكون سالبًا"),
  supplierName: z.string().optional(), // Simplified for now
  warehouseName: z.string().optional(), // Simplified for now
  expiryDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val.split('/').reverse().join('-'))), {message: "تاريخ الصلاحية غير صالح (مثال: 31/12/2025)"}),
  notes: z.string().optional(),
});
type InventoryItemFormData = z.infer<typeof inventoryItemFormSchema>;

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  onSave: () => void;
}

function ItemDialog({ open, onOpenChange, item, onSave }: ItemDialogProps) {
  const { toast } = useToast();
  const form = useForm<InventoryItemFormData>({
    resolver: zodResolver(inventoryItemFormSchema),
    defaultValues: {
      name: "", sku: "", barcode: "", category: "", unitOfMeasure: "قطعة", quantity: 0,
      reorderPoint: 0, costPrice: 0, sellingPrice: 0, supplierName: "", warehouseName: "",
      expiryDate: "", notes: "",
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        sku: item.sku,
        barcode: item.barcode || "",
        category: item.category,
        unitOfMeasure: item.unitOfMeasure,
        quantity: item.quantity,
        reorderPoint: item.reorderPoint,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        supplierName: item.supplierName || "",
        warehouseName: item.warehouseName || "",
        expiryDate: item.expiryDate || "",
        notes: item.notes || "",
      });
    } else {
      form.reset({
        name: "", sku: "", barcode: "", category: "", unitOfMeasure: "قطعة", quantity: 0,
        reorderPoint: 0, costPrice: 0, sellingPrice: 0, supplierName: "", warehouseName: "",
        expiryDate: "", notes: "",
      });
    }
  }, [item, form, open]);

  const onSubmit = async (data: InventoryItemFormData) => {
    try {
      const itemDataForService = { ...data, supplierId: data.supplierName, warehouseId: data.warehouseName }; // Map names to IDs if needed
      if (item) {
        await updateInventoryItem(item.id, itemDataForService);
        toast({ title: "تم التحديث بنجاح", description: `تم تحديث المنتج ${data.name}.` });
      } else {
        await addInventoryItem(itemDataForService as Omit<InventoryItem, 'id' | 'lastCountDate'>);
        toast({ title: "تمت الإضافة بنجاح", description: `تمت إضافة المنتج ${data.name}.` });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "حدث خطأ", description: "لم يتم حفظ المنتج." });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{item ? "تعديل منتج" : "إضافة منتج جديد للمخزون"}</DialogTitle>
          <DialogDescription>
            {item ? `قم بتحديث تفاصيل المنتج: ${item.name}.` : "أدخل تفاصيل المنتج الجديد أدناه."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>اسم المنتج</FormLabel><FormControl><Input placeholder="مثال: لابتوب ديل" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="sku" render={({ field }) => (
                <FormItem><FormLabel>SKU (رمز تعريف المنتج)</FormLabel><FormControl><Input placeholder="مثال: DELL-XPS-001" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="barcode" render={({ field }) => (
                <FormItem><FormLabel>الباركود (اختياري)</FormLabel><FormControl><Input placeholder="مثال: 1234567890123" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>الفئة</FormLabel><FormControl><Input placeholder="مثال: إلكترونيات، مواد غذائية" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="unitOfMeasure" render={({ field }) => (
                    <FormItem><FormLabel>وحدة القياس الأساسية</FormLabel><FormControl><Input placeholder="مثال: قطعة، كجم، كرتون" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="quantity" render={({ field }) => (
                    <FormItem><FormLabel>الكمية الحالية</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="reorderPoint" render={({ field }) => (
                    <FormItem><FormLabel>نقطة إعادة الطلب</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="costPrice" render={({ field }) => (
                    <FormItem><FormLabel>سعر التكلفة (ر.س)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                    <FormItem><FormLabel>سعر البيع (ر.س)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="expiryDate" render={({ field }) => (
                    <FormItem><FormLabel>تاريخ الصلاحية (اختياري)</FormLabel><FormControl><Input placeholder="مثال: 31/12/2025" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="supplierName" render={({ field }) => (
                    <FormItem><FormLabel>اسم المورد الافتراضي (اختياري)</FormLabel><FormControl><Input placeholder="اسم المورد" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="warehouseName" render={({ field }) => (
                    <FormItem><FormLabel>اسم المستودع (اختياري)</FormLabel><FormControl><Input placeholder="اسم المستودع" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>ملاحظات (اختياري)</FormLabel><FormControl><Textarea placeholder="أي تفاصيل إضافية عن المنتج" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>

            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Save className="ml-2 h-4 w-4"/> {form.formState.isSubmitting ? "جاري الحفظ..." : "حفظ المنتج"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface ItemDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

function ItemDetailsDialog({ open, onOpenChange, item }: ItemDetailsDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>تفاصيل المنتج: {item.name}</DialogTitle>
          <DialogDescription>SKU: {item.sku} {item.barcode && `| باركود: ${item.barcode}`}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4 text-sm">
          {item.images && item.images[0] && (
            <div className="w-full h-48 relative rounded-md overflow-hidden bg-muted mb-2">
              <Image src={item.images[0]} alt={item.name} layout="fill" objectFit="contain" data-ai-hint={`${item.category} product detailed`} />
            </div>
          )}
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <span className="text-muted-foreground">الفئة:</span> <strong>{item.category}</strong>
            <span className="text-muted-foreground">وحدة القياس:</span> <strong>{item.unitOfMeasure}</strong>
            <span className="text-muted-foreground">الكمية الحالية:</span> <strong>{item.quantity}</strong>
            <span className="text-muted-foreground">نقطة إعادة الطلب:</span> <strong>{item.reorderPoint}</strong>
            <span className="text-muted-foreground">سعر التكلفة:</span> <strong>{item.costPrice.toFixed(2)} ر.س</strong>
            <span className="text-muted-foreground">سعر البيع:</span> <strong>{item.sellingPrice.toFixed(2)} ر.س</strong>
            {item.expiryDate && <><span className="text-muted-foreground">تاريخ الصلاحية:</span> <strong>{item.expiryDate}</strong></>}
            {item.supplierName && <><span className="text-muted-foreground">المورد:</span> <strong>{item.supplierName}</strong></>}
            {item.warehouseName && <><span className="text-muted-foreground">المستودع:</span> <strong>{item.warehouseName}</strong></>}
            <span className="text-muted-foreground">آخر جرد:</span> <strong>{item.lastCountDate}</strong>
          </div>
          {item.notes && (
            <div>
              <h4 className="font-medium text-muted-foreground">ملاحظات:</h4>
              <p className="bg-muted/50 p-2 rounded-md">{item.notes}</p>
            </div>
          )}
           {item.alternativeUnits && item.alternativeUnits.length > 0 && (
            <div>
              <h4 className="font-medium text-muted-foreground">وحدات بديلة:</h4>
              <ul className="list-disc list-inside bg-muted/50 p-2 rounded-md">
                {item.alternativeUnits.map(au => <li key={au.unit}>{au.unit} (1 {au.unit} = {au.conversionFactor} {item.unitOfMeasure})</li>)}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">إغلاق</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const getItemStatus = (item: InventoryItem): InventoryItemStatus => {
  if (item.quantity <= 0) return "نفذ المخزون";
  if (item.quantity <= item.reorderPoint) return "مخزون منخفض";
  return "متوفر";
}

const getStatusBadgeVariant = (status: InventoryItemStatus) => {
  if (status === "مخزون منخفض") return "destructive"; 
  if (status === "نفذ المخزون") return "destructive";
  return "default"; 
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [inventoryCounts, setInventoryCounts] = useState<InventoryCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [itemsData, movementsData, alertsData, countsData] = await Promise.all([
        getInventoryItems(),
        getStockMovements(),
        getInventoryAlerts(),
        getInventoryCounts()
      ]);
      setInventoryItems(itemsData);
      setStockMovements(movementsData);
      setInventoryAlerts(alertsData);
      setInventoryCounts(countsData);
    } catch (error) {
      console.error("Failed to fetch inventory data:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل بيانات المخزون." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAddItemDialog = () => {
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };
  
  const handleViewItemDetails = (item: InventoryItem) => {
    setViewingItem(item);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteItem = async (item: InventoryItem) => {
     if (confirm(`هل أنت متأكد من حذف المنتج "${item.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
        try {
            await deleteInventoryItem(item.id);
            toast({ title: "تم الحذف", description: `تم حذف المنتج ${item.name} بنجاح.` });
            fetchData(); // Refresh
        } catch (error) {
            toast({ variant: "destructive", title: "خطأ في الحذف", description: "لم يتم حذف المنتج."});
        }
    }
  };

  return (
    <>
      <PageHeader 
        title="إدارة المخزون الذكية" 
        description="تتبع كميات المخزون بدقة، سجل حركات المخزون، نفذ عمليات الجرد، واحصل على تنبيهات استباقية."
        actions={
          <div className="flex gap-2">
            <Button onClick={handleOpenAddItemDialog}>
              <PlusCircle className="ml-2 h-4 w-4" /> إضافة منتج جديد
            </Button>
            <Button variant="outline">
              <ListChecks className="ml-2 h-4 w-4" /> بدء عملية جرد جديدة
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="overview" dir="rtl" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="text-base py-2.5 flex items-center gap-2"><Package className="h-4 w-4"/>نظرة عامة على المخزون</TabsTrigger>
          <TabsTrigger value="movements" className="text-base py-2.5 flex items-center gap-2"><Repeat className="h-4 w-4"/>حركات المخزون</TabsTrigger>
          <TabsTrigger value="counts" className="text-base py-2.5 flex items-center gap-2"><ListChecks className="h-4 w-4"/>عمليات الجرد</TabsTrigger>
          <TabsTrigger value="alerts" className="text-base py-2.5 flex items-center gap-2"><BellDot className="h-4 w-4"/>التنبيهات والإشعارات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>قائمة المنتجات في المخزون</CardTitle>
              <CardDescription>عرض ملخص لحالة جميع المنتجات في المخزون.</CardDescription>
              <div className="flex items-center gap-2 pt-4">
                <Input placeholder="ابحث بالاسم، SKU، أو الباركود..." className="max-w-sm" />
                <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && <p className="text-center p-4">جاري تحميل المنتجات...</p>}
              {!isLoading && inventoryItems.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  <PackageSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg">لا توجد عناصر مخزون لعرضها حاليًا.</p>
                  <p className="text-sm">ابدأ بإضافة منتجاتك لتتبع مستويات المخزون.</p>
                </div>
              )}
              {!isLoading && inventoryItems.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج (SKU)</TableHead>
                      <TableHead>الباركود</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead>المستودع</TableHead>
                      <TableHead>وحدة القياس</TableHead>
                      <TableHead className="text-center">الكمية</TableHead>
                      <TableHead className="text-center">نقطة إعادة الطلب</TableHead>
                      <TableHead className="text-left">سعر التكلفة</TableHead>
                      <TableHead className="text-left">سعر البيع</TableHead>
                      <TableHead>تاريخ الصلاحية</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                      <TableHead>آخر جرد</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems.map((item) => {
                      const status = getItemStatus(item);
                      const progressValue = item.reorderPoint > 0 ? (item.quantity / (item.reorderPoint * 2)) * 100 : item.quantity > 0 ? 100 : 0;
                      const primaryImage = item.images && item.images.length > 0 ? item.images[0] : "https://placehold.co/100x100.png?text=منتج";

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                               <Image src={primaryImage} alt={item.name} width={40} height={40} className="h-10 w-10 rounded object-cover border" data-ai-hint={`${item.category} item`} />
                               <div>
                                {item.name}
                                <p className="text-xs text-muted-foreground">{item.sku}</p>
                               </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.barcode || "-"}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.warehouseName || item.warehouseId || "-"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.unitOfMeasure}</TableCell>
                          <TableCell className="text-center">
                            {item.quantity}
                            <Progress value={Math.min(100, progressValue)} className={`h-1.5 mt-1 ${status === 'مخزون منخفض' ? 'bg-red-100 [&>div]:bg-red-500' : status === 'نفذ المخزون' ? 'bg-destructive/20 [&>div]:bg-destructive' : 'bg-green-100 [&>div]:bg-green-500'}`} />
                          </TableCell>
                          <TableCell className="text-center">{item.reorderPoint}</TableCell>
                          <TableCell className="text-left text-sm">{item.costPrice.toFixed(2)} ر.س</TableCell>
                          <TableCell className="text-left text-sm">{item.sellingPrice.toFixed(2)} ر.س</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.expiryDate || "-"}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={getStatusBadgeVariant(status)} className="text-xs">{status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.lastCountDate}</TableCell>
                          <TableCell className="text-center space-x-1">
                            <Button variant="ghost" size="icon" title="عرض التفاصيل" onClick={() => handleViewItemDetails(item)}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" title="تعديل المنتج" onClick={() => handleEditItem(item)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" title="حذف المنتج" className="text-destructive hover:text-destructive" onClick={() => handleDeleteItem(item)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>سجل حركات المخزون</CardTitle>
              <CardDescription>تتبع جميع التغييرات في كميات المخزون (استلام، صرف، تعديلات، تحويلات).</CardDescription>
               <div className="flex items-center gap-2 pt-4">
                <Input placeholder="ابحث بالمنتج أو المرجع..." className="max-w-sm" />
                <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية حسب النوع/التاريخ</Button>
                 <Button variant="outline"><PlusCircle className="ml-2 h-4 w-4" /> إذن إضافة مخزون</Button>
                 <Button variant="outline"><PlusCircle className="ml-2 h-4 w-4" /> إذن صرف مخزون</Button>
                 <Button variant="outline"><Repeat className="ml-2 h-4 w-4" /> تحويل مخزني</Button>
              </div>
            </CardHeader>
            <CardContent>
               {isLoading && <p className="text-center p-4">جاري تحميل حركات المخزون...</p>}
               {!isLoading && stockMovements.length === 0 && (
                 <div className="text-center text-muted-foreground py-10">
                    <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg">لا توجد حركات مخزون مسجلة حاليًا.</p>
                    <p className="text-sm">ستظهر هنا جميع عمليات استلام وصرف وتعديل المخزون.</p>
                </div>
              )}
              {!isLoading && stockMovements.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ والوقت</TableHead>
                      <TableHead>المنتج (SKU)</TableHead>
                      <TableHead>نوع الحركة</TableHead>
                      <TableHead>من مستودع</TableHead>
                      <TableHead>إلى مستودع</TableHead>
                      <TableHead className="text-center">الكمية المتغيرة</TableHead>
                      <TableHead className="text-center">الكمية الجديدة</TableHead>
                      <TableHead>المرجع/السبب</TableHead>
                      <TableHead>المستخدم</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm text-muted-foreground">{movement.date}</TableCell>
                        <TableCell className="font-medium">{movement.itemName} <span className="text-xs text-muted-foreground">({movement.itemSku})</span></TableCell>
                        <TableCell>{movement.type}</TableCell>
                        <TableCell>{movement.fromWarehouseId || "-"}</TableCell>
                        <TableCell>{movement.toWarehouseId || "-"}</TableCell>
                        <TableCell className={`text-center font-semibold ${movement.quantityChanged < 0 ? 'text-red-600' : 'text-green-600'}`}>{movement.quantityChanged}</TableCell>
                        <TableCell className="text-center">{movement.newQuantity}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{movement.reference || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{movement.user || "النظام"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="counts">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>عمليات الجرد الدورية والسنوية</CardTitle>
                    <CardDescription>سجل وتتبع عمليات جرد المخزون لضمان دقة البيانات.</CardDescription>
                     <div className="flex items-center gap-2 pt-4">
                        <Input placeholder="ابحث في عمليات الجرد..." className="max-w-sm" />
                        <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button>
                        <Button><ListChecks className="ml-2 h-4 w-4" /> بدء عملية جرد جديدة</Button>
                     </div>
                </CardHeader>
                <CardContent>
                  {isLoading && <p className="text-center p-4">جاري تحميل عمليات الجرد...</p>}
                  {!isLoading && inventoryCounts.length === 0 && (
                    <div className="text-center text-muted-foreground py-10">
                        <ListChecks className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg">لا توجد عمليات جرد مسجلة حاليًا.</p>
                        <p className="text-sm">ابدأ عملية جرد جديدة لتحديث كميات المخزون.</p>
                    </div>
                   )}
                   {!isLoading && inventoryCounts.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>تاريخ الجرد</TableHead>
                                <TableHead>المستودع</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>القائم بالجرد</TableHead>
                                <TableHead className="text-center">عدد الأصناف</TableHead>
                                <TableHead className="text-center">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventoryCounts.map((count) => (
                                <TableRow key={count.id}>
                                    <TableCell>{count.date}</TableCell>
                                    <TableCell>{count.warehouseName || count.warehouseId}</TableCell>
                                    <TableCell><Badge variant={count.status === "مكتمل" ? "default" : "secondary"}>{count.status}</Badge></TableCell>
                                    <TableCell>{count.countedBy}</TableCell>
                                    <TableCell className="text-center">{count.items.length}</TableCell>
                                    <TableCell className="text-center space-x-1">
                                        <Button variant="ghost" size="icon" title="عرض تفاصيل الجرد"><Edit className="h-4 w-4" /></Button>
                                        {count.status !== "مكتمل" && <Button variant="ghost" size="icon" title="إلغاء الجرد" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                   )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>تنبيهات وإشعارات المخزون</CardTitle>
              <CardDescription>مراقبة استباقية لمشاكل المخزون مثل انخفاض الكميات أو قرب انتهاء الصلاحية.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && <p className="text-center p-4">جاري تحميل التنبيهات...</p>}
              {!isLoading && inventoryAlerts.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                    <BellDot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg">لا توجد تنبيهات نشطة حاليًا.</p>
                    <p className="text-sm">سيتم عرض إشعارات المخزون الهامة هنا عند حدوثها.</p>
                </div>
              )}
              {!isLoading && inventoryAlerts.length > 0 && (
                inventoryAlerts.map((alert) => (
                  <Alert key={alert.id} variant={alert.severity === "info" ? "default" : alert.severity === "warning" ? "default" : "destructive"} className={`${alert.severity === "warning" ? "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700 [&>svg]:text-yellow-500 dark:[&>svg]:text-yellow-400" : ""}`}>
                    {alert.severity === "destructive" && <AlertOctagon className="h-5 w-5 ml-2" />}
                    {alert.severity === "warning" && <FileWarning className="h-5 w-5 ml-2" />}
                    {alert.severity === "info" && <BellDot className="h-5 w-5 ml-2" />}
                    <AlertTitle className="flex justify-between items-center text-base">
                      <span>{alert.type} {alert.itemSku && `(SKU: ${alert.itemSku})`}</span>
                      <span className="text-xs text-muted-foreground">{alert.date}</span>
                    </AlertTitle>
                    <AlertDescription>{alert.message}</AlertDescription>
                    <div className="mt-2">
                        <Button variant="outline" size="sm">عرض التفاصيل</Button>
                    </div>
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <ItemDialog
        open={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        item={editingItem}
        onSave={fetchData}
      />
      <ItemDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        item={viewingItem}
      />
    </>
  );
}
