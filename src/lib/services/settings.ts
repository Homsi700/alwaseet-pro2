
// src/lib/services/settings.ts
'use server';

export interface GeneralSettings {
  companyName: string; taxNumber?: string; companyAddress?: string; companyPhone?: string;
  companyEmail?: string; baseCurrency: string; enableEInvoice: boolean;
}
let mockGeneralSettings: GeneralSettings = {
  companyName: "شركة الوسيط برو (الافتراضية)", taxNumber: "30012345600003",
  companyAddress: "شارع الملك فهد، الرياض", companyPhone: "+966112345678",
  companyEmail: "info@alwaseet.pro", baseCurrency: "SYP", enableEInvoice: true, 
};
export async function getGeneralSettings(): Promise<GeneralSettings> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(mockGeneralSettings));
}
export async function updateGeneralSettings(updatedSettings: Partial<GeneralSettings>): Promise<GeneralSettings> {
  await new Promise(resolve => setTimeout(resolve, 100));
  mockGeneralSettings = { ...mockGeneralSettings, ...updatedSettings };
  return JSON.parse(JSON.stringify(mockGeneralSettings));
}

export interface User {
  id: string; username: string; fullName: string; email: string;
  role: "مدير" | "محاسب" | "موظف مبيعات" | "مراجع"; isActive: boolean; lastLogin?: string; password?: string;
}
let mockUsers: User[] = [
    {id: 'user1', username: 'admin', fullName: 'المدير العام', email: 'admin@alwaseet.pro', role: 'مدير', isActive: true, lastLogin: '15/07/2024 10:00 ص'},
    {id: 'user2', username: 'accountant1', fullName: 'المحاسب الأول', email: 'accountant@alwaseet.pro', role: 'محاسب', isActive: true, lastLogin: '14/07/2024 03:30 م'},
];
export async function getUsers(): Promise<User[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(mockUsers.map(u => { const {password, ...userWithoutPassword} = u; return userWithoutPassword; })));
}
export async function addUser(userData: Omit<User, 'id' | 'lastLogin'>): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const newUser: User = { ...userData, id: `user-${Date.now()}`, lastLogin: undefined };
  mockUsers.push(newUser);
  const {password, ...userWithoutPassword} = newUser;
  return JSON.parse(JSON.stringify(userWithoutPassword));
}
export async function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'lastLogin' | 'username'>>): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        const preservedUsername = mockUsers[userIndex].username;
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData, username: preservedUsername };
        const {password, ...updatedUserWithoutPassword} = mockUsers[userIndex];
        return JSON.parse(JSON.stringify(updatedUserWithoutPassword));
    } return null;
}
export async function deleteUser(id: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 100));
  mockUsers = mockUsers.filter(u => u.id !== id); return true;
}

export interface CompanyBranch { id: string; name: string; address: string; phone?: string; isMain: boolean; }
let mockBranches: CompanyBranch[] = [ {id: 'branch1', name: 'الفرع الرئيسي - الرياض', address: 'ش الملك عبد العزيز', phone: '011-123', isMain: true},];
export async function getBranches(): Promise<CompanyBranch[]> { await new Promise(r => setTimeout(r, 50)); return JSON.parse(JSON.stringify(mockBranches)); }
export async function addBranch(branchData: Omit<CompanyBranch, 'id'>): Promise<CompanyBranch> {
  await new Promise(r => setTimeout(r,100)); const newBranch: CompanyBranch = { ...branchData, id: `branch-${Date.now()}` };
  if (newBranch.isMain) mockBranches.forEach(b => b.isMain = false); mockBranches.push(newBranch); return JSON.parse(JSON.stringify(newBranch));
}
export async function updateBranch(id: string, branchData: Partial<Omit<CompanyBranch, 'id'>>): Promise<CompanyBranch | null> {
  await new Promise(r => setTimeout(r,100)); const idx = mockBranches.findIndex(b=>b.id===id);
  if(idx !== -1) { if(branchData.isMain) mockBranches.forEach(b => {if(b.id !== id) b.isMain=false;}); mockBranches[idx] = {...mockBranches[idx], ...branchData}; return JSON.parse(JSON.stringify(mockBranches[idx])); } return null;
}
export async function deleteBranch(id: string): Promise<boolean> {
  await new Promise(r => setTimeout(r,100)); const branch = mockBranches.find(b=>b.id===id); if(branch && branch.isMain) throw new Error("لا يمكن حذف الفرع الرئيسي.");
  mockBranches = mockBranches.filter(b => b.id !== id); return true;
}

