import { getDbConnection } from '../config/db.js'; // تم إضافة .js
import sql from 'mssql';

export async function getProducts() {
  try {
    const pool = getDbConnection();
    // تأكد من وجود جدول Products في قاعدة بياناتك.
    // إذا لم يكن موجوداً أو كان فارغاً، يمكنك إرجاع بيانات وهمية بدلاً من ذلك.
    const result = await pool.request().query('SELECT * FROM Products');
    if (result.recordset.length > 0) {
      return result.recordset; // إرجاع المنتجات الحقيقية من قاعدة البيانات
    } else {
      console.warn('[Products Service]: جدول المنتجات فارغ أو غير موجود. جلب بيانات وهمية.');
      return getMockProducts(); // إرجاع بيانات وهمية إذا لم تكن هناك بيانات حقيقية
    }
  } catch (error) {
    console.error('[Products Service]: خطأ أثناء جلب المنتجات من قاعدة البيانات:', error);
    // يمكنك هنا التعامل مع الخطأ بطريقة أفضل، مثلاً رميه ليتم التعامل معه في الـ controller
    return getMockProducts(); // في حالة وجود خطأ، لا يزال بإمكاننا إرجاع بيانات وهمية
  }
}

function getMockProducts() {
  return [
    { id: 1, name: 'منتج تجريبي 1', description: 'وصف للمنتج التجريبي الأول.', price: 100.00 },
    { id: 2, name: 'منتج تجريبي 2', description: 'وصف للمنتج التجريبي الثاني.', price: 250.50 },
    { id: 3, name: 'منتج تجريبي 3', description: 'وصف للمنتج التجريبي الثالث.', price: 75.20 }
  ];
}