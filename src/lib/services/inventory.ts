// src/lib/services/inventory.ts
'use server';

// استيراد النوع InventoryItem من مكانه الصحيح
import type { InventoryItem, StockMovement, InventoryAlert, InventoryCount } from '@/app/inventory/page';

// --- Mock Data ---
let mockInventoryItems: InventoryItem[] = [
  { id: 'item1', name: 'لابتوب ديل XPS 15 (وهمي)', sku: 'DELL-XPS15-001', barcode: '1234567890123', category: 'إلكترونيات', unitOfMeasure: 'قطعة', quantity: 25, reorderPoint: 5, costPrice: 4500, sellingPrice: 5500, supplierName: 'شركة ديل السعودية', warehouseName: 'المستودع الرئيسي', expiryDate: '', lastCountDate: '01/07/2024', images: ['https://placehold.co/100x100.png?text=لابتوب'], notes: 'لابتوب بمعالج i7 وذاكرة 16GB', alternativeUnits: [{unit: "كرتونة", conversionFactor: 5}], isGeneratedBarcode: false },
  { id: 'item2', name: 'قهوة أرابيكا فاخرة (وهمي)', sku: 'COF-ARA-002', barcode: '9876543210987', category: 'مواد غذائية', unitOfMeasure: 'كجم', quantity: 10, reorderPoint: 2, costPrice: 60, sellingPrice: 80, supplierName: 'محمصة البن الذهبي', warehouseName: 'مستودع المواد الغذائية', expiryDate: '31/12/2025', lastCountDate: '15/06/2024', images: ['https://placehold.co/100x100.png?text=قهوة'], notes: 'بن أرابيكا 100%، تحميص متوسط', isGeneratedBarcode: false  },
  { id: 'item3', name: 'ورق طباعة A4 (وهمي)', sku: 'PAP-A4-WH-003', barcode: '1122334455667', category: 'أدوات مكتبية', unitOfMeasure: 'رزنة', quantity: 100, reorderPoint: 20, costPrice: 15, sellingPrice: 20, supplierName: 'مكتبة النهضة', warehouseName: 'المستودع الرئيسي', lastCountDate: '01/07/2024', isGeneratedBarcode: false  },
];

let mockStockMovements: StockMovement[] = [
    { id: 'sm1', date: '20/07/2024 10:00', itemSku: 'DELL-XPS15-001', itemName: 'لابتوب ديل XPS 15 (وهمي)', type: 'استلام', quantityChanged: 10, newQuantity: 25, reference: 'PO-123', user: 'admin' },
    { id: 'sm2', date: '21/07/2024 14:30', itemSku: 'COF-ARA-002', itemName: 'قهوة أرابيكا فاخرة (وهمي)', type: 'صرف', quantityChanged: -5, newQuantity: 10, reference: 'SO-456', user: 'sales_user' },
];
let mockInventoryAlerts: InventoryAlert[] = [
    { id: 'alert1', type: 'مخزون منخفض', message: 'منتج "قهوة أرابيكا" وصل إلى نقطة إعادة الطلب.', severity: 'warning', date: '22/07/2024', itemSku: 'COF-ARA-002' },
];
let mockInventoryCounts: InventoryCount[] = [
    {id: 'ic1', date: '01/07/2024', warehouseId: 'MAIN-WH', warehouseName: 'المستودع الرئيسي', status: 'مكتمل', countedBy: ' فريق الجرد أ', items: [
        {itemId: 'item1', itemName: 'لابتوب ديل XPS (وهمي)', expectedQty: 15, countedQty: 15, difference: 0},
        {itemId: 'item2', itemName: 'قهوة أرابيكا (وهمي)', expectedQty: 15, countedQty: 15, difference: 0},
    ]}
];

// --- Service Functions (CRUD on Mock Data) ---

export async function getProducts(): Promise<InventoryItem[]> {
  console.log("Service: getProducts (mock) called");
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
  return JSON.parse(JSON.stringify(mockInventoryItems));
}

export async function getProductById(id: string): Promise<InventoryItem | undefined> {
  console.log(`Service: getProductById (mock) called with id: ${id}`);
  await new Promise(resolve => setTimeout(resolve, 50));
  const item = mockInventoryItems.find(p => p.id === id);
  return item ? JSON.parse(JSON.stringify(item)) : undefined;
}

export async function createProduct(productData: Omit<InventoryItem, 'id' | 'lastCountDate' | 'images'> & { images?: string[] }): Promise<InventoryItem> {
  console.log("Service: createProduct (mock) called with", productData);
  await new Promise(resolve => setTimeout(resolve, 100));
  const newProduct: InventoryItem = {
    ...productData,
    id: `item-${Date.now()}`,
    lastCountDate: new Date().toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    images: productData.images || [],
    isGeneratedBarcode: !!productData.barcode?.startsWith("INT-"), // A simple check
  };
  mockInventoryItems.push(newProduct);
  return JSON.parse(JSON.stringify(newProduct));
}

export async function updateProduct(id: string, productUpdateData: Partial<Omit<InventoryItem, 'id'>>): Promise<InventoryItem | null> {
  console.log(`Service: updateProduct (mock) called for id: ${id} with`, productUpdateData);
  await new Promise(resolve => setTimeout(resolve, 100));
  const productIndex = mockInventoryItems.findIndex(p => p.id === id);
  if (productIndex !== -1) {
    mockInventoryItems[productIndex] = { ...mockInventoryItems[productIndex], ...productUpdateData };
    return JSON.parse(JSON.stringify(mockInventoryItems[productIndex]));
  }
  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  console.log(`Service: deleteProduct (mock) called for id: ${id}`);
  await new Promise(resolve => setTimeout(resolve, 100));
  const initialLength = mockInventoryItems.length;
  mockInventoryItems = mockInventoryItems.filter(p => p.id !== id);
  return mockInventoryItems.length < initialLength;
}

export async function getInventoryItemByBarcode(barcode: string): Promise<InventoryItem | undefined> {
  console.log(`Service: getInventoryItemByBarcode (mock) called with barcode: ${barcode}`);
  await new Promise(resolve => setTimeout(resolve, 50));
  const item = mockInventoryItems.find(p => p.barcode === barcode);
  return item ? JSON.parse(JSON.stringify(item)) : undefined;
}

// --- Other Mock Service Functions ---
export async function getStockMovements(): Promise<StockMovement[]> {
  console.log("Service: getStockMovements (mock) called");
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(mockStockMovements));
}

export async function getInventoryAlerts(): Promise<InventoryAlert[]> {
  console.log("Service: getInventoryAlerts (mock) called");
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(mockInventoryAlerts));
}

export async function getInventoryCounts(): Promise<InventoryCount[]> {
  console.log("Service: getInventoryCounts (mock) called");
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(mockInventoryCounts));
}

// This function was specific to how the frontend dialog was structured for generating barcodes.
// The createProduct function can handle this logic.
export async function addInventoryItemWithGeneratedBarcode(itemData: Omit<InventoryItem, 'id' | 'lastCountDate' | 'images'> & { images?: string[], isGeneratedBarcode: boolean }): Promise<InventoryItem> {
  console.log("Service: addInventoryItemWithGeneratedBarcode (mock) called with", itemData);
  return createProduct(itemData); // Reuse createProduct logic
}
