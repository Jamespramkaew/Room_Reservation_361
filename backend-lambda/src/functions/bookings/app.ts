import { createApp } from '../../shared/create-app';
import { successResponse } from '../../shared/http/response';
import { validate } from '../../shared/http/validate';
import { listQuery } from './bookings.schema';
import { bookingsService as service } from './bookings.service';

export const app = createApp('/api/bookings');

app.get('/', validate('query', listQuery), async (c) => {
  return c.json(successResponse(await service.list(c.req.valid('query')), 'Bookings retrieved successfully'));
});
