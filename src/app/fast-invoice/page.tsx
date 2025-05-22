"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanLine, PlusCircle, Trash2, ShoppingCart, DollarSign, XCircle, PackageSearch, Filter, GripVertical } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string; 
  stock: number;
  barcode: string;
}

interface InvoiceItem extends Item {
  quantity: number;
}

// Mock data for available items
const mockAvailableItems: Item[] = [
  { id: "item001", name: "تيشيرت قطني فاخر", price: 75.00, category: "ملابس", stock: 50, barcode: "628110123456", imageUrl: "https://placehold.co/300x300.png?text=تيشيرت" },
  { id: "item002", name: "بنطلون جينز عصري", price: 120.50, category: "ملابس", stock: 30, barcode: "628110789012", imageUrl: "https://placehold.co/300x300.png?text=بنطلون+جينز" },
  { id: "item003", name: "سماعات لاسلكية بلوتوث", price: 250.00, category: "إلكترونيات", stock: 20, barcode: "628110345678", imageUrl: "https://placehold.co/300x300.png?text=سماعات" },
  { id: "item004", name: "كتاب تطوير الذات", price: 45.00, category: "كتب", stock: 100, barcode: "978603507281", imageUrl: "https://placehold.co/300x300.png?text=كتاب" },
  { id: "item005", name: "قهوة مختصة (250 جرام)", price: 60.00, category: "بقالة", stock: 0, barcode: "628110901234", imageUrl: "https://placehold.co/300x300.png?text=قهوة" },
];

