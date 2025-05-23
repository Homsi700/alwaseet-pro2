
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
  console.log("Service: getGeneralSettings called");
  await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(mockGeneralSettings));
}
export async function updateGeneralSettings(updatedSettings: Partial<GeneralSettings>): Promise<GeneralSettings> {
  console.log("Service: updateGeneralSettings called with", updatedSettings);
  await new Promise(resolve => setTimeout(resolve, 100));
  mockGeneralSettings = { ...mockGeneralSettings, ...updatedSettings };
  return JSON.parse(JSON.stringify(mockGeneralSettings));
}

export interface User {
  id: string; username: string; fullName: string; email: string;
  role: "مدير" | "محاسب" | "موظف مبيعات" | "مراجع"; isActive: boolean; lastLogin?: string; password?: string;
}
let mockUsers: User[] = [
    {id: 'user1', username: 'admin', fullName: 'المدير العام', email: 'admin@alwaseet.pro', role: 'مدير', isActive: true, lastLogin: '15/07/2024 10:00 ص', password: 'hashedpassword1'},
    {id: 'user2', username: 'accountant1', fullName: 'المحاسب الأول', email: 'accountant@alwaseet.pro', role: 'محاسب', isActive: true, lastLogin: '14/07/2024 03:30 م', password: 'hashedpassword2'},
];
export async function getUsers(): Promise<User[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(mockUsers.map(u => { const {password, ...userWithoutPassword} = u; return userWithoutPassword; })));
}
export async function addUser(userData: Omit<User, 'id' | 'lastLogin'>): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, 100));
  if (mockUsers.some(u => u.username === userData.username)) {
    throw new Error("اسم المستخدم موجود بالفعل.");
  }
  if (mockUsers.some(u => u.email === userData.email)) {
    throw new Error("البريد الإلكتروني مسجل بالفعل.");
  }
  const newUser: User = { ...userData, id: `user-${Date.now()}`, lastLogin: undefined };
  mockUsers.push(newUser);
  const {password, ...userWithoutPassword} = newUser;
  return JSON.parse(JSON.stringify(userWithoutPassword));
}
export async function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'lastLogin' | 'username'>>): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        // Prevent changing username, ensure email uniqueness if changed
        if (userData.email && userData.email !== mockUsers[userIndex].email && mockUsers.some(u => u.email === userData.email && u.id !== id)) {
            throw new Error("البريد الإلكتروني مسجل بالفعل لمستخدم آخر.");
        }
        const preservedUsername = mockUsers[userIndex].username;
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData, username: preservedUsername };
        
        // If password is not provided in userData, it means don't change it
        if (userData.password === undefined || userData.password === "") {
          mockUsers[userIndex].password = mockUsers[userIndex].password; // Keep old password
        } else {
           mockUsers[userIndex].password = userData.password; // "Hash" new password (in real app)
        }

        const {password, ...updatedUserWithoutPassword} = mockUsers[userIndex];
        return JSON.parse(JSON.stringify(updatedUserWithoutPassword));
    } return null;
}
export async function deleteUser(id: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const initialLength = mockUsers.length;
  mockUsers = mockUsers.filter(u => u.id !== id); 
  return mockUsers.length < initialLength;
}

export interface CompanyBranch { id: string; name: string; address: string; phone?: string; isMain: boolean; }
let mockBranches: CompanyBranch[] = [ {id: 'branch1', name: 'الفرع الرئيسي - الرياض', address: 'ش الملك عبد العزيز', phone: '011-123', isMain: true},];
export async function getBranches(): Promise<CompanyBranch[]> { await new Promise(r => setTimeout(r, 50)); return JSON.parse(JSON.stringify(mockBranches)); }
export async function addBranch(branchData: Omit<CompanyBranch, 'id'>): Promise<CompanyBranch> {
  await new Promise(r => setTimeout(r,100)); 
  if (branchData.isMain && mockBranches.some(b => b.isMain)) {
    throw new Error("يمكن تحديد فرع رئيسي واحد فقط. يرجى إلغاء تحديد الفرع الرئيسي الحالي أولاً.");
  }
  const newBranch: CompanyBranch = { ...branchData, id: `branch-${Date.now()}` };
  mockBranches.push(newBranch); return JSON.parse(JSON.stringify(newBranch));
}
export async function updateBranch(id: string, branchData: Partial<Omit<CompanyBranch, 'id'>>): Promise<CompanyBranch | null> {
  await new Promise(r => setTimeout(r,100)); 
  const idx = mockBranches.findIndex(b=>b.id===id);
  if(idx !== -1) { 
    if(branchData.isMain && mockBranches.some(b => b.isMain && b.id !== id)) {
        throw new Error("يمكن تحديد فرع رئيسي واحد فقط. يرجى إلغاء تحديد الفرع الرئيسي الحالي أولاً.");
    }
    mockBranches[idx] = {...mockBranches[idx], ...branchData}; 
    return JSON.parse(JSON.stringify(mockBranches[idx])); 
  } return null;
}
export async function deleteBranch(id: string): Promise<boolean> {
  await new Promise(r => setTimeout(r,100)); 
  const branch = mockBranches.find(b=>b.id===id); 
  if(branch && branch.isMain) throw new Error("لا يمكن حذف الفرع الرئيسي.");
  const initialLength = mockBranches.length;
  mockBranches = mockBranches.filter(b => b.id !== id); 
  return mockBranches.length < initialLength;
}

