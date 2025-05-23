// src/lib/api/index.ts
import axios from 'axios';

// هذا هو الرابط الأساسي (Base URL) للـ Backend API الحقيقي
// IMPORTANT: Make sure this URL is accessible from where the frontend is running.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.1.100:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // يمكننا إضافة Header لـ Authorization (مثل Token) هنا لاحقاً عندما نصل لميزة تسجيل الدخول
  },
});

api.interceptors.response.use(
  response => response,
  error => {
    // مثال للتعامل مع الأخطاء (يمكننا توسيعها لاحقاً)
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized request, redirecting to login...");
      // يرجى التأكد من أن الواجهة الأمامية تتعامل مع هذه الحالة بتوجيه المستخدم لصفحة تسجيل الدخول
      // For example: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
