import axiosInstance from '../config/axios'
import type { Room } from '../types/room'

/** Every endpoint in this project wraps its payload in this envelope. */
interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export async function fetchRooms(): Promise<Room[]> {
  const res = await axiosInstance.get<ApiEnvelope<Room[]>>('/mock/rooms')
  return res.data.data
}

export async function fetchRoomById(id: string): Promise<Room> {
  const res = await axiosInstance.get<ApiEnvelope<Room>>(`/mock/rooms/${id}`)
  return res.data.data
}
