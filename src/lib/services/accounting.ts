
// src/lib/services/accounting.ts
'use server';

import type { JournalEntry, Account, CostCenter, ReceiptVoucher, PaymentVoucher } from '@/app/accounting/page';

let mockJournalEntries: JournalEntry[] = [
    {
        id: 'je1', date: '18/07/2024', description: 'شراء بضاعة من المورد شركة الأنوار', reference: 'INV-S001', isPosted: false,
        details: [
            { accountId: 'accMerch', accountName: 'بضاعة أول المدة', debit: 5000, credit: 0, costCenterId: 'cc1' },
            { accountId: 'accVATIn', accountName: 'ضريبة القيمة المضافة المدفوعة', debit: 750, credit: 0 },
            { accountId: 'accSupplierAnwar', accountName: 'المورد شركة الأنوار', debit: 0, credit: 5750 },
        ]
    },
    {
        id: 'je2', date: '19/07/2024', description: 'مبيعات نقدية', reference: 'SALE-001', isPosted: true,
        details: [
            { accountId: 'accCash', accountName: 'الصندوق', debit: 2300, credit: 0 },
            { accountId: 'accSales', accountName: 'المبيعات', debit: 0, credit: 2000, costCenterId: 'cc2' },
            { accountId: 'accVATOut', accountName: 'ضريبة القيمة المضافة المحصلة', debit: 0, credit: 300 },
        ]
    }
];

let mockAccounts: Account[] = [
    { id: 'accCash', code: '1101', name: 'الصندوق', type: 'أصول', balance: 15000, isMain: false, parentAccountId: 'accCurrentAssets' },
    { id: 'accBank', code: '1102', name: 'البنك - حساب جاري', type: 'أصول', balance: 75000, isMain: false, parentAccountId: 'accCurrentAssets' },
    { id: 'accReceivables', code: '1103', name: 'العملاء (المدينون)', type: 'أصول', balance: 30000, isMain: true, parentAccountId: 'accCurrentAssets' },
    { id: 'accMerch', code: '1201', name: 'بضاعة أول المدة', type: 'أصول', balance: 120000, isMain: false, parentAccountId: 'accInventory' },
    { id: 'accInventory', code: '1200', name: 'المخزون', type: 'أصول', balance: 0, isMain: true, parentAccountId: 'accCurrentAssets'},
    { id: 'accCurrentAssets', code: '1000', name: 'الأصول المتداولة', type: 'أصول', balance: 0, isMain: true},
    { id: 'accFixedAssets', code: '2000', name: 'الأصول الثابتة', type: 'أصول', balance: 250000, isMain: true },
    { id: 'accSuppliers', code: '3101', name: 'الموردون (الدائنون)', type: 'التزامات', balance: 45000, isMain: true, parentAccountId: 'accCurrentLiabilities' },
    { id: 'accVATOut', code: '3102', name: 'ضريبة القيمة المضافة المحصلة', type: 'التزامات', balance: 5000, isMain: false, parentAccountId: 'accCurrentLiabilities' },
    { id: 'accVATIn', code: '7001', name: 'ضريبة القيمة المضافة المدفوعة', type: 'مصروفات', balance: 0, isMain: false, parentAccountId: 'accExpenses' },
    { id: 'accSupplierAnwar', code: '3101-Anwar', name: 'المورد شركة الأنوار', type: 'التزامات', balance: 5750, isMain: false, parentAccountId: 'accSuppliers'},
    { id: 'accCurrentLiabilities', code: '3000', name: 'الالتزامات المتداولة', type: 'التزامات', balance: 0, isMain: true},
    { id: 'accCapital', code: '4000', name: 'رأس المال', type: 'حقوق ملكية', balance: 300000, isMain: true },
    { id: 'accSales', code: '5000', name: 'المبيعات', type: 'إيرادات', balance: 0, isMain: true },
    { id: 'accCOGS', code: '6000', name: 'تكلفة البضاعة المباعة', type: 'مصروفات', balance: 0, isMain: true },
    { id: 'accExpenses', code: '7000', name: 'المصروفات التشغيلية', type: 'مصروفات', balance: 0, isMain: true },
];

