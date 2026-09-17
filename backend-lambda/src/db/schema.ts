import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

// ==================== ENUMS ====================

export const userRoleEnum = pgEnum('UserRole', ['STUDENT', 'ADMIN']);
export const roomStatusEnum = pgEnum('RoomStatus', ['AVAILABLE', 'MAINTENANCE', 'RESERVED']);
export const roomSizeEnum = pgEnum('RoomSize', ['SMALL', 'MEDIUM', 'LARGE']);
export const roomTypeEnum = pgEnum('RoomType', ['LAB', 'LECTURE', 'MEETING']);
export const bookingTypeEnum = pgEnum('BookingType', ['CLASS', 'SCHEDULE', 'SPECIAL_EVENT', 'STUDENT_BOOKING']);
export const bookingStatusEnum = pgEnum('BookingStatus', ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);

// ==================== TABLES ====================

// Example table (ตัวอย่าง)
export const example = pgTable('Example', {
  id: uuid('id').primaryKey().defaultRandom(),
  author: varchar('author', { length: 255 }).notNull().unique(),
  comment: text('comment').notNull().default('Hello world!'),
});

// User table
export const users = pgTable('User', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('STUDENT'),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
});

// Room table
export const rooms = pgTable('Room', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomName: varchar('room_name', { length: 255 }).notNull().unique(),
  description: text('description'),
  seatCapacity: integer('seat_capacity').notNull(),
  status: roomStatusEnum('status').notNull(),
  size: roomSizeEnum('size').notNull(),
  roomType: roomTypeEnum('room_type').notNull().default('LECTURE'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
});

// Booking table
export const bookings = pgTable('Booking', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roomId: uuid('room_id').notNull().references(() => rooms.id),
  bookingType: bookingTypeEnum('booking_type').notNull(),
  title: varchar('title', { length: 255 }),
  startTime: timestamp('start_time', { mode: 'date' }).notNull(),
  endTime: timestamp('end_time', { mode: 'date' }).notNull(),
  status: bookingStatusEnum('status').notNull().default('PENDING'),
  remark: text('remark'),
  cancelledBy: uuid('cancelled_by').references(() => users.id),
  cancelReason: text('cancel_reason'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  cancelledAt: timestamp('cancelled_at', { mode: 'date' }),
});

// RoomPhotos table
export const roomPhotos = pgTable('RoomPhotos', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  objectKey: text('object_key').notNull(),
  caption: text('caption'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// Facilities table
export const facilities = pgTable('Facilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
});

// RoomFacilities table (junction table)
export const roomFacilities = pgTable('RoomFacilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  facilityId: uuid('facility_id').notNull().references(() => facilities.id),
  quantity: integer('quantity').notNull().default(1),
  brokenQuantity: integer('broken_quantity').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  note: text('note'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
});

// ==================== TYPESCRIPT TYPES ====================

// Example
export type Example = typeof example.$inferSelect;
export type NewExample = typeof example.$inferInsert;

// User
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Room
export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;

// Booking
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

// RoomPhoto
export type RoomPhoto = typeof roomPhotos.$inferSelect;
export type NewRoomPhoto = typeof roomPhotos.$inferInsert;

// Facility
export type Facility = typeof facilities.$inferSelect;
export type NewFacility = typeof facilities.$inferInsert;

// RoomFacility
export type RoomFacility = typeof roomFacilities.$inferSelect;
export type NewRoomFacility = typeof roomFacilities.$inferInsert;
