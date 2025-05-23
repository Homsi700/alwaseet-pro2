// alwaseet-backend/src/config/db.ts
import sql, { ConnectionPool } from 'mssql';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
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
