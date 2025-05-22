"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Barcode, Search, Package, DollarSign, Info, QrCodeScan } from "lucide-react";
import Image from "next/image";
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ScannedItem {
  id: string;
  name: string;
  price: string;
  description: string;
  stock: string;
  category: string;
  imageUrl?: string; 
}

// Mock database of items
const mockItemDatabase: ScannedItem[] = [
  { id: "123456789012", name: "قهوة فاخرة مختصة", price: "25.50", description: "حبوب بن أرابيكا محمصة بعناية، ذات نكهة غنية ومتوازنة.", stock: "متوفر (15 كيس)", category: "المشروبات", imageUrl: "https://placehold.co/600x400.png?text=قهوة+فاخرة" },
  { id: "987654321098", name: "كوب سيراميك يدوي", price: "45.00", description: "كوب سيراميك مصنوع يدويًا بتصميم فريد وألوان جذابة.", stock: "متوفر (8 قطع)", category: "الأدوات المنزلية", imageUrl: "https://placehold.co/600x400.png?text=كوب+سيراميك" },
  { id: "112233445566", name: "شاحن محمول سريع", price: "120.00", description: "شاحن محمول بسعة كبيرة يدعم الشحن السريع لجميع الأجهزة.", stock: "نفذ المخزون", category: "الإلكترونيات", imageUrl: "https://placehold.co/600x400.png?text=شاحن+محمول" },
];


export default function BarcodeSupportPage() {
  const [scannedItem, setScannedItem] = useState<ScannedItem | null>(null);
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        // console.warn("getUserMedia not supported"); // Potentially inform user through UI if critical
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'خطأ في الوصول للكاميرا',
          description: 'يرجى تمكين صلاحيات الكاميرا في متصفحك لاستخدام ميزة المسح الضوئي.',
        });
      }
    };

    // getCameraPermission(); // Enable this if you want to auto-start camera

    return () => { // Cleanup function
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);


  const handleFetchDetails = () => {
    if (!barcodeInput.trim()) {
      toast({ title: "الرجاء إدخال باركود", description: "حقل الباركود لا يمكن أن يكون فارغًا.", variant: "destructive" });
      setScannedItem(null);
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const item = mockItemDatabase.find(i => i.id === barcodeInput.trim());
      if (item) {
        setScannedItem(item);
        toast({ title: "تم العثور على المنتج", description: `عرض تفاصيل المنتج: ${item.name}` });
      } else {
        setScannedItem(null);
        toast({ title: "لم يتم العثور على المنتج", description: "الباركود المدخل غير مسجل في النظام.", variant: "destructive" });
      }
      setIsLoading(false);
    }, 1000);
  };
  
  const startCameraScan = async () => {
    if (hasCameraPermission === false) {
       toast({ variant: 'destructive', title: 'الكاميرا غير متاحة', description: 'لا يمكن بدء المسح. يرجى التأكد من صلاحيات الكاميرا.'});
       return;
    }
     if (videoRef.current && videoRef.current.srcObject) { // Camera already active
        // Potentially add logic here if you want to restart or re-focus
        toast({ title: "الكاميرا نشطة بالفعل", description: "يمكنك توجيهها نحو الباركود للمسح."});
        return;
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play(); // Ensure video plays
             // TODO: Integrate actual barcode scanning library here
             // For now, we'll simulate a scan after a few seconds
            setTimeout(() => {
                if (videoRef.current && videoRef.current.srcObject) { // Check if still active
                    setBarcodeInput("123456789012"); // Simulate scanning first item
                    handleFetchDetails(); // Fetch details for the simulated scan
                    toast({ title: "تم المسح (محاكاة)", description: "تمت محاكاة مسح باركود."});
                }
            }, 3000);
        }
    } catch (error) {
        console.error('Error starting camera:', error);
        setHasCameraPermission(false);
        toast({ variant: 'destructive', title: 'خطأ في تشغيل الكاميرا', description: 'لم نتمكن من تشغيل الكاميرا. يرجى التحقق من الصلاحيات.'});
    }
  };


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
            <CardDescription>أدخل باركود المنتج أو استخدم الكاميرا لمسحه ضوئيًا.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product-barcode" className="text-base">باركود المنتج</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  id="product-barcode" 
                  placeholder="مثال: 123456789012" 
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchDetails()}
                  className="text-lg py-2.5"
                  disabled={isLoading}
                />
                <Button onClick={startCameraScan} variant="outline" size="icon" title="مسح بالكاميرا" disabled={isLoading || hasCameraPermission === false}>
                    <QrCodeScan className="h-5 w-5" />
                </Button>
              </div>
            </div>
             {/* Video element for camera */}
            <div className="relative">
                 <video ref={videoRef} className={`w-full aspect-video rounded-md bg-muted ${ !(hasCameraPermission && videoRef.current?.srcObject) && 'hidden' }`} autoPlay playsInline muted />
                 { (hasCameraPermission === null && !videoRef.current?.srcObject) && (
                    <div className="w-full aspect-video rounded-md bg-muted flex flex-col items-center justify-center text-muted-foreground">
                        <QrCodeScan className="h-10 w-10 mb-2"/>
                        <p>انقر على زر الكاميرا لبدء المسح</p>
                    </div>
                 )}
                 {hasCameraPermission === false && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertTitle>الكاميرا غير متاحة</AlertTitle>
                      <AlertDescription>
                        يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح لاستخدام ميزة المسح الضوئي.
                      </AlertDescription>
                    </Alert>
                 )}
            </div>

            <Button onClick={handleFetchDetails} className="w-full text-base py-3" disabled={isLoading}>
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

        <Card className="w-full shadow-lg sticky top-20"> {/* Product details card */}
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
                {scannedItem.imageUrl && (
                  <div className="w-full h-60 relative rounded-lg overflow-hidden shadow-md mb-4 bg-muted">
                    <Image 
                      src={scannedItem.imageUrl} 
                      alt={scannedItem.name} 
                      layout="fill" 
                      objectFit="cover"
                      data-ai-hint={`${scannedItem.category} ${scannedItem.name.substring(0,15)}`} 
                    />
                  </div>
                )}
                <h3 className="text-2xl font-semibold text-foreground">{scannedItem.name}</h3>
                <p className="text-3xl font-bold text-primary flex items-center">
                  <DollarSign className="ml-2 h-7 w-7" /> {scannedItem.price} ر.س
                </p>
                
                <div className="space-y-3 text-base">
                    <div className="flex items-center">
                        <Info className="ml-2 h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">الوصف:</span>
                        <span className="mr-2 text-foreground">{scannedItem.description}</span>
                    </div>
                    <div className="flex items-center">
                        <Package className="ml-2 h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">الفئة:</span>
                        <span className="mr-2 text-foreground">{scannedItem.category}</span>
                    </div>
                    <div className="flex items-center">
                        <Package className="ml-2 h-5 w-5 text-muted-foreground" />
                         <span className="font-medium text-muted-foreground">التوفر:</span>
                        <span className={`mr-2 font-semibold ${scannedItem.stock.includes("متوفر") ? "text-green-600" : "text-red-600"}`}>
                          {scannedItem.stock}
                        </span>
                    </div>
                </div>
                 <CardFooter className="p-0 pt-4">
                    <Button variant="outline" className="w-full">
                       <Search className="ml-2 h-4 w-4" /> فتح صفحة المنتج (شبكة محلية)
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