export interface Currency { id: string; code: string; name: string; symbol: string; exchangeRateToBase: number; isBaseCurrency: boolean; }
let mockCurrencies: Currency[] = [ 
    {id: 'curr1', code: 'SYP', name: 'ليرة سورية', symbol: 'ل.س', exchangeRateToBase: 1, isBaseCurrency: true}, 
    {id: 'curr2', code: 'USD', name: 'دولار أمريكي', symbol: '$', exchangeRateToBase: 15000, isBaseCurrency: false},
    {id: 'curr3', code: 'TRY', name: 'ليرة تركية', symbol: '₺', exchangeRateToBase: 450, isBaseCurrency: false},
];
export async function getCurrencies(): Promise<Currency[]> { await new Promise(r=>setTimeout(r,50)); return JSON.parse(JSON.stringify(mockCurrencies)); }
export async function addCurrency(currencyData: Omit<Currency, 'id'>): Promise<Currency> {
  await new Promise(r=>setTimeout(r,100)); 
  if (mockCurrencies.some(c => c.code === currencyData.code.toUpperCase())) {
    throw new Error(`رمز العملة ${currencyData.code.toUpperCase()} موجود بالفعل.`);
  }
  const newCurrency: Currency = {...currencyData, id: `curr-${Date.now()}`, code: currencyData.code.toUpperCase()};
  if (newCurrency.isBaseCurrency && mockCurrencies.some(c => c.isBaseCurrency)) {
    throw new Error("يمكن تحديد عملة أساسية واحدة فقط. يرجى إلغاء تحديد العملة الأساسية الحالية أولاً.");
  }
  mockCurrencies.push(newCurrency); return JSON.parse(JSON.stringify(newCurrency));
}
export async function updateCurrency(id: string, currencyData: Partial<Omit<Currency, 'id'>>): Promise<Currency | null> {
  await new Promise(r=>setTimeout(r,100)); 
  const idx = mockCurrencies.findIndex(c=>c.id===id);
  if(idx !== -1) { 
    if (currencyData.code && currencyData.code.toUpperCase() !== mockCurrencies[idx].code && mockCurrencies.some(c => c.code === currencyData.code!.toUpperCase() && c.id !== id)) {
      throw new Error(`رمز العملة ${currencyData.code.toUpperCase()} موجود بالفعل لعملة أخرى.`);
    }
    if(currencyData.isBaseCurrency && mockCurrencies.some(c => c.isBaseCurrency && c.id !== id)) {
        throw new Error("يمكن تحديد عملة أساسية واحدة فقط. يرجى إلغاء تحديد العملة الأساسية الحالية أولاً.");
    }
    const updatedData = currencyData.code ? { ...currencyData, code: currencyData.code.toUpperCase() } : currencyData;
    mockCurrencies[idx] = {...mockCurrencies[idx], ...updatedData}; 
    return JSON.parse(JSON.stringify(mockCurrencies[idx])); 
  } return null;
}
export async function deleteCurrency(id: string): Promise<boolean> { 
  await new Promise(r=>setTimeout(r,100)); 
  const curr = mockCurrencies.find(c=>c.id===id); 
  if(curr && curr.isBaseCurrency) throw new Error("لا يمكن حذف العملة الأساسية.");
  const initialLength = mockCurrencies.length;
  mockCurrencies = mockCurrencies.filter(c => c.id !== id); 
  return mockCurrencies.length < initialLength;
}

export interface Tax { id: string; name: string; rate: number; isDefault: boolean; }
let mockTaxes: Tax[] = [ {id:'tax1', name:'ضريبة القيمة المضافة', rate: 15, isDefault: true }];
export async function getTaxes(): Promise<Tax[]> { await new Promise(r=>setTimeout(r,50)); return JSON.parse(JSON.stringify(mockTaxes)); }
export async function addTax(taxData: Omit<Tax, 'id'>): Promise<Tax> {
  await new Promise(r=>setTimeout(r,100)); 
  const newTax: Tax = {...taxData, id: `tax-${Date.now()}`};
  if(newTax.isDefault && mockTaxes.some(t => t.isDefault)) {
    mockTaxes.forEach(t => t.isDefault = false); // Demote other defaults
  }
  mockTaxes.push(newTax); return JSON.parse(JSON.stringify(newTax));
}
export async function updateTax(id: string, taxData: Partial<Omit<Tax, 'id'>>): Promise<Tax | null> {
  await new Promise(r=>setTimeout(r,100)); 
  const idx = mockTaxes.findIndex(t=>t.id===id);
  if(idx !== -1) { 
    if(taxData.isDefault && mockTaxes.some(t => t.isDefault && t.id !== id)) {
        mockTaxes.forEach(t => {if(t.id !== id) t.isDefault=false;}); // Demote other defaults
    }
    mockTaxes[idx] = {...mockTaxes[idx], ...taxData}; 
    return JSON.parse(JSON.stringify(mockTaxes[idx])); 
  } return null;
}
export async function deleteTax(id: string): Promise<boolean> { 
  await new Promise(r=>setTimeout(r,100)); 
  const initialLength = mockTaxes.length;
  mockTaxes = mockTaxes.filter(t=>t.id !== id); 
  return mockTaxes.length < initialLength;
}

