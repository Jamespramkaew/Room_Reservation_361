import { getDb } from './client';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

async function reset() {
  console.log('🗑️  Resetting database...');

  const db = getDb();

  try {
    console.log('Dropping all tables...');

    // Drop tables in correct order (respecting foreign keys)
    await db.execute(sql`DROP TABLE IF EXISTS "Booking" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "RoomPhotos" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "RoomFacilities" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Facilities" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Room" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "User" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "Example" CASCADE`);

    console.log('Dropping all enums...');

    // Drop enums
    await db.execute(sql`DROP TYPE IF EXISTS "BookingStatus" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "BookingType" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "RoomSize" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "RoomStatus" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "RoomType" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "UserRole" CASCADE`);

    console.log('');
    console.log('✅ Database reset complete!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run db:push    (recreate tables)');
    console.log('   2. Run: npm run db:seed    (insert seed data)');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

// Run reset
reset();
