
// src/lib/services/inventory.ts
'use server';
import type { InventoryItem, StockMovement, InventoryAlert, InventoryCount } from '@/app/inventory/page'; // Ensure types are exported from page or a types file

let mockInventoryItems: InventoryItem[] = [
  {
    id: 'item1', name: 'لابتوب ديل XPS 13 (وهمي)', sku: 'DELL-XPS13-I7', barcode: '1234567890123', category: 'إلكترونيات', unitOfMeasure: 'قطعة', quantity: 15, reorderPoint: 5, costPrice: 4500, sellingPrice: 5500, supplierName: 'شركة ديل السعودية', warehouseName: 'المستودع الرئيسي', expiryDate: undefined, lastCountDate: '01/07/2024', images: ['https://placehold.co/100x100.png?text=XPS13'], notes: 'شاشة لمس، 16GB RAM, 512GB SSD', alternativeUnits: [{ unit: 'كرتونة', conversionFactor: 5 }]
  },
  {
    id: 'item2', name: 'قهوة أرابيكا فاخرة (وهمي)', sku: 'COFF-ARABICA-PREM', barcode: '9876543210987', category: 'مواد غذائية', unitOfMeasure: 'كجم', quantity: 2, reorderPoint: 10, costPrice: 80, sellingPrice: 120, supplierName: 'محمصة البن الذهبي', warehouseName: 'مستودع المواد الغذائية', expiryDate: '31/12/2025', lastCountDate: '15/06/2024', images: ['https://placehold.co/100x100.png?text=قهوة']
  },
  {
    id: 'item3', name: 'طابعة HP LaserJet Pro (وهمي)', sku: 'HP-LJPRO-M404', category: 'أجهزة مكتبية', unitOfMeasure: 'جهاز', quantity: 0, reorderPoint: 2, costPrice: 750, sellingPrice: 950, lastCountDate: '10/05/2024', images: ['https://placehold.co/100x100.png?text=طابعةHP'], barcode: '1122334455667'
  }
];

let mockStockMovements: StockMovement[] = [];
let mockInventoryAlerts: InventoryAlert[] = [];
let mockInventoryCounts: InventoryCount[] = [];


export async function getInventoryItems(): Promise<InventoryItem[]> {
  console.log("Fetching inventory items (mock service)...", mockInventoryItems);
  await new Promise(resolve => setTimeout(resolve, 500));
  return JSON.parse(JSON.stringify(mockInventoryItems));
}

export async function getInventoryItemById(id: string): Promise<InventoryItem | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const item = mockInventoryItems.find(i => i.id === id);
  return item ? JSON.parse(JSON.stringify(item)) : undefined;
}

export async function getInventoryItemByBarcode(barcode: string): Promise<InventoryItem | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const item = mockInventoryItems.find(i => i.barcode === barcode);
  return item ? JSON.parse(JSON.stringify(item)) : undefined;
}

export async function addInventoryItem(itemData: Omit<InventoryItem, 'id' | 'lastCountDate'>): Promise<InventoryItem> {
  console.log("Adding inventory item (mock service):", itemData);
  await new Promise(resolve => setTimeout(resolve, 500));
  const newItem: InventoryItem = {
    ...itemData,
    id: `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    lastCountDate: new Date().toLocaleDateString('ar-EG'),
    images: itemData.images || (itemData.name ? [`https://placehold.co/100x100.png?text=${encodeURIComponent(itemData.name.substring(0,10))}`] : []),
  };
  mockInventoryItems.push(newItem);
  return JSON.parse(JSON.stringify(newItem));
}

export async function updateInventoryItem(id: string, itemData: Partial<Omit<InventoryItem, 'id' | 'lastCountDate'>>): Promise<InventoryItem | null> {
  console.log("Updating inventory item (mock service):", id, itemData);
  await new Promise(resolve => setTimeout(resolve, 500));
  const itemIndex = mockInventoryItems.findIndex(i => i.id === id);
  if (itemIndex !== -1) {
    mockInventoryItems[itemIndex] = { ...mockInventoryItems[itemIndex], ...itemData };
    return JSON.parse(JSON.stringify(mockInventoryItems[itemIndex]));
  }
  return null;
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  console.log("Deleting inventory item (mock service):", id);
  await new Promise(resolve => setTimeout(resolve, 500));
  const initialLength = mockInventoryItems.length;
  mockInventoryItems = mockInventoryItems.filter(i => i.id !== id);
  return mockInventoryItems.length < initialLength;
}


// Mock service functions for StockMovements
export async function getStockMovements(): Promise<StockMovement[]> {
  console.log("Fetching stock movements (mock service)...");
  await new Promise(resolve => setTimeout(resolve, 300));
  return JSON.parse(JSON.stringify(mockStockMovements));
}

// Mock service functions for InventoryAlerts
export async function getInventoryAlerts(): Promise<InventoryAlert[]> {
  console.log("Fetching inventory alerts (mock service)...");
  await new Promise(resolve => setTimeout(resolve, 300));
   // Auto-generate low stock alerts for example
  const lowStockAlerts: InventoryAlert[] = mockInventoryItems
    .filter(item => item.quantity > 0 && item.quantity <= item.reorderPoint)
    .map(item => ({
      id: `alert-low-${item.id}`,
      type: "مخزون منخفض",
      message: `المنتج "${item.name}" (SKU: ${item.sku}) وصل إلى نقطة إعادة الطلب (${item.reorderPoint}). الكمية الحالية: ${item.quantity}.`,
      severity: "warning",
      date: new Date().toLocaleDateString('ar-EG'),
      itemSku: item.sku
    }));
  const outOfStockAlerts: InventoryAlert[] = mockInventoryItems
    .filter(item => item.quantity <= 0)
    .map(item => ({
      id: `alert-out-${item.id}`,
      type: "منتج على وشك النفاذ", // Or "نفذ المخزون"
      message: `المنتج "${item.name}" (SKU: ${item.sku}) قد نفذ من المخزون.`,
      severity: "destructive",
      date: new Date().toLocaleDateString('ar-EG'),
      itemSku: item.sku
    }));
  return JSON.parse(JSON.stringify([...mockInventoryAlerts, ...lowStockAlerts, ...outOfStockAlerts]));
}

// Mock service functions for InventoryCounts
export async function getInventoryCounts(): Promise<InventoryCount[]> {
  console.log("Fetching inventory counts (mock service)...");
  await new Promise(resolve => setTimeout(resolve, 300));
  return JSON.parse(JSON.stringify(mockInventoryCounts));
}
