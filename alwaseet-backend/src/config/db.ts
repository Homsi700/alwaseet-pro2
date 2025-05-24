import sql from 'mssql';

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER!,
  database: process.env.DB_DATABASE!,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // Use true for Azure SQL Database, false for local dev if not using SSL
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' // Change to true for local dev / self-signed certs
  }
};

let pool: sql.ConnectionPool;

export async function connectDb() {
  try {
    pool = await sql.connect(dbConfig);
    console.log('[Database]: تم الاتصال بقاعدة البيانات بنجاح.');
    // هنا يمكنك اختبار الاتصال بجلب بسيط إذا أردت
    // const result = await pool.request().query('SELECT GETDATE() AS CurrentDateTime');
    // console.log('Current DB Time:', result.recordset[0].CurrentDateTime);
  } catch (err) {
    console.error('[Database]: فشل الاتصال بقاعدة البيانات:', err);
    process.exit(1); // الخروج من التطبيق في حالة فشل الاتصال
  }
}

export async function disconnectDb() {
  try {
    if (pool && pool.connected) {
      await pool.close();
      console.log('[Database]: تم قطع الاتصال بقاعدة البيانات.');
    }
  } catch (err) {
    console.error('[Database]: خطأ أثناء قطع الاتصال:', err);
  }
}

export function getDbConnection() {
  if (!pool || !pool.connected) {
    throw new Error('[Database]: الاتصال بقاعدة البيانات غير موجود أو غير متصل. يرجى الاتصال أولاً.');
  }
  return pool;
}