import { getDb } from './client';
import { users, rooms, facilities, roomFacilities, roomPhotos, bookings, example } from './schema';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

async function seed() {
  console.log('🌱 Starting database seed...');

  const db = getDb();

  try {
    // 0. สร้าง Examples
    console.log('📝 Creating examples...');
    await db
      .insert(example)
      .values([
        {
          author: 'John Doe',
          comment: 'This is my first example!',
        },
        {
          author: 'Jane Smith',
          comment: 'Hello from the seed script',
        },
        {
          author: 'Bob Johnson',
          comment: 'Testing the example feature',
        },
      ]);

    console.log(`✅ Created ${3} examples`);

    // 1. สร้าง Users
    console.log('👤 Creating users...');
    const [adminUser, studentUser1, studentUser2] = await db
      .insert(users)
      .values([
        {
          username: 'admin',
          passwordHash: await bcrypt.hash('admin123', 10),
          role: 'ADMIN',
          email: 'admin@example.com',
        },
        {
          username: 'student1',
          passwordHash: await bcrypt.hash('password123', 10),
          role: 'STUDENT',
          email: 'student1@example.com',
        },
        {
          username: 'student2',
          passwordHash: await bcrypt.hash('password123', 10),
          role: 'STUDENT',
          email: 'student2@example.com',
        },
      ])
      .returning();

    console.log(`✅ Created ${3} users`);

    // 2. สร้าง Facilities
    console.log('🔧 Creating facilities...');
    const [projector, whiteboard, aircon, computer] = await db
      .insert(facilities)
      .values([
        { name: 'Projector' },
        { name: 'Whiteboard' },
        { name: 'Air Conditioner' },
        { name: 'Computer' },
      ])
      .returning();

    console.log(`✅ Created ${4} facilities`);

    // 3. สร้าง Rooms
    console.log('🏢 Creating rooms...');
    const [room1, room2, room3] = await db
      .insert(rooms)
      .values([
        {
          roomName: 'LAB-101',
          description: 'Computer Laboratory with 30 workstations',
          seatCapacity: 30,
          status: 'AVAILABLE',
          size: 'LARGE',
          roomType: 'LAB',
        },
        {
          roomName: 'LECTURE-201',
          description: 'Large lecture hall for 100 students',
          seatCapacity: 100,
          status: 'AVAILABLE',
          size: 'LARGE',
          roomType: 'LECTURE',
        },
        {
          roomName: 'MEETING-301',
          description: 'Small meeting room for discussions',
          seatCapacity: 10,
          status: 'AVAILABLE',
          size: 'SMALL',
          roomType: 'MEETING',
        },
      ])
      .returning();

    console.log(`✅ Created ${3} rooms`);

    // 4. เชื่อม Room กับ Facilities
    console.log('🔗 Linking rooms with facilities...');
    await db.insert(roomFacilities).values([
      // LAB-101
      { roomId: room1.id, facilityId: projector.id, quantity: 1 },
      { roomId: room1.id, facilityId: whiteboard.id, quantity: 2 },
      { roomId: room1.id, facilityId: aircon.id, quantity: 2 },
      { roomId: room1.id, facilityId: computer.id, quantity: 30 },

      // LECTURE-201
      { roomId: room2.id, facilityId: projector.id, quantity: 2 },
      { roomId: room2.id, facilityId: whiteboard.id, quantity: 3 },
      { roomId: room2.id, facilityId: aircon.id, quantity: 4 },

      // MEETING-301
      { roomId: room3.id, facilityId: projector.id, quantity: 1 },
      { roomId: room3.id, facilityId: whiteboard.id, quantity: 1 },
      { roomId: room3.id, facilityId: aircon.id, quantity: 1 },
    ]);

    console.log(`✅ Linked rooms with facilities`);

    // 5. สร้าง Room Photos (ตัวอย่าง)
    console.log('📷 Creating room photos...');
    await db.insert(roomPhotos).values([
      {
        roomId: room1.id,
        objectKey: 'rooms/lab-101/photo1.jpg',
        caption: 'Computer Lab Overview',
        sortOrder: 1,
      },
      {
        roomId: room2.id,
        objectKey: 'rooms/lecture-201/photo1.jpg',
        caption: 'Lecture Hall View',
        sortOrder: 1,
      },
      {
        roomId: room3.id,
        objectKey: 'rooms/meeting-301/photo1.jpg',
        caption: 'Meeting Room Setup',
        sortOrder: 1,
      },
    ]);

    console.log(`✅ Created room photos`);

    // 6. สร้าง Bookings
    console.log('📅 Creating bookings...');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await db.insert(bookings).values([
      {
        userId: studentUser1.id,
        roomId: room1.id,
        bookingType: 'STUDENT_BOOKING',
        title: 'Study Group Session',
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // +2 hours
        status: 'APPROVED',
        remark: 'Need computers for programming practice',
      },
      {
        userId: studentUser2.id,
        roomId: room2.id,
        bookingType: 'CLASS',
        title: 'CS101 Lecture',
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000), // +3 hours
        status: 'PENDING',
      },
    ]);

    console.log(`✅ Created bookings`);

    console.log('');
    console.log('✅ Seed completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Examples: 3`);
    console.log(`   Users: 3 (1 admin, 2 students)`);
    console.log(`   Rooms: 3`);
    console.log(`   Facilities: 4`);
    console.log(`   Bookings: 2`);
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('   Admin:    username: admin     password: admin123');
    console.log('   Student1: username: student1  password: password123');
    console.log('   Student2: username: student2  password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seed();
