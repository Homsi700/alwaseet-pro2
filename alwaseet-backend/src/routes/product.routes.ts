import { Router } from 'express';
import { getProducts } from '../services/product.service.js'; // تم إضافة .js

const router = Router();

// نقطة نهاية لجلب جميع المنتجات
router.get('/', async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    console.error('[Product Routes]: خطأ في معالجة طلب جلب المنتجات:', error);
    res.status(500).json({ message: 'فشل جلب المنتجات.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;