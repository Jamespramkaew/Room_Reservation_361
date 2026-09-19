import { objectUrl } from '../../shared/aws/s3';
import { type RoomWithDetails, roomsRepository as repo } from './rooms.repository';

// Facility names as seeded (scripts/db/seed.ts) -> the count fields the room cards show
const COUNTED_FACILITIES = {
  คอมพิวเตอร์: 'computers',
  โปรเจกเตอร์: 'projector',
  ไมโครโฟน: 'mic',
} as const;

type CountField = (typeof COUNTED_FACILITIES)[keyof typeof COUNTED_FACILITIES];

function countFacilities(room: RoomWithDetails): Record<CountField, number> {
  const counts = { computers: 0, projector: 0, mic: 0 };
  for (const rf of room.roomFacilities) {
    const field = COUNTED_FACILITIES[rf.facility.name as keyof typeof COUNTED_FACILITIES];
    if (field) counts[field] += rf.quantity;
  }
  return counts;
}

// API responses keep snake_case keys, like the rest of the API contract
const toResponse = (room: RoomWithDetails) => ({
  id: room.id,
  room_name: room.roomName,
  description: room.description,
  room_type: room.roomType,
  size: room.size,
  status: room.status,
  seat_capacity: room.seatCapacity,
  ...countFacilities(room),
  photos: room.photos.map((p) => ({ object_key: p.objectKey, url: objectUrl(p.objectKey) })),
});

export const roomsService = {
  async list() {
    return (await repo.findAllWithDetails()).map(toResponse);
  },
};
