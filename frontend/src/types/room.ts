// API Response from backend
export interface RoomApiResponse {
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

// Frontend UI format
export interface Room {
  id: string
  name: string
  desc: string
  type: string
  size: 'Small' | 'Medium' | 'Large'
  status: string
  seats?: number       // ที่นั่งทั่วไป (เก้าอี้)
  computers?: number   // เครื่องคอมพิวเตอร์ (แยกจาก seat)
  projector?: number
  mic?: number
  image?: string
  images?: string[]
}

// Type mapping utilities
export const ROOM_TYPE_MAP: Record<RoomApiResponse['room_type'], string> = {
  LAB: 'ห้องแลป',
  LECTURE: 'ห้องเล็คเชอร์',
  MEETING: 'ห้องประชุม',
  COWORKING: 'ห้อง Co-working',
}

export const ROOM_TYPE_REVERSE_MAP: Record<string, RoomApiResponse['room_type']> = {
  'ห้องแลป': 'LAB',
  'ห้องเล็คเชอร์': 'LECTURE',
  'ห้องประชุม': 'MEETING',
  'ห้อง Co-working': 'COWORKING',
}

export const ROOM_SIZE_MAP: Record<RoomApiResponse['size'], Room['size']> = {
  SMALL: 'Small',
  MEDIUM: 'Medium',
  LARGE: 'Large',
}

export const ROOM_STATUS_MAP: Record<RoomApiResponse['status'], string> = {
  AVAILABLE: 'Available',
  MAINTENANCE: 'Maintenance',
  RESERVED: 'Reserved',
}

// Convert API response to UI format
export function mapRoomFromApi(apiRoom: RoomApiResponse): Room {
  return {
    id: apiRoom.id,
    name: apiRoom.room_name,
    desc: apiRoom.description || '',
    type: ROOM_TYPE_MAP[apiRoom.room_type],
    size: ROOM_SIZE_MAP[apiRoom.size],
    status: ROOM_STATUS_MAP[apiRoom.status],
    seats: apiRoom.seat_capacity,
    computers: apiRoom.computers,
    projector: apiRoom.projector,
    mic: apiRoom.mic,
    image: apiRoom.photos[0]?.url,
    images: apiRoom.photos.map(p => p.url),
  }
}
