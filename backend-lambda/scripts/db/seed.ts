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

const facilityNames = ['Projector', 'Whiteboard', 'Air Conditioner', 'Computer'];
await db
  .insert(facilities)
  .values(facilityNames.map((name) => ({ name })))
  .onConflictDoNothing({ target: facilities.name });

await db
  .insert(rooms)
  .values([
    { roomName: 'LAB-101', description: 'Computer laboratory with 30 workstations', seatCapacity: 30, status: 'AVAILABLE', size: 'LARGE', roomType: 'LAB' },
    { roomName: 'LECTURE-201', description: 'Lecture hall for 100 students', seatCapacity: 100, status: 'AVAILABLE', size: 'LARGE', roomType: 'LECTURE' },
    { roomName: 'MEETING-301', description: 'Small meeting room for discussions', seatCapacity: 10, status: 'AVAILABLE', size: 'SMALL', roomType: 'MEETING' },
  ])
  .onConflictDoNothing({ target: rooms.roomName });

const facilityId = Object.fromEntries(
  (await db.select().from(facilities).where(inArray(facilities.name, facilityNames))).map((f) => [f.name, f.id]),
);
const roomId = Object.fromEntries((await db.select().from(rooms)).map((r) => [r.roomName, r.id]));

await db
  .insert(roomFacilities)
  .values([
    { roomId: roomId['LAB-101'], facilityId: facilityId['Projector'], quantity: 1, sortOrder: 1 },
    { roomId: roomId['LAB-101'], facilityId: facilityId['Whiteboard'], quantity: 2, sortOrder: 2 },
    { roomId: roomId['LAB-101'], facilityId: facilityId['Air Conditioner'], quantity: 2, sortOrder: 3 },
    { roomId: roomId['LAB-101'], facilityId: facilityId['Computer'], quantity: 30, sortOrder: 4 },
    { roomId: roomId['LECTURE-201'], facilityId: facilityId['Projector'], quantity: 2, sortOrder: 1 },
    { roomId: roomId['LECTURE-201'], facilityId: facilityId['Whiteboard'], quantity: 3, sortOrder: 2 },
    { roomId: roomId['LECTURE-201'], facilityId: facilityId['Air Conditioner'], quantity: 4, sortOrder: 3 },
    { roomId: roomId['MEETING-301'], facilityId: facilityId['Projector'], quantity: 1, sortOrder: 1 },
    { roomId: roomId['MEETING-301'], facilityId: facilityId['Whiteboard'], quantity: 1, sortOrder: 2 },
    { roomId: roomId['MEETING-301'], facilityId: facilityId['Air Conditioner'], quantity: 1, sortOrder: 3 },
  ])
  .onConflictDoNothing({ target: [roomFacilities.roomId, roomFacilities.facilityId] });

// Photos and bookings have no natural unique key: only seed them into an empty table
const [anyPhoto] = await db.select({ id: roomPhotos.id }).from(roomPhotos).limit(1);
if (!anyPhoto) {
  await db.insert(roomPhotos).values([
    { roomId: roomId['LAB-101'], objectKey: 'rooms/lab-101/photo1.jpg', caption: 'Computer lab overview', sortOrder: 1 },
    { roomId: roomId['LECTURE-201'], objectKey: 'rooms/lecture-201/photo1.jpg', caption: 'Lecture hall view', sortOrder: 1 },
    { roomId: roomId['MEETING-301'], objectKey: 'rooms/meeting-301/photo1.jpg', caption: 'Meeting room setup', sortOrder: 1 },
  ]);
}

const [anyBooking] = await db.select({ id: bookings.id }).from(bookings).limit(1);
if (!anyBooking) {
  const [student1] = await db.select().from(users).where(eq(users.username, 'student1'));
  const [student2] = await db.select().from(users).where(eq(users.username, 'student2'));
  const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const hours = (h: number) => new Date(start.getTime() + h * 60 * 60 * 1000);
  await db.insert(bookings).values([
    { userId: student1.id, roomId: roomId['LAB-101'], bookingType: 'STUDENT_BOOKING', title: 'Study group session', startTime: start, endTime: hours(2), status: 'APPROVED' },
    { userId: student2.id, roomId: roomId['LECTURE-201'], bookingType: 'CLASS', title: 'CS101 lecture', startTime: start, endTime: hours(3) },
  ]);
}

console.log('Seed complete. Logins: admin/admin123, student1/password123, student2/password123');
process.exit(0);
