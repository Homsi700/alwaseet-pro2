// Placeholder types (assuming they are not yet defined or imported)
// It's better to import these from a central types file if available, e.g., '@/types'

interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
}

interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  amount: number;
  taxAmount: number;
  totalAmount: number;
  balanceDue: number;
  payments: Payment[];
  issueDate: string;
  dueDate: string;
  lastActivity?: string;
  customerName: string;
  customerId?: string; // Assuming a contact can be linked
  items: InvoiceItem[];
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  // Add other relevant fields like address, company, etc.
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantityInStock: number;
  barcode?: string; // For mockGetInventoryItemByBarcode
  // Add other relevant fields like description, category, SKU, etc.
}

// Mock Data

let mockInvoicesData: Invoice[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'INV-2024-001',
    status: 'Paid',
    amount: 1000,
    taxAmount: 100,
    totalAmount: 1100,
    balanceDue: 0,
    payments: [{ id: 'pay_001', amount: 1100, date: '2024-07-15', method: 'Credit Card' }],
    issueDate: '2024-07-01',
    dueDate: '2024-07-31',
    lastActivity: '2024-07-15',
    customerName: 'Alice Wonderland',
    customerId: 'contact_001',
    items: [
      { id: 'item_001', productName: 'Web Development', quantity: 1, unitPrice: 1000, total: 1000 },
    ],
  },
  {
    id: 'inv_002',
    invoiceNumber: 'INV-2024-002',
    status: 'Sent',
    amount: 500,
    taxAmount: 50,
    totalAmount: 550,
    balanceDue: 550,
    payments: [],
    issueDate: '2024-07-10',
    dueDate: '2024-08-10',
    customerName: 'Bob The Builder',
    customerId: 'contact_002',
    items: [
      { id: 'item_002', productName: 'Logo Design', quantity: 1, unitPrice: 500, total: 500 },
    ],
  },
  {
    id: 'inv_003',
    invoiceNumber: 'INV-2024-003',
    status: 'Overdue',
    amount: 750,
    taxAmount: 75,
    totalAmount: 825,
    balanceDue: 825,
    payments: [],
    issueDate: '2024-06-01',
    dueDate: '2024-06-30',
    customerName: 'Charlie Brown',
    customerId: 'contact_003',
    items: [
      { id: 'item_003', productName: 'Consulting Hours', quantity: 5, unitPrice: 150, total: 750 },
    ],
  },
];

let mockContactsData: Contact[] = [
  { id: 'contact_001', name: 'Alice Wonderland', email: 'alice@example.com', phone: '123-456-7890' },
  { id: 'contact_002', name: 'Bob The Builder', email: 'bob@example.com', phone: '234-567-8901' },
  { id: 'contact_003', name: 'Charlie Brown', email: 'charlie@example.com', phone: '345-678-9012' },
];

let mockProductsData: Product[] = [
  { id: 'prod_001', name: 'Web Development Package', price: 1000, quantityInStock: 10, barcode: 'WEBDEV001' },
  { id: 'prod_002', name: 'Logo Design Service', price: 500, quantityInStock: 20, barcode: 'LOGODSIGN002' },
  { id: 'prod_003', name: 'Hourly Consulting', price: 150, quantityInStock: 100, barcode: 'CONSULTING003' },
  { id: 'prod_004', name: 'Software License', price: 250, quantityInStock: 5, barcode: 'SOFTLIC004' }, // Low stock example
];

// Helper function for generating IDs
const generateId = (prefix: string = 'id_') => `${prefix}${Math.random().toString(36).substr(2, 9)}`;

// --- Invoicing Mock Functions ---

export const mockGetInvoices = async (type?: string): Promise<Invoice[]> => {
  console.log(`mockGetInvoices called with type: ${type}`);
  if (type) {
    return Promise.resolve([...mockInvoicesData.filter(inv => inv.status.toLowerCase() === type.toLowerCase())]);
  }
  return Promise.resolve([...mockInvoicesData]);
};

export const mockGetInvoiceById = async (id: string): Promise<Invoice | undefined> => {
  console.log(`mockGetInvoiceById called with id: ${id}`);
  const invoice = mockInvoicesData.find(inv => inv.id === id);
  return Promise.resolve(invoice ? { ...invoice } : undefined);
};

