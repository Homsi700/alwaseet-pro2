import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanLine, PlusCircle, Trash2, ShoppingCart, DollarSign } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const sampleItems = [
  { id: "ITEM001", name: "Wireless Mouse", price: 25.99, category: "Electronics", image: "https://placehold.co/100x100.png", stock: 50, dataAiHint: "computer mouse" },
  { id: "ITEM002", name: "USB-C Cable", price: 12.50, category: "Accessories", image: "https://placehold.co/100x100.png", stock: 120, dataAiHint: "usb cable" },
  { id: "ITEM003", name: "Coffee Mug", price: 8.99, category: "Kitchenware", image: "https://placehold.co/100x100.png", stock: 80, dataAiHint: "coffee mug" },
  { id: "ITEM004", name: "Notebook", price: 4.75, category: "Stationery", image: "https://placehold.co/100x100.png", stock: 200, dataAiHint: "notebook paper" },
];

// Mock state for current invoice items - in a real app this would be useState
const currentInvoiceItems = [
  { ...sampleItems[0], quantity: 2 },
  { ...sampleItems[1], quantity: 1 },
];
const currentTotal = currentInvoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0);


export default function FastInvoicePage() {
  return (
    <>
      <PageHeader 
        title="Fast Invoice" 
        description="Quickly create invoices using barcode scanning."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Panel: Barcode Scan & Item Display */}
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ScanLine className="mr-2 h-5 w-5" /> Barcode Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="barcode">Scan or Enter Barcode</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input id="barcode" placeholder="e.g., 123456789012" />
                <Button size="icon"><ScanLine className="h-4 w-4"/></Button>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Scanned Item:</h3>
              <Card className="bg-secondary p-4">
                <div className="flex items-center gap-4">
                    <Image src="https://placehold.co/80x80.png" alt="Product Image" width={80} height={80} className="rounded-md" data-ai-hint="product package"/>
                    <div>
                        <p className="font-medium">Wireless Mouse</p>
                        <p className="text-sm text-primary font-semibold">$25.99</p>
                        <p className="text-xs text-muted-foreground">Stock: 50</p>
                    </div>
                </div>
                <Button className="w-full mt-3">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add to Invoice
                </Button>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Middle Panel: Current Invoice */}
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" /> Current Invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-3">
            <div className="space-y-3">
              {currentInvoiceItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 border rounded-md">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity} @ ${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
               {currentInvoiceItems.length === 0 && <p className="text-muted-foreground text-center py-4">No items in invoice yet.</p>}
            </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-2 pt-4 border-t">
             <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>${currentTotal.toFixed(2)}</span>
            </div>
            <Button size="lg" className="w-full">
              <DollarSign className="mr-2 h-5 w-5" /> Finalize & Pay
            </Button>
          </CardFooter>
        </Card>

        {/* Right Panel: Item Multi-View */}
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Add Items</CardTitle>
            <CardDescription>Browse and add items quickly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="ghost" size="sm">Electronics</Button>
              <Button variant="ghost" size="sm">Accessories</Button>
            </div>
            <ScrollArea className="h-[340px] pr-3">
              <div className="grid grid-cols-2 gap-3">
                {sampleItems.map(item => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <Image src={item.image} alt={item.name} width={100} height={100} className="w-full h-20 object-cover" data-ai-hint={item.dataAiHint} />
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-xs text-primary font-semibold">${item.price.toFixed(2)}</p>
                      <Button variant="outline" size="xs" className="w-full mt-1 text-xs h-6">
                        <PlusCircle className="mr-1 h-3 w-3" /> Add
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
