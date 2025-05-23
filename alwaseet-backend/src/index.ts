import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware لتحليل جسم الطلبات كـ JSON
app.use(express.json());
// Middleware لتحليل أجسام الطلبات المشفّرة بالـ URL
app.use(express.urlencoded({ extended: true }));

// مثال بسيط لـ Route أساسي
app.get('/', (req: Request, res: Response) => {
  res.send('مرحباً بك في الواجهة الخلفية لمشروع الوسيط - Backend!');
});

app.listen(port, () => {
  console.log(`[server]: الخادم يعمل على المنفذ http://localhost:${port}`);
});