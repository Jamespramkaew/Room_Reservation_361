import { getData } from './api'
import type { Booking } from '../types/booking'

/** Bookings of one room between two Bangkok dates (inclusive). Defaults to PENDING + APPROVED. */
export const getRoomBookings = (roomId: string, from: string, to: string) =>
  getData<Booking[]>('/bookings', { room_id: roomId, from, to })
