// Idempotent sample data: safe to run more than once.
import bcrypt from 'bcryptjs';
import { eq, inArray } from 'drizzle-orm';
import { getDb } from '../../src/shared/db/client';
import { bookings, facilities, roomFacilities, roomPhotos, rooms, users } from '../../src/shared/db/schema';

const db = getDb();

await db
  .insert(users)
  .values([
    { username: 'admin', passwordHash: await bcrypt.hash('admin123', 10), role: 'ADMIN', email: 'admin@example.com' },
    { username: 'student1', passwordHash: await bcrypt.hash('password123', 10), email: 'student1@example.com' },
    { username: 'student2', passwordHash: await bcrypt.hash('password123', 10), email: 'student2@example.com' },
  ])
  .onConflictDoNothing({ target: users.username });

const facilityNames = ['คอมพิวเตอร์', 'โปรเจกเตอร์', 'ไมโครโฟน', 'ไวท์บอร์ด', 'เครื่องปรับอากาศ'];
await db
  .insert(facilities)
  .values(facilityNames.map((name) => ({ name })))
  .onConflictDoNothing({ target: facilities.name });

await db
  .insert(rooms)
  .values([
    { roomName: 'LC-101', description: 'ห้องเรียนสำหรับทำกิจกรรมแล็บในรายวิชา', seatCapacity: 39, status: 'AVAILABLE', size: 'LARGE', roomType: 'LAB' },
    { roomName: 'LC-102', description: 'ห้องเรียนสำหรับทำกิจกรรมแล็บในรายวิชา', seatCapacity: 67, status: 'AVAILABLE', size: 'LARGE', roomType: 'LAB' },
    { roomName: 'LC-103', description: 'ห้องบรรยายขนาดกลาง', seatCapacity: 39, status: 'AVAILABLE', size: 'MEDIUM', roomType: 'LECTURE' },
    { roomName: 'LC-104', description: 'ห้องบรรยายขนาดกลาง', seatCapacity: 40, status: 'AVAILABLE', size: 'MEDIUM', roomType: 'LECTURE' },
    { roomName: 'LC-105', description: 'ห้องบรรยายขนาดเล็ก', seatCapacity: 30, status: 'MAINTENANCE', size: 'SMALL', roomType: 'LECTURE' },
    { roomName: 'LC-106', description: 'ห้องประชุมกลุ่มย่อย', seatCapacity: 12, status: 'AVAILABLE', size: 'SMALL', roomType: 'MEETING' },
    { roomName: 'Co-working Space', description: 'พื้นที่ทำงานร่วมกัน เหมาะสำหรับนั่งทำงานและอ่านหนังสือ', seatCapacity: 50, status: 'AVAILABLE', size: 'LARGE', roomType: 'COWORKING' },
  ])
  .onConflictDoNothing({ target: rooms.roomName });

const facilityId = Object.fromEntries(
  (await db.select().from(facilities).where(inArray(facilities.name, facilityNames))).map((f) => [f.name, f.id]),
);
const roomId = Object.fromEntries((await db.select().from(rooms)).map((r) => [r.roomName, r.id]));

await db
  .insert(roomFacilities)
  .values([
    { roomId: roomId['LC-101'], facilityId: facilityId['คอมพิวเตอร์'], quantity: 39, sortOrder: 1 },
    { roomId: roomId['LC-101'], facilityId: facilityId['โปรเจกเตอร์'], quantity: 1, sortOrder: 2 },
    { roomId: roomId['LC-101'], facilityId: facilityId['ไมโครโฟน'], quantity: 2, sortOrder: 3 },
    { roomId: roomId['LC-101'], facilityId: facilityId['ไวท์บอร์ด'], quantity: 1, sortOrder: 4 },
    { roomId: roomId['LC-101'], facilityId: facilityId['เครื่องปรับอากาศ'], quantity: 3, sortOrder: 5 },

    { roomId: roomId['LC-102'], facilityId: facilityId['คอมพิวเตอร์'], quantity: 67, sortOrder: 1 },
    { roomId: roomId['LC-102'], facilityId: facilityId['โปรเจกเตอร์'], quantity: 2, sortOrder: 2 },
    { roomId: roomId['LC-102'], facilityId: facilityId['ไมโครโฟน'], quantity: 2, sortOrder: 3 },
    { roomId: roomId['LC-102'], facilityId: facilityId['ไวท์บอร์ด'], quantity: 1, sortOrder: 4 },
    { roomId: roomId['LC-102'], facilityId: facilityId['เครื่องปรับอากาศ'], quantity: 3, sortOrder: 5 },

    { roomId: roomId['LC-103'], facilityId: facilityId['โปรเจกเตอร์'], quantity: 1, sortOrder: 1 },
    { roomId: roomId['LC-103'], facilityId: facilityId['ไมโครโฟน'], quantity: 2, sortOrder: 2 },
    { roomId: roomId['LC-103'], facilityId: facilityId['ไวท์บอร์ด'], quantity: 1, sortOrder: 3 },
    { roomId: roomId['LC-103'], facilityId: facilityId['เครื่องปรับอากาศ'], quantity: 2, sortOrder: 4 },

    { roomId: roomId['LC-104'], facilityId: facilityId['โปรเจกเตอร์'], quantity: 1, sortOrder: 1 },
    { roomId: roomId['LC-104'], facilityId: facilityId['ไมโครโฟน'], quantity: 1, sortOrder: 2 },
    { roomId: roomId['LC-104'], facilityId: facilityId['ไวท์บอร์ด'], quantity: 1, sortOrder: 3 },
    { roomId: roomId['LC-104'], facilityId: facilityId['เครื่องปรับอากาศ'], quantity: 2, sortOrder: 4 },

    { roomId: roomId['LC-105'], facilityId: facilityId['โปรเจกเตอร์'], quantity: 1, sortOrder: 1 },
    { roomId: roomId['LC-105'], facilityId: facilityId['ไมโครโฟน'], quantity: 1, sortOrder: 2 },
    { roomId: roomId['LC-105'], facilityId: facilityId['ไวท์บอร์ด'], quantity: 1, sortOrder: 3 },
    { roomId: roomId['LC-105'], facilityId: facilityId['เครื่องปรับอากาศ'], quantity: 1, sortOrder: 4 },

    { roomId: roomId['LC-106'], facilityId: facilityId['โปรเจกเตอร์'], quantity: 1, sortOrder: 1 },
    { roomId: roomId['LC-106'], facilityId: facilityId['ไวท์บอร์ด'], quantity: 1, sortOrder: 2 },
    { roomId: roomId['LC-106'], facilityId: facilityId['เครื่องปรับอากาศ'], quantity: 1, sortOrder: 3 },

    { roomId: roomId['Co-working Space'], facilityId: facilityId['ไวท์บอร์ด'], quantity: 2, sortOrder: 1 },
    { roomId: roomId['Co-working Space'], facilityId: facilityId['เครื่องปรับอากาศ'], quantity: 3, sortOrder: 2 },
  ])
  .onConflictDoNothing({ target: [roomFacilities.roomId, roomFacilities.facilityId] });