let mockCostCenters: CostCenter[] = [
    { id: 'cc1', code: 'CC-ADM', name: 'الإدارة العامة', description: 'مركز تكلفة المصاريف الإدارية' },
    { id: 'cc2', code: 'CC-SAL', name: 'قسم المبيعات', description: 'مركز تكلفة عمليات البيع والتسويق' },
    { id: 'cc3', code: 'CC-PROD', name: 'قسم الإنتاج', description: 'مركز تكلفة عمليات الإنتاج' },
];

let mockReceiptVouchers: ReceiptVoucher[] = [
    {id: 'rv1', voucherNumber: 'قبض-2024-001', date: '20/07/2024', accountId: 'accCash', accountName: 'الصندوق', receivedFrom: 'العميل شركة الأمل', amount: 5000, description: 'دفعة من فاتورة مبيعات رقم INV-00123', paymentMethod: 'نقدي', reference: 'INV-00123'},
    {id: 'rv2', voucherNumber: 'قبض-2024-002', date: '21/07/2024', accountId: 'accBank', accountName: 'البنك - حساب جاري', receivedFrom: 'العميل خالد الأحمد', amount: 12500, description: 'تحصيل قيمة شيك رقم 7890', paymentMethod: 'شيك', reference: '7890'},
];

let mockPaymentVouchers: PaymentVoucher[] = [
    {id: 'pv1', voucherNumber: 'صرف-2024-001', date: '22/07/2024', accountId: 'accCash', accountName: 'الصندوق', paidTo: 'المورد شركة النور للتجارة', amount: 3200, description: 'سداد جزئي لفاتورة مشتريات رقم PUR-0088', paymentMethod: 'نقدي', reference: 'PUR-0088'},
    {id: 'pv2', voucherNumber: 'صرف-2024-002', date: '23/07/2024', accountId: 'accBank', accountName: 'البنك - حساب جاري', paidTo: 'مصاريف إيجار المكتب', amount: 7500, description: 'إيجار مكتب شهر يوليو 2024', paymentMethod: 'تحويل بنكي'},
];


// Journal Entry Services
export async function getJournalEntries(): Promise<JournalEntry[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return JSON.parse(JSON.stringify(mockJournalEntries));
}
export async function addJournalEntry(entryData: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const newEntry: JournalEntry = { ...entryData, id: `je-${Date.now()}`};
  mockJournalEntries.push(newEntry);
  return JSON.parse(JSON.stringify(newEntry));
}
export async function updateJournalEntry(id: string, entryData: Partial<Omit<JournalEntry, 'id'>>): Promise<JournalEntry | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const index = mockJournalEntries.findIndex(e => e.id === id);
  if (index !== -1) {
    mockJournalEntries[index] = { ...mockJournalEntries[index], ...entryData };
    return JSON.parse(JSON.stringify(mockJournalEntries[index]));
  }
  return null;
}
export async function deleteJournalEntry(id: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const initialLength = mockJournalEntries.length;
  mockJournalEntries = mockJournalEntries.filter(e => e.id !== id);
  return mockJournalEntries.length < initialLength;
}

// Chart of Accounts Services
export async function getChartOfAccounts(): Promise<Account[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return JSON.parse(JSON.stringify(mockAccounts));
}
export async function addAccount(accountData: Omit<Account, 'id' | 'balance'>): Promise<Account> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const newAccount: Account = { ...accountData, id: `acc-${Date.now()}`, balance: 0 };
  mockAccounts.push(newAccount);
  return JSON.parse(JSON.stringify(newAccount));
}
export async function updateAccount(id: string, accountData: Partial<Omit<Account, 'id' | 'balance'>>): Promise<Account | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = mockAccounts.findIndex(a => a.id === id);
    if (index !== -1) {
        mockAccounts[index] = { ...mockAccounts[index], ...accountData };
        return JSON.parse(JSON.stringify(mockAccounts[index]));
    }
    return null;
}
export async function deleteAccount(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const accountToDelete = mockAccounts.find(a => a.id === id);
    if (accountToDelete && (accountToDelete.balance !== 0 || mockAccounts.some(child => child.parentAccountId === id))) {
        throw new Error("لا يمكن حذف حساب له رصيد أو حسابات فرعية.");
    }
    const initialLength = mockAccounts.length;
    mockAccounts = mockAccounts.filter(a => a.id !== id);
    return mockAccounts.length < initialLength;
}

