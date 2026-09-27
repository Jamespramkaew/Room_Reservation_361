import { type BookingRow, findBookingsInRange } from './bookings.repository';
import type { ListQuery } from './bookings.schema';

// Asia/Bangkok is UTC+7, no DST — offset is always +07:00
const BKK_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Converts a YYYY-MM-DD string (Asia/Bangkok) to the UTC Date at 00:00 BKK.
 * e.g. "2026-09-21" → 2026-09-20T17:00:00.000Z
 */
function toStartOfDay(date: string): Date {
  return new Date(`${date}T00:00:00+07:00`);
}

/**
 * Converts a YYYY-MM-DD string (Asia/Bangkok) to the UTC Date at 24:00 BKK
 * (i.e. 00:00 of the next day in BKK = end of the given day).
 * e.g. "2026-09-21" → 2026-09-21T17:00:00.000Z
 */
function toEndOfDay(date: string): Date {
  return new Date(toStartOfDay(date).getTime() + 24 * 60 * 60 * 1000);
}

// STUDENT_BOOKING titles are hidden until auth is implemented —
// without login anyone can read booking titles, which may be sensitive.
const toResponse = (row: BookingRow) => ({
  id: row.id,
  title: row.bookingType === 'STUDENT_BOOKING' ? null : row.title,
  booking_type: row.bookingType,
  status: row.status,
  start_time: row.startTime,
  end_time: row.endTime,
  room: {
    id: row.roomId,
    room_name: row.roomName,
  },
});

export const bookingsService = {
  async list(query: ListQuery) {
    const rows = await findBookingsInRange({
      fromEdge: toStartOfDay(query.from),
      toEdge: toEndOfDay(query.to),
      statuses: query.status as Array<'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'>,
      roomId: query.room_id,
    });

    return rows.map(toResponse);
  },
};
