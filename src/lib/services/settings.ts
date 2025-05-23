
// src/lib/services/settings.ts
'use server';

export interface GeneralSettings {
  companyName: string;
  taxNumber?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  baseCurrency: string; 
  enableEInvoice: boolean;
}

let mockGeneralSettings: GeneralSettings = {
  companyName: "شركة الوسيط برو (الافتراضية)",
  taxNumber: "30012345600003",
  companyAddress: "شارع الملك فهد، الرياض، المملكة العربية السعودية",
  companyPhone: "+966112345678",
  companyEmail: "info@alwaseet.pro",
  baseCurrency: "SYP",
  enableEInvoice: true, 
};

export async function getGeneralSettings(): Promise<GeneralSettings> {
  console.log("Fetching general settings (mock service)...", mockGeneralSettings);
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(mockGeneralSettings));
}

export async function updateGeneralSettings(updatedSettings: Partial<GeneralSettings>): Promise<GeneralSettings> {
  console.log("Updating general settings (mock service):", updatedSettings);
  await new Promise(resolve => setTimeout(resolve, 200));
  mockGeneralSettings = { ...mockGeneralSettings, ...updatedSettings };
  return JSON.parse(JSON.stringify(mockGeneralSettings));
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: "مدير" | "محاسب" | "موظف مبيعات" | "مراجع";
  isActive: boolean;
  lastLogin?: string;
  password?: string; // Only for creation/update, not stored as plain text
}
let mockUsers: User[] = [
    {id: 'user1', username: 'admin', fullName: 'المدير العام', email: 'admin@alwaseet.pro', role: 'مدير', isActive: true, lastLogin: '15/07/2024 10:00 ص'},
    {id: 'user2', username: 'accountant1', fullName: 'المحاسب الأول', email: 'accountant@alwaseet.pro', role: 'محاسب', isActive: true, lastLogin: '14/07/2024 03:30 م'},
    {id: 'user3', username: 'sales1', fullName: 'موظف مبيعات', email: 'sales@alwaseet.pro', role: 'موظف مبيعات', isActive: false, lastLogin: '10/07/2024 09:00 ص'},
];

export async function getUsers(): Promise<User[]> {
  console.log("Fetching users (mock service)...");
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(mockUsers.map(u => { const {password, ...userWithoutPassword} = u; return userWithoutPassword; })));
}

export async function addUser(userData: Omit<User, 'id' | 'lastLogin'>): Promise<User> {
  console.log("Adding user (mock service):", userData);
  await new Promise(resolve => setTimeout(resolve, 200));
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    lastLogin: undefined, // New users haven't logged in
  };
  mockUsers.push(newUser);
  const {password, ...userWithoutPassword} = newUser;
  return JSON.parse(JSON.stringify(userWithoutPassword));
}

export async function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'lastLogin' | 'username'>>): Promise<User | null> {
    console.log("Updating user (mock service):", id, userData);
    await new Promise(resolve => setTimeout(resolve, 200));
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        // Preserve username if not provided in userData (it's usually not updatable or handled separately)
        const preservedUsername = mockUsers[userIndex].username;
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData, username: preservedUsername };
        // Don't return password, even if it was in userData for hashing by backend
        const {password, ...updatedUserWithoutPassword} = mockUsers[userIndex];
        return JSON.parse(JSON.stringify(updatedUserWithoutPassword));
    }
    return null;
}

export async function deleteUser(id: string): Promise<boolean> {
  console.log("Deleting user (mock service):", id);
  await new Promise(resolve => setTimeout(resolve, 200));
  const initialLength = mockUsers.length;
  mockUsers = mockUsers.filter(u => u.id !== id);
  return mockUsers.length < initialLength;
}

export interface CompanyBranch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  isMain: boolean;
}
let mockBranches: CompanyBranch[] = [
    {id: 'branch1', name: 'الفرع الرئيسي - الرياض', address: 'شارع الملك عبد العزيز، الرياض', phone: '011-1234567', isMain: true},
    {id: 'branch2', name: 'مستودع جدة المركزي', address: 'المنطقة الصناعية، جدة', phone: '012-9876543', isMain: false},
];

