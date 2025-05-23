
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
let mockStockMovements: StockMovement[] = [
    { id: 'sm1', date: '20/07/2024 10:00', itemSku: 'SKU-LAP-001', itemName: 'لابتوب ديل XPS (وهمي)', type: 'استلام', quantityChanged: 10, newQuantity: 50, reference: 'PO-123', user: 'admin' },
    { id: 'sm2', date: '21/07/2024 14:30', itemSku: 'SKU-COF-002', itemName: 'قهوة أرابيكا (وهمي)', type: 'صرف', quantityChanged: -5, newQuantity: 25, reference: 'SO-456', user: 'sales_user' },
];
let mockInventoryAlerts: InventoryAlert[] = [
    { id: 'alert1', type: 'مخزون منخفض', message: 'منتج "قهوة أرابيكا" وصل إلى نقطة إعادة الطلب.', severity: 'warning', date: '22/07/2024', itemSku: 'SKU-COF-002' },
    { id: 'alert2', type: 'انتهاء صلاحية قريب', message: 'دفعة من منتج "حليب طويل الأجل" ستنتهي صلاحيتها خلال أسبوع.', severity: 'destructive', date: '23/07/2024', itemSku: 'SKU-MILK-001' },
];
let mockInventoryCounts: InventoryCount[] = [
    {id: 'ic1', date: '01/07/2024', warehouseId: 'MAIN-WH', warehouseName: 'المستودع الرئيسي', status: 'مكتمل', countedBy: ' فريق الجرد أ', items: [
        {itemId: 'item1', itemName: 'لابتوب ديل XPS (وهمي)', expectedQty: 50, countedQty: 49, difference: -1},
        {itemId: 'item2', itemName: 'قهوة أرابيكا (وهمي)', expectedQty: 30, countedQty: 30, difference: 0},
    ]}
];

// Renamed from getStockMovements_mock
export async function getStockMovements(): Promise<StockMovement[]> {
  console.log("Fetching stock movements (mock service - to be connected)...");
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(mockStockMovements));
}

// Renamed from getInventoryAlerts_mock
export async function getInventoryAlerts(): Promise<InventoryAlert[]> {
  console.log("Fetching inventory alerts (mock service - to be connected)...");
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(mockInventoryAlerts));
}

// Renamed from getInventoryCounts_mock
export async function getInventoryCounts(): Promise<InventoryCount[]> {
  console.log("Fetching inventory counts (mock service - to be connected)...");
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(mockInventoryCounts));
}


// Renaming old functions to avoid conflict and make it clear they are mocks or deprecated
export async function getInventoryItems_mock(): Promise<Product[]> {
  console.log("Fetching inventory items (mock service - DEPRECATED, use getProducts for API or specific mocks if needed)...");
  // This function is problematic if other parts still expect it.
  // For now, let's return what getProducts would, to avoid breaking UI immediately
  // but this should ideally be removed and callers updated.
  // Simulating fetching via API for mock data consistency in UI if needed.
  // return getProducts(); 
  return []; // Or return an empty array if it's truly deprecated and no longer used.
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

export async function addInventoryItemWithGeneratedBarcode_mock(itemData: Omit<Product, 'id' | 'lastCountDate' | 'isGeneratedBarcode' | 'images'> & {barcode: string, images?: string[], isGeneratedBarcode: boolean}): Promise<Product> {
  console.log("Adding inventory item with generated barcode (mock service - DEPRECATED):", itemData);
   throw new Error("Mock function addInventoryItemWithGeneratedBarcode_mock is deprecated. Use createProduct.");
}
