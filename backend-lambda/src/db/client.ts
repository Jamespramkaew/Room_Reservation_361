import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Singleton pattern - สร้าง connection เพียงครั้งเดียว
let db: ReturnType<typeof drizzle> | null = null;

/**
 * Get database instance
 * - ใช้ singleton pattern เพื่อไม่ให้สร้าง connection ซ้ำซ้อน
 * - สำคัญมากใน Lambda เพราะ Lambda จะ reuse container
 */
export function getDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    
    console.log('Creating new database connection...');
    
    // สร้าง PostgreSQL client
    const client = postgres(connectionString, { 
      max: 1,              // Lambda best practice: ใช้ 1 connection
      idle_timeout: 20,    // ปิด connection ถ้าไม่ใช้งาน 20 วินาที
      connect_timeout: 10, // Timeout การเชื่อมต่อ 10 วินาที
    });
    
    // สร้าง Drizzle ORM instance
    db = drizzle(client, { schema });
  }
  
  return db;
}
