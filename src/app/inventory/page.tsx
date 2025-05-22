"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, PackageSearch, AlertOctagon, Edit, History, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React, { useState } from 'react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  lastCount: string;
  status: "OK" | "Low Stock" | "Out of Stock"; // Using string literals
}

interface StockMovement {
  date: string;
  item: string;
  type: string;
  quantity: number;
  reference: string;
}

interface InventoryAlert {
  id: string;
  type: string;
  message: string;
  severity: "default" | "destructive" | "warning" | "info"; // Adjusted for Alert variant
  date: string;
}


const getStatusBadgeVariant = (status: InventoryItem["status"]) => {
  if (status === "Low Stock") return "destructive"; 
  if (status === "Out of Stock") return "destructive";
  return "default"; 
}


export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);

  // TODO: Add functions to fetch/manage inventory data

  return (
    <>
      <PageHeader 
        title="إدارة المخزون" 
        description="تتبع كميات المخزون، حركات المخزون، وإدارة التنبيهات."
        actions={
          <Button>
            <PackageSearch className="ml-2 h-4 w-4" /> بدء جرد جديد
          </Button>
        }
      />

      <Tabs defaultValue="count" dir="rtl">
        <TabsList className="grid w-full grid-cols-3 md:w-[500px]">
          <TabsTrigger value="count">جرد المخزون</TabsTrigger>
          <TabsTrigger value="movements">حركات المخزون</TabsTrigger>
          <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
        </TabsList>

        <TabsContent value="count">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>مستويات المخزون الحالية</CardTitle>
            </CardHeader>
            <CardContent>
              {inventoryItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>معرف العنصر</TableHead>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead className="text-left">الكمية</TableHead>
                      <TableHead>آخر جرد</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-left">{item.quantity}</TableCell>
                        <TableCell>{item.lastCount}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusBadgeVariant(item.status)}>{item.status === "OK" ? "جيد" : item.status === "Low Stock" ? "مخزون منخفض" : "نفذ المخزون"}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">لا توجد عناصر مخزون لعرضها حاليًا.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>حركات المخزون الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              {stockMovements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>العنصر</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead className="text-left">الكمية</TableHead>
                      <TableHead>المرجع</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockMovements.map((movement, index) => (
                      <TableRow key={index}>
                        <TableCell>{movement.date}</TableCell>
                        <TableCell className="font-medium">{movement.item}</TableCell>
                        <TableCell>{movement.type}</TableCell>
                        <TableCell className={`text-left ${movement.quantity < 0 ? 'text-red-500' : 'text-green-500'}`}>{movement.quantity}</TableCell>
                        <TableCell>{movement.reference}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">لا توجد حركات مخزون لعرضها حاليًا.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>تنبيهات وإشعارات المخزون</CardTitle>
              <CardDescription>مراقبة مشاكل المخزون الحرجة والحالات غير الطبيعية.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inventoryAlerts.length > 0 ? (
                inventoryAlerts.map((alert) => (
                  <Alert key={alert.id} variant={alert.severity === "info" ? "default" : alert.severity}>
                    {alert.severity === "destructive" && <AlertOctagon className="h-4 w-4 ml-2" />}
                    {alert.severity === "warning" && <FileWarning className="h-4 w-4 ml-2" />}
                    <AlertTitle className="flex justify-between items-center">
                      <span>{alert.type}</span>
                      <span className="text-xs text-muted-foreground">{alert.date}</span>
                    </AlertTitle>
                    <AlertDescription>{alert.message}</AlertDescription>
                  </Alert>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">لا توجد تنبيهات نشطة.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
