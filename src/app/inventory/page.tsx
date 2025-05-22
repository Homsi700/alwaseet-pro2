import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, PackageSearch, AlertOctagon, Edit, History, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const inventoryItems = [
  { id: "ITEM001", name: "Wireless Mouse", category: "Electronics", quantity: 50, lastCount: "2024-07-01", status: "OK" },
  { id: "ITEM002", name: "USB-C Cable", category: "Accessories", quantity: 8, lastCount: "2024-07-01", status: "Low Stock" },
  { id: "ITEM003", name: "Coffee Mug", category: "Kitchenware", quantity: 80, lastCount: "2024-07-01", status: "OK" },
  { id: "ITEM004", name: "Notebook", category: "Stationery", quantity: 200, lastCount: "2024-07-01", status: "OK" },
  { id: "ITEM005", name: "Bluetooth Speaker", category: "Electronics", quantity: 0, lastCount: "2024-07-01", status: "Out of Stock" },
];

const stockMovements = [
  { date: "2024-07-10", item: "Wireless Mouse", type: "Sale (INV001)", quantity: -5, reference: "INV001" },
  { date: "2024-07-09", item: "USB-C Cable", type: "Purchase (PO005)", quantity: 50, reference: "PO005" },
  { date: "2024-07-08", item: "Notebook", type: "Adjustment (Damage)", quantity: -2, reference: "ADJ002" },
];

const inventoryAlerts = [
  { id: "ALERT001", type: "Low Stock", message: "Item 'USB-C Cable' (ITEM002) quantity is low (8 units).", severity: "warning" as const, date: "2024-07-15" },
  { id: "ALERT002", type: "Out of Stock", message: "Item 'Bluetooth Speaker' (ITEM005) is out of stock.", severity: "destructive" as const, date: "2024-07-14" },
  { id: "ALERT003", type: "Anomaly", message: "Unusual stock movement for 'Coffee Mug' (ITEM003). Review recent transactions.", severity: "info" as const, date: "2024-07-13" },
];

const getStatusBadgeVariant = (status: string) => {
  if (status === "Low Stock") return "destructive"; // Use destructive for more visibility
  if (status === "Out of Stock") return "destructive";
  return "default"; // Using primary for "OK"
}


export default function InventoryPage() {
  return (
    <>
      <PageHeader 
        title="Inventory Management" 
        description="Track inventory counts, stock movements, and manage alerts."
        actions={
          <Button>
            <PackageSearch className="mr-2 h-4 w-4" /> Start New Count
          </Button>
        }
      />

      <Tabs defaultValue="count">
        <TabsList className="grid w-full grid-cols-3 md:w-[500px]">
          <TabsTrigger value="count">Inventory Count</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="count">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Current Stock Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Last Count</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell>{item.lastCount}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.map((movement, index) => (
                    <TableRow key={index}>
                      <TableCell>{movement.date}</TableCell>
                      <TableCell className="font-medium">{movement.item}</TableCell>
                      <TableCell>{movement.type}</TableCell>
                      <TableCell className={`text-right ${movement.quantity < 0 ? 'text-red-600' : 'text-green-600'}`}>{movement.quantity}</TableCell>
                      <TableCell>{movement.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Inventory Alerts & Notifications</CardTitle>
              <CardDescription>Monitor critical stock issues and anomalies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inventoryAlerts.map((alert) => (
                <Alert key={alert.id} variant={alert.severity === "info" ? "default" : alert.severity}>
                  {alert.severity === "destructive" && <AlertOctagon className="h-4 w-4" />}
                  {alert.severity === "warning" && <FileWarning className="h-4 w-4" />}
                  <AlertTitle className="flex justify-between items-center">
                    <span>{alert.type}</span>
                    <span className="text-xs text-muted-foreground">{alert.date}</span>
                  </AlertTitle>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
              {inventoryAlerts.length === 0 && <p className="text-muted-foreground text-center py-4">No active alerts.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
