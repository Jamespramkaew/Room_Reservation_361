import { get, post, put, deleteRequest } from './api'

// Types
export interface Booking {
  id: string
  roomId: string
  userId: string
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateBookingPayload {
  roomId: string
  userId: string
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  notes?: string
}

export interface UpdateBookingPayload {
  checkInDate?: string
  checkOutDate?: string
  numberOfGuests?: number
  status?: string
  notes?: string
}

// Bookings Service
export const bookingsService = {
  // Get all bookings
  getAllBookings: () => get<Booking[]>('/bookings'),

  // Get booking by ID
  getBookingById: (id: string) => get<Booking>(`/bookings/${id}`),

  // Create new booking
  createBooking: (payload: CreateBookingPayload) =>
    post<Booking>('/bookings', payload),

  // Update booking
  updateBooking: (id: string, payload: UpdateBookingPayload) =>
    put<Booking>(`/bookings/${id}`, payload),

  // Cancel booking
  cancelBooking: (id: string) =>
    put<Booking>(`/bookings/${id}`, { status: 'cancelled' }),

  // Delete booking
  deleteBooking: (id: string) =>
    deleteRequest<{ success: boolean }>(`/bookings/${id}`),

  // Get user's bookings
  getUserBookings: (userId: string) =>
    get<Booking[]>(`/bookings/user/${userId}`),

  // Get bookings by room
  getRoomBookings: (roomId: string) =>
    get<Booking[]>(`/bookings/room/${roomId}`),
}
