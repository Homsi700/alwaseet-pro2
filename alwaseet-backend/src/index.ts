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
app.get('/', (req: Request, res: Response) => {
  res.send('مرحباً بك في الواجهة الخلفية لمشروع الوسيط - Backend!');
});

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
