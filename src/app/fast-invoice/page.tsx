"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanLine, PlusCircle, Trash2, ShoppingCart, DollarSign } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useState } from 'react';

interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string; // Image is optional
  stock: number;
}

interface InvoiceItem extends Item {
  quantity: number;
}

export default function FastInvoicePage() {
  const [barcodeInputValue, setBarcodeInputValue] = useState<string>("");
  const [scannedItem, setScannedItem] = useState<Item | null>(null);
  const [currentInvoiceItems, setCurrentInvoiceItems] = useState<InvoiceItem[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]); // For Quick Add Items
  
  // TODO: Fetch availableItems from API

  const handleScanOrEnter = () => {
    // TODO: Implement logic to find item by barcodeInputValue from availableItems or API
    // For now, this is a placeholder.
    const foundItem = availableItems.find(item => item.id === barcodeInputValue); // Example find
    setScannedItem(foundItem || null);
  };

  const addItemToInvoice = () => {
    if (scannedItem) {
      setCurrentInvoiceItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === scannedItem.id);
        if (existingItem) {
          return prevItems.map(item => 
            item.id === scannedItem.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevItems, { ...scannedItem, quantity: 1 }];
      });
      setScannedItem(null); // Clear scanned item after adding
      setBarcodeInputValue(""); // Clear barcode input
    }
  };

  const removeItemFromInvoice = (itemId: string) => {
    setCurrentInvoiceItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const currentTotal = currentInvoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <PageHeader 
        title="فاتورة سريعة" 
        description="إنشاء الفواتير بسرعة باستخدام مسح الباركود."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Panel: Barcode Scan & Item Display */}
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ScanLine className="ml-2 h-5 w-5" /> ماسح الباركود
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="barcode">مسح أو إدخال الباركود</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  id="barcode" 
                  placeholder="مثال: 123456789012" 
                  value={barcodeInputValue}
                  onChange={(e) => setBarcodeInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScanOrEnter()}
                />
                <Button size="icon" onClick={handleScanOrEnter}><ScanLine className="h-4 w-4"/></Button>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">العنصر الممسوح:</h3>
              {scannedItem ? (
                <Card className="bg-secondary p-4">
                  <div className="flex items-center gap-4">
                      {scannedItem.image && <Image src={scannedItem.image} alt={scannedItem.name} width={80} height={80} className="rounded-md"/>}
                      {!scannedItem.image && <div className="w-[80px] h-[80px] bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs">لا توجد صورة</div>}
                      <div>
                          <p className="font-medium">{scannedItem.name}</p>
                          <p className="text-sm text-primary font-semibold">{scannedItem.price.toFixed(2)} ر.س</p>
                          <p className="text-xs text-muted-foreground">المخزون: {scannedItem.stock}</p>
                      </div>
                  </div>
                  <Button className="w-full mt-3" onClick={addItemToInvoice} disabled={scannedItem.stock <= 0}>
                    <PlusCircle className="ml-2 h-4 w-4" /> {scannedItem.stock > 0 ? "إضافة للفاتورة" : "نفذ المخزون"}
                  </Button>
                </Card>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>لم يتم مسح أي عنصر بعد.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Middle Panel: Current Invoice */}
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="ml-2 h-5 w-5" /> الفاتورة الحالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pl-3">
            <div className="space-y-3">
              {currentInvoiceItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 border rounded-md">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">الكمية: {item.quantity} @ {item.price.toFixed(2)} ر.س</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} ر.س</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeItemFromInvoice(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
               {currentInvoiceItems.length === 0 && <p className="text-muted-foreground text-center py-4">لا توجد عناصر في الفاتورة بعد.</p>}
            </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-2 pt-4 border-t">
             <div className="flex justify-between font-semibold text-lg">
                <span>الإجمالي:</span>
                <span>{currentTotal.toFixed(2)} ر.س</span>
            </div>
            <Button size="lg" className="w-full" disabled={currentInvoiceItems.length === 0}>
              <DollarSign className="ml-2 h-5 w-5" /> إتمام والدفع
            </Button>
          </CardFooter>
        </Card>

        {/* Right Panel: Item Multi-View */}
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>إضافة سريعة للعناصر</CardTitle>
            <CardDescription>تصفح وأضف العناصر بسرعة.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Button variant="outline" size="sm">الكل</Button>
              {/* TODO: Populate categories dynamically */}
              <Button variant="ghost" size="sm">إلكترونيات</Button>
              <Button variant="ghost" size="sm">إكسسوارات</Button>
            </div>
            <ScrollArea className="h-[340px] pl-3">
              {availableItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {availableItems.map(item => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      {item.image ? 
                        <Image src={item.image} alt={item.name} width={100} height={100} className="w-full h-20 object-cover"/>
                        : <div className="w-full h-20 bg-muted flex items-center justify-center text-muted-foreground text-xs">لا توجد صورة</div>
                      }
                      <div className="p-2">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-xs text-primary font-semibold">{item.price.toFixed(2)} ر.س</p>
                        <Button 
                          variant="outline" 
                          size="xs" 
                          className="w-full mt-1 text-xs h-6" 
                          onClick={() => {
                            setScannedItem(item); // Set as scanned to add via main panel logic
                            addItemToInvoice(); // Or directly add logic here
                          }}
                          disabled={item.stock <= 0}
                        >
                          <PlusCircle className="ml-1 h-3 w-3" /> {item.stock > 0 ? "إضافة" : "نفذ"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">لا توجد عناصر متاحة للإضافة السريعة.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
