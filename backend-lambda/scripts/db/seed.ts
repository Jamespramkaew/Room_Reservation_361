// Idempotent sample data: safe to run more than once.
import bcrypt from 'bcryptjs';
import { inArray } from 'drizzle-orm';
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
  const userId = Object.fromEntries((await db.select().from(users)).map((u) => [u.username, u.id]));

  // Monday of next week in Bangkok time, so the sample schedule is always in the future
  const bangkokNow = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const daysToMonday = (8 - bangkokNow.getUTCDay()) % 7 || 7;
  const monday = new Date(
    Date.UTC(bangkokNow.getUTCFullYear(), bangkokNow.getUTCMonth(), bangkokNow.getUTCDate() + daysToMonday),
  );
  // at(0, '09:00') = next Monday 09:00 Bangkok time; at(4, ...) = Friday
  const at = (day: number, time: string) =>
    new Date(`${new Date(monday.getTime() + day * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}T${time}:00+07:00`);

  await db.insert(bookings).values([
    // Monday
    { userId: userId['admin'], roomId: roomId['LC-101'], bookingType: 'CLASS', title: 'CS101 ปฏิบัติการ', startTime: at(0, '09:00'), endTime: at(0, '12:00'), status: 'APPROVED' },
    { userId: userId['admin'], roomId: roomId['LC-103'], bookingType: 'CLASS', title: 'CS102 บรรยาย', startTime: at(0, '09:00'), endTime: at(0, '12:00'), status: 'APPROVED' },
    { userId: userId['admin'], roomId: roomId['LC-101'], bookingType: 'CLASS', title: 'CS201 ปฏิบัติการ', startTime: at(0, '13:00'), endTime: at(0, '16:00'), status: 'APPROVED' },
    { userId: userId['student1'], roomId: roomId['LC-106'], bookingType: 'STUDENT_BOOKING', title: 'ประชุมโปรเจกต์กลุ่ม', startTime: at(0, '10:00'), endTime: at(0, '12:00'), status: 'APPROVED' },
    { userId: userId['student2'], roomId: roomId['LC-106'], bookingType: 'STUDENT_BOOKING', title: 'นัดพบอาจารย์ที่ปรึกษา', startTime: at(0, '12:00'), endTime: at(0, '13:00'), status: 'APPROVED' },
    // Tuesday
    { userId: userId['admin'], roomId: roomId['LC-102'], bookingType: 'CLASS', title: 'CS211 ปฏิบัติการ', startTime: at(1, '09:00'), endTime: at(1, '12:00'), status: 'APPROVED' },
    { userId: userId['admin'], roomId: roomId['LC-104'], bookingType: 'CLASS', title: 'CS213 บรรยาย', startTime: at(1, '13:00'), endTime: at(1, '16:00'), status: 'APPROVED' },
    { userId: userId['admin'], roomId: roomId['Co-working Space'], bookingType: 'SPECIAL_EVENT', title: 'Workshop Cloud เบื้องต้น', startTime: at(1, '13:00'), endTime: at(1, '17:00'), status: 'APPROVED' },
    // Wednesday
    { userId: userId['admin'], roomId: roomId['LC-101'], bookingType: 'CLASS', title: 'CS101 ปฏิบัติการ', startTime: at(2, '09:00'), endTime: at(2, '12:00'), status: 'APPROVED' },
    { userId: userId['student2'], roomId: roomId['LC-103'], bookingType: 'STUDENT_BOOKING', title: 'ติวสอบกลางภาค', startTime: at(2, '15:00'), endTime: at(2, '17:00'), status: 'PENDING' },
    { userId: userId['student1'], roomId: roomId['LC-106'], bookingType: 'STUDENT_BOOKING', title: 'ประชุมชมรม', startTime: at(2, '16:00'), endTime: at(2, '18:00'), status: 'CANCELLED', cancelledBy: userId['student1'], cancelReason: 'เลื่อนการประชุม', cancelledAt: new Date() },
    // Thursday
    { userId: userId['admin'], roomId: roomId['LC-102'], bookingType: 'CLASS', title: 'CS211 ปฏิบัติการ', startTime: at(3, '09:00'), endTime: at(3, '12:00'), status: 'APPROVED' },
    { userId: userId['student2'], roomId: roomId['LC-104'], bookingType: 'STUDENT_BOOKING', title: 'อ่านหนังสือกลุ่ม', startTime: at(3, '13:00'), endTime: at(3, '15:00'), status: 'REJECTED' },
    { userId: userId['student1'], roomId: roomId['LC-104'], bookingType: 'STUDENT_BOOKING', title: 'ซ้อมนำเสนองาน', startTime: at(3, '14:00'), endTime: at(3, '16:00'), status: 'APPROVED' },
    // Friday
    { userId: userId['admin'], roomId: roomId['LC-103'], bookingType: 'CLASS', title: 'CS102 บรรยาย', startTime: at(4, '09:00'), endTime: at(4, '12:00'), status: 'APPROVED' },
    { userId: userId['admin'], roomId: roomId['LC-102'], bookingType: 'SCHEDULE', title: 'สอบปฏิบัติ CS211', startTime: at(4, '13:00'), endTime: at(4, '16:00'), status: 'APPROVED' },
  ]);
}


console.log('Seed complete. Logins: admin/admin123, student1/password123, student2/password123');
process.exit(0);
