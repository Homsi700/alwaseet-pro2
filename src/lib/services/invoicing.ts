// src/lib/services/invoicing.ts
import api from '../api';
import type { Invoice, Payment, InvoiceType } from '@/types'; // Ensure this path is correct for Invoice and Payment types

// دالة لجلب جميع الفواتير
export const getInvoices = async (type?: InvoiceType): Promise<Invoice[]> => {
  try {
    const response = await api.get<Invoice[]>('/invoices', { params: type ? { type } : {} });
    return response.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    // Consider re-throwing a more specific error or handling it
    throw error;
  }
};

// دالة لجلب فاتورة واحدة بواسطة الـ ID
export const getInvoiceById = async (id: string): Promise<Invoice> => {
  try {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching invoice with ID ${id}:`, error);
    throw error;
  }
};

// دالة لإنشاء فاتورة جديدة
// Omit type as per backend's request for createInvoice input:
// Omit<Invoice, 'id' | 'payments' | 'totalAmount' | 'balanceDue' | 'status' | 'issueDate' | 'dueDate' | 'lastActivity'>
export const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'status' | 'amount' | 'taxAmount' | 'totalAmount' | 'balanceDue' | 'payments' | 'issueDate' | 'dueDate' | 'lastActivity'>): Promise<Invoice> => {
  try {
    // الـ Backend سيتولى توليد الـ ID, invoiceNumber, حساب المبالغ, وتعيين الحالة والتاريخ
    const response = await api.post<Invoice>('/invoices', invoiceData);
    return response.data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

// دالة لتحديث فاتورة موجودة
export const updateInvoice = async (id: string, invoiceData: Partial<Omit<Invoice, 'id' | 'invoiceNumber'>>): Promise<Invoice> => {
  try {
    const response = await api.put<Invoice>(`/invoices/${id}`, invoiceData);
    return response.data;
  } catch (error) {
    console.error(`Error updating invoice with ID ${id}:`, error);
    throw error;
  }
};

// دالة لحذف فاتورة
export const deleteInvoice = async (id: string): Promise<void> => {
  try {
    await api.delete(`/invoices/${id}`);
  } catch (error) {
    console.error(`Error deleting invoice with ID ${id}:`, error);
    throw error;
  }
};

// دالة لتغيير حالة الفاتورة إلى مدفوعة
export const markInvoiceAsPaid = async (id: string, paymentDate?: string): Promise<Invoice> => {
  try {
    const payload: { paymentDate?: string } = {};
    if (paymentDate) payload.paymentDate = paymentDate; // Ensure paymentDate is in YYYY-MM-DD format if sent
    const response = await api.post<Invoice>(`/invoices/${id}/mark-paid`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error marking invoice ${id} as paid:`, error);
    throw error;
  }
};

// دالة لإضافة دفعة جزئية لفاتورة
export const addPaymentToInvoice = async (invoiceId: string, paymentData: Omit<Payment, 'id'>): Promise<Invoice> => {
  try {
    // Ensure paymentData.paymentDate is in YYYY-MM-DD format if sent
    const response = await api.post<Invoice>(`/invoices/${invoiceId}/payments`, paymentData);
    return response.data;
  } catch (error) {
    console.error(`Error adding payment to invoice ${invoiceId}:`, error);
    throw error;
  }
};
