
// src/lib/services/invoicing.ts
'use server';

import type { Invoice, InvoiceStatus, InvoiceType } from '@/app/invoicing/page'; 

let mockInvoices: Invoice[] = [
  { 
    id: 'inv1', invoiceNumber: 'بيع-2024-001', date: '15/07/2024', dueDate: '15/08/2024', 
    customerSupplierName: 'نبيل القدسي (وهمي)', customerSupplierId: 'cust1', 
    amount: 5500, taxAmount: 825, totalAmount: 6325, 
    status: 'Pending', type: 'Sales', paymentMethod: 'تحويل بنكي', 
    notes: 'فاتورة لابتوب ديل XPS 13', salesperson: 'أحمد', isEInvoice: true, eInvoiceStatus: 'مرسلة',
    items: [
      { productId: 'item1', productName: 'لابتوب ديل XPS 13 (وهمي)', quantity: 1, unitPrice: 5500, discountRate: 0, taxRate: 0.15, totalPrice: 6325 }
    ]
  },
  { 
    id: 'inv2', invoiceNumber: 'شراء-2024-005', date: '10/07/2024', dueDate: '10/08/2024',
    customerSupplierName: 'شركة حمص للتوريدات (وهمي)', customerSupplierId: 'supp2',
    amount: 160, taxAmount: 24, totalAmount: 184,
    status: 'Paid', type: 'Purchase', paymentMethod: 'نقدي',
    items: [
      { productId: 'item2', productName: 'قهوة أرابيكا فاخرة (وهمي)', quantity: 2, unitPrice: 80, taxRate: 0.15, totalPrice: 184 }
    ]
  },
  { 
    id: 'quote1', invoiceNumber: 'عرض-2024-001', date: '12/07/2024', dueDate: '22/07/2024', 
    customerSupplierName: 'عميل محتمل شركة الأمل', customerSupplierId: 'cust-potential-1', 
    amount: 1000, taxAmount: 150, totalAmount: 1150, 
    status: 'Draft', type: 'Quote', paymentMethod: 'آجل', 
    notes: 'عرض سعر أولي', salesperson: 'سارة', isEInvoice: false,
    items: [
      { productId: 'item-generic', productName: 'خدمات استشارية', quantity: 10, unitPrice: 100, discountRate: 0, taxRate: 0.15, totalPrice: 1150 }
    ]
  }
];

function generateInvoiceNumber(type: InvoiceType, year: number, count: number): string {
    const typePrefixMap: Record<InvoiceType, string> = {
        Sales: "بيع", Purchase: "شراء", Tax: "ضريبة", Return: "مرتجع",
        Quote: "عرض", SalesOrder: "أمر-بيع", PurchaseOrder: "أمر-شراء"
    };
    return `${typePrefixMap[type]}-${year}-${String(count).padStart(3, '0')}`;
}


export async function getInvoices(type?: Invoice['type']): Promise<Invoice[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  if (type) {
    return JSON.parse(JSON.stringify(mockInvoices.filter(inv => inv.type === type)));
  }
  return JSON.parse(JSON.stringify(mockInvoices));
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const invoice = mockInvoices.find(inv => inv.id === id);
  return invoice ? JSON.parse(JSON.stringify(invoice)) : undefined;
}

export async function createInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const currentYear = new Date().getFullYear();
  const invoicesOfTypeThisYear = mockInvoices.filter(inv => inv.type === invoiceData.type && new Date(inv.date.split('/').reverse().join('-')).getFullYear() === currentYear);

  const newInvoice: Invoice = {
    ...invoiceData,
    id: `inv-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    invoiceNumber: generateInvoiceNumber(invoiceData.type, currentYear, invoicesOfTypeThisYear.length + 1)
  };
  mockInvoices.push(newInvoice);
  console.log("Created Invoice (mock):", newInvoice);
  return JSON.parse(JSON.stringify(newInvoice));
}

export async function updateInvoice(id: string, invoiceData: Partial<Omit<Invoice, 'id' | 'invoiceNumber'>>): Promise<Invoice | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id);
  if (invoiceIndex !== -1) {
    const originalInvoice = mockInvoices[invoiceIndex];
    // Preserve original invoice number if not explicitly changed (usually not changed)
    const preservedInvoiceNumber = originalInvoice.invoiceNumber;
    
    mockInvoices[invoiceIndex] = { 
        ...originalInvoice, 
        ...invoiceData,
        invoiceNumber: invoiceData.invoiceNumber || preservedInvoiceNumber // Keep original if not provided
    };
    console.log("Updated Invoice (mock):", mockInvoices[invoiceIndex]);
    return JSON.parse(JSON.stringify(mockInvoices[invoiceIndex]));
  }
  return null;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const initialLength = mockInvoices.length;
  mockInvoices = mockInvoices.filter(inv => inv.id !== id);
  console.log("Deleted Invoice (mock), ID:", id);
  return mockInvoices.length < initialLength;
}

    