export const mockCreateInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'issueDate' | 'dueDate' | 'status' | 'balanceDue' | 'payments' | 'totalAmount' | 'amount' | 'taxAmount'> & { customerId?: string, items: InvoiceItem[], taxRate?: number }): Promise<Invoice> => {
  console.log('mockCreateInvoice called with data:', invoiceData);
  const calculatedAmount = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
  const calculatedTaxAmount = calculatedAmount * (invoiceData.taxRate || 0.10); // Use provided taxRate or default to 10%
  
  const newInvoice: Invoice = {
    id: generateId('inv_'),
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(mockInvoicesData.length + 1).padStart(3, '0')}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 30 days
    status: 'Draft',
    payments: [],
    customerName: invoiceData.customerName, // Ensure customerName is part of the input or fetched
    customerId: invoiceData.customerId,
    items: invoiceData.items,
    amount: calculatedAmount,
    taxAmount: calculatedTaxAmount,
    get totalAmount() { return this.amount + this.taxAmount; },
    get balanceDue() { return this.totalAmount - this.payments.reduce((sum, p) => sum + p.amount, 0); },
  };
  mockInvoicesData.push(newInvoice);
  return Promise.resolve({ ...newInvoice });
};

export const mockUpdateInvoice = async (id: string, invoiceUpdateData: Partial<Omit<Invoice, 'totalAmount'|'balanceDue'>> & { taxRate?: number }): Promise<Invoice | undefined> => {
  console.log(`mockUpdateInvoice called for id: ${id} with data:`, invoiceUpdateData);
  const invoiceIndex = mockInvoicesData.findIndex(inv => inv.id === id);
  if (invoiceIndex === -1) {
    return Promise.resolve(undefined);
  }
  const originalInvoice = mockInvoicesData[invoiceIndex];
  
  let updatedInvoice = {
    ...originalInvoice,
    ...invoiceUpdateData,
    lastActivity: new Date().toISOString().split('T')[0],
  };

  // Recalculate amounts if items or taxRate changed
  if (invoiceUpdateData.items || invoiceUpdateData.taxRate !== undefined) {
    updatedInvoice.amount = updatedInvoice.items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = invoiceUpdateData.taxRate ?? (originalInvoice.taxAmount / originalInvoice.amount); // Use new taxRate or derive from original
    updatedInvoice.taxAmount = updatedInvoice.amount * taxRate;
  }
  
  // Define totalAmount and balanceDue as properties that compute on access
  const finalUpdatedInvoice = {
    ...updatedInvoice,
    get totalAmount() { return this.amount + this.taxAmount; },
    get balanceDue() { return this.totalAmount - this.payments.reduce((sum, p) => sum + p.amount, 0); },
  };

  mockInvoicesData[invoiceIndex] = finalUpdatedInvoice;
  return Promise.resolve({ ...finalUpdatedInvoice });
};

export const mockDeleteInvoice = async (id: string): Promise<void> => {
  console.log(`mockDeleteInvoice called for id: ${id}`);
  mockInvoicesData = mockInvoicesData.filter(inv => inv.id !== id);
  return Promise.resolve();
};

export const mockMarkInvoiceAsPaid = async (id: string, paymentDateInput?: string): Promise<Invoice | undefined> => {
  console.log(`mockMarkInvoiceAsPaid called for id: ${id}`);
  const invoiceIndex = mockInvoicesData.findIndex(inv => inv.id === id);
  if (invoiceIndex === -1) {
    return Promise.resolve(undefined);
  }
  
  const invoice = mockInvoicesData[invoiceIndex];
  const paymentDate = paymentDateInput || new Date().toISOString().split('T')[0];

  const updatedInvoice = {
    ...invoice,
    status: 'Paid' as 'Paid', // Type assertion
    balanceDue: 0,
    lastActivity: paymentDate,
  };

  // Add a full payment if current payments don't cover the total amount
  const currentPaidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  if (currentPaidAmount < invoice.totalAmount) {
    updatedInvoice.payments = [
      ...invoice.payments,
      {
        id: generateId('pay_'),
        amount: invoice.totalAmount - currentPaidAmount,
        date: paymentDate,
        method: 'Mock Full Payment',
      }
    ];
  }
  
  // Re-apply getters for totalAmount and balanceDue
  const finalUpdatedInvoice = {
    ...updatedInvoice,
    get totalAmount() { return this.amount + this.taxAmount; },
    get balanceDue() { return this.totalAmount - this.payments.reduce((sum, p) => sum + p.amount, 0); },
  };

  mockInvoicesData[invoiceIndex] = finalUpdatedInvoice;
  return Promise.resolve({ ...finalUpdatedInvoice });
};

