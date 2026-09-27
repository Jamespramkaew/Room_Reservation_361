import { objectUrl } from '../../shared/aws/s3';
import { notFound } from '../../shared/http/errors';
import { type RoomDetail, type RoomFilters, type RoomWithDetails, roomsRepository as repo } from './rooms.repository';
import type { ListQuery } from './rooms.schema';

// Facility names as seeded (scripts/db/seed.ts) → the count fields the room cards show
const COUNTED_FACILITIES: Record<string, 'computers' | 'projector' | 'mic'> = {
  คอมพิวเตอร์: 'computers',
  โปรเจกเตอร์: 'projector',
  ไมโครโฟน: 'mic',
};

// Maps API-facing facility filter keys → Thai DB names for the repository
const FACILITY_KEY_TO_NAME: Record<string, string> = {
  computers: 'คอมพิวเตอร์',
  projector: 'โปรเจกเตอร์',
  mic: 'ไมโครโฟน',
};

type CountField = 'computers' | 'projector' | 'mic';

function countFacilities(facilities: { facility: { name: string }; quantity: number }[]): Record<CountField, number> {
  const counts: Record<CountField, number> = { computers: 0, projector: 0, mic: 0 };
  for (const rf of facilities) {
    const field = COUNTED_FACILITIES[rf.facility.name];
    if (field) counts[field] += rf.quantity;
  }
  return counts;
}

const mapPhotos = (photos: { objectKey: string }[]) =>
  photos.map((p) => ({ object_key: p.objectKey, url: objectUrl(p.objectKey) }));

// API responses keep snake_case keys, like the rest of the API contract
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

function toRepoFilters(query: ListQuery): RoomFilters {
  return {
    q: query.q,
    roomTypes: query.room_type,
    // Translate API keys → Thai facility names expected by the DB
    facilityNames: query.facilities?.map((k: string) => FACILITY_KEY_TO_NAME[k]).filter(Boolean),
    start: query.start ? new Date(query.start) : undefined,
    end: query.end ? new Date(query.end) : undefined,
  };
}

export const roomsService = {
  async list(query: ListQuery = {}) {
    return (await repo.findAllWithDetails(toRepoFilters(query))).map(toListItem);
  },

  async get(id: string) {
    const room = await repo.findByIdWithDetails(id);
    if (!room) throw notFound(`Room with ID "${id}" not found`);
    return toDetailItem(room);
  },
};
