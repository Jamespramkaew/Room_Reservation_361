import { conflict, notFound } from '../../shared/http/errors';
import { type Facility, facilitiesRepository as repo } from './facilities.repository';
import type { CreateFacilityBody, UpdateFacilityBody } from './facilities.schema';

// API responses keep snake_case keys, like the rest of the API contract
const toResponse = (f: Facility) => ({
  id: f.id,
  name: f.name,
  created_at: f.createdAt,
  updated_at: f.updatedAt,
  deleted_at: f.deletedAt,
});

async function getOrThrow(id: string): Promise<Facility> {
  const facility = await repo.findById(id);
  if (!facility) throw notFound(`Facility with ID "${id}" not found`);
  return facility;
}

async function assertNameAvailable(name: string, exceptId?: string) {
  const existing = await repo.findByName(name);
  if (existing && existing.id !== exceptId) {
    throw conflict(`Facility with name "${name}" already exists. Name must be unique.`);
  }
}

export const facilitiesService = {
  async list() {
    return (await repo.findAll()).map(toResponse);
  },

  async get(id: string) {
    return toResponse(await getOrThrow(id));
  },

  async create(body: CreateFacilityBody) {
    await assertNameAvailable(body.name);
    return toResponse(await repo.create(body.name));
  },

  async update(id: string, body: UpdateFacilityBody) {
    await getOrThrow(id);
    if (body.name) await assertNameAvailable(body.name, id);
    return toResponse(await repo.update(id, body));
  },

  async remove(id: string) {
    await getOrThrow(id);
    return toResponse(await repo.softDelete(id));
  },
};
