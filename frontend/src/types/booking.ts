export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export type BookingType = 'CLASS' | 'SCHEDULE' | 'SPECIAL_EVENT' | 'STUDENT_BOOKING'

/** Item of GET /api/bookings. Times are ISO strings in UTC. */
export interface Booking {
  id: string
  title: string | null
  booking_type: BookingType
  status: BookingStatus
  start_time: string
  end_time: string
  room: { id: string; room_name: string }
}

/** A booking clipped to one Bangkok day, in minutes since midnight */
export interface DayBlock {
  booking: Booking
  startMin: number
  endMin: number
  lane: number
  lanes: number
}
