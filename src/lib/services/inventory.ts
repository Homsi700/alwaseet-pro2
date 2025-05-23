
// src/lib/services/inventory.ts
'use server';
import api from '../api';
import type { InventoryItem as Product, StockMovement, InventoryAlert, InventoryCount } from '@/app/inventory/page'; // Using InventoryItem as Product

// دالة لجلب جميع المنتجات/الأصناف
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Consider re-throwing a more specific error or handling it as per app's error strategy
    throw error;
  }
};

// دالة لجلب منتج/صنف واحد بواسطة الـ ID
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

// دالة لإنشاء منتج/صنف جديد
// The backend will assign 'id', 'lastCountDate', and potentially 'isGeneratedBarcode'
export const createProduct = async (productData: Omit<Product, 'id' | 'lastCountDate' | 'isGeneratedBarcode' | 'images'> & { images?: string[] }): Promise<Product> => {
  try {
    const response = await api.post<Product>('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// دالة لتحديث منتج/صنف موجود
export const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'lastCountDate'>>): Promise<Product> => {
  try {
    const response = await api.put<Product>(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw error;
  }
};

// دالة لحذف منتج/صنف
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await api.delete(`/products/${id}`);
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw error;
  }
};


// --- Placeholder for other inventory-related service functions that might be re-added or connected later ---

// Example: If getInventoryItemByBarcode is still needed from frontend and backend provides it
export async function getInventoryItemByBarcode(barcode: string): Promise<Product | undefined> {
  try {
    // Assuming your backend has an endpoint like GET /products?barcode=XXXX
    // Or a specific endpoint GET /products/barcode/XXXX
    const response = await api.get<Product[]>(`/products?barcode=${barcode}`);
    if (response.data && response.data.length > 0) {
      return response.data[0]; // Assuming barcode is unique
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching product by barcode ${barcode}:`, error);
    // Decide if to throw or return undefined based on expected behavior
    // For a "not found" case, returning undefined might be appropriate.
    // For other errors, re-throwing might be better.
    if ((error as any).response && (error as any).response.status === 404) {
        return undefined;
    }
    throw error;
  }
}


// --- Mock service functions for other inventory aspects - to be replaced or removed ---
let mockStockMovements: StockMovement[] = [];
let mockInventoryAlerts: InventoryAlert[] = [];
let mockInventoryCounts: InventoryCount[] = [];

export async function getStockMovements(): Promise<StockMovement[]> {
  console.log("Fetching stock movements (mock service - to be connected)...");
  // TODO: Connect to backend API: await api.get('/stock-movements');
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(mockStockMovements));
}

export async function getInventoryAlerts(): Promise<InventoryAlert[]> {
  console.log("Fetching inventory alerts (mock service - to be connected)...");
  // TODO: Connect to backend API: await api.get('/inventory-alerts');
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(mockInventoryAlerts));
}

export async function getInventoryCounts(): Promise<InventoryCount[]> {
  console.log("Fetching inventory counts (mock service - to be connected)...");
  // TODO: Connect to backend API: await api.get('/inventory-counts');
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(mockInventoryCounts));
}

// For addInventoryItemWithGeneratedBarcode, the logic of generating barcode
// might now reside in the backend or the createProduct endpoint handles it.
// If specific frontend logic for barcode generation before sending to backend is needed,
// it can be re-added or adjusted.
// For now, createProduct will be the primary way to add new products.

// Renaming old functions to avoid conflict and make it clear they are mocks or deprecated
export async function getInventoryItems_mock(): Promise<Product[]> {
  console.log("Fetching inventory items (mock service - DEPRECATED)...");
  return []; // Return empty or original mock data if needed for other parts temporarily
}

export async function addInventoryItem_mock(itemData: Omit<Product, 'id' | 'lastCountDate'>): Promise<Product> {
  console.log("Adding inventory item (mock service - DEPRECATED):", itemData);
  throw new Error("Mock function addInventoryItem_mock is deprecated. Use createProduct.");
}

export async function updateInventoryItem_mock(id: string, itemData: Partial<Omit<Product, 'id' | 'lastCountDate'>>): Promise<Product | null> {
  console.log("Updating inventory item (mock service - DEPRECATED):", id, itemData);
  throw new Error("Mock function updateInventoryItem_mock is deprecated. Use updateProduct.");
}

export async function deleteInventoryItem_mock(id: string): Promise<boolean> {
  console.log("Deleting inventory item (mock service - DEPRECATED):", id);
  throw new Error("Mock function deleteInventoryItem_mock is deprecated. Use deleteProduct.");
}

export async function addInventoryItemWithGeneratedBarcode_mock(itemData: Omit<Product, 'id' | 'lastCountDate'> & {barcode: string}): Promise<Product> {
  console.log("Adding inventory item with generated barcode (mock service - DEPRECATED):", itemData);
   throw new Error("Mock function addInventoryItemWithGeneratedBarcode_mock is deprecated. Use createProduct.");
}
