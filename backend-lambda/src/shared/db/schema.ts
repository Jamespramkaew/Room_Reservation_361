// Baseline pulled with `drizzle-kit pull` from the DB built by backend/prisma migrations,
// so table/column/index names match the existing database exactly.
// From here on Drizzle owns the schema: edit this file, then `npm run db:generate`.
import { randomUUID } from 'node:crypto';
import { foreignKey, integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const userRole = pgEnum('UserRole', ['STUDENT', 'ADMIN']);
export const roomStatus = pgEnum('RoomStatus', ['AVAILABLE', 'MAINTENANCE', 'RESERVED']);
export const roomSize = pgEnum('RoomSize', ['SMALL', 'MEDIUM', 'LARGE']);
export const roomType = pgEnum('RoomType', ['LAB', 'LECTURE', 'MEETING', 'COWORKING']);
export const bookingType = pgEnum('BookingType', ['CLASS', 'SCHEDULE', 'SPECIAL_EVENT', 'STUDENT_BOOKING']);
export const bookingStatus = pgEnum('BookingStatus', ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);

const id = () => text('id').primaryKey().$defaultFn(() => randomUUID());
const ts = (name: string) => timestamp(name, { precision: 3, mode: 'date' });
const createdAt = () => ts('created_at').default(sql`CURRENT_TIMESTAMP`).notNull();
// No DB default (same as Prisma @updatedAt); Drizzle fills it on insert and update.
const updatedAt = () =>
  ts('updated_at')
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date());

export const examples = pgTable(
  'Example',
  {
    id: id(),
    author: text('author').notNull(),
    comment: text('comment').default('Hello world!').notNull(),
  },
  (t) => [uniqueIndex('Example_author_key').using('btree', t.author.asc().nullsLast().op('text_ops'))],
);

export const users = pgTable(
  'User',
  {
    id: id(),
    username: text('username').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: userRole('role').default('STUDENT').notNull(),
    email: text('email'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: ts('deleted_at'),
  },
  (t) => [uniqueIndex('User_username_key').using('btree', t.username.asc().nullsLast().op('text_ops'))],
);

export const rooms = pgTable(
  'Room',
  {
    id: id(),
    roomName: text('room_name').notNull(),
    description: text('description'),
    seatCapacity: integer('seat_capacity').notNull(),
    status: roomStatus('status').notNull(),
    size: roomSize('size').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: ts('deleted_at'),
    roomType: roomType('room_type').default('LECTURE').notNull(),
  },
  (t) => [uniqueIndex('Room_room_name_key').using('btree', t.roomName.asc().nullsLast().op('text_ops'))],
);

export const facilities = pgTable(
  'Facilities',
  {
    id: id(),
    name: text('name').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: ts('deleted_at'),
  },
  (t) => [uniqueIndex('Facilities_name_key').using('btree', t.name.asc().nullsLast().op('text_ops'))],
);

export const roomFacilities = pgTable(
  'RoomFacilities',
  {
    id: id(),
    roomId: text('room_id').notNull(),
    facilityId: text('facility_id').notNull(),
    quantity: integer('quantity').default(1).notNull(),
    brokenQuantity: integer('broken_quantity').default(0).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    note: text('note'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: ts('deleted_at'),
  },
  (t) => [
    uniqueIndex('RoomFacilities_room_id_facility_id_key').using(
      'btree',
      t.roomId.asc().nullsLast().op('text_ops'),
      t.facilityId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({ columns: [t.roomId], foreignColumns: [rooms.id], name: 'RoomFacilities_room_id_fkey' })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({ columns: [t.facilityId], foreignColumns: [facilities.id], name: 'RoomFacilities_facility_id_fkey' })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ],
);

export const roomPhotos = pgTable(
  'RoomPhotos',
  {
    id: id(),
    roomId: text('room_id').notNull(),
    objectKey: text('object_key').notNull(),
    caption: text('caption'),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    foreignKey({ columns: [t.roomId], foreignColumns: [rooms.id], name: 'RoomPhotos_room_id_fkey' })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
);

export const bookings = pgTable(
  'Booking',
  {
    id: id(),
    userId: text('user_id').notNull(),
    roomId: text('room_id').notNull(),
    bookingType: bookingType('booking_type').notNull(),
    title: text('title'),
    startTime: ts('start_time').notNull(),
    endTime: ts('end_time').notNull(),
    status: bookingStatus('status').default('PENDING').notNull(),
    remark: text('remark'),
    cancelledBy: text('cancelled_by'),
    cancelReason: text('cancel_reason'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    cancelledAt: ts('cancelled_at'),
  },
  (t) => [
    foreignKey({ columns: [t.userId], foreignColumns: [users.id], name: 'Booking_user_id_fkey' })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({ columns: [t.cancelledBy], foreignColumns: [users.id], name: 'Booking_cancelled_by_fkey' })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({ columns: [t.roomId], foreignColumns: [rooms.id], name: 'Booking_room_id_fkey' })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ],
);
