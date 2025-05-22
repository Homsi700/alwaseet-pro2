import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Edit, Trash2, Mail, Phone, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  avatarFallback: string;
  email: string;
  phone: string;
  type: "Customer" | "Supplier";
  balance: number;
  lastActivity: string;
  dataAiHint?: string;
}

const contactsData: Contact[] = [
  { id: "CUST001", name: "Alice Wonderland", avatar: "https://placehold.co/40x40.png", dataAiHint: "woman face", avatarFallback: "AW", email: "alice@example.com", phone: "(555) 123-4567", type: "Customer", balance: 1250.75, lastActivity: "2024-07-12" },
  { id: "CUST002", name: "Bob The Builder", avatarFallback: "BB", email: "bob@example.com", phone: "(555) 987-6543", type: "Customer", balance: -300.00, lastActivity: "2024-07-10" },
  { id: "SUPP001", name: "Global Supplies Ltd.", avatarFallback: "GS", email: "sales@globalsupplies.com", phone: "(555) 234-5678", type: "Supplier", balance: 5800.00, lastActivity: "2024-07-05" },
  { id: "CUST003", name: "Charlie Brown", avatar: "https://placehold.co/40x40.png", dataAiHint: "man face", avatarFallback: "CB", email: "charlie@example.com", phone: "(555) 345-6789", type: "Customer", balance: 0.00, lastActivity: "2024-06-20" },
];

const ContactTable = ({ contacts, type }: { contacts: Contact[]; type: string }) => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle>{type}</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint={contact.dataAiHint} />
                    <AvatarFallback>{contact.avatarFallback}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{contact.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <a href={`mailto:${contact.email}`} className="text-primary hover:underline flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5"/> {contact.email}
                </a>
              </TableCell>
              <TableCell>
                 <span className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5"/> {contact.phone}
                 </span>
              </TableCell>
              <TableCell className={`text-right font-semibold ${contact.balance < 0 ? 'text-red-600' : contact.balance > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                ${Math.abs(contact.balance).toFixed(2)}
                {contact.balance < 0 && <Badge variant="destructive" className="ml-1">Due</Badge>}
                {contact.balance > 0 && contact.type === "Customer" && <Badge variant="outline" className="ml-1">Credit</Badge>}
                 {contact.balance > 0 && contact.type === "Supplier" && <Badge variant="secondary" className="ml-1">Payable</Badge>}
              </TableCell>
              <TableCell>{contact.lastActivity}</TableCell>
              <TableCell className="text-center space-x-1">
                <Button variant="ghost" size="icon" title="View Transactions"><Landmark className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" title="Edit Contact"><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" title="Delete Contact" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default function ContactsPage() {
  const customers = contactsData.filter(c => c.type === "Customer");
  const suppliers = contactsData.filter(c => c.type === "Supplier");

  return (
    <>
      <PageHeader 
        title="Contact Management" 
        description="Manage your customer and supplier information, transaction history, and balances."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Contact
          </Button>
        }
      />

      <Tabs defaultValue="customers">
        <TabsList className="grid w-full grid-cols-2 md:w-[300px]">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>
        <TabsContent value="customers">
          <ContactTable contacts={customers} type="Customers" />
        </TabsContent>
        <TabsContent value="suppliers">
          <ContactTable contacts={suppliers} type="Suppliers" />
        </TabsContent>
      </Tabs>
    </>
  );
}
