import { and, asc, eq, gt, inArray, lt } from 'drizzle-orm';
import { getDb } from '../../shared/db/client';
import { bookings, rooms } from '../../shared/db/schema';

export interface BookingFilters {
  /** Start of range (inclusive boundary): bookings with end_time > fromEdge */
  fromEdge: Date;
  /** End of range (exclusive boundary): bookings with start_time < toEdge */
  toEdge: Date;
  statuses: Array<'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'>;
  roomId?: string;
}

export async function findBookingsInRange(filters: BookingFilters) {
  const { fromEdge, toEdge, statuses, roomId } = filters;

  const conditions = [
    // Overlap condition: booking overlaps [fromEdge, toEdge) when:
    //   booking.start_time < toEdge  AND  booking.end_time > fromEdge
    lt(bookings.startTime, toEdge),
    gt(bookings.endTime, fromEdge),
    inArray(bookings.status, statuses),
  ];

  if (roomId) {
    conditions.push(eq(bookings.roomId, roomId));
  }

  const rows = await getDb()
    .select({
      id: bookings.id,
      title: bookings.title,
      bookingType: bookings.bookingType,
      status: bookings.status,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      roomId: rooms.id,
      roomName: rooms.roomName,
    })
    .from(bookings)
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .where(and(...conditions))
    .orderBy(asc(bookings.startTime), asc(rooms.roomName));

  return rows;
}

export type BookingRow = Awaited<ReturnType<typeof findBookingsInRange>>[number];