export const mockAddPaymentToInvoice = async (invoiceId: string, paymentData: Omit<Payment, 'id'>): Promise<Invoice | undefined> => {
  console.log(`mockAddPaymentToInvoice called for invoiceId: ${invoiceId} with data:`, paymentData);
  const invoiceIndex = mockInvoicesData.findIndex(inv => inv.id === invoiceId);
  if (invoiceIndex === -1) {
    return Promise.resolve(undefined);
  }

  const invoice = mockInvoicesData[invoiceIndex];
  const newPayment: Payment = {
    id: generateId('pay_'),
    ...paymentData,
  };
  
  const updatedPayments = [...invoice.payments, newPayment];
  const newPaidAmount = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
  
  let newStatus = invoice.status;
  let newBalanceDue = invoice.totalAmount - newPaidAmount;

  if (newBalanceDue <= 0) {
    newStatus = 'Paid';
    newBalanceDue = 0;
  }

  const updatedInvoice = {
    ...invoice,
    payments: updatedPayments,
    status: newStatus,
    balanceDue: newBalanceDue, // This will be overridden by the getter, but good for context
    lastActivity: new Date().toISOString().split('T')[0],
  };

  // Re-apply getters
  const finalUpdatedInvoice = {
    ...updatedInvoice,
    get totalAmount() { return this.amount + this.taxAmount; },
    get balanceDue() { return this.totalAmount - this.payments.reduce((sum, p) => sum + p.amount, 0); },
  };
  
  mockInvoicesData[invoiceIndex] = finalUpdatedInvoice;
  return Promise.resolve({ ...finalUpdatedInvoice });
};

// --- Contact Mock Functions ---

export const mockGetContacts = async (): Promise<Contact[]> => {
  console.log('mockGetContacts called');
  return Promise.resolve([...mockContactsData]);
};

export const mockGetContactById = async (id: string): Promise<Contact | undefined> => {
  console.log(`mockGetContactById called with id: ${id}`);
  const contact = mockContactsData.find(c => c.id === id);
  return Promise.resolve(contact ? { ...contact } : undefined);
};

export const mockCreateContact = async (contactData: Omit<Contact, 'id'>): Promise<Contact> => {
  console.log('mockCreateContact called with data:', contactData);
  const newContact: Contact = {
    id: generateId('contact_'),
    ...contactData,
  };
  mockContactsData.push(newContact);
  return Promise.resolve({ ...newContact });
};

export const mockUpdateContact = async (id: string, contactUpdateData: Partial<Contact>): Promise<Contact | undefined> => {
  console.log(`mockUpdateContact called for id: ${id} with data:`, contactUpdateData);
  const contactIndex = mockContactsData.findIndex(c => c.id === id);
  if (contactIndex === -1) {
    return Promise.resolve(undefined);
  }
  mockContactsData[contactIndex] = { ...mockContactsData[contactIndex], ...contactUpdateData };
  return Promise.resolve({ ...mockContactsData[contactIndex] });
};

export const mockDeleteContact = async (id: string): Promise<void> => {
  console.log(`mockDeleteContact called for id: ${id}`);
  mockContactsData = mockContactsData.filter(c => c.id !== id);
  return Promise.resolve();
};

// --- Inventory Mock Functions ---

export const mockGetProducts = async (): Promise<Product[]> => {
  console.log('mockGetProducts called');
  return Promise.resolve([...mockProductsData]);
};

export const mockGetProductById = async (id: string): Promise<Product | undefined> => {
  console.log(`mockGetProductById called with id: ${id}`);
  const product = mockProductsData.find(p => p.id === id);
  return Promise.resolve(product ? { ...product } : undefined);
};

export const mockCreateProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  console.log('mockCreateProduct called with data:', productData);
  const newProduct: Product = {
    id: generateId('prod_'),
    ...productData,
  };
  mockProductsData.push(newProduct);
  return Promise.resolve({ ...newProduct });
};

export const mockUpdateProduct = async (id: string, productUpdateData: Partial<Product>): Promise<Product | undefined> => {
  console.log(`mockUpdateProduct called for id: ${id} with data:`, productUpdateData);
  const productIndex = mockProductsData.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return Promise.resolve(undefined);
  }
  mockProductsData[productIndex] = { ...mockProductsData[productIndex], ...productUpdateData };
  return Promise.resolve({ ...mockProductsData[productIndex] });
};

export const mockDeleteProduct = async (id: string): Promise<void> => {
  console.log(`mockDeleteProduct called for id: ${id}`);
  mockProductsData = mockProductsData.filter(p => p.id !== id);
  return Promise.resolve();
};

export const mockGetInventoryItemByBarcode = async (barcode: string): Promise<Product | undefined> => {
  console.log(`mockGetInventoryItemByBarcode called with barcode: ${barcode}`);
  const product = mockProductsData.find(p => p.barcode === barcode);
  return Promise.resolve(product ? { ...product } : undefined);
};

