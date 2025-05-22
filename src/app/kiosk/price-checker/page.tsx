
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Barcode, DollarSign, Package, Search, ShoppingCart, Briefcase } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { getInventoryItemByBarcode, InventoryItem } from "@/lib/services/inventory";
import { useSearchParams } from 'next/navigation';

export default function KioskPriceCheckerPage() {
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [itemDetails, setItemDetails] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    barcodeInputRef.current?.focus();
    const initialBarcode = searchParams.get('barcode');
    if (initialBarcode) {
        setBarcodeInput(initialBarcode);
        handleFetchItemDetails(initialBarcode);
    }
  }, [searchParams]);

  const handleFetchItemDetails = useCallback(async (barcodeToSearch?: string) => {
    const currentBarcode = barcodeToSearch || barcodeInput.trim();
    if (!currentBarcode) {
      // toast({ title: "فارغ", description: "الرجاء إدخال أو مسح باركود المنتج.", variant: "destructive" });
      setItemDetails(null);
      return;
    }
    setIsLoading(true);
    setItemDetails(null); // Clear previous details
    try {
      const item = await getInventoryItemByBarcode(currentBarcode);
      if (item) {
        setItemDetails(item);
      } else {
        toast({ title: "منتج غير موجود", description: "الباركود المدخل غير مسجل في النظام.", variant: "destructive", duration: 5000 });
      }
    } catch (error) {
      toast({ title: "خطأ في البحث", description: "حدث خطأ أثناء البحث عن المنتج.", variant: "destructive", duration: 5000 });
      console.error("Error fetching item by barcode:", error);
    } finally {
      setIsLoading(false);
      if (!barcodeToSearch) { // Only clear if it was a manual input, not from query param
        setBarcodeInput("");
      }
      barcodeInputRef.current?.focus();
    }
  }, [barcodeInput, toast]);

  // Auto-trigger search on sufficient barcode length for scanners
   useEffect(() => {
    const typicalBarcodeLength = 12; 
    if (barcodeInput.trim().length >= typicalBarcodeLength) {
      const timer = setTimeout(() => {
        if (document.activeElement === barcodeInputRef.current) {
           handleFetchItemDetails();
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [barcodeInput, handleFetchItemDetails]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8 selection:bg-primary selection:text-primary-foreground" dir="rtl">
        <div className="absolute top-6 left-6 flex items-center gap-2 text-primary">
            <Briefcase className="h-8 w-8" />
            <span className="text-xl font-semibold">الوسيط برو</span>
        </div>

      <Card className="w-full max-w-2xl shadow-2xl overflow-hidden border-2 border-primary/50">
        <CardHeader className="text-center bg-muted/30 p-6">
          <Barcode className="h-16 w-16 mx-auto text-primary mb-3" />
          <CardTitle className="text-3xl font-bold">استعلام عن سعر المنتج</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-1">
            امسح باركود المنتج أو أدخله يدويًا لعرض سعره وتفاصيله.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="relative">
            <Input
              ref={barcodeInputRef}
              id="kiosk-barcode-input"
              type="text"
              placeholder="امسح الباركود هنا..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleFetchItemDetails();
                }
              }}
              className="w-full text-xl h-14 pl-12 pr-4 py-3 border-2 border-primary/30 focus:border-primary focus:ring-primary"
              disabled={isLoading}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <svg className="animate-spin mx-auto h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-3 text-lg text-muted-foreground">جاري البحث عن المنتج...</p>
            </div>
          )}

          {!isLoading && itemDetails && (
            <Card className="bg-card border-primary/20 shadow-md">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                {itemDetails.images && itemDetails.images[0] ? (
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                    <Image
                      src={itemDetails.images[0]}
                      alt={itemDetails.name}
                      layout="fill"
                      objectFit="contain"
                       data-ai-hint={`${itemDetails.category || 'product'} item`}
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                    <Package className="h-16 w-16" />
                  </div>
                )}
                <div className="flex-grow text-center sm:text-right">
                  <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{itemDetails.name}</h2>
                  <p className="text-5xl sm:text-6xl font-extrabold text-primary flex items-center justify-center sm:justify-start">
                    <DollarSign className="ml-2 h-10 w-10 sm:h-12 sm:w-12" />
                    {itemDetails.sellingPrice.toFixed(2)}
                    <span className="text-3xl sm:text-4xl font-semibold mr-1">ل.س</span>
                  </p>
                  {itemDetails.notes && <p className="text-base text-muted-foreground mt-3">{itemDetails.notes}</p>}
                   <p className={`text-lg mt-3 font-medium ${itemDetails.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {itemDetails.quantity > 0 ? `متوفر: ${itemDetails.quantity} ${itemDetails.unitOfMeasure}` : 'نفذ من المخزون'}
                    </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !itemDetails && barcodeInput.trim() === "" && (
             <div className="text-center py-10 text-muted-foreground">
                <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-xl">جاهز لاستقبال باركود المنتج.</p>
              </div>
          )}
        </CardContent>
      </Card>
       <p className="mt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} الوسيط برو. جميع الحقوق محفوظة.
      </p>
    </div>
  );
}
