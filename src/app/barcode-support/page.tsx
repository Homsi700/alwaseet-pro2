
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Barcode, Search, Package, DollarSign, Info } from "lucide-react";
import Image from "next/image";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getInventoryItemByBarcode, InventoryItem } from "@/lib/services/inventory"; 

export default function BarcodeSupportPage() {
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const handleFetchDetails = useCallback(async () => {
    if (!barcodeInput.trim()) {
      toast({ title: "الرجاء إدخال باركود", description: "حقل الباركود لا يمكن أن يكون فارغًا.", variant: "destructive" });
      setScannedItem(null);
      barcodeInputRef.current?.focus();
      return;
    }
    setIsLoading(true);
    try {
      const item = await getInventoryItemByBarcode(barcodeInput.trim());
      if (item) {
        setScannedItem(item);
        toast({ title: "تم العثور على المنتج", description: `عرض تفاصيل المنتج: ${item.name}` });
      } else {
        setScannedItem(null);
        toast({ title: "لم يتم العثور على المنتج", description: "الباركود المدخل غير مسجل في النظام.", variant: "destructive" });
      }
    } catch (error) {
      setScannedItem(null);
      toast({ title: "خطأ في البحث", description: "حدث خطأ أثناء البحث عن المنتج.", variant: "destructive" });
      console.error("Error fetching item by barcode:", error);
    } finally {
      setIsLoading(false);
      setBarcodeInput(""); // Clear input after search
      barcodeInputRef.current?.focus(); // Re-focus for next scan
    }
  }, [barcodeInput, toast]);
  
  // Automatically trigger search when barcode input length suggests a full scan (e.g., 12-13 digits)
  // Or when Enter key is pressed (handled by onKeyDown in Input)
  useEffect(() => {
    const typicalBarcodeLength = 12; // Common length for EAN-13, UPC-A
    if (barcodeInput.trim().length >= typicalBarcodeLength) {
      // Small delay to ensure the scanner has finished inputting
      const timer = setTimeout(() => {
        if (document.activeElement === barcodeInputRef.current) { // Only if input is still focused
             handleFetchDetails();
        }
      }, 200); // Adjust delay if needed
      return () => clearTimeout(timer);
    }
  }, [barcodeInput, handleFetchDetails]);


  return (
    <>
      <PageHeader
        title="دعم العملاء بالباركود"
        description="امسح باركود المنتج أو أدخله يدويًا لعرض سعره وتفاصيله فورًا."
      />

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-3 shadow-sm">
                <Barcode className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">البحث عن المنتج بالباركود</CardTitle>
            <CardDescription>أدخل باركود المنتج ليتم عرضه فورًا.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product-barcode" className="text-base">باركود المنتج</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  ref={barcodeInputRef}
                  id="product-barcode"
                  placeholder="امسح الباركود هنا..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevent form submission if any
                      handleFetchDetails();
                    }
                  }}
                  className="text-lg py-2.5"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button onClick={handleFetchDetails} className="w-full text-base py-3" disabled={isLoading || !barcodeInput.trim()}>
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري البحث...
                </>
              ) : (
                <>
                  <Search className="ml-2 h-5 w-5" /> عرض تفاصيل المنتج
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full shadow-lg sticky top-20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Package className="ml-2 h-6 w-6 text-primary" />
              تفاصيل المنتج الممسوح
            </CardTitle>
            {!scannedItem && <CardDescription>سيتم عرض تفاصيل المنتج هنا بعد البحث عنه.</CardDescription>}
          </CardHeader>
          <CardContent>
            {scannedItem ? (
              <div className="space-y-4">
                {scannedItem.images && scannedItem.images[0] && (
                  <div className="w-full h-60 relative rounded-lg overflow-hidden shadow-md mb-4 bg-muted">
                    <Image
                      src={scannedItem.images[0]}
                      alt={scannedItem.name}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={`${scannedItem.category || 'product'} item`}
                    />
                  </div>
                )}
                <h3 className="text-2xl font-semibold text-foreground">{scannedItem.name}</h3>
                <p className="text-3xl font-bold text-primary flex items-center">
                  <DollarSign className="ml-2 h-7 w-7" /> {scannedItem.sellingPrice.toFixed(2)} ل.س
                </p>

                <div className="space-y-3 text-base">
                    <div className="flex items-center">
                        <Info className="ml-2 h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">الوصف:</span>
                        <span className="mr-2 text-foreground">{scannedItem.notes || "لا يوجد وصف"}</span>
                    </div>
                    <div className="flex items-center">
                        <Package className="ml-2 h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">الفئة:</span>
                        <span className="mr-2 text-foreground">{scannedItem.category}</span>
                    </div>
                    <div className="flex items-center">
                        <Package className="ml-2 h-5 w-5 text-muted-foreground" />
                         <span className="font-medium text-muted-foreground">التوفر:</span>
                        <span className={`mr-2 font-semibold ${scannedItem.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                          {scannedItem.quantity > 0 ? `متوفر (${scannedItem.quantity} ${scannedItem.unitOfMeasure})` : "نفذ المخزون"}
                        </span>
                    </div>
                </div>
                 <CardFooter className="p-0 pt-4">
                    <Button variant="outline" className="w-full" onClick={() => {
                        if(scannedItem.barcode) {
                            window.open(`/kiosk/price-checker?barcode=${scannedItem.barcode}`, '_blank');
                        } else {
                            toast({title: "خطأ", description: "لا يوجد باركود لهذا المنتج لفتح صفحة الاستعلام.", variant: "destructive"});
                        }
                    }}>
                       <Search className="ml-2 h-4 w-4" /> فتح صفحة المنتج (Kiosk)
                    </Button>
                </CardFooter>

              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg">لم يتم اختيار أي منتج بعد.</p>
                <p className="text-sm">أدخل باركود المنتج أو امسحه ضوئيًا لعرض تفاصيله هنا.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
