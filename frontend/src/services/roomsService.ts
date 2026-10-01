import { get, post, put, deleteRequest } from './api'
import type { RoomApiResponse } from '../types/room'

// Types
export interface Room {
  id: string
  room_name: string
  description: string | null
  room_type: 'LAB' | 'LECTURE' | 'MEETING' | 'COWORKING'
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
  status: 'AVAILABLE' | 'MAINTENANCE' | 'RESERVED'
  seat_capacity: number
  computers: number
  projector: number
  mic: number
  photos: Array<{
    object_key: string
    url: string
  }>
}

export interface CreateRoomPayload {
  name: string
  capacity: number
  location: string
  pricePerHour: number
  amenities?: string[]
}

export interface UpdateRoomPayload extends Partial<CreateRoomPayload> {}

export interface RoomSearchParams {
  q?: string
  room_type?: string
  facilities?: string
  start?: string
  end?: string
}

// Rooms Service
export const roomsService = {
  // Get all rooms
  getAllRooms: (params?: RoomSearchParams) => {
    const queryString = params 
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : ''
    return get<RoomApiResponse[]>(`/rooms${queryString}`)
  },

  // Get room by ID
  getRoomById: (id: string) => get<RoomApiResponse>(`/rooms/${id}`),

  // Create new room (if needed in the future)
  createRoom: (payload: CreateRoomPayload) =>
    post<Room>('/rooms', payload),

  // Update room (if needed in the future)
  updateRoom: (id: string, payload: UpdateRoomPayload) =>
    put<Room>(`/rooms/${id}`, payload),

  // Delete room (if needed in the future)
  deleteRoom: (id: string) =>
    deleteRequest<{ success: boolean }>(`/rooms/${id}`),

  // Search available rooms
  searchRooms: (params: RoomSearchParams) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString()
    return get<RoomApiResponse[]>(`/rooms?${queryString}`)
  },
}
