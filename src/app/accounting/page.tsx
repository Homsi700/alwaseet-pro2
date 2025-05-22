import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

const journalEntries = [
  { id: "JE001", date: "2024-07-15", description: "Office Supplies Purchase", debit: 150.00, credit: null, account: "Office Expenses" },
  { id: "JE001", date: "2024-07-15", description: "Office Supplies Purchase", debit: null, credit: 150.00, account: "Cash" },
  { id: "JE002", date: "2024-07-16", description: "Sales Revenue - Client A", debit: 2500.00, credit: null, account: "Accounts Receivable" },
  { id: "JE002", date: "2024-07-16", description: "Sales Revenue - Client A", debit: null, credit: 2500.00, account: "Sales Revenue" },
];

const chartOfAccountsData = [
  { code: "1010", name: "Cash", type: "Asset", balance: 15000.00 },
  { code: "1200", name: "Accounts Receivable", type: "Asset", balance: 7500.00 },
  { code: "2010", name: "Accounts Payable", type: "Liability", balance: 3200.00 },
  { code: "3010", name: "Owner's Equity", type: "Equity", balance: 50000.00 },
  { code: "4010", name: "Sales Revenue", type: "Revenue", balance: 120000.00 },
  { code: "5010", name: "Office Expenses", type: "Expense", balance: 8000.00 },
];

export default function AccountingPage() {
  return (
    <>
      <PageHeader 
        title="Accounting System" 
        description="Manage daily journal entries and your chart of accounts."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Entry
          </Button>
        }
      />

      <Tabs defaultValue="journal">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="journal">Daily Journal</TabsTrigger>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
        </TabsList>
        <TabsContent value="journal">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Daily Journal Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journalEntries.map((entry, index) => (
                    <TableRow key={`${entry.id}-${index}`}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{entry.account}</TableCell>
                      <TableCell className="text-right">{entry.debit ? `$${entry.debit.toFixed(2)}` : "-"}</TableCell>
                      <TableCell className="text-right">{entry.credit ? `$${entry.credit.toFixed(2)}` : "-"}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" className="mr-1">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="accounts">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Chart of Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                     <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartOfAccountsData.map((account) => (
                    <TableRow key={account.code}>
                      <TableCell>{account.code}</TableCell>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>{account.type}</TableCell>
                      <TableCell className="text-right">${account.balance.toFixed(2)}</TableCell>
                       <TableCell className="text-center">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
