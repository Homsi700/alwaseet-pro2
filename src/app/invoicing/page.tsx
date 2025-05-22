import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Edit, Trash2 } from "lucide-react";

type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Draft";

interface Invoice {
  id: string;
  date: string;
  customerSupplier: string;
  amount: number;
  status: InvoiceStatus;
}

const sampleInvoices: Invoice[] = [
  { id: "INV001", date: "2024-07-01", customerSupplier: "Tech Solutions Inc.", amount: 1500.00, status: "Paid" },
  { id: "INV002", date: "2024-07-05", customerSupplier: "Creative Designs LLC", amount: 850.50, status: "Pending" },
  { id: "INV003", date: "2024-06-15", customerSupplier: "Global Imports Co.", amount: 2200.75, status: "Overdue" },
  { id: "INV004", date: "2024-07-10", customerSupplier: "Local Services Ltd.", amount: 300.00, status: "Draft" },
];

const getStatusVariant = (status: InvoiceStatus) => {
  switch (status) {
    case "Paid": return "default"; // Using primary color for paid
    case "Pending": return "secondary";
    case "Overdue": return "destructive";
    case "Draft": return "outline";
    default: return "outline";
  }
};

const InvoiceTable = ({ invoices, type }: { invoices: Invoice[]; type: string }) => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle>{type} Invoices</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer/Supplier</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>{invoice.date}</TableCell>
              <TableCell>{invoice.customerSupplier}</TableCell>
              <TableCell className="text-right">${invoice.amount.toFixed(2)}</TableCell>
              <TableCell className="text-center">
                <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
              </TableCell>
              <TableCell className="text-center space-x-1">
                <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default function InvoicingPage() {
  return (
    <>
      <PageHeader 
        title="Invoicing Module" 
        description="Manage all your sales, purchase, tax, and return invoices."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Invoice
          </Button>
        }
      />

      <Tabs defaultValue="sales">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <InvoiceTable invoices={sampleInvoices.filter(inv => inv.amount > 500)} type="Sales" />
        </TabsContent>
        <TabsContent value="purchase">
          <InvoiceTable invoices={sampleInvoices.filter(inv => inv.customerSupplier.includes("Import"))} type="Purchase" />
        </TabsContent>
        <TabsContent value="tax">
           <InvoiceTable invoices={sampleInvoices.filter(inv => inv.status === "Paid")} type="Tax" />
        </TabsContent>
        <TabsContent value="returns">
           <InvoiceTable invoices={sampleInvoices.slice(0,1)} type="Return" />
        </TabsContent>
      </Tabs>
    </>
  );
}