// Photos and bookings have no natural unique key: only seed them into an empty table
const [anyPhoto] = await db.select({ id: roomPhotos.id }).from(roomPhotos).limit(1);
if (!anyPhoto) {
    await db.insert(roomPhotos).values([
    { roomId: roomId['LC-101'], objectKey: 'Room1.jpg', sortOrder: 1 },
    { roomId: roomId['LC-101'], objectKey: 'Room1-1.jpg', sortOrder: 2 },
    { roomId: roomId['LC-101'], objectKey: 'Room1-2.jpg', sortOrder: 3 },

    { roomId: roomId['LC-102'], objectKey: 'Room102.jpg', sortOrder: 1 },
    { roomId: roomId['LC-102'], objectKey: 'Room105(4).jpg', sortOrder: 2 },
    { roomId: roomId['LC-102'], objectKey: 'Room106.jpg', sortOrder: 3 },

    { roomId: roomId['LC-103'], objectKey: 'lec1.jpg', sortOrder: 1 },
    { roomId: roomId['LC-103'], objectKey: 'lec4.jpg', sortOrder: 2 },
    { roomId: roomId['LC-103'], objectKey: 'lec5.jpg', sortOrder: 3 },

    { roomId: roomId['LC-104'], objectKey: 'lec2.jpg', sortOrder: 1 },
    { roomId: roomId['LC-104'], objectKey: 'lec4.jpg', sortOrder: 2 },
    { roomId: roomId['LC-104'], objectKey: 'lec5.jpg', sortOrder: 3 },

    { roomId: roomId['LC-105'], objectKey: 'lec3.jpg', sortOrder: 1 },
    { roomId: roomId['LC-105'], objectKey: 'lec4.jpg', sortOrder: 2 },
    { roomId: roomId['LC-105'], objectKey: 'lec5.jpg', sortOrder: 3 },

    { roomId: roomId['LC-106'], objectKey: 'meet1.jpg', sortOrder: 1 },
    { roomId: roomId['LC-106'], objectKey: 'meet2.jpg', sortOrder: 2 },
    { roomId: roomId['LC-106'], objectKey: 'meet3.jpg', sortOrder: 3 },

    { roomId: roomId['Co-working Space'], objectKey: 'co-working.jpg', sortOrder: 1 },
    { roomId: roomId['Co-working Space'], objectKey: 'co2.png', sortOrder: 2 },
    { roomId: roomId['Co-working Space'], objectKey: 'co3.jpg', sortOrder: 3 },
  ]);
}

const [anyBooking] = await db.select({ id: bookings.id }).from(bookings).limit(1);
if (!anyBooking) {
  const [student1] = await db.select().from(users).where(eq(users.username, 'student1'));
  const [student2] = await db.select().from(users).where(eq(users.username, 'student2'));
  const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const hours = (h: number) => new Date(start.getTime() + h * 60 * 60 * 1000);
  await db.insert(bookings).values([
    { userId: student1.id, roomId: roomId['LC-101'], bookingType: 'STUDENT_BOOKING', title: 'Study group session', startTime: start, endTime: hours(2), status: 'APPROVED' },
    { userId: student2.id, roomId: roomId['LC-103'], bookingType: 'CLASS', title: 'CS101 lecture', startTime: start, endTime: hours(3) },
  ]);
}

console.log('Seed complete. Logins: admin/admin123, student1/password123, student2/password123');
process.exit(0);
