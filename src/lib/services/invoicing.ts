
// src/lib/services/invoicing.ts
'use server';

import type { Invoice, InvoiceItem } from '@/app/invoicing/page'; // Ensure types are exported

let mockInvoices: Invoice[] = [
  { 
    id: 'inv1', invoiceNumber: 'بيع-2024-001', date: '15/07/2024', dueDate: '15/08/2024', 
    customerSupplierName: 'نبيل القدسي (وهمي)', customerSupplierId: 'cust1', 
    amount: 5500, taxAmount: 825, totalAmount: 6325, 
    status: 'Pending', type: 'Sales', paymentMethod: 'تحويل بنكي', 
    notes: 'فاتورة لابتوب ديل XPS 13', salesperson: 'أحمد', isEInvoice: true, eInvoiceStatus: 'مرسلة',
    items: [
      { productId: 'item1', productName: 'لابتوب ديل XPS 13', quantity: 1, unitPrice: 5500, discountRate: 0, taxRate: 0.15, totalPrice: 6325 }
    ]
  },
  { 
    id: 'inv2', invoiceNumber: 'شراء-2024-005', date: '10/07/2024', dueDate: '10/08/2024',
    customerSupplierName: 'شركة حمص للتوريدات (وهمي)', customerSupplierId: 'supp2',
    amount: 160, taxAmount: 24, totalAmount: 184,
    status: 'Paid', type: 'Purchase', paymentMethod: 'نقدي',
    items: [
      { productId: 'item2', productName: 'قهوة أرابيكا فاخرة', quantity: 2, unitPrice: 80, taxRate: 0.15, totalPrice: 184 }
    ]
  }
];

export async function getInvoices(type?: Invoice['type']): Promise<Invoice[]> {
  console.log(`Fetching invoices (mock service) - Type: ${type || 'All'}`);
  await new Promise(resolve => setTimeout(resolve, 600));
  if (type) {
    return JSON.parse(JSON.stringify(mockInvoices.filter(inv => inv.type === type)));
  }
  return JSON.parse(JSON.stringify(mockInvoices));
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const invoice = mockInvoices.find(inv => inv.id === id);
  return invoice ? JSON.parse(JSON.stringify(invoice)) : undefined;
}

export async function createInvoice(invoiceData: Omit<Invoice, 'id' | 'amount' | 'taxAmount' | 'totalAmount'>): Promise<Invoice> {
  console.log("Creating invoice (mock service):", invoiceData);
  await new Promise(resolve => setTimeout(resolve, 700));
  
  let calculatedAmount = 0;
  let calculatedTaxAmount = 0;
  invoiceData.items.forEach(item => {
    const itemSubTotal = item.quantity * item.unitPrice * (1 - (item.discountRate || 0));
    calculatedAmount += itemSubTotal;
    calculatedTaxAmount += itemSubTotal * (item.taxRate || 0);
  });
  const calculatedTotalAmount = calculatedAmount + calculatedTaxAmount;

  const newInvoice: Invoice = {
    ...invoiceData,
    id: `inv-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    amount: calculatedAmount,
    taxAmount: calculatedTaxAmount,
    totalAmount: calculatedTotalAmount,
    invoiceNumber: `${invoiceData.type === "Sales" ? "بيع" : invoiceData.type === "Purchase" ? "شراء" : invoiceData.type === "Return" ? "مرتجع" : "ضريبة"}-${new Date().getFullYear()}-${String(mockInvoices.length + 1).padStart(3, '0')}`
  };
  mockInvoices.push(newInvoice);
  return JSON.parse(JSON.stringify(newInvoice));
}

export async function updateInvoice(id: string, invoiceData: Partial<Omit<Invoice, 'id' | 'invoiceNumber' | 'amount' | 'taxAmount' | 'totalAmount'>>): Promise<Invoice | null> {
  console.log("Updating invoice (mock service):", id, invoiceData);
  await new Promise(resolve => setTimeout(resolve, 500));
  const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id);
  if (invoiceIndex !== -1) {
    const originalInvoice = mockInvoices[invoiceIndex];
    const updatedData = { ...originalInvoice, ...invoiceData };

    let calculatedAmount = 0;
    let calculatedTaxAmount = 0;
    if (updatedData.items) { // Recalculate if items are part of the update
        updatedData.items.forEach(item => {
            const itemSubTotal = item.quantity * item.unitPrice * (1 - (item.discountRate || 0));
            calculatedAmount += itemSubTotal;
            calculatedTaxAmount += itemSubTotal * (item.taxRate || 0);
        });
        updatedData.amount = calculatedAmount;
        updatedData.taxAmount = calculatedTaxAmount;
        updatedData.totalAmount = calculatedAmount + calculatedTaxAmount;
    }
    
    mockInvoices[invoiceIndex] = updatedData;
    return JSON.parse(JSON.stringify(mockInvoices[invoiceIndex]));
  }
  return null;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  console.log("Deleting invoice (mock service):", id);
  await new Promise(resolve => setTimeout(resolve, 500));
  const initialLength = mockInvoices.length;
  mockInvoices = mockInvoices.filter(inv => inv.id !== id);
  return mockInvoices.length < initialLength;
}
