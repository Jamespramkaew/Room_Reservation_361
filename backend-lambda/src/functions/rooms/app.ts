import { createApp } from '../../shared/create-app';
import { successResponse } from '../../shared/http/response';
import { roomsService as service } from './rooms.service';

export const app = createApp('/api/rooms');

app.get('/', async (c) => {
  return c.json(successResponse(await service.list(), 'Rooms retrieved successfully'));
});
