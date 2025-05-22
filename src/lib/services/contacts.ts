
// src/lib/services/contacts.ts
'use server';

import type { Contact } from '@/app/contacts/page'; // Assuming Contact type is exported from page

// Mock data - In a real app, this would come from a database
let mockContacts: Contact[] = [
  { id: 'cust1', name: 'نبيل القدسي (وهمي)', email: 'nabil.kad@example.com', phone: '0987654321', type: 'Customer', balance: 1500.75, lastActivity: 'فاتورة #101 - 15/07/2024', avatarUrl: 'https://placehold.co/100x100.png', avatarFallback: 'ن ق', companyName: 'شركة نبيل للتجارة', address: 'شارع النهضة، الرياض', taxNumber: '300123456789012', contactGroup: 'كبار العملاء', creditLimit: 10000, paymentTerms: '30 يوم صافي' },
  { id: 'supp2', name: 'شركة حمص للتوريدات (وهمي)', email: 'homs.supplies@example.com', phone: '0501234567', type: 'Supplier', balance: -500.00, lastActivity: 'فاتورة شراء #S050 - 10/07/2024', avatarUrl: 'https://placehold.co/100x100.png', avatarFallback: 'ش ح', companyName: 'شركة حمص للتوريدات المتحدة', address: 'المنطقة الصناعية، جدة', taxNumber: '300987654321098', paymentTerms: 'عند الاستلام' },
];

export async function getContacts(): Promise<Contact[]> {
  console.log("Fetching contacts (mock service)...", mockContacts);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return JSON.parse(JSON.stringify(mockContacts)); // Return a deep copy
}

export async function getContactById(id: string): Promise<Contact | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const contact = mockContacts.find(c => c.id === id);
  return contact ? JSON.parse(JSON.stringify(contact)) : undefined;
}

export async function addContact(contactData: Omit<Contact, 'id' | 'avatarFallback' | 'lastActivity' | 'balance' | 'avatarUrl'>): Promise<Contact> {
  console.log("Adding contact (mock service):", contactData);
  await new Promise(resolve => setTimeout(resolve, 500));
  const newContact: Contact = {
    ...contactData,
    id: `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    avatarFallback: contactData.name.substring(0, 2).toUpperCase() || '??',
    avatarUrl: `https://placehold.co/100x100.png?text=${encodeURIComponent(contactData.name.substring(0,2))}`,
    balance: 0, // Initial balance, might be adjusted by initial transactions
    lastActivity: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
  };
  mockContacts.push(newContact);
  return JSON.parse(JSON.stringify(newContact));
}

export async function updateContact(id: string, contactData: Partial<Omit<Contact, 'id' | 'avatarFallback' | 'lastActivity' | 'balance' | 'avatarUrl'>>): Promise<Contact | null> {
  console.log("Updating contact (mock service):", id, contactData);
  await new Promise(resolve => setTimeout(resolve, 500));
  const contactIndex = mockContacts.findIndex(c => c.id === id);
  if (contactIndex !== -1) {
    mockContacts[contactIndex] = { 
      ...mockContacts[contactIndex], 
      ...contactData,
      avatarFallback: contactData.name ? contactData.name.substring(0, 2).toUpperCase() : mockContacts[contactIndex].avatarFallback,
      // avatarUrl might need updating if name changes significantly
    };
    return JSON.parse(JSON.stringify(mockContacts[contactIndex]));
  }
  return null;
}

export async function deleteContact(id: string): Promise<boolean> {
  console.log("Deleting contact (mock service):", id);
  await new Promise(resolve => setTimeout(resolve, 500));
  const initialLength = mockContacts.length;
  mockContacts = mockContacts.filter(c => c.id !== id);
  return mockContacts.length < initialLength;
}
