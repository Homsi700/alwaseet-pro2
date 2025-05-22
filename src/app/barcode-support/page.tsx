import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Barcode, Search } from "lucide-react";
import Image from "next/image";

export default function BarcodeSupportPage() {
  // Placeholder for scanned item details
  const scannedItem = {
    name: "Premium Bluetooth Speaker",
    price: "79.99",
    description: "High-fidelity sound with 12-hour battery life. Water-resistant IPX7.",
    stock: "In Stock (23 units)",
    image: "https://placehold.co/300x300.png",
    dataAiHint: "bluetooth speaker"
  };

  return (
    <>
      <PageHeader 
        title="Barcode Customer Support" 
        description="Scan a product barcode to instantly display its price and details."
      />

      <div className="flex justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                <Barcode className="h-10 w-10 text-primary" />
            </div>
            <CardTitle>Product Lookup</CardTitle>
            <CardDescription>Enter or scan the product barcode below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="product-barcode">Product Barcode</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input id="product-barcode" placeholder="e.g., 987654321098" />
                <Button>
                  <Search className="mr-2 h-4 w-4" /> Get Details
                </Button>
              </div>
            </div>
            
            {/* Display area for item details - shown after a "scan" */}
            {scannedItem && (
              <Card className="bg-secondary p-4">
                <CardHeader className="p-0 mb-3">
                    <Image src={scannedItem.image} alt={scannedItem.name} width={300} height={300} className="w-full h-auto rounded-md object-cover aspect-square" data-ai-hint={scannedItem.dataAiHint}/>
                </CardHeader>
                <CardContent className="p-0 space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">{scannedItem.name}</h3>
                    <p className="text-2xl font-bold text-primary">${scannedItem.price}</p>
                    <p className="text-sm text-muted-foreground">{scannedItem.description}</p>
                    <p className="text-sm">
                        <span className="font-medium">Availability: </span> 
                        <span className={scannedItem.stock.includes("In Stock") ? "text-green-600" : "text-red-600"}>{scannedItem.stock}</span>
                    </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