// Cost Center Services
export async function getCostCenters(): Promise<CostCenter[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return JSON.parse(JSON.stringify(mockCostCenters));
}
export async function addCostCenter(ccData: Omit<CostCenter, 'id'>): Promise<CostCenter> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const newCC: CostCenter = { ...ccData, id: `cc-${Date.now()}`};
  mockCostCenters.push(newCC);
  return JSON.parse(JSON.stringify(newCC));
}
export async function updateCostCenter(id: string, ccData: Partial<Omit<CostCenter, 'id'>>): Promise<CostCenter | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = mockCostCenters.findIndex(cc => cc.id === id);
    if (index !== -1) {
        mockCostCenters[index] = { ...mockCostCenters[index], ...ccData };
        return JSON.parse(JSON.stringify(mockCostCenters[index]));
    }
    return null;
}
export async function deleteCostCenter(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Add validation if cost center is in use
    const initialLength = mockCostCenters.length;
    mockCostCenters = mockCostCenters.filter(cc => cc.id !== id);
    return mockCostCenters.length < initialLength;
}

// Receipt Voucher Services
export async function getReceiptVouchers(): Promise<ReceiptVoucher[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return JSON.parse(JSON.stringify(mockReceiptVouchers));
}
export async function addReceiptVoucher(voucherData: Omit<ReceiptVoucher, 'id' | 'voucherNumber'>): Promise<ReceiptVoucher> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const newVoucher: ReceiptVoucher = { 
    ...voucherData, 
    id: `rv-${Date.now()}`, 
    voucherNumber: `قبض-${new Date().getFullYear()}-${String(mockReceiptVouchers.length + 1).padStart(3, '0')}`
  };
  mockReceiptVouchers.push(newVoucher);
  return JSON.parse(JSON.stringify(newVoucher));
}
export async function updateReceiptVoucher(id: string, voucherData: Partial<Omit<ReceiptVoucher, 'id' | 'voucherNumber'>>): Promise<ReceiptVoucher | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = mockReceiptVouchers.findIndex(v => v.id === id);
    if (index !== -1) {
        mockReceiptVouchers[index] = { ...mockReceiptVouchers[index], ...voucherData };
        return JSON.parse(JSON.stringify(mockReceiptVouchers[index]));
    }
    return null;
}
export async function deleteReceiptVoucher(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const initialLength = mockReceiptVouchers.length;
    mockReceiptVouchers = mockReceiptVouchers.filter(v => v.id !== id);
    return mockReceiptVouchers.length < initialLength;
}

// Payment Voucher Services
export async function getPaymentVouchers(): Promise<PaymentVoucher[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return JSON.parse(JSON.stringify(mockPaymentVouchers));
}
export async function addPaymentVoucher(voucherData: Omit<PaymentVoucher, 'id' | 'voucherNumber'>): Promise<PaymentVoucher> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const newVoucher: PaymentVoucher = { 
    ...voucherData, 
    id: `pv-${Date.now()}`,
    voucherNumber: `صرف-${new Date().getFullYear()}-${String(mockPaymentVouchers.length + 1).padStart(3, '0')}`
   };
  mockPaymentVouchers.push(newVoucher);
  return JSON.parse(JSON.stringify(newVoucher));
}
export async function updatePaymentVoucher(id: string, voucherData: Partial<Omit<PaymentVoucher, 'id' | 'voucherNumber'>>): Promise<PaymentVoucher | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = mockPaymentVouchers.findIndex(v => v.id === id);
    if (index !== -1) {
        mockPaymentVouchers[index] = { ...mockPaymentVouchers[index], ...voucherData };
        return JSON.parse(JSON.stringify(mockPaymentVouchers[index]));
    }
    return null;
}
export async function deletePaymentVoucher(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const initialLength = mockPaymentVouchers.length;
    mockPaymentVouchers = mockPaymentVouchers.filter(v => v.id !== id);
    return mockPaymentVouchers.length < initialLength;
}

    