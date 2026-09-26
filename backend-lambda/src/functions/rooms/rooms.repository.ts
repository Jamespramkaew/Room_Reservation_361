import { and, asc, eq, isNull } from 'drizzle-orm';
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

async function findByIdWithDetails(id: string) {
  const row = await getDb().query.rooms.findFirst({
    where: and(eq(rooms.id, id), isNull(rooms.deletedAt)),
    with: {
      roomFacilities: {
        where: isNull(roomFacilities.deletedAt),
        orderBy: asc(roomFacilities.sortOrder),
        columns: { quantity: true, brokenQuantity: true, note: true },
        with: { facility: { columns: { name: true } } },
      },
      photos: {
        orderBy: asc(roomPhotos.sortOrder),
        columns: { objectKey: true },
      },
    },
  });
  return row ?? null;
}

export type RoomWithDetails = Awaited<ReturnType<typeof findAllWithDetails>>[number];
export type RoomDetail = NonNullable<Awaited<ReturnType<typeof findByIdWithDetails>>>;

export const roomsRepository = {
  findAllWithDetails,
  findByIdWithDetails,
};
