
// src/lib/services/settings.ts
'use server';

export interface GeneralSettings {
  companyName: string;
  taxNumber?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  baseCurrency: string; // e.g., "SYP", "USD"
  enableEInvoice: boolean;
  // Add other general settings as needed
}

// Mock initial settings - in a real app, this would come from a database or config file
let mockGeneralSettings: GeneralSettings = {
  companyName: "شركة الوسيط برو (الافتراضية)",
  taxNumber: "1234567890123",
  companyAddress: "شارع الحمراء، دمشق، سوريا",
  companyPhone: "+963 11 123 4567",
  companyEmail: "info@alwaseet.pro",
  baseCurrency: "SYP", // Syrian Pound as default
  enableEInvoice: true, 
};

export async function getGeneralSettings(): Promise<GeneralSettings> {
  console.log("Fetching general settings (mock service)...");
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return JSON.parse(JSON.stringify(mockGeneralSettings));
}

export async function updateGeneralSettings(updatedSettings: Partial<GeneralSettings>): Promise<GeneralSettings> {
  console.log("Updating general settings (mock service):", updatedSettings);
  await new Promise(resolve => setTimeout(resolve, 300));
  mockGeneralSettings = { ...mockGeneralSettings, ...updatedSettings };
  return JSON.parse(JSON.stringify(mockGeneralSettings));
}


// You can add more settings-related functions here for users, branches, currencies, etc.
// For example:

export interface UserSetting {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string; // "مدير", "محاسب", etc.
  isActive: boolean;
}
// let mockUsers: UserSetting[] = [...];
// export async function getUsers(): Promise<UserSetting[]> { ... }
// export async function addUser(userData: Omit<UserSetting, 'id'>): Promise<UserSetting> { ... }
// etc.

export interface CurrencySetting {
    id: string;
    code: string; 
    name: string; 
    symbol: string; 
    exchangeRateToBase: number; 
    isBaseCurrency: boolean;
}
// Similar mock and functions for currencies
