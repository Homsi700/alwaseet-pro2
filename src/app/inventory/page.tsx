
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, PackageSearch, AlertOctagon, Edit, History, FileWarning, Package, Search, Filter, ListChecks, Repeat, BellDot, Barcode, DollarSign, CalendarDays, Warehouse as WarehouseIcon, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

type InventoryItemStatus = "متوفر" | "مخزون منخفض" | "نفذ المخزون";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  unitOfMeasure: string; // وحدة القياس الأساسية
  quantity: number;
  reorderPoint: number; 
  costPrice: number;
  sellingPrice: number;
  supplierId?: string;
  supplierName?: string; // For display
  warehouseId?: string; 
  warehouseName?: string; // For display
  expiryDate?: string; 
  lastCountDate: string;
  images?: string[]; // Array of image URLs
  notes?: string;
  alternativeUnits?: { unit: string; conversionFactor: number }[]; // وحدات بديلة ومعامل التحويل
}

interface StockMovement {
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

interface InventoryAlert {
  id: string;
  type: "مخزون منخفض" | "منتج على وشك النفاذ" | "انتهاء صلاحية قريب" | "خطأ في الجرد"; 
  message: string;
  severity: "warning" | "destructive" | "info";
  date: string;
  itemSku?: string;
}

interface InventoryCount {
    id: string;
    date: string;
    warehouseId: string;
    warehouseName?: string;
    status: "قيد التنفيذ" | "مكتمل" | "ملغى";
    countedBy: string;
    items: { itemId: string; itemName: string; expectedQty: number; countedQty: number; difference: number }[];
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


  return (
    <>
      <PageHeader 
        title="إدارة المخزون الذكية" 
        description="تتبع كميات المخزون بدقة، سجل حركات المخزون، نفذ عمليات الجرد، واحصل على تنبيهات استباقية."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <PlusCircle className="ml-2 h-4 w-4" /> إضافة منتج جديد
            </Button>
            <Button>
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
              {inventoryItems.length > 0 ? (
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
                            <Button variant="ghost" size="icon" title="تعديل المنتج"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" title="عرض حركات المخزون للمنتج"><History className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <PackageSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg">لا توجد عناصر مخزون لعرضها حاليًا.</p>
                  <p className="text-sm">ابدأ بإضافة منتجاتك لتتبع مستويات المخزون.</p>
                </div>
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
              {stockMovements.length > 0 ? (
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
              ) : (
                 <div className="text-center text-muted-foreground py-10">
                    <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg">لا توجد حركات مخزون مسجلة حاليًا.</p>
                    <p className="text-sm">ستظهر هنا جميع عمليات استلام وصرف وتعديل المخزون.</p>
                </div>
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
                  {inventoryCounts.length > 0 ? (
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
                   ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <ListChecks className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg">لا توجد عمليات جرد مسجلة حاليًا.</p>
                        <p className="text-sm">ابدأ عملية جرد جديدة لتحديث كميات المخزون.</p>
                    </div>
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
              {inventoryAlerts.length > 0 ? (
                inventoryAlerts.map((alert) => (
                  <Alert key={alert.id} variant={alert.severity === "info" ? "default" : alert.severity === "warning" ? "default" : "destructive"} className={`${alert.severity === "warning" ? "border-yellow-500 bg-yellow-50 text-yellow-700 [&>svg]:text-yellow-500" : ""}`}>
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
              ) : (
                <div className="text-center text-muted-foreground py-10">
                    <BellDot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg">لا توجد تنبيهات نشطة حاليًا.</p>
                    <p className="text-sm">سيتم عرض إشعارات المخزون الهامة هنا عند حدوثها.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