export async function getBranches(): Promise<CompanyBranch[]> {
  console.log("Fetching branches (mock service)...");
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(mockBranches));
}
export async function addBranch(branchData: Omit<CompanyBranch, 'id'>): Promise<CompanyBranch> {
  console.log("Adding branch (mock service):", branchData);
  await new Promise(resolve => setTimeout(resolve, 200));
  const newBranch: CompanyBranch = { ...branchData, id: `branch-${Date.now()}` };
  if (newBranch.isMain) mockBranches.forEach(b => b.isMain = false); // Ensure only one main branch
  mockBranches.push(newBranch);
  return JSON.parse(JSON.stringify(newBranch));
}
export async function updateBranch(id: string, branchData: Partial<Omit<CompanyBranch, 'id'>>): Promise<CompanyBranch | null> {
  console.log("Updating branch (mock service):", id, branchData);
  await new Promise(resolve => setTimeout(resolve, 200));
  const branchIndex = mockBranches.findIndex(b => b.id === id);
  if (branchIndex !== -1) {
    if (branchData.isMain) mockBranches.forEach(b => { if (b.id !== id) b.isMain = false; });
    mockBranches[branchIndex] = { ...mockBranches[branchIndex], ...branchData };
    return JSON.parse(JSON.stringify(mockBranches[branchIndex]));
  }
  return null;
}
export async function deleteBranch(id: string): Promise<boolean> {
  console.log("Deleting branch (mock service):", id);
  await new Promise(resolve => setTimeout(resolve, 200));
  const branchToDelete = mockBranches.find(b => b.id === id);
  if (branchToDelete && branchToDelete.isMain) {
    console.error("Cannot delete main branch."); // Or throw an error
    return false;
  }
  const initialLength = mockBranches.length;
  mockBranches = mockBranches.filter(b => b.id !== id);
  return mockBranches.length < initialLength;
}


export interface Currency {
    id: string;
    code: string; 
    name: string; 
    symbol: string; 
    exchangeRateToBase: number; 
    isBaseCurrency: boolean;
}
let mockCurrencies: Currency[] = [
    {id: 'curr1', code: 'SYP', name: 'ليرة سورية', symbol: 'ل.س', exchangeRateToBase: 1, isBaseCurrency: true},
    {id: 'curr2', code: 'USD', name: 'دولار أمريكي', symbol: '$', exchangeRateToBase: 15000, isBaseCurrency: false},
    {id: 'curr3', code: 'EUR', name: 'يورو', symbol: '€', exchangeRateToBase: 16000, isBaseCurrency: false},
    {id: 'curr4', code: 'TRY', name: 'ليرة تركية', symbol: '₺', exchangeRateToBase: 450, isBaseCurrency: false},
    {id: 'curr5', code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', exchangeRateToBase: 4000, isBaseCurrency: false},
];

export async function getCurrencies(): Promise<Currency[]> {
  console.log("Fetching currencies (mock service)...");
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(mockCurrencies));
}
export async function addCurrency(currencyData: Omit<Currency, 'id'>): Promise<Currency> {
  console.log("Adding currency (mock service):", currencyData);
  await new Promise(resolve => setTimeout(resolve, 200));
  const newCurrency: Currency = { ...currencyData, id: `curr-${Date.now()}`};
  if (newCurrency.isBaseCurrency) mockCurrencies.forEach(c => c.isBaseCurrency = false);
  mockCurrencies.push(newCurrency);
  return JSON.parse(JSON.stringify(newCurrency));
}
export async function updateCurrency(id: string, currencyData: Partial<Omit<Currency, 'id'>>): Promise<Currency | null> {
  console.log("Updating currency (mock service):", id, currencyData);
  await new Promise(resolve => setTimeout(resolve, 200));
  const currencyIndex = mockCurrencies.findIndex(c => c.id === id);
  if (currencyIndex !== -1) {
    if (currencyData.isBaseCurrency) mockCurrencies.forEach(c => { if(c.id !== id) c.isBaseCurrency = false; });
    mockCurrencies[currencyIndex] = { ...mockCurrencies[currencyIndex], ...currencyData };
    return JSON.parse(JSON.stringify(mockCurrencies[currencyIndex]));
  }
  return null;
}
export async function deleteCurrency(id: string): Promise<boolean> {
  console.log("Deleting currency (mock service):", id);
  await new Promise(resolve => setTimeout(resolve, 200));
  const currencyToDelete = mockCurrencies.find(c => c.id === id);
  if (currencyToDelete && currencyToDelete.isBaseCurrency) {
    console.error("Cannot delete base currency.");
    return false;
  }
  const initialLength = mockCurrencies.length;
  mockCurrencies = mockCurrencies.filter(c => c.id !== id);
  return mockCurrencies.length < initialLength;
}

    