export interface Currency { id: string; code: string; name: string; symbol: string; exchangeRateToBase: number; isBaseCurrency: boolean; }
let mockCurrencies: Currency[] = [ {id: 'curr1', code: 'SYP', name: 'ليرة سورية', symbol: 'ل.س', exchangeRateToBase: 1, isBaseCurrency: true}, {id: 'curr2', code: 'USD', name: 'دولار أمريكي', symbol: '$', exchangeRateToBase: 15000, isBaseCurrency: false},];
export async function getCurrencies(): Promise<Currency[]> { await new Promise(r=>setTimeout(r,50)); return JSON.parse(JSON.stringify(mockCurrencies)); }
export async function addCurrency(currencyData: Omit<Currency, 'id'>): Promise<Currency> {
  await new Promise(r=>setTimeout(r,100)); const newCurrency: Currency = {...currencyData, id: `curr-${Date.now()}`};
  if (newCurrency.isBaseCurrency) mockCurrencies.forEach(c => c.isBaseCurrency = false); mockCurrencies.push(newCurrency); return JSON.parse(JSON.stringify(newCurrency));
}
export async function updateCurrency(id: string, currencyData: Partial<Omit<Currency, 'id'>>): Promise<Currency | null> {
  await new Promise(r=>setTimeout(r,100)); const idx = mockCurrencies.findIndex(c=>c.id===id);
  if(idx !== -1) { if(currencyData.isBaseCurrency) mockCurrencies.forEach(c => {if(c.id !== id) c.isBaseCurrency=false;}); mockCurrencies[idx] = {...mockCurrencies[idx], ...currencyData}; return JSON.parse(JSON.stringify(mockCurrencies[idx])); } return null;
}
export async function deleteCurrency(id: string): Promise<boolean> {
  await new Promise(r=>setTimeout(r,100)); const curr = mockCurrencies.find(c=>c.id===id); if(curr && curr.isBaseCurrency) throw new Error("لا يمكن حذف العملة الأساسية.");
  mockCurrencies = mockCurrencies.filter(c => c.id !== id); return true;
}

export interface Tax { id: string; name: string; rate: number; isDefault: boolean; } // Rate as percentage, e.g., 15 for 15%
let mockTaxes: Tax[] = [ {id:'tax1', name:'ضريبة القيمة المضافة', rate: 15, isDefault: true }];
export async function getTaxes(): Promise<Tax[]> { await new Promise(r=>setTimeout(r,50)); return JSON.parse(JSON.stringify(mockTaxes)); }
export async function addTax(taxData: Omit<Tax, 'id'>): Promise<Tax> {
  await new Promise(r=>setTimeout(r,100)); const newTax: Tax = {...taxData, id: `tax-${Date.now()}`};
  if(newTax.isDefault) mockTaxes.forEach(t => t.isDefault = false); mockTaxes.push(newTax); return JSON.parse(JSON.stringify(newTax));
}
export async function updateTax(id: string, taxData: Partial<Omit<Tax, 'id'>>): Promise<Tax | null> {
  await new Promise(r=>setTimeout(r,100)); const idx = mockTaxes.findIndex(t=>t.id===id);
  if(idx !== -1) { if(taxData.isDefault) mockTaxes.forEach(t => {if(t.id !== id) t.isDefault=false;}); mockTaxes[idx] = {...mockTaxes[idx], ...taxData}; return JSON.parse(JSON.stringify(mockTaxes[idx])); } return null;
}
export async function deleteTax(id: string): Promise<boolean> { await new Promise(r=>setTimeout(r,100)); mockTaxes = mockTaxes.filter(t=>t.id !== id); return true;}

export interface Discount { id: string; name: string; rate?: number; amount?: number; type: "percentage" | "fixed"; isDefault: boolean; }
let mockDiscounts: Discount[] = [ {id:'disc1', name:'خصم نهاية الموسم', rate: 10, type: 'percentage', isDefault: false }];
export async function getDiscounts(): Promise<Discount[]> { await new Promise(r=>setTimeout(r,50)); return JSON.parse(JSON.stringify(mockDiscounts)); }
// Add CRUD for Discounts

export interface UnitOfMeasure { id: string; name: string; symbol: string; isBaseUnit: boolean; }
let mockUnits: UnitOfMeasure[] = [{id:'unit1', name:'قطعة', symbol:'قطعة', isBaseUnit: true}, {id:'unit2', name:'كيلوجرام', symbol:'كجم', isBaseUnit: false}];
export async function getUnitsOfMeasure(): Promise<UnitOfMeasure[]> { await new Promise(r=>setTimeout(r,50)); return JSON.parse(JSON.stringify(mockUnits)); }
// Add CRUD for UnitsOfMeasure

export interface ProductCategory { id: string; name: string; parentCategoryId?: string; }
let mockCategories: ProductCategory[] = [{id:'cat1', name:'إلكترونيات'}, {id:'cat2', name:'مواد غذائية'}];
export async function getProductCategories(): Promise<ProductCategory[]> { await new Promise(r=>setTimeout(r,50)); return JSON.parse(JSON.stringify(mockCategories)); }
// Add CRUD for ProductCategories

    