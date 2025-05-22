
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanLine, PlusCircle, Trash2, ShoppingCart, DollarSign, XCircle, PackageSearch, Filter, GripVertical, UserCircle } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { getInventoryItems, getInventoryItemByBarcode, InventoryItem } from "@/lib/services/inventory";
import { createInvoice as createInvoiceService, Invoice, InvoiceItem as InvoiceLineItem } from "@/lib/services/invoicing"; // Renamed to avoid conflict
import { getContacts, Contact } from "@/lib/services/contacts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface CurrentInvoiceItem extends InventoryItem { // Extends InventoryItem to include all its properties
  quantity: number;
}

export default function FastInvoicePage() {
  const [barcodeInputValue, setBarcodeInputValue] = useState<string>("");
  const [scannedItemDetails, setScannedItemDetails] = useState<InventoryItem | null>(null);
  const [currentInvoiceItems, setCurrentInvoiceItems] = useState<CurrentInvoiceItem[]>([]);
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]); 
  const [activeCategory, setActiveCategory] = useState<string>("الكل");
  const [customers, setCustomers] = useState<Contact[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  const fetchPageData = useCallback(async () => {
    setIsLoadingItems(true);
    try {
      const [itemsData, customersData] = await Promise.all([
        getInventoryItems(),
        getContacts().then(contacts => contacts.filter(c => c.type === "Customer"))
      ]);
      setAvailableItems(itemsData);
      setCustomers(customersData);
      if (customersData.length > 0) {
        // Optionally select the first customer by default or a "Walk-in Customer"
        // setSelectedCustomerId(customersData[0].id); 
      }
    } catch (error) {
      toast({ title: "خطأ في تحميل البيانات", description: "فشل تحميل المنتجات أو العملاء.", variant: "destructive" });
    } finally {
      setIsLoadingItems(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);
  
  const categories = ["الكل", ...new Set(availableItems.map(item => item.category))];

  const handleScanOrEnter = useCallback(async () => {
    if (!barcodeInputValue.trim()) {
      toast({ title: "إدخال فارغ", description: "الرجاء إدخال أو مسح باركود المنتج.", variant: "destructive" });
      return;
    }
    try {
      const foundItem = await getInventoryItemByBarcode(barcodeInputValue.trim());
      if (foundItem) {
        setScannedItemDetails(foundItem);
        // Automatically add to invoice if found and in stock
        if (foundItem.quantity > 0) {
            addItemToInvoice(foundItem);
            setScannedItemDetails(null); // Clear after adding
            setBarcodeInputValue(""); // Clear input after adding
        } else {
            toast({ title: "نفذ المخزون", description: `منتج "${foundItem.name}" غير متوفر حالياً.`, variant: "destructive"});
        }
      } else {
        setScannedItemDetails(null);
        toast({ title: "منتج غير موجود", description: "لم يتم العثور على منتج بهذا الباركود.", variant: "destructive" });
      }
    } catch (error) {
        setScannedItemDetails(null);
        toast({ title: "خطأ في البحث", description: "حدث خطأ أثناء البحث بالباركود.", variant: "destructive" });
    }
    // Barcode input is cleared if item is added, otherwise user might want to correct it
  }, [barcodeInputValue, toast, availableItems]); // availableItems might not be needed if getInventoryItemByBarcode is purely API based

  // Auto-scan/add on long enough barcode
  useEffect(() => {
    if (barcodeInputValue.trim().length >= 8) { // Adjust length as needed
      handleScanOrEnter();
    }
  }, [barcodeInputValue, handleScanOrEnter]);


  const addItemToInvoice = (itemToAdd: InventoryItem) => {
    if (!itemToAdd) return;

    if (itemToAdd.quantity <= 0) {
      toast({ title: "نفذ المخزون", description: `عذراً، منتج "${itemToAdd.name}" غير متوفر حالياً.`, variant: "destructive"});
      return;
    }

    setCurrentInvoiceItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      if (existingItem) {
        if (existingItem.quantity < itemToAdd.quantity) { // Check against available stock of the *original* item
          return prevItems.map(item => 
            item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          toast({ title: "الحد الأقصى للكمية", description: `لا يمكن إضافة المزيد من "${itemToAdd.name}", الكمية المتوفرة ${itemToAdd.quantity}.`, variant: "destructive"});
          return prevItems;
        }
      }
      // Add all details of InventoryItem, plus quantity for the invoice
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
    // Do not clear scannedItemDetails or barcodeInputValue here, handleScanOrEnter does it if item is added
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    setCurrentInvoiceItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const originalItem = availableItems.find(i => i.id === itemId); 
          if (originalItem && newQuantity > 0 && newQuantity <= originalItem.quantity) {
            return { ...item, quantity: newQuantity };
          } else if (originalItem && newQuantity > originalItem.quantity) {
             toast({ title: "كمية غير كافية", description: `الكمية المتوفرة من "${item.name}" هي ${originalItem.quantity} فقط.`, variant: "destructive"});
             return { ...item, quantity: originalItem.quantity }; 
          } else if (newQuantity <= 0) { // Allow removing item by setting quantity to 0 or less
            return null; 
          }
        }
        return item;
      }).filter(item => item !== null) as CurrentInvoiceItem[] 
    );
  };

  const removeItemFromInvoice = (itemId: string) => {
    setCurrentInvoiceItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const currentTotal = currentInvoiceItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const taxAmount = currentTotal * 0.15; // Assuming 15% VAT
  const finalTotal = currentTotal + taxAmount;

  const filteredQuickAddItems = activeCategory === "الكل" 
    ? availableItems 
    : availableItems.filter(item => item.category === activeCategory);

  const handleCheckout = async () => {
    if (currentInvoiceItems.length === 0) {
      toast({ title: "الفاتورة فارغة", description: "الرجاء إضافة منتجات أولاً.", variant: "destructive" });
      return;
    }
    if (!selectedCustomerId) {
      toast({ title: "العميل غير محدد", description: "الرجاء اختيار عميل للفاتورة.", variant: "destructive" });
      return;
    }
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
      toast({ title: "خطأ", description: "لم يتم العثور على بيانات العميل.", variant: "destructive" });
      return;
    }

    const invoiceToCreate: Omit<Invoice, 'id' | 'amount' | 'taxAmount' | 'totalAmount' | 'invoiceNumber'> = {
      date: new Date().toLocaleDateString('fr-CA').split('-').reverse().join('/'), // DD/MM/YYYY
      customerSupplierId: customer.id,
      customerSupplierName: customer.name,
      status: "Paid", // Assuming direct payment for fast invoice
      type: "Sales",
      paymentMethod: "نقدي", // Default for fast invoice
      items: currentInvoiceItems.map(ci => ({
        productId: ci.id,
        productName: ci.name,
        quantity: ci.quantity,
        unitPrice: ci.sellingPrice,
        taxRate: 0.15, // Assuming 15% VAT
        totalPrice: ci.sellingPrice * ci.quantity * 1.15, // Placeholder, service should calculate
      })),
      isEInvoice: true, // Default, can be configured
    };

    try {
      const created = await createInvoiceService(invoiceToCreate);
      toast({ title: "تم إنشاء الفاتورة بنجاح!", description: `رقم الفاتورة: ${created.invoiceNumber}` });
      setCurrentInvoiceItems([]); // Clear cart
      // Potentially update stock in availableItems or refetch (complex for mock)
      // For now, user needs to be aware mock stock doesn't auto-update perfectly
      fetchPageData(); // Refetch items to reflect (potentially) updated stock
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في إنشاء الفاتورة", description: "لم نتمكن من حفظ الفاتورة."});
    }
  };


  return (
    <>
      <PageHeader 
        title="نقطة بيع سريعة" 
        description="إنشاء فواتير العملاء بسرعة وكفاءة باستخدام ماسح الباركود أو الإضافة السريعة."
      />

      <div className="grid lg:grid-cols-3 gap-6">
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
                    {/* <Button size="icon" variant="outline" onClick={handleScanOrEnter} title="بحث"><ScanLine className="h-5 w-5"/></Button> */}
                  </div>
                  {scannedItemDetails ? ( // This section might be less useful if auto-adding
                    <Card className="bg-card border p-4 shadow-sm">
                      <div className="flex items-center gap-4">
                          {scannedItemDetails.images && scannedItemDetails.images[0] && <Image src={scannedItemDetails.images[0]} alt={scannedItemDetails.name} width={80} height={80} className="rounded-md border object-cover" data-ai-hint={`${scannedItemDetails.category} product`} />}
                          {(!scannedItemDetails.images || scannedItemDetails.images.length === 0) && <div className="w-[80px] h-[80px] bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs">لا توجد صورة</div>}
                          <div className="flex-grow">
                              <p className="font-semibold text-lg">{scannedItemDetails.name}</p>
                              <p className="text-sm text-primary font-bold">{scannedItemDetails.sellingPrice.toFixed(2)} ر.س</p>
                              <p className={`text-xs ${scannedItemDetails.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                المخزون: {scannedItemDetails.quantity > 0 ? scannedItemDetails.quantity : "نفذ"}
                              </p>
                          </div>
                      </div>
                       {/* Button is removed as item is auto-added if found and in stock */}
                    </Card>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground border border-dashed rounded-md">
                      <PackageSearch className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p>سيتم عرض تفاصيل المنتج الممسوح هنا (أو إضافته للفاتورة مباشرة).</p>
                    </div>
                  )}
                </div>
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
                         {availableItems.length > 0 && categories.length <= 1 && (
                            <p className="text-xs text-muted-foreground">لا توجد فئات متعددة حاليًا.</p>
                        )}
                    </div>
                    <ScrollArea className="h-[250px] pr-3">
                      {isLoadingItems && <p className="text-center py-4">جاري تحميل المنتجات...</p>}
                      {!isLoadingItems && filteredQuickAddItems.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {filteredQuickAddItems.map(item => (
                            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group" onClick={() => addItemToInvoice(item)}>
                              <div className="relative w-full h-24 bg-muted">
                                {item.images && item.images[0] ? 
                                  <Image src={item.images[0]} alt={item.name} layout="fill" objectFit="cover" data-ai-hint={`${item.category} item`} />
                                  : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">لا توجد صورة</div>
                                }
                                {item.quantity <= 0 && <Badge variant="destructive" className="absolute top-1 right-1 text-xs">نفذ</Badge>}
                              </div>
                              <div className="p-2 text-center">
                                <p className="text-sm font-medium truncate" title={item.name}>{item.name}</p>
                                <p className="text-sm text-primary font-semibold">{item.sellingPrice.toFixed(2)} ر.س</p>
                                <Button 
                                  variant="ghost" 
                                  size="xs" 
                                  className="w-full mt-1 text-xs h-7 group-hover:bg-primary group-hover:text-primary-foreground"
                                  disabled={item.quantity <= 0}
                                >
                                  <PlusCircle className="ml-1 h-3 w-3" /> {item.quantity > 0 ? "إضافة" : "نفذ"}
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        !isLoadingItems && <p className="text-muted-foreground text-center py-8">
                            {availableItems.length === 0 ? "لا توجد عناصر متاحة للإضافة السريعة. يرجى إضافة منتجات إلى المخزون أولاً." : "لا توجد عناصر في هذه الفئة."}
                        </p>
                      )}
                    </ScrollArea>
                </div>

              </CardContent>
            </Card>
        </div>

        <Card className="lg:col-span-1 shadow-lg sticky top-20">
          <CardHeader>
            <CardTitle className="flex items-center text-xl justify-between">
              <div className="flex items-center">
                <ShoppingCart className="ml-2 h-6 w-6 text-primary" /> الفاتورة الحالية
              </div>
              <Badge variant={currentInvoiceItems.length > 0 ? "default" : "outline"}>
                {currentInvoiceItems.length} عناصر
              </Badge>
            </CardTitle>
             <div className="pt-2">
                <Label htmlFor="customer-select" className="text-sm">العميل:</Label>
                 <Select dir="rtl" value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger id="customer-select" className="mt-1">
                        <SelectValue placeholder="اختر عميلًا..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="walk-in">عميل نقدي (بدون تسجيل)</SelectItem> {/* Placeholder for walk-in */}
                        {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {!selectedCustomerId && currentInvoiceItems.length > 0 && <p className="text-xs text-destructive mt-1">الرجاء تحديد العميل لإتمام الفاتورة.</p>}
            </div>
          </CardHeader>
          <CardContent className="pb-0">
            <ScrollArea className="h-[calc(100vh-480px)] min-h-[200px] pr-3"> 
            <div className="space-y-3">
              {currentInvoiceItems.map(item => (
                <div key={item.id} className="flex items-center p-3 border rounded-md shadow-sm bg-background hover:bg-muted/50">
                  {item.images && item.images[0] && <Image src={item.images[0]} alt={item.name} width={50} height={50} className="rounded-md border object-cover ml-3" data-ai-hint="product thumbnail" />}
                  {(!item.images || item.images.length === 0) && <div className="w-[50px] h-[50px] bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs ml-3">صورة</div>}
                  <div className="flex-grow">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sellingPrice.toFixed(2)} ر.س للقطعة</p>
                    <div className="flex items-center mt-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateItemQuantity(item.id, item.quantity - 1)}><Trash2 className="h-3 w-3" /></Button>
                        <Input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)} // Allow 0 to remove
                            className="h-6 w-12 text-center mx-1 px-0 border-muted-foreground/50"
                            min="0" 
                            max={availableItems.find(ai => ai.id === item.id)?.quantity || item.quantity} // Max based on original stock
                        />
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateItemQuantity(item.id, item.quantity + 1)}><PlusCircle className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-base">{(item.sellingPrice * item.quantity).toFixed(2)} ر.س</p>
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
          {currentInvoiceItems.length > 0 && (
            <CardFooter className="flex flex-col items-stretch gap-3 pt-4 border-t mt-4">
                <div className="flex justify-between font-semibold text-lg">
                    <span>الإجمالي الفرعي:</span>
                    <span>{currentTotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-sm">
                    <span>الضريبة (15%):</span> 
                    <span>{taxAmount.toFixed(2)} ر.س</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl text-primary">
                    <span>الإجمالي النهائي:</span>
                    <span>{finalTotal.toFixed(2)} ر.س</span>
                </div>
                <Button size="lg" className="w-full text-lg py-3 mt-2" disabled={currentInvoiceItems.length === 0 || !selectedCustomerId} onClick={handleCheckout}>
                <DollarSign className="ml-2 h-5 w-5" /> إتمام والدفع
                </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
}
