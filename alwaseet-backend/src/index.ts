import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
// يجب أن يكون المسار يشمل .js عند الاستيراد من ملفات داخل المشروع
import { connectDb, disconnectDb } from './config/db.js'; 
import productRoutes from './routes/product.routes.js'; 
// cors هو مكتبة خارجية، لا يحتاج إلى .js
import cors from 'cors'; 

dotenv.config(); 

const app: Express = express();
const port = process.env.PORT || 3001; // استخدام المنفذ 3001 افتراضيا

// Middleware لتحليل جسم الطلبات كـ JSON
app.use(express.json());
// Middleware لتحليل أجسام الطلبات المشفّرة بالـ URL
app.use(express.urlencoded({ extended: true }));

app.use(cors());

connectDb();

app.use('/api/products', productRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('مرحباً بك في الواجهة الخلفية لمشروع الوسيط - Backend!');
});

const server = app.listen(port, () => {
  console.log(`[server]: الخادم يعمل على المنفذ http://localhost:${port}`);
  console.log(`[server]: نقطة نهاية المنتجات متاحة على http://localhost:${port}/api/products`);
});

process.on('SIGTERM', async () => {
  console.log('[server]: إشارة SIGTERM مستلمة، إغلاق الخادم...');
  await disconnectDb();
  server.close(() => {
    console.log('[server]: الخادم مغلق.');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('[server]: إشارة SIGINT مستلمة، إغلاق الخادم...');
  await disconnectDb();
  server.close(() => {
    console.log('[server]: الخادم مغلق.');
    process.exit(0);
  });
});