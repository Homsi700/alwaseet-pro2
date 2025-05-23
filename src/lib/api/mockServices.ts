// src/lib/api/mockServices.ts
// هذا الملف مخصص لتهيئة اعتراضات Axios وتوفير بيانات وهمية
// يمكن استخدام مكتبة مثل axios-mock-adapter هنا

// import MockAdapter from 'axios-mock-adapter';
// import api from './index'; // استيراد نسخة api المهيأة
// import { mockInventoryItems } from '../services/inventory'; // مثال لاستيراد بيانات وهمية
// import { mockContacts } from '../services/contacts';

export function initializeMockServices() {
  console.log("Initializing mock services (placeholder)...");

  // const mock = new MockAdapter(api, { delayResponse: 500 });

  // مثال على كيفية اعتراض طلب GET لـ /products
  // mock.onGet('/products').reply(200, mockInventoryItems);

  // مثال على كيفية اعتراض طلب POST لـ /contacts
  // mock.onPost('/contacts').reply(config => {
  //   const newContactData = JSON.parse(config.data);
  //   const newContact = { ...newContactData, id: `contact-${Date.now()}` };
  //   // يمكن إضافة منطق لتحديث mockContacts هنا إذا أردنا محاكاة الإضافة
  //   return [201, newContact];
  // });

  // أضف هنا تهيئة لجميع الـ APIs الأخرى التي تحتاج إلى محاكاة
  // ...

  // إذا لم يتم اعتراض طلب، دعه يمر (أو يفشل إذا لم يكن هناك API حقيقي)
  // mock.onAny().passThrough();
}
