import { objectUrl } from '../../shared/aws/s3';
import { notFound } from '../../shared/http/errors';
import { type RoomDetail, type RoomWithDetails, roomsRepository as repo } from './rooms.repository';

// Facility names as seeded (scripts/db/seed.ts) -> the count fields the room cards show
const COUNTED_FACILITIES = {
  คอมพิวเตอร์: 'computers',
  โปรเจกเตอร์: 'projector',
  ไมโครโฟน: 'mic',
} as const;

type CountField = (typeof COUNTED_FACILITIES)[keyof typeof COUNTED_FACILITIES];

function countFacilities(facilities: { facility: { name: string }; quantity: number }[]): Record<CountField, number> {
  const counts = { computers: 0, projector: 0, mic: 0 };
  for (const rf of facilities) {
    const field = COUNTED_FACILITIES[rf.facility.name as keyof typeof COUNTED_FACILITIES];
    if (field) counts[field] += rf.quantity;
  }
  return counts;
}

const mapPhotos = (photos: { objectKey: string }[]) =>
  photos.map((p) => ({ object_key: p.objectKey, url: objectUrl(p.objectKey) }));

// API responses for get(id)
const toListItem = (room: RoomWithDetails) => ({
  id: room.id,
  room_name: room.roomName,
  description: room.description,
  room_type: room.roomType,
  size: room.size,
  status: room.status,
  seat_capacity: room.seatCapacity,
  ...countFacilities(room.roomFacilities),
  photos: mapPhotos(room.photos),
});

const toDetailItem = (room: RoomDetail) => ({
  id: room.id,
  room_name: room.roomName,
  description: room.description,
  room_type: room.roomType,
  size: room.size,
  status: room.status,
  seat_capacity: room.seatCapacity,
  ...countFacilities(room.roomFacilities),
  facilities: room.roomFacilities.map((rf) => ({
    name: rf.facility.name,
    quantity: rf.quantity,
    broken_quantity: rf.brokenQuantity,
    note: rf.note,
  })),
  photos: mapPhotos(room.photos),
});

export const roomsService = {
  async list() {
    return (await repo.findAllWithDetails()).map(toListItem);
  },

  async get(id: string) {
    const room = await repo.findByIdWithDetails(id);
    if (!room) throw notFound(`Room with ID "${id}" not found`);
    return toDetailItem(room);
  },
};
