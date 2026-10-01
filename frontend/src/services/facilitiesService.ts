import { get, post, put, deleteRequest } from './api'

// Types
export interface Facility {
  id: string
  name: string
  description: string
  location: string
  availability: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateFacilityPayload {
  name: string
  description: string
  location: string
  availability: boolean
}

export interface UpdateFacilityPayload extends Partial<CreateFacilityPayload> {}

// Facilities Service
export const facilitiesService = {
  // Get all facilities
  getAllFacilities: () => get<Facility[]>('/facilities'),

  // Get facility by ID
  getFacilityById: (id: string) => get<Facility>(`/facilities/${id}`),

  // Create new facility
  createFacility: (payload: CreateFacilityPayload) =>
    post<Facility>('/facilities', payload),

  // Update facility
  updateFacility: (id: string, payload: UpdateFacilityPayload) =>
    put<Facility>(`/facilities/${id}`, payload),

  // Delete facility
  deleteFacility: (id: string) =>
    deleteRequest<{ success: boolean }>(`/facilities/${id}`),

  // Get available facilities
  getAvailableFacilities: () =>
    get<Facility[]>('/facilities?availability=true'),
}
