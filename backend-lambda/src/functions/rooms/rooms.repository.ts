import { asc, isNull } from 'drizzle-orm';
import { getDb } from '../../shared/db/client';
import { roomFacilities, roomPhotos, rooms } from '../../shared/db/schema';

function findAllWithDetails() {
  return getDb().query.rooms.findMany({
    where: isNull(rooms.deletedAt),
    orderBy: asc(rooms.roomName),
    with: {
      roomFacilities: {
        where: isNull(roomFacilities.deletedAt),
        columns: { quantity: true },
        with: { facility: { columns: { name: true } } },
      },
      photos: {
        orderBy: asc(roomPhotos.sortOrder),
        columns: { objectKey: true },
      },
    },
  });
}

export type RoomWithDetails = Awaited<ReturnType<typeof findAllWithDetails>>[number];

export const roomsRepository = {
  findAllWithDetails,
};
