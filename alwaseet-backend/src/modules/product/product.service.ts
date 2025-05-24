// alwaseet-backend/src/modules/product/product.service.ts
import { getPool } from '../../config/db';
import sql from 'mssql';

// Placeholder for Product type, adjust as per actual data structure
interface Product {
  ProductID: number;
  ProductName: string;
  UnitPrice: number;
  // Add other relevant fields
}

export const getProductsService = async (): Promise<Product[]> => {
  try {
    const pool = getPool();
    const result = await pool.request().query('SELECT ProductID, ProductName, UnitPrice FROM Products'); // Adjust query as needed

    if (result.recordset.length > 0) {
      return result.recordset as Product[];
    } else {
      // If Products table is empty or does not exist, return mock data
      console.warn('No products found in database or table does not exist. Returning mock data.');
      return [
        { ProductID: 1, ProductName: 'منتج وهمي 1', UnitPrice: 100 },
        { ProductID: 2, ProductName: 'منتج وهمي 2', UnitPrice: 200 },
      ];
    }
  } catch (error) {
    console.error('Error fetching products from database:', error);
    // If there's an error (e.g., table doesn't exist), return mock data
    // In a real app, you might want to throw the error or handle it differently
    console.warn('Error occurred. Returning mock data as fallback.');
    return [
      { ProductID: 1, ProductName: 'منتج وهمي 1 (خطأ)', UnitPrice: 100 },
      { ProductID: 2, ProductName: 'منتج وهمي 2 (خطأ)', UnitPrice: 200 },
    ];
  }
};
