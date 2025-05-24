import sql from 'mssql';

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
<<<<<<< HEAD
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
=======
  server: process.env.DB_SERVER || 'localhost', // Default to localhost if not specified
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // Use true if your SQL Server requires encryption
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' // Use true for local dev, false for production with valid certs
  }
};

let pool: ConnectionPool | null = null;

export const connectDB = async (): Promise<ConnectionPool> => {
  if (pool) {
    return pool;
  }
  try {
    console.log(`Attempting to connect to SQL Server: ${dbConfig.server}, Database: ${dbConfig.database}`);
    pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log('Successfully connected to SQL Server.');
    
    pool.on('error', err => {
      console.error('SQL Pool Error:', err);
      // Optionally try to reconnect or handle error
      pool = null; // Reset pool on error
    });

    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    // Exit process or throw error to prevent app from running without DB if critical
    process.exit(1); 
  }
};

export const getPool = (): ConnectionPool => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDB first.');
  }
  return pool;
};
>>>>>>> backend-setup-pr