export const mockGetInventoryCounts = async (): Promise<{ [productId: string]: number }> => {
  console.log('mockGetInventoryCounts called');
  const counts: { [productId: string]: number } = {};
  mockProductsData.forEach(product => {
    counts[product.id] = product.quantityInStock;
  });
  return Promise.resolve(counts);
};

export const mockGetInventoryAlerts = async (lowStockThreshold: number = 10): Promise<Product[]> => {
  console.log(`mockGetInventoryAlerts called with threshold: ${lowStockThreshold}`);
  const alerts = mockProductsData.filter(product => product.quantityInStock < lowStockThreshold);
  return Promise.resolve([...alerts]);
};

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantityChanged: number;
  newQuantity: number;
  date: string;
  reason?: string;
}
let mockStockMovementsData: StockMovement[] = [
    {id: generateId('move_'), productId: 'prod_001', productName: 'Web Development Package', type: 'in', quantityChanged: 10, newQuantity:10, date: '2024-01-01', reason: 'Initial stock'},
    {id: generateId('move_'), productId: 'prod_004', productName: 'Software License', type: 'in', quantityChanged: 5, newQuantity:5, date: '2024-01-01', reason: 'Initial stock'},
];

export const mockGetStockMovements = async (): Promise<StockMovement[]> => {
  console.log('mockGetStockMovements called');
  return Promise.resolve([...mockStockMovementsData]);
};


