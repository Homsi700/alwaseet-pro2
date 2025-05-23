// src/lib/api/index.ts
// هذا الملف يقوم بتهيئة عميل Axios للاتصال بالخدمات (سواء وهمية أو حقيقية)

import axios from 'axios';
import {
  initializeMockServices,
  mockGetContacts,
  mockCreateContact,
  mockUpdateContact,
  mockDeleteContact,
  mockGetContactById,
  mockGetProducts,
  mockCreateProduct,
  mockUpdateProduct,
  mockDeleteProduct,
  mockGetProductById,
  mockGetInventoryItemByBarcode,
  mockGetInventoryCounts,
  mockGetInventoryAlerts,
  mockGetStockMovements,
  mockGetInvoices,
  mockGetInvoiceById,
  mockCreateInvoice,
  mockUpdateInvoice,
  mockDeleteInvoice,
  mockMarkInvoiceAsPaid,
  mockAddPaymentToInvoice,
} from './mockServices'; // تأكدي أن هذا المسار صحيح

// تهيئة الخدمات الوهمية بمجرد تحميل التطبيق
// هذا الجزء سيتولى اعتراض طلبات Axios وتوفير بيانات وهمية بدلاً من الاتصال بـ API حقيقي
// initializeMockServices(); // تم التعليق مؤقتًا حتى يتم تنفيذ mockServices.ts بشكل كامل

// إنشاء عميل Axios افتراضي
// في هذه المرحلة، بما أننا نستخدم الـ mock services، فإن baseURL لا يهم كثيراً لأنه سيتم اعتراض الطلبات
// ولكن من الجيد تحديده بعنوان وهمي ليكون جاهزاً للانتقال إلى API حقيقي لاحقاً
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // عنوان وهمي أو افتراضي لـ API في المستقبل
  timeout: 10000, // مهلة 10 ثوانٍ للطلب
  headers: {
    'Content-Type': 'application/json',
    // يمكن إضافة headers أخرى هنا لاحقاً مثل التوثيق (Authorization)
  },
});

// مثال للتعامل مع الأخطاء (يمكننا توسيعها لاحقاً)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized request, consider redirecting to login...");
      // For example: window.location.href = '/login';
    }
    // يمكنك إضافة معالجة لأنواع أخرى من الأخطاء هنا
    // مثل أخطاء الشبكة (error.message === 'Network Error')
    // أو أخطاء timeout
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        console.error('Request timed out:', error);
    } else if (error.message === 'Network Error') {
        console.error('Network Error. Ensure the backend server is running and accessible.', error);
    }
    
    return Promise.reject(error);
  }
);

export default api;

export const contactService = {
  getContacts: mockGetContacts,
  getContactById: mockGetContactById,
  createContact: mockCreateContact,
  updateContact: mockUpdateContact,
  deleteContact: mockDeleteContact,
};

export const inventoryService = {
  getProducts: mockGetProducts,
  getProductById: mockGetProductById,
  createProduct: mockCreateProduct,
  updateProduct: mockUpdateProduct,
  deleteProduct: mockDeleteProduct,
  getInventoryItemByBarcode: mockGetInventoryItemByBarcode,
  getInventoryCounts: mockGetInventoryCounts,
  getInventoryAlerts: mockGetInventoryAlerts,
  getStockMovements: mockGetStockMovements,
};

export const invoicingService = {
  getInvoices: mockGetInvoices,
  getInvoiceById: mockGetInvoiceById,
  createInvoice: mockCreateInvoice,
  updateInvoice: mockUpdateInvoice,
  deleteInvoice: mockDeleteInvoice,
  markInvoiceAsPaid: mockMarkInvoiceAsPaid,
  addPaymentToInvoice: mockAddPaymentToInvoice,
};
