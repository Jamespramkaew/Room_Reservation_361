import { z } from 'zod';

const name = z.string().trim().min(2, 'name must be at least 2 characters').max(100, 'name cannot exceed 100 characters');

export const idParam = z.object({ id: z.string().min(1) });

export const createFacilityBody = z.object({ name });

export const updateFacilityBody = z.object({ name: name.optional() });

export type CreateFacilityBody = z.infer<typeof createFacilityBody>;
export type UpdateFacilityBody = z.infer<typeof updateFacilityBody>;