// --- Initialize Mock Services ---
export const initializeMockServices = (axiosInstance: any) => {
  import('axios-mock-adapter').then(module => {
    const MockAdapter = module.default;
    const mock = new MockAdapter(axiosInstance, { delayResponse: 300 });

    // --- Invoice Routes ---
    mock.onGet('/invoices').reply(async (config) => {
      const type = config.params?.type;
      const invoices = await mockGetInvoices(type);
      return [200, invoices];
    });

    mock.onGet(/\/invoices\/(.+)/).reply(async (config) => {
      const idMatch = config.url?.match(/\/invoices\/([^/]+)$/);
      const id = idMatch?.[1];
      if (!id) return [400, { error: 'Invoice ID missing or invalid URL structure' }];
      const invoice = await mockGetInvoiceById(id);
      return invoice ? [200, invoice] : [404, { error: 'Invoice not found' }];
    });

    mock.onPost('/invoices').reply(async (config) => {
      const invoiceData = JSON.parse(config.data);
      const newInvoice = await mockCreateInvoice(invoiceData);
      return [201, newInvoice];
    });

    mock.onPut(/\/invoices\/(.+)/).reply(async (config) => {
      const idMatch = config.url?.match(/\/invoices\/([^/]+)$/);
      const id = idMatch?.[1];
      if (!id) return [400, { error: 'Invoice ID missing or invalid URL structure' }];
      const invoiceData = JSON.parse(config.data);
      const updatedInvoice = await mockUpdateInvoice(id, invoiceData);
      return updatedInvoice ? [200, updatedInvoice] : [404, { error: 'Invoice not found' }];
    });

    mock.onDelete(/\/invoices\/(.+)/).reply(async (config) => {
      const idMatch = config.url?.match(/\/invoices\/([^/]+)$/);
      const id = idMatch?.[1];
      if (!id) return [400, { error: 'Invoice ID missing or invalid URL structure' }];
      await mockDeleteInvoice(id);
      return [204, null];
    });

    mock.onPost(/\/invoices\/(.+)\/mark-paid/).reply(async (config) => {
      const idMatch = config.url?.match(/\/invoices\/([^/]+)\/mark-paid$/);
      const id = idMatch?.[1];
      if (!id) return [400, { error: 'Invoice ID missing or invalid URL structure' }];
      const { paymentDate } = JSON.parse(config.data || '{}');
      const invoice = await mockMarkInvoiceAsPaid(id, paymentDate);
      return invoice ? [200, invoice] : [404, { error: 'Invoice not found' }];
    });

    mock.onPost(/\/invoices\/(.+)\/payments/).reply(async (config) => {
      const idMatch = config.url?.match(/\/invoices\/([^/]+)\/payments$/);
      const invoiceId = idMatch?.[1];
      if (!invoiceId) return [400, { error: 'Invoice ID missing or invalid URL structure' }];
      const paymentData = JSON.parse(config.data);
      const invoice = await mockAddPaymentToInvoice(invoiceId, paymentData);
      return invoice ? [200, invoice] : [404, { error: 'Invoice not found' }];
    });

    // --- Contact Routes ---
    mock.onGet('/contacts').reply(async () => [200, await mockGetContacts()]);

    mock.onGet(/\/contacts\/(.+)/).reply(async (config) => {
      const idMatch = config.url?.match(/\/contacts\/([^/]+)$/);
      const id = idMatch?.[1];
      if (!id) return [400, { error: 'Contact ID missing or invalid URL structure' }];
      const contact = await mockGetContactById(id);
      return contact ? [200, contact] : [404, { error: 'Contact not found' }];
    });

    mock.onPost('/contacts').reply(async (config) => {
      const contactData = JSON.parse(config.data);
      const newContact = await mockCreateContact(contactData);
      return [201, newContact];
    });

    mock.onPut(/\/contacts\/(.+)/).reply(async (config) => {
      const idMatch = config.url?.match(/\/contacts\/([^/]+)$/);
      const id = idMatch?.[1];
      if (!id) return [400, { error: 'Contact ID missing or invalid URL structure' }];
      const contactData = JSON.parse(config.data);
      const updatedContact = await mockUpdateContact(id, contactData);
      return updatedContact ? [200, updatedContact] : [404, { error: 'Contact not found' }];
    });

    mock.onDelete(/\/contacts\/(.+)/).reply(async (config) => {
      const idMatch = config.url?.match(/\/contacts\/([^/]+)$/);
      const id = idMatch?.[1];
      if (!id) return [400, { error: 'Contact ID missing or invalid URL structure' }];
      await mockDeleteContact(id);
      return [204, null];
    });

    // --- Product/Inventory Routes ---
    mock.onGet('/products').reply(async () => [200, await mockGetProducts()]);
    
    mock.onGet('/products/inventory/counts').reply(async () => [200, await mockGetInventoryCounts()]);
    mock.onGet('/products/inventory/alerts').reply(async (config) => {
        const threshold = config.params?.lowStockThreshold;
        return [200, await mockGetInventoryAlerts(threshold ? parseInt(threshold) : undefined)];
    });
    mock.onGet('/products/inventory/stock-movements').reply(async () => [200, await mockGetStockMovements()]);
    
    mock.onGet(/\/products\/barcode\/(.+)/).reply(async (config) => {
        const barcodeMatch = config.url?.match(/\/products\/barcode\/([^/]+)$/);
        const barcode = barcodeMatch?.[1];
        if(!barcode) return [400, { error: 'Barcode missing or invalid URL structure' }];
        const product = await mockGetInventoryItemByBarcode(barcode);
        return product ? [200, product] : [404, { error: 'Product not found by barcode' }];
    });

    // This needs to be more specific or ordered correctly to avoid capturing /products/inventory etc.
    // A regex that matches an ID but not sub-resources.
    mock.onGet(/\/products\/((?!inventory|barcode)[^/]+)$/).reply(async (config) => {
      const idMatch = config.url?.match(/\/products\/((?!inventory|barcode)[^/]+)$/);
      const id = idMatch?.[1];
      if (!id) return [400, { error: 'Product ID missing or invalid URL structure' }];
      const product = await mockGetProductById(id);
      return product ? [200, product] : [404, { error: 'Product not found' }];
    });

    mock.onPost('/products').reply(async (config) => {
      const productData = JSON.parse(config.data);
      const newProduct = await mockCreateProduct(productData);
      return [201, newProduct];
    });

    mock.onPut(/\/products\/(.+)/).reply(async (config) => {
      const idMatch = config.url?.match(/\/products\/([^/]+)$/);
      // Ensure this doesn't match /products/inventory/counts etc.
      // This regex might be too greedy. Let's assume IDs don't contain '/'
      const id = idMatch?.[1]; 
      if (!id || id.includes('/')) return [400, { error: 'Product ID missing or invalid URL structure, or conflict with sub-resource' }];
      const productData = JSON.parse(config.data);
      const updatedProduct = await mockUpdateProduct(id, productData);
      return updatedProduct ? [200, updatedProduct] : [404, { error: 'Product not found' }];
    });

    mock.onDelete(/\/products\/(.+)/).reply(async (config) => {
      const idMatch = config.url?.match(/\/products\/([^/]+)$/);
      const id = idMatch?.[1];
       if (!id || id.includes('/')) return [400, { error: 'Product ID missing or invalid URL structure, or conflict with sub-resource' }];
      await mockDeleteProduct(id);
      return [204, null];
    });

    console.log('Mock services initialized.');
  }).catch(err => {
    console.error("Failed to load axios-mock-adapter or initialize mocks:", err);
  });
};
