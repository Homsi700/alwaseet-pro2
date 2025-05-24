<<<<<<< HEAD
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

=======
// alwaseet-backend/src/index.ts
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv'; // Ensure dotenv is imported if not already
import { connectDB } from './config/db'; // Import connectDB function
import productRoutes from './modules/product/product.routes'; // Import product routes

// Load environment variables from .env file
// This should be at the top, especially if other modules need env vars at import time
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001; // Changed default to 3001 to avoid potential conflict with frontend

// Middleware to parse JSON request bodies
app.use(express.json());
// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', productRoutes); // Register product routes under /api prefix (e.g., /api/products)

// Root route
>>>>>>> backend-setup-pr
app.get('/', (req: Request, res: Response) => {
  res.send('مرحباً بك في الواجهة الخلفية لمشروع الوسيط - Backend!');
});

<<<<<<< HEAD
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
=======
const startServer = async () => {
  try {
    await connectDB(); // Establish database connection
    app.listen(port, () => {
      console.log(`[server]: الخادم يعمل على المنفذ http://localhost:${port}`);
      console.log(`[server]: نقطة نهاية المنتجات متاحة على http://localhost:${port}/api/products`);
    });
  } catch (error) {
    console.error('[server]: فشل في بدء تشغيل الخادم بسبب خطأ في الاتصال بقاعدة البيانات', error);
    process.exit(1); // Exit if DB connection fails
  }
};

startServer();
>>>>>>> backend-setup-pr
