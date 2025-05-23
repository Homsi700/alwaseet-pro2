
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanLine, PlusCircle, Trash2, ShoppingCart, DollarSign, XCircle, PackageSearch, Filter, GripVertical, UserCircle, Printer } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { getInventoryItems, getInventoryItemByBarcode, InventoryItem } from "@/lib/services/inventory";
import { createInvoice as createInvoiceService, Invoice, InvoiceStatus } from "@/lib/services/invoicing"; 
import { getContacts, Contact } from "@/lib/services/contacts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface CurrentInvoiceItem extends InventoryItem { 
  quantityInInvoice: number;
}

export default function FastInvoicePage() {
  const [barcodeInputValue, setBarcodeInputValue] = useState<string>("");
  const [currentInvoiceItems, setCurrentInvoiceItems] = useState<CurrentInvoiceItem[]>([]);
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]); 
  const [activeCategory, setActiveCategory] = useState<string>("الكل");
  const [customers, setCustomers] = useState<Contact[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>("walk-in"); 
  const { toast } = useToast();
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const fetchPageData = useCallback(async () => {
    setIsLoadingItems(true);
    try {
      const [itemsData, customersData] = await Promise.all([
        getInventoryItems(),
        getContacts().then(contacts => contacts.filter(c => c.type === "Customer"))
      ]);
      setAvailableItems(itemsData);
      setCustomers(customersData);
    } catch (error) {
      toast({ title: "خطأ في تحميل البيانات", description: "فشل تحميل المنتجات أو العملاء.", variant: "destructive" });
    } finally {
      setIsLoadingItems(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPageData();
    barcodeInputRef.current?.focus();
  }, [fetchPageData]);
  
  const categories = ["الكل", ...new Set(availableItems.map(item => item.category))];

  const addItemToInvoice = useCallback((itemToAdd: InventoryItem, quantity: number = 1) => {
    if (!itemToAdd) return;

    if (itemToAdd.quantity < quantity) {
      toast({ title: "كمية غير كافية", description: `عذراً، الكمية المتوفرة من "${itemToAdd.name}" هي ${itemToAdd.quantity} فقط.`, variant: "destructive"});
      return;
    }

    setCurrentInvoiceItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      if (existingItem) {
        const newQuantityInInvoice = existingItem.quantityInInvoice + quantity;
        if (newQuantityInInvoice <= itemToAdd.quantity) { 
          return prevItems.map(item => 
            item.id === itemToAdd.id ? { ...item, quantityInInvoice: newQuantityInInvoice } : item
          );
        } else {
          toast({ title: "الحد الأقصى للكمية", description: `لا يمكن إضافة المزيد من "${itemToAdd.name}", الكمية المتوفرة ${itemToAdd.quantity}.`, variant: "destructive"});
          return prevItems;
        }
      }
      return [...prevItems, { ...itemToAdd, quantityInInvoice: quantity }];
    });
    toast({title: "تمت الإضافة", description: `أضيف ${itemToAdd.name} إلى الفاتورة.`});
  }, [toast]); 

  const handleItemScannedOrEntered = useCallback(async (barcode: string) => {
    if (!barcode.trim()) {
      return; 
    }
    try {
      const foundItem = await getInventoryItemByBarcode(barcode.trim());
      if (foundItem) {
        addItemToInvoice(foundItem);
        setBarcodeInputValue(""); 
      } else {
        toast({ title: "منتج غير موجود", description: "لم يتم العثور على منتج بهذا الباركود.", variant: "destructive" });
      }
    } catch (error) {
        toast({ title: "خطأ في البحث", description: "حدث خطأ أثناء البحث بالباركود.", variant: "destructive" });
    }
    barcodeInputRef.current?.focus(); 
  }, [toast, addItemToInvoice]); 

  useEffect(() => {
    const currentInput = barcodeInputRef.current;
    const handleAutoAdd = () => {
        if (document.activeElement === currentInput && barcodeInputValue.trim().length >= 8 && barcodeInputValue.trim().length <= 13) { 
            handleItemScannedOrEntered(barcodeInputValue);
        }
    }
    const debouncer = setTimeout(handleAutoAdd, 150); 
    return () => clearTimeout(debouncer);
  }, [barcodeInputValue, handleItemScannedOrEntered]);


  const updateItemQuantityInInvoice = (itemId: string, newQuantity: number) => {
    setCurrentInvoiceItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const originalItemDetails = availableItems.find(i => i.id === itemId); 
          if (originalItemDetails && newQuantity > 0 && newQuantity <= originalItemDetails.quantity) {
            return { ...item, quantityInInvoice: newQuantity };
          } else if (originalItemDetails && newQuantity > originalItemDetails.quantity) {
             toast({ title: "كمية غير كافية", description: `الكمية المتوفرة من "${item.name}" هي ${originalItemDetails.quantity} فقط.`, variant: "destructive"});
             return { ...item, quantityInInvoice: originalItemDetails.quantity }; 
          } else if (newQuantity <= 0) { 
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

  const currentTotal = currentInvoiceItems.reduce((sum, item) => sum + item.sellingPrice * item.quantityInInvoice, 0);
  const taxAmount = currentTotal * 0.15; 
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
    
    let customerName = "عميل نقدي";
    if (selectedCustomerId !== "walk-in") {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (!customer) {
          toast({ title: "خطأ", description: "لم يتم العثور على بيانات العميل المحدد.", variant: "destructive" });
          return;
        }
        customerName = customer.name;
    }

    const invoiceToCreate: Omit<Invoice, 'id' | 'invoiceNumber' | 'status'> = {
      date: new Date().toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit', year: 'numeric' }), 
      customerSupplierId: selectedCustomerId,
      customerSupplierName: customerName,
      type: "Sales",
      paymentMethod: "نقدي", 
      items: currentInvoiceItems.map(ci => ({
        productId: ci.id,
        productName: ci.name,
        quantity: ci.quantityInInvoice,
        unitPrice: ci.sellingPrice,
        taxRate: 0.15, 
        discountRate: 0, 
        totalPrice: ci.sellingPrice * ci.quantityInInvoice * 1.15, 
      })),
      isEInvoice: true, 
      // These are calculated by createInvoiceService now
      amount: 0,
      taxAmount: 0,
      totalAmount: 0,
    };

    try {
      const created = await createInvoiceService(invoiceToCreate);
      toast({ title: "تم إنشاء الفاتورة بنجاح!", description: `رقم الفاتورة: ${created.invoiceNumber}` });
      setCurrentInvoiceItems([]); 
      await fetchPageData(); 

      setTimeout(() => {
         if (window.confirm("هل تريد طباعة الفاتورة؟")) {
            const printWindow = window.open('', '_blank', 'width=300,height=500'); 
            if (printWindow) {
                printWindow.document.write('<html><head><title>فاتورة</title>');
                printWindow.document.write('<style> body { font-family: "Tajawal", Arial, sans-serif; direction: rtl; margin: 5mm; font-size: 10pt; } table { width: 100%; border-collapse: collapse; font-size: 9pt; } th, td { padding: 2px; text-align: right; } .header { text-align: center; margin-bottom: 10px; } .header h2 { margin:0; font-size: 12pt;} .header p {margin: 2px 0; font-size: 8pt;} .total { font-weight: bold; } .item-line td { border-bottom: 1px dashed #ccc; } .totals-section { margin-top: 10px; padding-top: 5px; border-top: 1px solid #000;} </style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write(`<div class="header"><h2>فاتورة ضريبية مبسطة</h2><p>الوسيط برو</p><p>التاريخ: ${created.date}</p><p>رقم الفاتورة: ${created.invoiceNumber}</p><p>العميل: ${customerName}</p></div>`);
                printWindow.document.write('<table><thead><tr><th>الصنف</th><th>كمية</th><th>سعر (ل.س)</th><th>إجمالي (ل.س)</th></tr></thead><tbody>');
                created.items.forEach(item => {
                    printWindow.document.write(`<tr class="item-line"><td>${item.productName}</td><td>${item.quantity}</td><td>${item.unitPrice.toFixed(2)}</td><td>${(item.quantity * item.unitPrice).toFixed(2)}</td></tr>`);
                });
                printWindow.document.write('</tbody></table>');
                printWindow.document.write('<div class="totals-section">');
                printWindow.document.write(`<p class="total">الإجمالي الفرعي: ${created.amount.toFixed(2)} ل.س</p>`);
                printWindow.document.write(`<p class="total">الضريبة (15%): ${created.taxAmount.toFixed(2)} ل.س</p>`);
                printWindow.document.write(`<p class="total" style="font-size: 1.1em;">الإجمالي الكلي: ${created.totalAmount.toFixed(2)} ل.س</p>`);
                printWindow.document.write('</div>');
                printWindow.document.write('<p style="text-align:center; font-size: 8pt; margin-top:15px;">شكراً لتعاملكم معنا!</p>')
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus(); 
                printWindow.print();
            } else {
                toast({title: "خطأ في الطباعة", description: "لم نتمكن من فتح نافذة الطباعة. يرجى التحقق من إعدادات المتصفح."});
            }
        }
      }, 500); 

    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في إنشاء الفاتورة", description: (error as Error).message || "لم نتمكن من حفظ الفاتورة."});
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
                      ref={barcodeInputRef}
                      id="barcode" 
                      placeholder="امسح الباركود هنا..." 
                      value={barcodeInputValue}
                      onChange={(e) => setBarcodeInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleItemScannedOrEntered(barcodeInputValue);
                        }
                      }}
                      className="text-lg py-2.5 flex-grow"
                      autoFocus
                    />
                  </div>
                  <div className="text-center py-6 text-muted-foreground border border-dashed rounded-md h-[140px] flex items-center justify-center">
                      <PackageSearch className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p>سيتم إضافة المنتج للفاتورة مباشرة عند مسح باركود صحيح.</p>
                  </div>
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
                                <p className="text-sm text-primary font-semibold">{item.sellingPrice.toFixed(2)} ل.س</p>
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
                        <SelectItem value="walk-in">عميل نقدي (بدون تسجيل)</SelectItem>
                        {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                                {customer.name} ({customer.phone})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {!selectedCustomerId && currentInvoiceItems.length > 0 && <p className="text-xs text-destructive mt-1">الرجاء تحديد العميل لإتمام الفاتورة.</p>}
            </div>
          </CardHeader>
          <CardContent className="pb-0">
            <ScrollArea className="h-[calc(100vh-500px)] min-h-[150px] pr-3"> 
            <div className="space-y-3">
              {currentInvoiceItems.map(item => (
                <div key={item.id} className="flex items-center p-3 border rounded-md shadow-sm bg-background hover:bg-muted/50">
                  {item.images && item.images[0] && <Image src={item.images[0]} alt={item.name} width={50} height={50} className="rounded-md border object-cover ml-3" data-ai-hint="product thumbnail" />}
                  {(!item.images || item.images.length === 0) && <div className="w-[50px] h-[50px] bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs ml-3">صورة</div>}
                  <div className="flex-grow">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sellingPrice.toFixed(2)} ل.س للقطعة</p>
                    <div className="flex items-center mt-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateItemQuantityInInvoice(item.id, item.quantityInInvoice - 1)}><Trash2 className="h-3 w-3" /></Button>
                        <Input 
                            type="number" 
                            value={item.quantityInInvoice} 
                            onChange={(e) => updateItemQuantityInInvoice(item.id, parseInt(e.target.value) || 0)} 
                            className="h-6 w-12 text-center mx-1 px-0 border-muted-foreground/50"
                            min="0" 
                            max={item.quantity} 
                        />
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateItemQuantityInInvoice(item.id, item.quantityInInvoice + 1)}><PlusCircle className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-base">{(item.sellingPrice * item.quantityInInvoice).toFixed(2)} ل.س</p>
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
                    <span>{currentTotal.toFixed(2)} ل.س</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-sm">
                    <span>الضريبة (15%):</span> 
                    <span>{taxAmount.toFixed(2)} ل.س</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl text-primary">
                    <span>الإجمالي النهائي:</span>
                    <span>{finalTotal.toFixed(2)} ل.س</span>
                </div>
                <Button size="lg" className="w-full text-lg py-3 mt-2" disabled={currentInvoiceItems.length === 0 || !selectedCustomerId} onClick={handleCheckout}>
                  <DollarSign className="ml-2 h-5 w-5" /> إتمام والدفع والطباعة
                </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
}
