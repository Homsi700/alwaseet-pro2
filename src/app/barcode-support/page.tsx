"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Barcode, Search } from "lucide-react";
import Image from "next/image";
import React, { useState } from 'react';

interface ScannedItem {
  name: string;
  price: string;
  description: string;
  stock: string;
  image?: string; // Image is optional now
}

export default function BarcodeSupportPage() {
  const [scannedItem, setScannedItem] = useState<ScannedItem | null>(null);
  const [barcodeInput, setBarcodeInput] = useState<string>("");

  const handleFetchDetails = () => {
    // TODO: Implement actual barcode fetching logic
    // For now, simulate fetching or set to null if input is empty
    if (barcodeInput) {
      // Example: setScannedItem({ name: "منتج افتراضي", price: "99.99", description: "وصف المنتج هنا.", stock: "متوفر (10 قطع)" });
      console.log("Fetching details for barcode:", barcodeInput);
      setScannedItem(null); // Reset or fetch actual data
    } else {
      setScannedItem(null);
    }
  };

  return (
    <>
      <PageHeader 
        title="دعم العملاء بالباركود" 
        description="امسح باركود المنتج لعرض سعره وتفاصيله فورًا."
      />

      <div className="flex justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                <Barcode className="h-10 w-10 text-primary" />
            </div>
            <CardTitle>البحث عن المنتج</CardTitle>
            <CardDescription>أدخل أو امسح باركود المنتج أدناه.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="product-barcode">باركود المنتج</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  id="product-barcode" 
                  placeholder="مثال: 987654321098" 
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                />
                <Button onClick={handleFetchDetails}>
                  <Search className="ml-2 h-4 w-4" /> عرض التفاصيل
                </Button>
              </div>
            </div>
            
            {scannedItem ? (
              <Card className="bg-secondary p-4">
                {scannedItem.image && (
                  <CardHeader className="p-0 mb-3">
                      <Image src={scannedItem.image} alt={scannedItem.name} width={300} height={300} className="w-full h-auto rounded-md object-cover aspect-square"/>
                  </CardHeader>
                )}
                <CardContent className="p-0 space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">{scannedItem.name}</h3>
                    <p className="text-2xl font-bold text-primary">{scannedItem.price} ر.س</p>
                    <p className="text-sm text-muted-foreground">{scannedItem.description}</p>
                    <p className="text-sm">
                        <span className="font-medium">التوفر: </span> 
                        <span className={scannedItem.stock.includes("متوفر") ? "text-green-500" : "text-red-500"}>{scannedItem.stock}</span>
                    </p>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>سيتم عرض تفاصيل المنتج هنا بعد إدخال أو مسح الباركود.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