export interface Discount { id: string; name: string; rate?: number; amount?: number; type: "percentage" | "fixed"; isDefault: boolean; }
let mockDiscounts: Discount[] = [ {id:'disc1', name:'خصم نهاية الموسم', rate: 10, type: 'percentage', isDefault: false }];
export async function getDiscounts(): Promise<Discount[]> { await new Promise(r=>setTimeout(r,50)); return JSON.parse(JSON.stringify(mockDiscounts)); }
export async function addDiscount(discountData: Omit<Discount, 'id'>): Promise<Discount> { /* Implement */ throw new Error("Not implemented"); }
export async function updateDiscount(id: string, discountData: Partial<Discount>): Promise<Discount | null> { /* Implement */ throw new Error("Not implemented"); }
export async function deleteDiscount(id: string): Promise<boolean> { /* Implement */ throw new Error("Not implemented"); }


export interface UnitOfMeasure { id: string; name: string; symbol: string; isBaseUnit: boolean; }
let mockUnits: UnitOfMeasure[] = [{id:'unit1', name:'قطعة', symbol:'قطعة', isBaseUnit: true}, {id:'unit2', name:'كيلوجرام', symbol:'كجم', isBaseUnit: false}];
export async function getUnitsOfMeasure(): Promise<UnitOfMeasure[]> { await new Promise(r=>setTimeout(r,50)); return JSON.parse(JSON.stringify(mockUnits)); }
export async function addUnitOfMeasure(unitData: Omit<UnitOfMeasure, 'id'>): Promise<UnitOfMeasure> {
  await new Promise(r=>setTimeout(r,100));
  const newUnit: UnitOfMeasure = {...unitData, id: `unit-${Date.now()}`};
  mockUnits.push(newUnit); return JSON.parse(JSON.stringify(newUnit));
}
export async function updateUnitOfMeasure(id: string, unitData: Partial<UnitOfMeasure>): Promise<UnitOfMeasure | null> {
  await new Promise(r=>setTimeout(r,100));
  const idx = mockUnits.findIndex(u => u.id === id);
  if (idx !== -1) {
    mockUnits[idx] = {...mockUnits[idx], ...unitData};
    return JSON.parse(JSON.stringify(mockUnits[idx]));
  } return null;
}
export async function deleteUnitOfMeasure(id: string): Promise<boolean> {
  await new Promise(r=>setTimeout(r,100));
  const initialLength = mockUnits.length;
  mockUnits = mockUnits.filter(u => u.id !== id);
  return mockUnits.length < initialLength;
}


export interface ProductCategory { id: string; name: string; parentCategoryId?: string; }
let mockCategories: ProductCategory[] = [{id:'cat1', name:'إلكترونيات'}, {id:'cat2', name:'مواد غذائية'}];
export async function getProductCategories(): Promise<ProductCategory[]> { await new Promise(r=>setTimeout(r,50)); return JSON.parse(JSON.stringify(mockCategories)); }
export async function addProductCategory(categoryData: Omit<ProductCategory, 'id'>): Promise<ProductCategory> {
  await new Promise(r=>setTimeout(r,100));
  const newCategory: ProductCategory = {...categoryData, id: `cat-${Date.now()}`};
  mockCategories.push(newCategory); return JSON.parse(JSON.stringify(newCategory));
}
export async function updateProductCategory(id: string, categoryData: Partial<ProductCategory>): Promise<ProductCategory | null> {
  await new Promise(r=>setTimeout(r,100));
  const idx = mockCategories.findIndex(c => c.id === id);
  if (idx !== -1) {
    // Prevent setting parentCategoryId to self
    if (categoryData.parentCategoryId === id) {
        throw new Error("لا يمكن تعيين الفئة كفئة رئيسية لنفسها.");
    }
    mockCategories[idx] = {...mockCategories[idx], ...categoryData};
    return JSON.parse(JSON.stringify(mockCategories[idx]));
  } return null;
}
export async function deleteProductCategory(id: string): Promise<boolean> {
    await new Promise(r=>setTimeout(r,100));
    // Basic check: prevent deletion if it's a parent to other categories
    if (mockCategories.some(c => c.parentCategoryId === id)) {
        throw new Error("لا يمكن حذف الفئة لأنها تحتوي على فئات فرعية. يرجى حذف الفئات الفرعية أولاً أو إعادة تعيين فئتها الرئيسية.");
    }
    const initialLength = mockCategories.length;
    mockCategories = mockCategories.filter(c => c.id !== id);
    return mockCategories.length < initialLength;
}