export default function FastInvoicePage() {
  const [barcodeInputValue, setBarcodeInputValue] = useState<string>("");
  const [scannedItem, setScannedItem] = useState<Item | null>(null);
  const [currentInvoiceItems, setCurrentInvoiceItems] = useState<InvoiceItem[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>(mockAvailableItems); 
  const [activeCategory, setActiveCategory] = useState<string>("الكل");
  const { toast } = useToast();

  const categories = ["الكل", ...new Set(availableItems.map(item => item.category))];

  const handleScanOrEnter = useCallback(() => {
    if (!barcodeInputValue.trim()) {
      toast({ title: "إدخال فارغ", description: "الرجاء إدخال أو مسح باركود المنتج.", variant: "destructive" });
      return;
    }
    const foundItem = availableItems.find(item => item.barcode === barcodeInputValue.trim());
    if (foundItem) {
      setScannedItem(foundItem);
      toast({ title: "تم العثور على المنتج", description: `المنتج: ${foundItem.name}` });
    } else {
      setScannedItem(null);
      toast({ title: "منتج غير موجود", description: "لم يتم العثور على منتج بهذا الباركود.", variant: "destructive" });
    }
  }, [barcodeInputValue, availableItems, toast]);

  useEffect(() => {
    // Automatically trigger search if barcode input changes and has a reasonable length (e.g. EAN-13)
    if (barcodeInputValue.trim().length >= 8) { // Common barcode lengths
      handleScanOrEnter();
    }
  }, [barcodeInputValue, handleScanOrEnter]);


  const addItemToInvoice = (itemToAdd: Item | null = scannedItem) => {
    if (!itemToAdd) return;

    if (itemToAdd.stock <= 0) {
      toast({ title: "نفذ المخزون", description: `عذراً، منتج "${itemToAdd.name}" غير متوفر حالياً.`, variant: "destructive"});
      return;
    }

    setCurrentInvoiceItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      if (existingItem) {
        if (existingItem.quantity < itemToAdd.stock) {
          return prevItems.map(item => 
            item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          toast({ title: "الحد الأقصى للكمية", description: `لا يمكن إضافة المزيد من "${itemToAdd.name}", الكمية المتوفرة ${itemToAdd.stock}.`, variant: "destructive"});
          return prevItems;
        }
      }
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
    setScannedItem(null); 
    setBarcodeInputValue(""); 
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    setCurrentInvoiceItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const targetItem = availableItems.find(i => i.id === itemId);
          if (targetItem && newQuantity > 0 && newQuantity <= targetItem.stock) {
            return { ...item, quantity: newQuantity };
          } else if (targetItem && newQuantity > targetItem.stock) {
             toast({ title: "كمية غير كافية", description: `الكمية المتوفرة من "${item.name}" هي ${targetItem.stock} فقط.`, variant: "destructive"});
             return { ...item, quantity: targetItem.stock }; // Set to max available
          } else if (newQuantity <= 0) {
            return null; // Mark for removal
          }
        }
        return item;
      }).filter(item => item !== null) as InvoiceItem[] // Remove items marked for removal
    );
  };

  const removeItemFromInvoice = (itemId: string) => {
    setCurrentInvoiceItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const currentTotal = currentInvoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredQuickAddItems = activeCategory === "الكل" 
    ? availableItems 
    : availableItems.filter(item => item.category === activeCategory);

  return (
    <>
      <PageHeader 
        title="نقطة بيع سريعة" 
        description="إنشاء فواتير العملاء بسرعة وكفاءة باستخدام ماسح الباركود أو الإضافة السريعة."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel: Barcode Scan & Quick Add */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <ScanLine className="ml-2 h-6 w-6 text-primary" /> مسح الباركود أو الإدخال اليدوي
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-3">
                  <Label htmlFor="barcode" className="text-base">امسح أو أدخل باركود المنتج:</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="barcode" 
                      placeholder="مثال: 628110123456" 
                      value={barcodeInputValue}
                      onChange={(e) => setBarcodeInputValue(e.target.value)}
                      className="text-lg py-2.5 flex-grow"
                    />
                    <Button size="icon" variant="outline" onClick={handleScanOrEnter} title="بحث"><ScanLine className="h-5 w-5"/></Button>
                  </div>
                  {scannedItem ? (
                    <Card className="bg-card border p-4 shadow-sm">
                      <div className="flex items-center gap-4">
                          {scannedItem.imageUrl && <Image src={scannedItem.imageUrl} alt={scannedItem.name} width={80} height={80} className="rounded-md border object-cover" data-ai-hint={`${scannedItem.category} product`} />}
                          {!scannedItem.imageUrl && <div className="w-[80px] h-[80px] bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs">لا توجد صورة</div>}
                          <div className="flex-grow">
                              <p className="font-semibold text-lg">{scannedItem.name}</p>
                              <p className="text-sm text-primary font-bold">{scannedItem.price.toFixed(2)} ر.س</p>
                              <p className={`text-xs ${scannedItem.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                المخزون: {scannedItem.stock > 0 ? scannedItem.stock : "نفذ"}
                              </p>
                          </div>
                      </div>
                      <Button className="w-full mt-3 text-base" onClick={() => addItemToInvoice(scannedItem)} disabled={scannedItem.stock <= 0}>
                        <PlusCircle className="ml-2 h-5 w-5" /> {scannedItem.stock > 0 ? "إضافة للفاتورة" : "نفذ المخزون"}
                      </Button>
                    </Card>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground border border-dashed rounded-md">
                      <PackageSearch className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p>سيتم عرض تفاصيل المنتج الممسوح هنا.</p>
                    </div>
                  )}
                </div>
                {/* Quick Add Items */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center"><GripVertical className="ml-2 h-5 w-5 text-primary" />إضافة سريعة للعناصر</h3>
                     <div className="flex flex-wrap gap-2 pb-2 border-b">
                        {categories.map(category => (
                            <Button 
                                key={category} 
                                variant={activeCategory === category ? "default" : "outline"} 
                                size="sm"
                                onClick={() => setActiveCategory(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                    <ScrollArea className="h-[250px] pr-3">
                      {filteredQuickAddItems.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {filteredQuickAddItems.map(item => (
                            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group" onClick={() => addItemToInvoice(item)}>
                              <div className="relative w-full h-24 bg-muted">
                                {item.imageUrl ? 
                                  <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" data-ai-hint={`${item.category} item`} />
                                  : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">لا توجد صورة</div>
                                }
                                {item.stock <= 0 && <Badge variant="destructive" className="absolute top-1 right-1 text-xs">نفذ</Badge>}
                              </div>
                              <div className="p-2 text-center">
                                <p className="text-sm font-medium truncate" title={item.name}>{item.name}</p>
                                <p className="text-sm text-primary font-semibold">{item.price.toFixed(2)} ر.س</p>
                                <Button 
                                  variant="ghost" 
                                  size="xs" 
                                  className="w-full mt-1 text-xs h-7 group-hover:bg-primary group-hover:text-primary-foreground"
                                  disabled={item.stock <= 0}
                                >
                                  <PlusCircle className="ml-1 h-3 w-3" /> إضافة
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">لا توجد عناصر في هذه الفئة.</p>
                      )}
                    </ScrollArea>
                </div>

              </CardContent>
            </Card>
        </div>

        {/* Right Panel: Current Invoice */}
        <Card className="lg:col-span-1 shadow-lg sticky top-20">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ShoppingCart className="ml-2 h-6 w-6 text-primary" /> الفاتورة الحالية
            </CardTitle>
            <CardDescription>إجمالي ({currentInvoiceItems.length}) عناصر</CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <ScrollArea className="h-[calc(100vh-380px)] min-h-[250px] pr-3"> {/* Adjusted height */}
            <div className="space-y-3">
              {currentInvoiceItems.map(item => (
                <div key={item.id} className="flex items-center p-3 border rounded-md shadow-sm bg-background hover:bg-muted/50">
                  {item.imageUrl && <Image src={item.imageUrl} alt={item.name} width={50} height={50} className="rounded-md border object-cover ml-3" data-ai-hint="product thumbnail" />}
                  {!item.imageUrl && <div className="w-[50px] h-[50px] bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs ml-3">صورة</div>}
                  <div className="flex-grow">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.price.toFixed(2)} ر.س للقطعة</p>
                    <div className="flex items-center mt-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateItemQuantity(item.id, item.quantity - 1)}><Trash2 className="h-3 w-3" /></Button>
                        <Input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="h-6 w-12 text-center mx-1 px-0 border-muted-foreground/50"
                            min="1"
                            max={item.stock}
                        />
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateItemQuantity(item.id, item.quantity + 1)}><PlusCircle className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-base">{(item.price * item.quantity).toFixed(2)} ر.س</p>
                     <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive mt-1" onClick={() => removeItemFromInvoice(item.id)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
               {currentInvoiceItems.length === 0 && 
                <div className="text-center py-10 text-muted-foreground border border-dashed rounded-md">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-lg">سلة المشتريات فارغة.</p>
                    <p className="text-sm">أضف منتجات لبدء عملية البيع.</p>
                </div>
                }
            </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-3 pt-4 border-t mt-4">
             <div className="flex justify-between font-semibold text-lg">
                <span>الإجمالي الفرعي:</span>
                <span>{currentTotal.toFixed(2)} ر.س</span>
            </div>
             <div className="flex justify-between text-muted-foreground text-sm">
                <span>الضريبة (15%):</span> {/* Placeholder for tax logic */}
                <span>{(currentTotal * 0.15).toFixed(2)} ر.س</span>
            </div>
             <Separator />
             <div className="flex justify-between font-bold text-xl text-primary">
                <span>الإجمالي النهائي:</span>
                <span>{(currentTotal * 1.15).toFixed(2)} ر.س</span>
            </div>
            <Button size="lg" className="w-full text-lg py-3 mt-2" disabled={currentInvoiceItems.length === 0}>
              <DollarSign className="ml-2 h-5 w-5" /> إتمام والدفع
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
