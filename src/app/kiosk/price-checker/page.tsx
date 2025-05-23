
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Barcode, DollarSign, Package, Search, Briefcase } from "lucide-react";
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
  const [displayMessage, setDisplayMessage] = useState<string>("جاهز لاستقبال باركود المنتج.");

  const handleFetchItemDetails = useCallback(async (barcodeToSearch: string) => {
    if (!barcodeToSearch.trim()) {
      setItemDetails(null);
      // Keep "جاهز لاستقبال باركود المنتج." as the default message if input is cleared manually
      // setDisplayMessage("الرجاء إدخال أو مسح باركود المنتج.");
      return;
    }
    setIsLoading(true);
    setItemDetails(null); 
    setDisplayMessage("جاري البحث عن المنتج...");
    try {
      const item = await getInventoryItemByBarcode(barcodeToSearch.trim());
      if (item) {
        setItemDetails(item);
        setDisplayMessage(""); // Clear message on success
      } else {
        setDisplayMessage(`لم يتم العثور على منتج بالباركود: ${barcodeToSearch}`);
        setTimeout(() => {
            // Only reset message if no item is found and user hasn't scanned something else.
            if (barcodeInputRef.current?.value === "" && !itemDetails) {
                 setDisplayMessage("جاهز لاستقبال باركود المنتج.");
            }
        }, 3000);
      }
    } catch (error) {
      setDisplayMessage("حدث خطأ أثناء البحث. حاول مرة أخرى.");
      setTimeout(() => {
         if (barcodeInputRef.current?.value === "" && !itemDetails) {
            setDisplayMessage("جاهز لاستقبال باركود المنتج.");
         }
      }, 3000);
      console.error("Error fetching item by barcode:", error);
    } finally {
      setIsLoading(false);
      setBarcodeInput(""); 
      // Ensure focus for the next scan
      barcodeInputRef.current?.focus();
    }
  }, [toast, setItemDetails, setDisplayMessage, setIsLoading, setBarcodeInput]);

  useEffect(() => {
    barcodeInputRef.current?.focus();
    const initialBarcode = searchParams.get('barcode');
    if (initialBarcode) {
        // Set the input value for the user to see, then trigger fetch
        setBarcodeInput(initialBarcode); 
        handleFetchItemDetails(initialBarcode);
    }
  }, [searchParams, handleFetchItemDetails]); // handleFetchItemDetails is stable

  useEffect(() => {
    const inputElement = barcodeInputRef.current;
    if (!inputElement) return;

    let debounceTimer: NodeJS.Timeout;

    const handleAutomaticScan = () => {
      const currentValue = inputElement.value;
      // Common barcode lengths. Adjust minLength if needed for very short internal barcodes.
      // Max length can also be adjusted.
      if (currentValue.trim().length >= 8 && currentValue.trim().length <= 14) {
        debounceTimer = setTimeout(() => {
          // Check if input is still focused and value matches
          if (document.activeElement === inputElement && inputElement.value === currentValue) {
            handleFetchItemDetails(currentValue.trim());
          }
        }, 200); // Debounce time in ms (e.g., 150-300ms for scanners)
      }
    };

    // Handles direct input or fast scanner input
    inputElement.addEventListener('input', handleAutomaticScan);

    // Handles scanners that send an "Enter" key after scanning
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && document.activeElement === inputElement) {
        event.preventDefault(); // Prevent any default form submission
        clearTimeout(debounceTimer); // Clear any pending debounce from 'input' event
        handleFetchItemDetails(inputElement.value.trim());
      }
    };
    inputElement.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(debounceTimer); // Clean up timer on component unmount
      inputElement.removeEventListener('input', handleAutomaticScan);
      inputElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleFetchItemDetails]); // Re-run if handleFetchItemDetails changes

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 selection:bg-primary selection:text-primary-foreground" dir="rtl">
        <div className="absolute top-6 left-6 flex items-center gap-2 text-primary">
            <Briefcase className="h-8 w-8" />
            <span className="text-xl font-semibold">الوسيط برو</span>
        </div>

      <Card className="w-full max-w-2xl shadow-2xl overflow-hidden border-2 border-primary/50 bg-card">
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
              onChange={(e) => setBarcodeInput(e.target.value)} // Controlled component
              className="w-full text-xl h-14 pl-12 pr-4 py-3 border-2 border-primary/30 focus:border-primary focus:ring-primary"
              disabled={isLoading}
              autoComplete="off"
              autoFocus
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
          </div>

          <div className="min-h-[250px] flex flex-col items-center justify-center">
            {isLoading && (
              <div className="text-center py-8">
                <svg className="animate-spin mx-auto h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-3 text-lg text-muted-foreground">جاري البحث...</p>
              </div>
            )}

            {!isLoading && itemDetails && (
              <Card className="w-full bg-card border-primary/20 shadow-md animate-in fade-in zoom-in-95">
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
                          {itemDetails.quantity > 0 ? `الكمية المتوفرة: ${itemDetails.quantity} ${itemDetails.unitOfMeasure}` : 'نفذ من المخزون'}
                      </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isLoading && !itemDetails && (
              <div className="text-center py-10 text-muted-foreground">
                  <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-xl">{displayMessage}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
       <p className="mt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} الوسيط برو. جميع الحقوق محفوظة.
      </p>
    </div>
  );
}
