import { createApp } from '../../shared/create-app';
import { validate } from '../../shared/http/validate';
import { successResponse } from '../../shared/http/response';
import { idParam } from './rooms.schema';
import { roomsService as service } from './rooms.service';

export const app = createApp('/api/rooms');

app.get('/', async (c) => {
  return c.json(successResponse(await service.list(), 'Rooms retrieved successfully'));
});

app.get('/:id', validate('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  return c.json(successResponse(await service.get(id), 'Room retrieved successfully'));
});
