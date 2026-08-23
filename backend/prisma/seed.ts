import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL as string;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper function to create DateTime safely
function createDateTime(daysFromNow: number, hours: number, minutes = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

async function main() {
  console.log('Start seeding...');

  // Clear existing data in correct order (reverse of foreign key dependencies)
  await prisma.booking.deleteMany();
  await prisma.roomFacilities.deleteMany();
  await prisma.roomPhotos.deleteMany();
  await prisma.room.deleteMany();
  await prisma.facilities.deleteMany();
  await prisma.user.deleteMany();
  await prisma.example.deleteMany();

  console.log('Creating users...');
  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const student1 = await prisma.user.create({
    data: {
      username: 'student1',
      password_hash: hashedPassword,
      role: 'STUDENT',
      email: 'student1@university.edu',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      username: 'student2',
      password_hash: hashedPassword,
      role: 'STUDENT',
      email: 'student2@university.edu',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      username: 'student3',
      password_hash: hashedPassword,
      role: 'STUDENT',
      email: 'student3@university.edu',
    },
  });

  const instructor1 = await prisma.user.create({
    data: {
      username: 'instructor1',
      password_hash: hashedPassword,
      role: 'STUDENT', // Assuming instructors are also STUDENT role
      email: 'instructor1@university.edu',
    },
  });

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password_hash: hashedPassword,
      role: 'ADMIN',
      email: 'admin@university.edu',
    },
  });

  console.log('Creating facilities...');
  // Create Facilities with more variety
  const facilities = await Promise.all([
    prisma.facilities.create({ data: { name: 'Projector' } }),
    prisma.facilities.create({ data: { name: 'Whiteboard' } }),
    prisma.facilities.create({ data: { name: 'Air Conditioner' } }),
    prisma.facilities.create({ data: { name: 'WiFi' } }),
    prisma.facilities.create({ data: { name: 'Sound System' } }),
    prisma.facilities.create({ data: { name: 'Table' } }),
    prisma.facilities.create({ data: { name: 'Chair' } }),
    prisma.facilities.create({ data: { name: 'Screen' } }),
  ]);

  const [projector, whiteboard, ac, wifi, soundSystem, table, chair, screen] = facilities;

  console.log('Creating rooms...');
  // Create Rooms with different statuses
  const room1 = await prisma.room.create({
    data: {
      room_name: 'A101',
      description: 'Lecture Hall - For classes and presentations',
      seat_capacity: 50,
      status: 'AVAILABLE',
      size: 'LARGE',
    },
  });

  const room2 = await prisma.room.create({
    data: {
      room_name: 'B202',
      description: 'Conference Room - For meetings and events',
      seat_capacity: 30,
      status: 'AVAILABLE',
      size: 'MEDIUM',
    },
  });

  const room3 = await prisma.room.create({
    data: {
      room_name: 'C301',
      description: 'Study Room - For group study sessions',
      seat_capacity: 15,
      status: 'AVAILABLE',
      size: 'SMALL',
    },
  });

  const room4 = await prisma.room.create({
    data: {
      room_name: 'D401',
      description: 'Training Lab - Under maintenance',
      seat_capacity: 40,
      status: 'MAINTENANCE',
      size: 'LARGE',
    },
  });

  const room5 = await prisma.room.create({
    data: {
      room_name: 'E501',
      description: 'Seminar Room - Reserved for special events',
      seat_capacity: 25,
      status: 'RESERVED',
      size: 'MEDIUM',
    },
  });

  console.log('Creating room facilities...');
  // Assign Facilities to Rooms
  const roomFacilities = [
    // Room A101 - Lecture Hall
    { room_id: room1.id, facility_id: projector.id, quantity: 2, note: 'High-resolution projectors' },
    { room_id: room1.id, facility_id: whiteboard.id, quantity: 3 },
    { room_id: room1.id, facility_id: soundSystem.id, quantity: 1 },
    { room_id: room1.id, facility_id: screen.id, quantity: 2 },
    { room_id: room1.id, facility_id: ac.id, quantity: 3 },
    { room_id: room1.id, facility_id: chair.id, quantity: 50 },
    { room_id: room1.id, facility_id: table.id, quantity: 10 },
    { room_id: room1.id, facility_id: wifi.id, quantity: 1 },
    
    // Room B202 - Conference Room
    { room_id: room2.id, facility_id: projector.id, quantity: 1 },
    { room_id: room2.id, facility_id: screen.id, quantity: 1 },
    { room_id: room2.id, facility_id: soundSystem.id, quantity: 1 },
    { room_id: room2.id, facility_id: table.id, quantity: 6, note: 'Conference tables' },
    { room_id: room2.id, facility_id: chair.id, quantity: 30 },
    { room_id: room2.id, facility_id: ac.id, quantity: 2 },
    { room_id: room2.id, facility_id: wifi.id, quantity: 1 },
    
    // Room C301 - Study Room
    { room_id: room3.id, facility_id: table.id, quantity: 4 },
    { room_id: room3.id, facility_id: chair.id, quantity: 15 },
    { room_id: room3.id, facility_id: whiteboard.id, quantity: 1 },
    { room_id: room3.id, facility_id: ac.id, quantity: 1 },
    { room_id: room3.id, facility_id: wifi.id, quantity: 1 },
    
    // Room D401 - Training Lab (Maintenance)
    { room_id: room4.id, facility_id: table.id, quantity: 8, broken_quantity: 2, note: 'Some tables under repair' },
    { room_id: room4.id, facility_id: chair.id, quantity: 40, broken_quantity: 5 },
    
    // Room E501 - Seminar Room (Reserved)
    { room_id: room5.id, facility_id: projector.id, quantity: 1 },
    { room_id: room5.id, facility_id: table.id, quantity: 5 },
    { room_id: room5.id, facility_id: chair.id, quantity: 25 },
    { room_id: room5.id, facility_id: ac.id, quantity: 2 },
  ];

  for (const rf of roomFacilities) {
    await prisma.roomFacilities.create({ data: rf });
  }

  console.log('Creating room photos...');
  // Add some room photos (optional but good for completeness)
  await prisma.roomPhotos.create({
    data: {
      room_id: room1.id,
      object_key: 's3://rooms/A101/main.jpg',
      caption: 'Main view of Lecture Hall',
      sort_order: 1,
    },
  });

  await prisma.roomPhotos.create({
    data: {
      room_id: room2.id,
      object_key: 's3://rooms/B202/main.jpg',
      caption: 'Conference Room setup',
      sort_order: 1,
    },
  });

  console.log('Creating bookings...');
  // Create Bookings with various statuses
  const bookings = [
    // APPROVED bookings (past, current, and future)
    {
      user_id: instructor1.id,
      room_id: room1.id,
      booking_type: 'CLASS',
      title: 'Introduction to Programming',
      start_time: createDateTime(1, 9, 0),
      end_time: createDateTime(1, 11, 0),
      status: 'APPROVED',
      remark: 'Regular class session - 50 students expected',
    },
    
    // PENDING booking
    {
      user_id: student1.id,
      room_id: room2.id,
      booking_type: 'STUDENT_BOOKING',
      title: 'Study Group Meeting',
      start_time: createDateTime(2, 14, 0),
      end_time: createDateTime(2, 16, 0),
      status: 'PENDING',
      remark: 'Group study for midterm exam',
    },
    
    // APPROVED SCHEDULE booking
    {
      user_id: instructor1.id,
      room_id: room1.id,
      booking_type: 'SCHEDULE',
      title: 'Advanced Web Development - Recurring',
      start_time: createDateTime(3, 13, 0),
      end_time: createDateTime(3, 15, 0),
      status: 'APPROVED',
      remark: 'First session of recurring schedule',
    },
    
    // APPROVED SPECIAL_EVENT booking
    {
      user_id: admin.id,
      room_id: room2.id,
      booking_type: 'SPECIAL_EVENT',
      title: 'University Seminar - Tech Innovation',
      start_time: createDateTime(7, 10, 0),
      end_time: createDateTime(7, 12, 0),
      status: 'APPROVED',
      remark: 'Guest speaker from tech industry',
    },
    
    // REJECTED booking (past request)
    {
      user_id: student2.id,
      room_id: room3.id,
      booking_type: 'STUDENT_BOOKING',
      title: 'Project Discussion - Too many people',
      start_time: createDateTime(-3, 15, 0),
      end_time: createDateTime(-3, 17, 0),
      status: 'REJECTED',
      remark: 'Room capacity exceeded - rejected by admin',
    },
    
    // CANCELLED booking (user cancelled)
    {
      user_id: student3.id,
      room_id: room1.id,
      booking_type: 'CLASS',
      title: 'Tutorial Session - Cancelled',
      start_time: createDateTime(-1, 10, 0),
      end_time: createDateTime(-1, 11, 0),
      status: 'CANCELLED',
      cancelled_by: student3.id,
      cancel_reason: 'Class was moved to online format',
      cancelled_at: new Date(),
      remark: 'Original booking for in-person session',
    },
  ];

  for (const booking of bookings) {
    await prisma.booking.create({ data: booking });
  }

  console.log('✅ Seeding finished successfully!');
  console.log({
    summary: {
      users: 5,
      rooms: 5,
      facilities: 8,
      bookings: 6,
    },
    roomStatus: {
      AVAILABLE: 3,
      MAINTENANCE: 1,
      RESERVED: 1,
    },
    bookingStatus: {
      APPROVED: 3,
      PENDING: 1,
      REJECTED: 1,
      CANCELLED: 1,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
