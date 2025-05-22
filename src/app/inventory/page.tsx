"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, PackageSearch, AlertOctagon, Edit, History, FileWarning, Package, Search, Filter, ListChecks, Repeat, BellDot, Barcode, DollarSign, CalendarDays } from "lucide-react"; // Added Barcode, DollarSign, CalendarDays
import { Badge } from "@/components/ui/badge";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type InventoryItemStatus = "متوفر" | "مخزون منخفض" | "نفذ المخزون";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string; // الباركود
  category: string;
  quantity: number;
  reorderPoint: number; 
  costPrice: number; // سعر التكلفة
  sellingPrice: number; // سعر البيع
  supplier?: string;
  warehouse?: string; // المستودع
  expiryDate?: string; // تاريخ الصلاحية
  lastCountDate: string;
  imageUrl?: string;
}

interface StockMovement {
  id: string;
  date: string;
  itemSku: string;
  itemName: string;
  type: "استلام" | "صرف" | "تعديل جرد" | "مرتجع"; 
  quantityChanged: number; 
  newQuantity: number;
  reference?: string; 
  user?: string;
}

interface InventoryAlert {
  id: string;
  type: "مخزون منخفض" | "منتج على وشك النفاذ" | "انتهاء صلاحية قريب" | "خطأ في الجرد"; 
  message: string;
  severity: "warning" | "destructive" | "info";
  date: string;
  itemSku?: string;
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


  return (
    <>
      <PageHeader 
        title="إدارة المخزون الذكية" 
        description="تتبع كميات المخزون بدقة، سجل حركات المخزون، واحصل على تنبيهات استباقية."
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
          <TabsTrigger value="overview" className="text-base py-2.5 flex items-center gap-2"><Package className="h-4 w-4"/>نظرة عامة</TabsTrigger>
          <TabsTrigger value="movements" className="text-base py-2.5 flex items-center gap-2"><Repeat className="h-4 w-4"/>حركات المخزون</TabsTrigger>
          <TabsTrigger value="alerts" className="text-base py-2.5 flex items-center gap-2"><BellDot className="h-4 w-4"/>التنبيهات والإشعارات</TabsTrigger>
           <TabsTrigger value="counts" className="text-base py-2.5 flex items-center gap-2"><ListChecks className="h-4 w-4"/>عمليات الجرد</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>نظرة عامة على مستويات المخزون</CardTitle>
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
                      <TableHead className="text-center">الكمية</TableHead>
                      <TableHead className="text-center">إعادة الطلب</TableHead>
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

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                               {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded object-cover border" data-ai-hint={`${item.category} item`} />}
                               {!item.imageUrl && <Package className="h-10 w-10 p-2 rounded bg-muted text-muted-foreground border"/>}
                               <div>
                                {item.name}
                                <p className="text-xs text-muted-foreground">{item.sku}</p>
                               </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.barcode || "-"}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.warehouse || "-"}</TableCell>
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
                            <Button variant="ghost" size="icon" title="عرض حركات المخزون"><History className="h-4 w-4" /></Button>
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
              <CardDescription>تتبع جميع التغييرات في كميات المخزون (استلام، صرف، تعديلات).</CardDescription>
              <div className="flex items-center gap-2 pt-4">
                <Input placeholder="ابحث بالمنتج أو المرجع..." className="max-w-sm" />
                <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية حسب النوع/التاريخ</Button>
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
                      <span>{alert.type} {alert.itemSku && `(${alert.itemSku})`}</span>
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
        
        <TabsContent value="counts">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>عمليات الجرد الدورية</CardTitle>
                    <CardDescription>سجل وتتبع عمليات جرد المخزون لضمان دقة البيانات.</CardDescription>
                     <div className="flex items-center gap-2 pt-4">
                        <Input placeholder="ابحث في عمليات الجرد..." className="max-w-sm" />
                        <Button variant="outline"><Filter className="ml-2 h-4 w-4" /> تصفية</Button>
                     </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-10">
                        <ListChecks className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg">لا توجد عمليات جرد مسجلة حاليًا.</p>
                        <p className="text-sm">ابدأ عملية جرد جديدة لتحديث كميات المخزون.</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

    